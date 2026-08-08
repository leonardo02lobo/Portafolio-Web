import type { ProjectsConfig } from "../lib/github/types";

/**
 * Curación de los proyectos del portafolio.
 *
 * Está en TypeScript y no en JSON a propósito: da autocompletado, valida en
 * build que un override no invente campos, y admite comentarios explicando por
 * qué un repo está oculto.
 *
 * Para publicar un repo nuevo no hace falta tocar nada: aparece solo en
 * /projects. Añádelo a `featured` únicamente si debe salir en la portada.
 */
export const projectsConfig = {
    username: "leonardo02lobo",

    /** El orden de esta lista es el orden de las tarjetas en la portada. */
    featured: [
        "ProConnect",
        // "TodoSobreLaUNET" se retiró el 2026-08-08: la API ya no lo devuelve
        // entre los repos públicos (borrado, renombrado o pasado a privado).
        // Si vuelve a publicarse, basta con añadirlo de nuevo aquí.
        "HWC-Frontend-Integrations",
        "Space-Invader-Clon-in-Java",
    ],

    /** Excluidos de todas las vistas. */
    hidden: [
        "leonardo02lobo", // repo del README de perfil, no es un proyecto
    ],

    /** Cuentas de bot que GitHub reporta como usuario normal. */
    hiddenCollaborators: [
        "astrobot-houston", // bot de la plantilla de Astro
    ],

    /** Solo lo que GitHub no puede dar por sí mismo. Lo omitido se hereda. */
    overrides: {
        ProConnect: {
            title: "ProConnect",
            description:
                "Mi proyecto más ambicioso: una red social para estudiantes universitarios, con el objetivo de conectar a los estudiantes de la UNET y fomentar la colaboración académica y social entre ellos.",
            imageUrl: "https://www.unet.edu.ve/images/stories/logo_unet_medida.jpg",
            skills: [
                "Astro",
                "Tailwind CSS",
                "TypeScript",
                "Node.js",
                "Express",
                "MySQL",
                "Spring Boot",
                "Java",
            ],
        },
        "Space-Invader-Clon-in-Java": {
            title: "Space Invaders Game",
            description:
                "Juego de invasores espaciales desarrollado en Java junto a Java Swing. Incluye mecánicas de juego y sistema de puntuación.",
            skills: ["Java", "Java Swing"],
        },
    },
} satisfies ProjectsConfig;
