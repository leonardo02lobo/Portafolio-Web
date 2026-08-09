# project-collaborators Specification

## Purpose
TBD - created by archiving change terminal-redesign-github-repos. Update Purpose after archive.
## Requirements
### Requirement: Obtención de contribuidores por repositorio
El sistema SHALL obtener la lista de contribuidores de cada repositorio mostrado y asociarla al proyecto correspondiente.

#### Scenario: Repositorio con contribuidores
- **WHEN** el sistema normaliza un repositorio que se va a mostrar
- **THEN** consulta `GET /repos/{owner}/{repo}/contributors`
- **AND** normaliza cada contribuidor a la forma `{ login, avatarUrl, profileUrl, contributions }`

#### Scenario: Exclusión del dueño del repositorio
- **WHEN** la lista de contribuidores incluye al usuario dueño del portafolio
- **THEN** ese contribuidor se elimina de la lista antes de mostrarla
- **AND** el resto conserva su orden relativo

#### Scenario: Orden por contribuciones
- **WHEN** un repositorio tiene dos o más contribuidores tras excluir al dueño
- **THEN** se muestran ordenados de mayor a menor número de contribuciones

#### Scenario: Contribuidores de tipo bot
- **WHEN** un contribuidor tiene `type: "Bot"` o su login termina en `[bot]`
- **THEN** se excluye de la lista mostrada

### Requirement: Presentación de colaboradores en la tarjeta de proyecto
La tarjeta de cada proyecto SHALL mostrar a sus colaboradores como una fila de avatares apilados, y MUST omitir la fila por completo cuando no haya ninguno.

#### Scenario: Proyecto colaborativo
- **WHEN** un proyecto tiene al menos un colaborador tras aplicar las exclusiones
- **THEN** la tarjeta muestra una fila etiquetada con los avatares apilados
- **AND** cada avatar enlaza al perfil de GitHub de esa persona en una pestaña nueva

#### Scenario: Proyecto en solitario
- **WHEN** un proyecto no tiene colaboradores tras excluir al dueño y a los bots
- **THEN** la tarjeta no renderiza la fila de colaboradores ni su etiqueta
- **AND** no deja espacio vacío ni un contenedor sin contenido

#### Scenario: Desbordamiento de colaboradores
- **WHEN** un proyecto tiene más colaboradores que el máximo visible configurado
- **THEN** se muestran los primeros hasta el máximo
- **AND** se añade un indicador con la cantidad restante en formato `+N`

#### Scenario: Avatar accesible
- **WHEN** se renderiza el avatar de un colaborador
- **THEN** tiene un texto alternativo con el login de la persona
- **AND** el enlace es alcanzable y operable por teclado con un indicador de foco visible

#### Scenario: Avatar que no carga
- **WHEN** la imagen del avatar no puede cargarse
- **THEN** se muestra un marcador de respaldo con la inicial del login
- **AND** el enlace al perfil sigue funcionando

### Requirement: Aislamiento de fallos al consultar contribuidores
Un fallo al obtener los contribuidores de un repositorio MUST NOT impedir que ese proyecto ni los demás se muestren.

#### Scenario: Endpoint de contribuidores falla para un repositorio
- **WHEN** la petición de contribuidores de un repositorio devuelve error o excede el timeout
- **THEN** ese proyecto se renderiza con una lista de colaboradores vacía
- **AND** los demás proyectos conservan sus colaboradores

#### Scenario: Repositorio sin historial de commits
- **WHEN** GitHub responde 204 Sin Contenido para los contribuidores de un repositorio
- **THEN** el sistema trata la respuesta como una lista vacía sin registrar un error

#### Scenario: Consultas en paralelo acotadas
- **WHEN** el sistema necesita los contribuidores de varios repositorios
- **THEN** las peticiones se ejecutan en paralelo con un límite de concurrencia configurado
- **AND** el fallo de una no cancela las demás

