## ADDED Requirements

### Requirement: Obtención de repositorios desde GitHub
El sistema SHALL obtener la lista de repositorios públicos del usuario configurado desde la API REST de GitHub y usarla como fuente de verdad de los proyectos mostrados en el sitio.

#### Scenario: Petición exitosa a la API
- **WHEN** una página que muestra proyectos se renderiza y no hay datos válidos en caché
- **THEN** el sistema consulta `GET /users/{GITHUB_USERNAME}/repos` con paginación de hasta 100 elementos
- **AND** normaliza cada repositorio a la forma interna `Project` con los campos `slug`, `name`, `description`, `url`, `stars`, `forks`, `primaryLanguage`, `languages`, `topics`, `updatedAt` y `isArchived`

#### Scenario: Exclusión de forks y archivados
- **WHEN** la respuesta de GitHub incluye repositorios con `fork: true` o `archived: true`
- **THEN** el sistema los descarta antes de normalizar
- **AND** no aparecen en ninguna vista del sitio

#### Scenario: Usuario configurable
- **WHEN** la variable de entorno `GITHUB_USERNAME` está definida
- **THEN** el sistema consulta los repositorios de ese usuario
- **AND** cuando no está definida usa `leonardo02lobo` como valor por defecto

### Requirement: Autenticación con token de solo lectura
El sistema SHALL autenticar sus peticiones a GitHub con un token personal de solo lectura cuando esté disponible, y MUST seguir funcionando sin él.

#### Scenario: Token presente
- **WHEN** la variable de entorno `GITHUB_TOKEN` tiene un valor no vacío
- **THEN** cada petición a GitHub incluye la cabecera `Authorization: Bearer {GITHUB_TOKEN}`

#### Scenario: Token ausente
- **WHEN** `GITHUB_TOKEN` no está definida o está vacía
- **THEN** el sistema realiza las peticiones sin cabecera de autorización
- **AND** el sitio se renderiza normalmente con el límite de tasa no autenticado

#### Scenario: El token nunca llega al cliente
- **WHEN** cualquier página del sitio se sirve al navegador
- **THEN** el valor de `GITHUB_TOKEN` no aparece en el HTML, en el JavaScript enviado al cliente ni en ninguna respuesta de red

### Requirement: Curación de proyectos mediante archivo de configuración
El sistema SHALL permitir controlar qué repositorios se muestran, en qué orden y con qué contenido, mediante un archivo de configuración versionado, sin modificar el código de los componentes.

#### Scenario: Repositorios destacados
- **WHEN** `projects.config.ts` declara una lista `featured` de nombres de repositorio
- **THEN** la página de inicio muestra únicamente esos repositorios
- **AND** los muestra en el mismo orden en que aparecen en la lista

#### Scenario: Repositorios ocultos
- **WHEN** un nombre de repositorio aparece en la lista `hidden`
- **THEN** ese repositorio no se muestra en ninguna vista del sitio, ni siquiera en el listado completo

#### Scenario: Sobrescritura de metadatos
- **WHEN** `projects.config.ts` define un `override` para un repositorio con campos `title`, `description`, `imageUrl` o `skills`
- **THEN** el sistema usa esos valores en lugar de los devueltos por GitHub
- **AND** los campos no sobrescritos conservan el valor de GitHub

#### Scenario: Repositorio destacado inexistente
- **WHEN** `featured` nombra un repositorio que la API no devuelve
- **THEN** el sistema omite esa entrada sin lanzar error
- **AND** registra una advertencia en el log del servidor

#### Scenario: Repositorio nuevo sin configurar
- **WHEN** existe un repositorio público que no aparece ni en `featured` ni en `hidden`
- **THEN** aparece en el listado completo de `/projects`
- **AND** no aparece en la página de inicio

### Requirement: Caché de respuestas de GitHub
El sistema SHALL cachear las respuestas de GitHub para evitar consultar la API en cada visita y mantenerse dentro del límite de tasa.

#### Scenario: Lectura desde caché vigente
- **WHEN** llega una petición y existe una entrada en caché cuya antigüedad es menor al TTL configurado
- **THEN** el sistema devuelve los datos cacheados
- **AND** no realiza ninguna petición a GitHub

#### Scenario: Caché vencida
- **WHEN** llega una petición y la entrada en caché superó el TTL
- **THEN** el sistema consulta GitHub y reemplaza la entrada en caché con el resultado

#### Scenario: Cabeceras de caché HTTP
- **WHEN** una página que muestra proyectos se sirve al navegador
- **THEN** la respuesta incluye una cabecera `Cache-Control` con `s-maxage` y `stale-while-revalidate`

### Requirement: Degradación ante fallos de la API
El sistema MUST renderizar siempre la sección de proyectos con contenido útil, incluso cuando GitHub no responda, responda con error o agote el límite de tasa.

#### Scenario: Límite de tasa agotado
- **WHEN** GitHub responde con estado 403 y la cabecera `x-ratelimit-remaining` en `0`
- **THEN** el sistema sirve la caché aunque esté vencida
- **AND** si no hay caché, sirve el snapshot local versionado
- **AND** la página se renderiza sin mostrar un error al visitante

#### Scenario: Error de red o timeout
- **WHEN** la petición a GitHub falla por red o excede el timeout configurado
- **THEN** el sistema aplica la misma cascada de respaldo: caché vencida, luego snapshot local
- **AND** registra el fallo en el log del servidor

#### Scenario: Sin caché ni snapshot
- **WHEN** fallan la API, la caché y el snapshot local
- **THEN** la sección de proyectos muestra un mensaje de estado en lenguaje de terminal en vez de quedar vacía o romper la página
- **AND** el resto del sitio se renderiza con normalidad

#### Scenario: Respuesta malformada
- **WHEN** GitHub devuelve 200 con un cuerpo que no cumple la forma esperada
- **THEN** el sistema descarta la respuesta, no la escribe en caché y aplica la cascada de respaldo

### Requirement: Listado completo de proyectos con filtros
La página `/projects` SHALL listar todos los repositorios no ocultos y permitir al visitante acotarlos por texto y por lenguaje.

#### Scenario: Listado completo
- **WHEN** el visitante abre `/projects`
- **THEN** ve todos los repositorios no ocultos, no solo los destacados

#### Scenario: Búsqueda por texto
- **WHEN** el visitante escribe en el campo de búsqueda
- **THEN** el listado se reduce a los proyectos cuyo nombre o descripción contiene el texto, sin distinguir mayúsculas ni acentos

#### Scenario: Filtro por lenguaje
- **WHEN** el visitante selecciona un lenguaje
- **THEN** el listado muestra únicamente los proyectos cuyo lenguaje principal o secundarios incluyen ese lenguaje

#### Scenario: Sin resultados
- **WHEN** ninguna combinación de búsqueda y filtro devuelve proyectos
- **THEN** se muestra un mensaje de estado vacío y un control para limpiar los filtros
