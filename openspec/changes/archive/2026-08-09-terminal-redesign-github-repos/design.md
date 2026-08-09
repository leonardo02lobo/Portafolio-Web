## Context

El portafolio es un sitio Astro 5 con `output: 'server'` y adapter de Vercel, estilado con Tailwind 4 vía `@tailwindcss/vite` (sin `tailwind.config`; los tokens viven en el bloque `@theme` de `src/styles/global.css`). Hoy tiene cuatro secciones en `index.astro` —Hero, Skills, Projects, AboutMe— más una página `/projects` sin estilar, y los proyectos salen de `src/data/projects.json` con tres entradas escritas a mano.

Restricciones que condicionan el diseño:

- **Ya es SSR.** No hay que migrar arquitectura para hacer fetch en servidor; sí hay que ser disciplinado con la caché, porque en SSR cada visita puede convertirse en una llamada a GitHub.
- **Rate limit de GitHub.** 60 req/h por IP sin token, y en Vercel la IP saliente es compartida: sin PAT el sitio se rompe con poco tráfico. Cada proyecto cuesta 2 llamadas extra (`/languages`, `/contributors`) sobre la de `/repos`, así que 15 repos ≈ 31 llamadas por refresco de caché.
- **Tailwind 4 sin config JS.** Los tokens se declaran como variables CSS en `@theme` y Tailwind genera las utilidades (`--color-accent` → `bg-accent`, `text-accent`, `border-accent`).
- **Deuda existente.** `#hero` referencia `url('/src/assets/fondo_Hero.png')`, ruta que solo resuelve en dev y queda rota en el build; `ButtonPrimary` navega con `onclick` sobre un `<button>`, invisible para lectores de pantalla y para el crawler. Ambas se corrigen aquí porque los componentes se reescriben de todos modos.

Se evaluaron tres direcciones visuales —Terminal/Hacker, Editorial oscuro y Glassmorphism— y se eligió **Terminal / Hacker**: es la que conecta con el perfil declarado (ciberseguridad, Kali Linux, "control total del sistema") y la que más diferencia el sitio de una plantilla, además de encajar naturalmente con el hecho de que el contenido ahora viene de la API de GitHub.

## Goals / Non-Goals

**Goals:**

- Una identidad visual coherente de terminal aplicada a todo el sitio, no una capa cosmética sobre el diseño actual.
- Los proyectos se alimentan de GitHub sin editar código: para publicar un repo nuevo basta tocar un archivo de configuración, o nada si va al listado completo.
- Cada tarjeta muestra señal real —estrellas, forks, lenguajes, actividad— y las personas que colaboraron.
- El sitio nunca depende de que GitHub responda: hay caché, snapshot de respaldo y degradación explícita.
- Accesibilidad AA: contraste, navegación por teclado, `prefers-reduced-motion` honrado de verdad.
- Cero dependencias de runtime nuevas.

**Non-Goals:**

- No se implementa un CMS, un panel de administración ni autenticación de visitantes.
- No se usa la API GraphQL de GitHub ni webhooks de sincronización.
- No se añade internacionalización: el sitio sigue en español.
- No se añade un framework de UI (React/Vue/Svelte); Astro + islas de script vanilla bastan.
- No se rediseña el contenido editorial (textos de Sobre Mí, RoadMap); se reestiliza lo existente.
- No se toca la sección de certificaciones (`certificaciones.json` hoy no se consume en ninguna página).

## Decisions

### D1 — Dirección visual: Terminal / Hacker

**Paleta.** Sustituye los tokens actuales por completo:

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#0D1117` | Fondo base del documento |
| `--color-surface` | `#161B22` | Ventanas de terminal, tarjetas |
| `--color-surface-raised` | `#1C2129` | Barra de título, chips |
| `--color-border` | `#30363D` | Bordes de ventana y separadores |
| `--color-text` | `#E6EDF3` | Texto principal |
| `--color-text-dim` | `#8B949E` | Metadatos, comentarios, rutas |
| `--color-accent` | `#00FF9C` | Prompt, cursor, foco, énfasis |
| `--color-accent-2` | `#00D2D2` | Enlaces, lenguajes, acentos secundarios |
| `--color-warn` | `#F2A01F` | Advertencias, estados degradados, badges |

`#00FF9C` sobre `#0D1117` da ~13:1 de contraste y `#8B949E` sobre `#0D1117` ~7:1: ambos superan AA con holgura. `#F2A01F` se reserva para metadatos y avisos, nunca para texto largo.

**Tipografía.** JetBrains Mono en 400/500/700, self-hosted como woff2 en `public/fonts/` con `font-display: swap` y respaldo `ui-monospace, SFMono-Regular, Menlo, monospace`. Se descarta Google Fonts: una petición a un host externo en el camino crítico, más CLS, a cambio de nada. Toda la jerarquía se construye con peso, tamaño y color —no hay segunda familia—, que es justamente lo que da el carácter de terminal.

**Vocabulario visual.** Cada sección es una ventana: barra de título con tres puntos y un nombre de archivo o comando (`~/proyectos`, `skills.json`, `whoami --full`), borde de 1px en `--color-border`, esquinas redondeadas `6px`. Los encabezados se prefijan con `$` o `//`. Las listas usan `▸` en lugar de viñetas. Las rutas y nombres de repo van en `--color-text-dim`.

**Movimiento.** El hero escribe sus líneas con un `setInterval` que revela caracteres ya presentes en el DOM. Un scanline muy sutil (`repeating-linear-gradient` a 4% de opacidad) más un grano estático. Todo el movimiento se apaga bajo `prefers-reduced-motion: reduce`, incluido el scanline: para alguien con sensibilidad vestibular, un patrón de líneas sobre fondo oscuro es igual de hostil que una animación.

*Alternativas consideradas:* **Editorial oscuro** —más sobrio y "profesional", pero no dice nada sobre el perfil y compite con miles de portafolios idénticos. **Glassmorphism** —el menor esfuerzo por ser la evolución del diseño actual, pero es exactamente la estética de plantilla que motivó el rediseño.

### D2 — REST con `fetch` nativo, sin SDK

Se usa `fetch` contra la API REST v3. Se descarta `@octokit/rest` (≈ 500 KB de dependencias para tres endpoints) y se descarta GraphQL: permitiría traer repos, lenguajes y contribuidores en una sola consulta, pero exige token siempre —no tiene modo anónimo—, con lo que el sitio dejaría de funcionar sin `GITHUB_TOKEN` y se perdería la degradación que exige la spec. REST con tres endpoints y concurrencia acotada es suficiente para la escala real (< 30 repos).

### D3 — Caché en dos niveles

**Nivel 1, memoria del proceso:** un `Map` a nivel de módulo con `{ data, fetchedAt }` y TTL de 1 hora. Fluid Compute reutiliza instancias entre peticiones concurrentes, así que este caché sobrevive de verdad entre visitas —no es el caso de la serverless clásica de una petición por instancia. Es best-effort por diseño: si la instancia se recicla, el nivel 2 responde.

**Nivel 2, CDN:** `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` en las páginas de proyectos. El CDN de Vercel absorbe el grueso del tráfico y `stale-while-revalidate` garantiza que un refresco lento nunca bloquea a un visitante.

Con TTL de 1 hora y ~31 llamadas por refresco, el consumo máximo es ~744 req/día contra un presupuesto de 120 000 con PAT: dos órdenes de magnitud de margen.

*Alternativa considerada:* Vercel Runtime Cache API, persistente entre instancias y con invalidación por tag. Es la opción correcta si el sitio crece, pero acopla el proyecto a una API de plataforma para resolver un problema que un `Map` más el CDN ya resuelven a esta escala. Se deja anotado como evolución.

### D4 — Cascada de respaldo en tres escalones

`GitHub → caché vencida → snapshot local → estado vacío`.

El snapshot es `src/data/projects.snapshot.json`, generado por un script `npm run sync:github` y **commiteado al repo**. Se regenera manualmente, no en cada build: si se regenerara en build, un fallo de GitHub durante el deploy sobrescribiría un snapshot bueno con uno vacío, que es precisamente el escenario del que protege. El snapshot vive en el repo, así que existe desde el primer render en frío.

El estado vacío no es una página de error: es una ventana de terminal con una línea en `--color-warn` del tipo `$ gh repo list → conexión no disponible, reintentando…`. El fallo pasa a ser parte de la estética en vez de una grieta en ella.

`fetch` lleva `AbortSignal.timeout(5000)`. Sin timeout explícito, una petición colgada a GitHub bloquea el render completo hasta el límite de la función.

### D5 — Curación en TypeScript, no en JSON

`src/data/projects.config.ts` exporta un objeto tipado:

```ts
export const projectsConfig = {
  username: 'leonardo02lobo',
  featured: ['ProConnect', 'TodoSobreLaUNET', 'Space-Invader-Clon-in-Java'],
  hidden: ['leonardo02lobo', 'dotfiles'],
  overrides: {
    ProConnect: {
      description: 'Red social para estudiantes universitarios…',
      imageUrl: '/img/proconnect.png',
      skills: ['Astro', 'Spring Boot', 'MySQL'],
    },
  },
} satisfies ProjectsConfig;
```

TypeScript sobre JSON porque da autocompletado, valida en build que un `override` no tenga campos inventados, y admite comentarios explicando por qué un repo está oculto. `featured` define orden además de pertenencia: la primera entrada es la primera tarjeta, lo que evita tener que ordenar por estrellas y hace determinista el home. Un nombre en `featured` que ya no existe se omite con una advertencia en log en lugar de romper el build —los repos se renombran, y el sitio no debería caerse por eso.

### D6 — Un solo punto de entrada de datos

Todo el acceso a GitHub pasa por `getProjects(scope: 'featured' | 'all'): Promise<Project[]>` en `src/lib/github/projects.ts`. Las páginas nunca llaman a `fetch` ni conocen la forma de la respuesta de GitHub; reciben `Project[]` ya normalizado, curado y con colaboradores resueltos. Esto mantiene la caché, el rate limiting y la cascada de respaldo en un solo lugar, y permite que la degradación sea consistente sin repetir `try/catch` en cada página.

Estructura:

```
src/lib/github/
  client.ts      → fetch autenticado, timeout, detección de rate limit
  normalize.ts   → GitHubRepo → Project, aplicación de overrides
  cache.ts       → Map con TTL
  types.ts       → Project, Collaborator, ProjectsConfig
  projects.ts    → getProjects(), orquestación y cascada de respaldo
```

### D7 — Filtros de `/projects` en el cliente

La búsqueda y el filtro por lenguaje se resuelven con un script vanilla que alterna `hidden` sobre tarjetas ya renderizadas en el HTML. Con menos de 30 proyectos no hay razón para paginar en servidor ni añadir un framework: el filtrado es instantáneo, funciona sin recargar y todo el contenido sigue presente en el HTML inicial para SEO. Sin JS, se ven todos los proyectos sin filtros, que es una degradación aceptable.

### D8 — Contribuidores, no colaboradores

`/contributors` es público y refleja el hecho verificable de quién commiteó. `/collaborators` describe permisos del repo, exige un PAT con acceso de escritura y devuelve 404 silencioso si falta el permiso —más superficie de fallo y un token más privilegiado a cambio de un dato que en repos personales casi siempre coincide. Se filtran bots (`type: "Bot"` o login terminado en `[bot]`) y al propio dueño; si no queda nadie, la fila entera desaparece de la tarjeta en vez de renderizar un contenedor vacío.

El token es un PAT fine-grained de solo lectura sobre repos públicos, en `GITHUB_TOKEN`, cargado con `import.meta.env` en código de servidor. No se expone con prefijo `PUBLIC_`, que es lo que lo filtraría al bundle del cliente.

## Risks / Trade-offs

- **Rate limit agotado en un pico de tráfico** → PAT (5 000 req/h), TTL de 1 hora, CDN absorbiendo el tráfico repetido, y cascada a caché vencida y snapshot. El peor caso muestra datos de hasta un día atrás, nunca un error.
- **El scope del cambio es todo el sitio a la vez** → se implementa por capas: primero tokens y `TerminalWindow` (base compartida), luego la capa de datos, luego cada sección. Cada capa es verificable con `npm run build` y una revisión visual antes de seguir. Aun así no hay rollback parcial: el rollback es revertir el commit.
- **La animación de typing perjudica el LCP** → el texto se renderiza completo en el HTML y el script solo controla su revelación; el LCP mide el contenido pintado, no el revelado. Bajo `prefers-reduced-motion` no se aplica ninguna transformación.
- **La caché en memoria se pierde al reciclar la instancia** → es best-effort por diseño; el CDN y el snapshot cubren el hueco. No se asume persistencia.
- **Un repo renombrado en GitHub rompe `featured` u `overrides`** → se omite con advertencia en log, nunca con error de build. El coste es que el repo desaparece del home en silencio hasta que alguien lea el log.
- **La estética de terminal puede leerse como nicho ante un reclutador no técnico** → el contenido sigue siendo texto plano legible con jerarquía clara y contraste AA; el marco es decorativo y no oscurece la información. Es una apuesta deliberada por diferenciación sobre neutralidad.
- **Los avatares se cargan desde `avatars.githubusercontent.com`** → dominio externo en el camino de render. Se mitiga con `loading="lazy"`, dimensiones explícitas para evitar CLS y un marcador con la inicial del login si la imagen falla.

## Migration Plan

1. **Base visual.** Tokens en `global.css`, fuente en `public/fonts/`, `Layout.astro` con `lang="es"`, `<title>` y meta reales. Componente `TerminalWindow`. El sitio sigue funcionando con el JSON actual.
2. **Capa de datos.** `src/lib/github/` completo más `projects.config.ts` y el script `sync:github`. Se genera y commitea el primer snapshot. Verificable de forma aislada, sin tocar todavía la UI.
3. **Proyectos.** `CardProject`, `CollaboratorStack`, `RepoMeta`; `Projects.astro` y `/projects` pasan a `getProjects()`. Se elimina `projects.json`. Es el punto donde el cambio se vuelve visible de punta a punta.
4. **Resto de secciones.** Hero, Header, Footer, Skills, AboutMe, RoadMap, `ButtonPrimary` sobre el nuevo sistema.
5. **Verificación.** Build limpio, revisión en 360 / 768 / 1440, prueba de teclado, prueba con `prefers-reduced-motion`, y prueba de degradación forzando fallo de la API (token inválido).
6. **Despliegue.** `GITHUB_TOKEN` y `GITHUB_USERNAME` en los tres entornos de Vercel antes de promover a producción; validación en la URL de preview.

**Rollback:** revertir el commit del rediseño. No hay migración de datos ni estado persistente, así que el rollback es completo y sin efectos residuales. `GITHUB_TOKEN` puede quedarse configurado sin consecuencias.

## Open Questions

- **Certificaciones.** `src/data/certificaciones.json` existe pero ninguna página lo consume. Queda fuera de este cambio; decidir después si se convierte en sección o se elimina.
- **TTL de 1 hora.** Es una estimación conservadora. Si los repos cambian poco, 6 o 12 horas reducirían aún más el consumo sin coste percibido.
- **Imágenes de proyecto.** Hoy son URLs externas (crazygames, unet.edu.ve) que pueden caerse o cambiar. Un paso natural es alojarlas en `public/img/` vía `overrides`, pero exige preparar cada imagen a mano.
- **Runtime Cache API.** Migrar el nivel 1 a la caché persistente de Vercel si el tráfico crece lo suficiente como para que el reciclado de instancias se note.
