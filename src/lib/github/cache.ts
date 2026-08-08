interface Entry<T> {
    data: T;
    fetchedAt: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hora

/**
 * Caché en memoria del proceso.
 *
 * Fluid Compute reutiliza instancias entre peticiones, así que estas entradas
 * sobreviven de verdad entre visitas. Aun así es best-effort por diseño: si la
 * instancia se recicla, responden el CDN y el snapshot local.
 */
const store = new Map<string, Entry<unknown>>();

/** Devuelve la entrada solo si sigue vigente. */
export function readFresh<T>(key: string): T | null {
    const entry = store.get(key) as Entry<T> | undefined;
    if (!entry) return null;
    if (Date.now() - entry.fetchedAt > TTL_MS) return null;
    return entry.data;
}

/** Devuelve la entrada aunque haya vencido. Segundo escalón de la cascada. */
export function readStale<T>(key: string): T | null {
    const entry = store.get(key) as Entry<T> | undefined;
    return entry ? entry.data : null;
}

export function write<T>(key: string, data: T): void {
    store.set(key, { data, fetchedAt: Date.now() });
}
