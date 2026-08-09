## 1. Base visual y tokens

- [x] 1.1 Descargar JetBrains Mono (400/500/700) en woff2 a `public/fonts/` y declarar `@font-face` con `font-display: swap` y respaldo `ui-monospace, SFMono-Regular, Menlo, monospace`
- [x] 1.2 Reescribir el bloque `@theme` de `src/styles/global.css` con los nueve tokens de D1 (`bg`, `surface`, `surface-raised`, `border`, `text`, `text-dim`, `accent`, `accent-2`, `warn`) y `--font-mono`
- [x] 1.3 Eliminar la regla `#hero` con `url('/src/assets/fondo_Hero.png')` (ruta rota en build) y aplicar `background: var(--color-bg)` y familia mono a `body`
- [x] 1.4 Añadir la capa decorativa de scanline/grano con `pointer-events: none` y `aria-hidden`, envuelta en `@media (prefers-reduced-motion: no-preference)`
- [x] 1.5 Definir estilos globales de foco visible con `--color-accent` sobre todos los elementos interactivos
- [x] 1.6 Actualizar `src/layouts/Layout.astro`: `lang="es"`, `<title>` y `<meta name="description">` reales, `preload` de la fuente, y Open Graph básico
- [x] 1.7 Crear `src/components/TerminalWindow.astro` con props `title` y `command`, barra de título con indicadores `aria-hidden`, borde y slot de contenido
- [x] 1.8 Verificar con `npm run build` que el sitio compila y que la fuente y los tokens se aplican sin romper las secciones existentes

## 2. Capa de datos de GitHub

- [x] 2.1 Crear `src/lib/github/types.ts` con las interfaces `Project`, `Collaborator`, `ProjectsConfig` y `GitHubRepo`
- [x] 2.2 Crear `src/lib/github/client.ts`: `fetch` con `Authorization: Bearer` opcional desde `import.meta.env.GITHUB_TOKEN`, `AbortSignal.timeout(5000)`, y detección de rate limit por estado 403 con `x-ratelimit-remaining: 0`
- [x] 2.3 Crear `src/lib/github/cache.ts`: `Map` a nivel de módulo con `{ data, fetchedAt }`, TTL de 1 hora, y lectura forzada de entradas vencidas para la cascada de respaldo
- [x] 2.4 Crear `src/data/projects.config.ts` con `username`, `featured`, `hidden` y `overrides` tipados con `satisfies ProjectsConfig`, migrando los datos de las tres entradas de `projects.json`
- [x] 2.5 Crear `src/lib/github/normalize.ts`: mapear `GitHubRepo` a `Project`, descartar forks y archivados, aplicar `hidden`, aplicar `overrides` campo a campo, y ordenar por el orden de `featured`
- [x] 2.6 Añadir a `normalize.ts` el filtrado de contribuidores: excluir al dueño, excluir `type: "Bot"` y logins terminados en `[bot]`, ordenar por `contributions` descendente
- [x] 2.7 Crear `src/lib/github/projects.ts` con `getProjects(scope: 'featured' | 'all')`: orquestar `/repos`, `/languages` y `/contributors` con concurrencia acotada, y aplicar la cascada `API → caché vencida → snapshot → vacío`
- [x] 2.8 Añadir aislamiento de fallos por repositorio: un error en `/contributors` o `/languages` deja ese proyecto con lista vacía sin afectar a los demás
- [x] 2.9 Registrar advertencia en log (sin lanzar error) cuando un nombre de `featured` no existe entre los repos devueltos
- [x] 2.10 Crear el script `scripts/sync-github.mjs` y el comando `npm run sync:github` que genera `src/data/projects.snapshot.json`; ejecutarlo y commitear el snapshot
- [x] 2.11 Crear `.env.example` con `GITHUB_TOKEN` y `GITHUB_USERNAME`, y verificar que `.env` está en `.gitignore`
- [x] 2.12 Verificar `getProjects()` de forma aislada: con token, sin token, con token inválido (fuerza el respaldo) y con red caída (fuerza el timeout)

## 3. Proyectos y colaboradores

- [x] 3.1 Crear `src/components/RepoMeta.astro`: estrellas, forks, lenguaje principal y fecha de última actualización, omitiendo cada métrica ausente sin dejar hueco
- [x] 3.2 Crear `src/components/CollaboratorStack.astro`: avatares apilados con enlace al perfil, `alt` con el login, `loading="lazy"`, dimensiones explícitas, indicador `+N` al superar el máximo visible, y marcador con inicial si la imagen falla
- [x] 3.3 Hacer que `CollaboratorStack` no renderice nada (ni etiqueta ni contenedor) cuando la lista de colaboradores está vacía
- [x] 3.4 Reescribir `src/components/CardProject.astro` como salida de comando: ruta `owner/repo` en `text-dim`, descripción, `RepoMeta`, chips de tecnologías con estilo de flags, `CollaboratorStack` y enlace `<a>` al repo con `target="_blank" rel="noopener noreferrer"`
- [x] 3.5 Reescribir `src/components/Projects.astro` para consumir `getProjects('featured')` con `map`, eliminando el acceso por índice `projects[0..2]`, envuelto en `TerminalWindow`
- [x] 3.6 Reescribir `src/pages/projects.astro` con `getProjects('all')`, layout completo, encabezado en estilo terminal y las tarjetas en grid
- [x] 3.7 Crear `src/components/ProjectFilters.astro`: campo de búsqueda y selector de lenguaje que alternan `hidden` sobre las tarjetas ya renderizadas, con normalización de mayúsculas y acentos
- [x] 3.8 Añadir estado vacío de filtros con mensaje en estilo terminal y control para limpiar los filtros
- [x] 3.9 Añadir el estado degradado: cuando `getProjects()` agota la cascada, renderizar la ventana con una línea en `--color-warn` en vez de una sección vacía
- [x] 3.10 Añadir la cabecera `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` en `index.astro` y `projects.astro`
- [x] 3.11 Eliminar `src/data/projects.json` y verificar que ningún archivo lo importa
- [x] 3.12 Verificar que `GITHUB_TOKEN` no aparece en el HTML servido ni en el bundle de `dist/client`

## 4. Resto de secciones

- [x] 4.1 Reescribir `src/components/ButtonPrimary.astro` como `<a href>` real, eliminando `onclick`, con variantes de estilo por prop
- [x] 4.2 Reescribir `src/components/Hero.astro` como sesión de shell: prompt `leonardo@unet:~$`, comandos `whoami` y `cat perfil.txt`, con el texto completo presente en el HTML
- [x] 4.3 Crear `src/components/TerminalPrompt.astro` con la animación de revelado por `setInterval` sobre texto ya en el DOM, cursor parpadeante, y salida inmediata bajo `prefers-reduced-motion: reduce`
- [x] 4.4 Reescribir `src/components/Header.astro` como barra de pestañas de terminal, conservando el menú móvil con `aria-expanded` correcto y foco retenido en el botón
- [x] 4.5 Reescribir `src/components/Footer.astro` como línea de status con los enlaces a GitHub y LinkedIn
- [x] 4.6 Reestilar `src/components/Skills.astro` y `CardSkills.astro` con `TerminalWindow` y vocabulario de terminal (`skills.json`, prefijos `▸`)
- [x] 4.7 Reestilar `src/components/AboutMe.astro` con `TerminalWindow` y encabezados prefijados, corrigiendo la errata "Pasón" → "Pasión"
- [x] 4.8 Reestilar `src/components/RoadMap.astro` como timeline de terminal, sustituyendo el token inexistente `border-tech-cyan` por uno real
- [x] 4.9 Revisar que ningún componente conserva valores hexadecimales o `rgb()` literales y que todos consumen tokens del tema

## 5. Verificación y despliegue

- [x] 5.1 Ejecutar `npm run build` sin errores ni advertencias nuevas y revisar `npm run preview`
- [x] 5.2 Revisar el layout en 360 px, 768 px y 1440 px, confirmando que no hay desplazamiento horizontal en ninguno
- [x] 5.3 Recorrer todo el sitio solo con teclado: todos los enlaces, botones, avatares y filtros alcanzables con foco visible
- [x] 5.4 Verificar el contraste de cada combinación texto/superficie contra AA (4.5:1 normal, 3:1 grande)
- [x] 5.5 Activar `prefers-reduced-motion: reduce` y confirmar que no hay typing, ni cursor parpadeante, ni scanline
- [x] 5.6 Forzar el fallo de la API con un token inválido y confirmar la cascada completa hasta el estado degradado
- [x] 5.7a Enlazar el proyecto de Vercel (`portafolio-web-mmtl`) y configurar `GITHUB_USERNAME` en los tres entornos
- [ ] 5.7b Crear el PAT fine-grained (solo lectura de repos públicos) y configurarlo como `GITHUB_TOKEN` en los tres entornos
- [ ] 5.7c Regenerar el snapshot completo con `npm run sync:github` ya con el token
- [x] 5.8a Desplegar a preview y validar el render con datos reales de GitHub
- [ ] 5.8b Promover a producción (en espera del token, por decisión del propietario)

## 6. Header fijo con animaciones

- [x] 6.1 Retirar `overflow-x: hidden` de `html`/`body`, que convierte el documento en contenedor de scroll y anula `position: sticky`
- [x] 6.2 Sacar el `Header` del wrapper del `Hero` y de `/projects` a nivel de página, para que el sticky no quede confinado a ese contenedor
- [x] 6.3 Hacer el header `sticky top-0 z-40` con fondo opaco y sombra condicionada al desplazamiento
- [x] 6.4 Implementar la entrada como animación CSS con escalonado de las pestañas, envuelta en `prefers-reduced-motion: no-preference`
- [x] 6.5 Animar el desplegable móvil con la técnica grid `0fr → 1fr`, con rotación del indicador y foco retenido en el botón
- [x] 6.6 Centralizar la altura del header en `--header-h` (borde incluido) y consumirla desde la barra, el `min-height` del hero y `scroll-padding-top`
- [x] 6.7 Verificar en navegador: sticky en 360/768/1440 y en ambas rutas, entrada animada y sin animación con movimiento reducido, desplegable, primera pantalla exacta y anclaje no tapado
