## Why

El portafolio actual funciona pero se lee como una plantilla genérica: paleta cyan/naranja sobre cards de vidrio, tipografía sans por defecto y ningún elemento que refleje el perfil real de Leonardo (ciberseguridad, Kali Linux, control del sistema). Al mismo tiempo, los proyectos viven hardcodeados en `src/data/projects.json`, así que cada repo nuevo exige editar código, las tres cards del home están escritas a mano por índice (`projects[0]`, `projects[1]`, `projects[2]`) y no se muestra ninguna señal de actividad real —estrellas, lenguajes, último commit— ni las personas que colaboraron en cada proyecto.

Este cambio ataca las dos cosas a la vez: una identidad visual de terminal que sí comunica el perfil, alimentada por datos vivos de GitHub en lugar de un JSON estático.

## What Changes

**Identidad visual — dirección "Terminal / Hacker"**

- Nuevo sistema de design tokens en `global.css`: fondo `#0D1117`, superficies `#161B22`, acento primario verde fósforo `#00FF9C`, acento secundario cyan `#00D2D2`, ámbar `#F2A01F` reservado para advertencias y metadatos.
- Tipografía monoespaciada (JetBrains Mono / IBM Plex Mono) como fuente principal, con jerarquía por peso y color en vez de por familia.
- Hero reconstruido como sesión de shell: prompt `leonardo@unet:~$`, comandos que se auto-escriben (`whoami`, `cat perfil.txt`), cursor parpadeante y salida progresiva. Respeta `prefers-reduced-motion` mostrando el texto completo sin animación.
- Componentes envueltos en un "chrome" de ventana de terminal reutilizable (barra de título, semáforo, borde), aplicado a Skills, Proyectos, Sobre Mí y RoadMap.
- Cards de proyecto rediseñadas como salida de comando: ruta del repo, línea de metadatos (`★ stars`, `⑂ forks`, lenguaje), chips de tecnologías como flags y fila de avatares de colaboradores.
- Header convertido en barra de pestañas de terminal; footer como línea de status.
- Efecto scanline / grano sutil sobre el fondo, desactivable por `prefers-reduced-motion`.
- Se corrigen de paso dos defectos existentes: `background-image: url('/src/assets/fondo_Hero.png')` (ruta que solo resuelve en dev, rota en build) y `ButtonPrimary` que usa `<button onclick>` en lugar de un enlace real, invisible para lectores de pantalla y para el crawler.

**Integración con GitHub**

- Cliente de GitHub en servidor que consulta `/users/{user}/repos` y, por repo, `/languages` y `/contributors`, autenticado con un PAT read-only (`GITHUB_TOKEN`) guardado en variables de entorno de Vercel.
- Archivo de curación `src/data/projects.config.ts`: lista `featured` (qué se destaca y en qué orden en el home), lista `hidden` (repos excluidos) y `overrides` por repo para sobrescribir título, descripción, imagen o skills cuando el metadato de GitHub no alcanza.
- Fila de colaboradores en cada card: avatares apilados de quienes han hecho commits, excluyendo al propio dueño; si no queda nadie, la fila no se renderiza.
- Caché en memoria con TTL más `Cache-Control`/`stale-while-revalidate` en las respuestas, para no gastar el rate limit en cada visita.
- Degradación en cascada ante fallos de la API: caché vencida → snapshot local commiteado → datos de `overrides`. La página nunca queda vacía ni lanza error por un 403 de rate limit.
- `/projects` pasa a listar todos los repos no ocultos (hoy solo repite los mismos tres del JSON) con buscador y filtro por lenguaje.
- `src/data/projects.json` queda reemplazado por el snapshot generado + `projects.config.ts`. **BREAKING** para cualquier import directo de ese JSON (hoy: `Projects.astro` y `pages/projects.astro`).

## Capabilities

### New Capabilities

- `github-repo-sync`: Obtención, normalización, curación y cacheo de los repositorios de GitHub como fuente de verdad de los proyectos del portafolio, incluyendo autenticación con PAT, límites de tasa y estrategia de degradación ante fallos.
- `project-collaborators`: Resolución y presentación de los contribuidores de cada repositorio, con exclusión del dueño, orden por número de contribuciones, límite visible y desbordamiento agregado.
- `terminal-ui-system`: Sistema visual de terminal —tokens de color, escala tipográfica monoespaciada, chrome de ventana, prompt animado, estados de foco y reglas de accesibilidad— compartido por todas las secciones del sitio.

### Modified Capabilities

<!-- Ninguna: openspec/specs/ está vacío, este es el primer change con specs del proyecto. -->

## Impact

**Código afectado**

- `src/styles/global.css` — reescritura de tokens y utilidades; eliminación del `#hero` con ruta de imagen rota.
- `src/layouts/Layout.astro` — carga de fuente mono, `<title>`/meta reales, `lang="es"`.
- `src/components/` — reescritura de `Hero`, `Header`, `Footer`, `Projects`, `CardProject`, `Skills`, `CardSkills`, `AboutMe`, `RoadMap`, `ButtonPrimary`.
- `src/components/` — nuevos: `TerminalWindow`, `TerminalPrompt`, `CollaboratorStack`, `RepoMeta`, `ProjectFilters`.
- `src/pages/index.astro`, `src/pages/projects.astro` — consumo del nuevo servicio en vez del JSON.
- `src/lib/github/` — nuevo: cliente, normalizador, caché y tipos.
- `src/data/projects.config.ts` — nuevo archivo de curación; `src/data/projects.json` se convierte en snapshot de respaldo generado.

**Dependencias**

- Ninguna dependencia de runtime nueva obligatoria. La fuente mono se sirve self-hosted desde `public/` (evita una petición a un CDN externo y el CLS asociado).

**Configuración y despliegue**

- Nueva variable de entorno `GITHUB_TOKEN` (PAT fine-grained, solo lectura de repos públicos) en Vercel para los tres entornos y en `.env` local. Sin ella el sitio sigue funcionando con el límite de 60 req/hora y el snapshot de respaldo.
- Nueva variable `GITHUB_USERNAME` (por defecto `leonardo02lobo`).
- El proyecto ya usa `output: 'server'` con el adapter de Vercel, así que el fetch en servidor no exige cambios de arquitectura.

**Riesgos**

- Rate limit de GitHub en picos de tráfico → mitigado con PAT, caché y snapshot.
- La animación de typing del hero puede retrasar el contenido percibido → el texto se renderiza en el HTML y la animación solo lo revela, para no perjudicar SEO ni el LCP.
- Superficie de cambio amplia: se toca casi todo el sitio de una vez, sin ruta de rollback parcial por componente.
