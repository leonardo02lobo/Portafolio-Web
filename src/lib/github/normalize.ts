import type {
    Collaborator,
    GitHubContributor,
    GitHubRepo,
    Project,
    ProjectsConfig,
} from "./types";

/** Repos de prueba, forks y archivados no representan trabajo a mostrar. */
export function isShowable(repo: GitHubRepo, config: ProjectsConfig): boolean {
    if (repo.fork || repo.archived) return false;
    if (config.hidden.includes(repo.name)) return false;
    return true;
}

/**
 * Descarta bots y al propio dueño, y ordena de mayor a menor contribución.
 * Lo que queda es la gente con la que Leonardo realmente colaboró.
 */
export function normalizeCollaborators(
    contributors: GitHubContributor[],
    owner: string,
    denylist: string[] = [],
): Collaborator[] {
    const ownerLower = owner.toLowerCase();
    const denied = new Set(denylist.map((login) => login.toLowerCase()));

    return contributors
        .filter((person) => {
            if (!person?.login) return false;
            if (person.login.toLowerCase() === ownerLower) return false;
            if (person.type === "Bot") return false;
            if (person.login.endsWith("[bot]")) return false;
            // Bots registrados como usuario normal (p. ej. astrobot-houston).
            if (denied.has(person.login.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => b.contributions - a.contributions)
        .map((person) => ({
            login: person.login,
            avatarUrl: person.avatar_url,
            profileUrl: person.html_url,
            contributions: person.contributions,
        }));
}

export function normalizeRepo(
    repo: GitHubRepo,
    config: ProjectsConfig,
    languages: string[],
    collaborators: Collaborator[],
): Project {
    const override = config.overrides[repo.name] ?? {};

    return {
        slug: repo.name,
        name: override.title ?? repo.name,
        owner: repo.owner.login,
        fullName: repo.full_name,
        description: override.description ?? repo.description ?? "",
        url: repo.html_url,
        homepage: repo.homepage || null,
        imageUrl: override.imageUrl ?? null,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        primaryLanguage: repo.language,
        languages,
        topics: repo.topics ?? [],
        skills: override.skills ?? languages,
        updatedAt: repo.updated_at,
        isArchived: repo.archived,
        collaborators,
    };
}

/**
 * Reordena según `featured`. Un nombre que ya no existe se omite con una
 * advertencia: los repos se renombran, y el sitio no debería caerse por eso.
 */
export function orderByFeatured(projects: Project[], config: ProjectsConfig): Project[] {
    const bySlug = new Map(projects.map((project) => [project.slug, project]));
    const ordered: Project[] = [];

    for (const slug of config.featured) {
        const project = bySlug.get(slug);
        if (project) {
            ordered.push(project);
        } else {
            console.warn(
                `[github] el repo destacado "${slug}" no está entre los devueltos por la API. Se omite.`,
            );
        }
    }

    return ordered;
}

/** Listado completo: lo más reciente primero. */
export function orderByUpdated(projects: Project[]): Project[] {
    return [...projects].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
}
