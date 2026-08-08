const API_ROOT = "https://api.github.com";
const TIMEOUT_MS = 5000;

/**
 * El token se lee primero de process.env: en Vercel, `import.meta.env` se
 * sustituye por literales en tiempo de build, así que por sí solo congelaría el
 * valor del deploy en vez de leer el configurado en el panel. import.meta.env
 * queda como respaldo para `astro dev`, donde Vite carga el .env.
 */
function readEnv(key: string): string | undefined {
    const fromProcess =
        typeof process !== "undefined" ? process.env?.[key] : undefined;
    if (fromProcess) return fromProcess;

    // import.meta.env no existe fuera de Vite (p. ej. en el script de sync),
    // así que se accede con guarda en vez de asumirlo presente.
    const viteEnv = (import.meta as { env?: Record<string, unknown> }).env;
    const fromVite = viteEnv?.[key];
    return typeof fromVite === "string" && fromVite ? fromVite : undefined;
}

export function getToken(): string | undefined {
    return readEnv("GITHUB_TOKEN");
}

export function getUsername(fallback: string): string {
    return readEnv("GITHUB_USERNAME") ?? fallback;
}

export type GitHubResult<T> =
    | { ok: true; data: T }
    | { ok: false; reason: "rate-limited" | "not-found" | "error"; status?: number };

/**
 * GET autenticado contra la API de GitHub.
 *
 * Nunca lanza: los fallos vuelven como resultado para que la cascada de
 * respaldo los trate explícitamente. Sin timeout, una petición colgada
 * bloquearía el render completo hasta el límite de la función.
 */
export async function githubFetch<T>(path: string): Promise<GitHubResult<T>> {
    const token = getToken();

    const headers: Record<string, string> = {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "portafolio-leonardo-lobo",
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
        const response = await fetch(`${API_ROOT}${path}`, {
            headers,
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (response.status === 403 || response.status === 429) {
            const remaining = response.headers.get("x-ratelimit-remaining");
            if (remaining === "0") {
                console.warn(
                    `[github] límite de tasa agotado en ${path}. Se repone: ${response.headers.get("x-ratelimit-reset") ?? "desconocido"}`,
                );
                return { ok: false, reason: "rate-limited", status: response.status };
            }
            return { ok: false, reason: "error", status: response.status };
        }

        if (response.status === 404) {
            return { ok: false, reason: "not-found", status: 404 };
        }

        // 204 Sin Contenido: repositorio sin historial de commits.
        if (response.status === 204) {
            return { ok: true, data: [] as unknown as T };
        }

        if (!response.ok) {
            console.warn(`[github] ${response.status} en ${path}`);
            return { ok: false, reason: "error", status: response.status };
        }

        return { ok: true, data: (await response.json()) as T };
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        console.warn(`[github] fallo de red o timeout en ${path}: ${detail}`);
        return { ok: false, reason: "error" };
    }
}

/**
 * Ejecuta tareas en paralelo con un tope de concurrencia. Un fallo individual
 * no cancela las demás: cada tarea es responsable de resolver su propio error.
 */
export async function mapWithLimit<T, R>(
    items: T[],
    limit: number,
    task: (item: T) => Promise<R>,
): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let cursor = 0;

    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor++;
            results[index] = await task(items[index]);
        }
    });

    await Promise.all(workers);
    return results;
}
