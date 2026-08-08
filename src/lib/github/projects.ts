import { projectsConfig } from "../../data/projects.config";
import snapshot from "../../data/projects.snapshot.json";
import { githubFetch, getUsername, mapWithLimit } from "./client";
import { readFresh, readStale, write } from "./cache";
import {
    isShowable,
    normalizeCollaborators,
    normalizeRepo,
    orderByFeatured,
    orderByUpdated,
} from "./normalize";
import type {
    GitHubContributor,
    GitHubRepo,
    Project,
    ProjectsResult,
    ProjectsSource,
} from "./types";

const CACHE_KEY = "projects";
const CONCURRENCY = 5;

/** Cabecera de caché del CDN. El grueso del tráfico no llega ni a la función. */
export const CACHE_CONTROL = "public, s-maxage=3600, stale-while-revalidate=86400";

/** Lenguajes del repo, del que más bytes aporta al que menos. */
async function fetchLanguages(fullName: string): Promise<string[]> {
    const result = await githubFetch<Record<string, number>>(`/repos/${fullName}/languages`);
    if (!result.ok || !result.data) return [];

    return Object.entries(result.data)
        .sort((a, b) => b[1] - a[1])
        .map(([language]) => language);
}

async function fetchCollaborators(fullName: string, owner: string) {
    const result = await githubFetch<GitHubContributor[]>(
        `/repos/${fullName}/contributors?per_page=100`,
    );
    // Un fallo aquí deja el proyecto sin colaboradores, nunca sin tarjeta.
    if (!result.ok || !Array.isArray(result.data)) return [];

    return normalizeCollaborators(result.data, owner, projectsConfig.hiddenCollaborators);
}

/**
 * Trae y compone la lista completa. Devuelve null si la API no da nada usable.
 * Exportada para que el script de sync use exactamente este camino.
 */
export async function fetchFromApi(): Promise<Project[] | null> {
    const username = getUsername(projectsConfig.username);

    const result = await githubFetch<GitHubRepo[]>(
        // 100 por página cubre de sobra la escala real; sin paginación adicional.
        `/users/${username}/repos?per_page=100&sort=updated&type=owner`,
    );

    if (!result.ok) return null;
    if (!Array.isArray(result.data)) {
        console.warn("[github] respuesta de /repos con forma inesperada. Se descarta.");
        return null;
    }

    const repos = result.data.filter((repo) => isShowable(repo, projectsConfig));

    return mapWithLimit(repos, CONCURRENCY, async (repo) => {
        const [languages, collaborators] = await Promise.all([
            fetchLanguages(repo.full_name),
            fetchCollaborators(repo.full_name, repo.owner.login),
        ]);
        return normalizeRepo(repo, projectsConfig, languages, collaborators);
    });
}

/**
 * Cascada de respaldo: API → caché vencida → snapshot local → vacío.
 *
 * Nunca lanza. La página siempre se renderiza; en el peor caso con `source`
 * en "empty" para que la UI muestre un estado degradado en vez de un hueco.
 */
async function loadAll(): Promise<{ projects: Project[]; source: ProjectsSource }> {
    const fresh = readFresh<Project[]>(CACHE_KEY);
    if (fresh) return { projects: fresh, source: "api" };

    const fromApi = await fetchFromApi();
    if (fromApi && fromApi.length > 0) {
        write(CACHE_KEY, fromApi);
        return { projects: fromApi, source: "api" };
    }

    const stale = readStale<Project[]>(CACHE_KEY);
    if (stale && stale.length > 0) {
        console.warn("[github] sirviendo caché vencida.");
        return { projects: stale, source: "stale-cache" };
    }

    const fromSnapshot = snapshot as unknown as Project[];
    if (Array.isArray(fromSnapshot) && fromSnapshot.length > 0) {
        console.warn("[github] sirviendo snapshot local.");
        return { projects: fromSnapshot, source: "snapshot" };
    }

    console.warn("[github] sin datos: API, caché y snapshot agotados.");
    return { projects: [], source: "empty" };
}

/**
 * Único punto de entrada a los datos de GitHub. Las páginas no conocen la
 * forma de la respuesta de la API ni repiten la lógica de degradación.
 */
export async function getProjects(scope: "featured" | "all"): Promise<ProjectsResult> {
    const { projects, source } = await loadAll();

    const ordered =
        scope === "featured"
            ? orderByFeatured(projects, projectsConfig)
            : orderByUpdated(projects);

    return { projects: ordered, source };
}
