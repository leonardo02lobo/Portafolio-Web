/**
 * Genera src/data/projects.snapshot.json, el último escalón de la cascada de
 * respaldo cuando fallan la API y la caché.
 *
 * Se ejecuta a mano (`npm run sync:github`), no en cada build: si se
 * regenerara en build, un fallo de GitHub durante el deploy sobrescribiría un
 * snapshot bueno con uno vacío, que es justo el escenario del que protege.
 *
 * Carga los módulos TypeScript a través de Vite, que ya es dependencia del
 * proyecto. Así no hace falta añadir un runner de TS y el script recorre
 * exactamente el mismo camino que el sitio en producción, sin duplicar lógica.
 */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createServer } from "vite";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT = resolve(ROOT, "src/data/projects.snapshot.json");

try {
    process.loadEnvFile?.();
} catch {
    // Sin .env se sigue adelante con el límite no autenticado.
}

async function main() {
    const vite = await createServer({
        root: ROOT,
        configFile: false,
        logLevel: "warn",
        server: { middlewareMode: true },
        appType: "custom",
    });

    try {
        const { fetchFromApi } = await vite.ssrLoadModule("/src/lib/github/projects.ts");

        console.log("Sincronizando repos desde GitHub…");
        const projects = await fetchFromApi();

        if (!projects) {
            console.error("La API no devolvió datos usables.");
            console.error("El snapshot existente se deja intacto.");
            process.exitCode = 1;
            return;
        }

        if (projects.length === 0) {
            console.error("Cero proyectos: no se sobrescribe el snapshot.");
            process.exitCode = 1;
            return;
        }

        writeFileSync(OUTPUT, `${JSON.stringify(projects, null, 2)}\n`, "utf8");

        const withCollaborators = projects.filter((p) => p.collaborators.length > 0);
        console.log(`Escritos ${projects.length} proyectos en src/data/projects.snapshot.json`);
        console.log(`${withCollaborators.length} con colaboradores.`);
    } finally {
        await vite.close();
    }
}

main().catch((error) => {
    console.error("Fallo inesperado en la sincronización:", error);
    process.exit(1);
});
