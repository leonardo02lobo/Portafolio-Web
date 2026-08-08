/** Persona con commits en un repositorio. */
export interface Collaborator {
    login: string;
    avatarUrl: string;
    profileUrl: string;
    contributions: number;
}

/** Forma interna de un proyecto. Es lo único que ven las páginas. */
export interface Project {
    /** Nombre del repositorio, usado como clave en config y overrides. */
    slug: string;
    /** Título mostrado. Por defecto el nombre del repo, sustituible por override. */
    name: string;
    owner: string;
    /** `owner/repo`, mostrado como ruta en la tarjeta. */
    fullName: string;
    description: string;
    url: string;
    homepage: string | null;
    imageUrl: string | null;
    stars: number;
    forks: number;
    primaryLanguage: string | null;
    languages: string[];
    topics: string[];
    /** Tecnologías mostradas como chips: lenguajes salvo que un override las fije. */
    skills: string[];
    /** ISO 8601. */
    updatedAt: string;
    isArchived: boolean;
    collaborators: Collaborator[];
}

export interface ProjectOverride {
    title?: string;
    description?: string;
    imageUrl?: string;
    skills?: string[];
}

export interface ProjectsConfig {
    username: string;
    /** Repos destacados en el home. El orden de la lista es el orden mostrado. */
    featured: string[];
    /** Repos excluidos de todas las vistas. */
    hidden: string[];
    /**
     * Cuentas que no son personas pero que los filtros automáticos no detectan:
     * bots registrados como usuario normal, sin `type: "Bot"` ni sufijo [bot].
     */
    hiddenCollaborators: string[];
    overrides: Record<string, ProjectOverride>;
}

/**
 * De dónde salieron los datos servidos. Permite a la UI distinguir entre datos
 * frescos y un estado degradado sin volver a inspeccionar la cascada.
 */
export type ProjectsSource = "api" | "stale-cache" | "snapshot" | "empty";

export interface ProjectsResult {
    projects: Project[];
    source: ProjectsSource;
}

/** Subconjunto de la respuesta de GitHub que realmente consumimos. */
export interface GitHubRepo {
    name: string;
    full_name: string;
    owner: { login: string };
    description: string | null;
    html_url: string;
    homepage: string | null;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    topics?: string[];
    updated_at: string;
    fork: boolean;
    archived: boolean;
}

export interface GitHubContributor {
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
    type?: string;
}
