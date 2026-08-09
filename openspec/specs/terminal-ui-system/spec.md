# terminal-ui-system Specification

## Purpose
TBD - created by archiving change terminal-redesign-github-repos. Update Purpose after archive.
## Requirements
### Requirement: Sistema de tokens visuales de terminal
El sitio SHALL definir su paleta, tipografía y espaciado como tokens centralizados, y todos los componentes MUST consumir esos tokens en lugar de valores literales.

#### Scenario: Tokens de color definidos en un solo lugar
- **WHEN** se declara la paleta del sitio
- **THEN** existen tokens para fondo base, superficie elevada, borde, texto primario, texto atenuado, acento primario verde, acento secundario cyan y acento de advertencia ámbar
- **AND** están definidos en el bloque `@theme` de `global.css`

#### Scenario: Un componente necesita un color
- **WHEN** un componente aplica color de fondo, texto o borde
- **THEN** usa una clase derivada de los tokens del tema
- **AND** no incluye un valor hexadecimal ni `rgb()` literal en su marcado

#### Scenario: Tipografía monoespaciada
- **WHEN** se renderiza cualquier página
- **THEN** el texto usa la familia monoespaciada del sitio, servida localmente desde `public/`
- **AND** la declaración de fuente usa `font-display: swap` con una familia mono del sistema como respaldo

### Requirement: Chrome de ventana de terminal reutilizable
El sitio SHALL disponer de un componente único que envuelve contenido en un marco de ventana de terminal, y las secciones principales MUST usarlo en vez de replicar el marco.

#### Scenario: Sección envuelta en ventana
- **WHEN** una sección principal se renderiza dentro del componente de ventana
- **THEN** se muestra con barra de título, indicadores de ventana, borde y el título recibido por propiedad

#### Scenario: Semántica del marco
- **WHEN** se renderiza el marco de la ventana
- **THEN** sus elementos decorativos quedan ocultos a las tecnologías de asistencia
- **AND** el contenido interno conserva su jerarquía de encabezados sin niveles saltados

#### Scenario: Adaptación a pantallas estrechas
- **WHEN** el ancho del viewport es menor a 640 px
- **THEN** la ventana ocupa el ancho disponible con relleno reducido
- **AND** ningún contenido provoca desplazamiento horizontal en la página

### Requirement: Hero como sesión de shell
La sección de portada SHALL presentarse como una sesión de terminal con prompt y salida de comandos, sin sacrificar la disponibilidad del contenido.

#### Scenario: Contenido presente en el HTML
- **WHEN** se solicita la página de inicio
- **THEN** el nombre, el título profesional y la descripción vienen completos en el HTML de la respuesta
- **AND** son legibles aunque el JavaScript no llegue a ejecutarse

#### Scenario: Animación de escritura
- **WHEN** la portada se muestra y el visitante no pidió reducir el movimiento
- **THEN** las líneas de comando se revelan progresivamente con un cursor parpadeante
- **AND** la animación no desplaza el contenido posterior al terminar

#### Scenario: Movimiento reducido
- **WHEN** el visitante tiene activado `prefers-reduced-motion: reduce`
- **THEN** todas las líneas se muestran de inmediato en su estado final
- **AND** el cursor no parpadea y el efecto de scanline no se aplica

### Requirement: Tarjeta de proyecto en formato de salida de comando
Cada proyecto SHALL renderizarse con una estructura común que muestre su identidad, sus métricas de GitHub y sus tecnologías.

#### Scenario: Tarjeta completa
- **WHEN** se renderiza un proyecto con datos de GitHub disponibles
- **THEN** la tarjeta muestra la ruta `owner/repo`, la descripción, el número de estrellas, el número de forks, el lenguaje principal y la fecha de última actualización

#### Scenario: Métricas ausentes
- **WHEN** una métrica de GitHub no está disponible para un proyecto
- **THEN** esa métrica se omite de la tarjeta
- **AND** las métricas restantes conservan su alineación sin dejar huecos

#### Scenario: Enlace al repositorio
- **WHEN** el visitante activa el enlace principal de la tarjeta
- **THEN** se abre el repositorio en una pestaña nueva con `rel="noopener noreferrer"`
- **AND** el enlace es alcanzable por teclado con un indicador de foco visible

### Requirement: Header fijo con animación de entrada
El header SHALL permanecer visible en la parte superior durante todo el desplazamiento de la página, y su aparición inicial y su menú móvil MUST animarse sin comprometer la accesibilidad.

#### Scenario: Header visible durante el desplazamiento
- **WHEN** el visitante se desplaza hasta cualquier punto de la página
- **THEN** el header permanece anclado al borde superior del viewport
- **AND** mantiene ese comportamiento en todas las páginas del sitio

#### Scenario: Sombra al despegarse
- **WHEN** el desplazamiento vertical supera los 8 px
- **THEN** el header muestra una sombra que lo separa del contenido
- **AND** la retira al volver al inicio de la página

#### Scenario: Animación de entrada
- **WHEN** una página se carga y el visitante no pidió reducir el movimiento
- **THEN** el header desciende desde fuera del viewport hasta su posición final
- **AND** los elementos de navegación aparecen escalonados tras él
- **AND** al terminar no queda ninguna transformación residual sobre el header

#### Scenario: Entrada sin movimiento
- **WHEN** el visitante tiene activado `prefers-reduced-motion: reduce`
- **THEN** el header y su navegación se muestran directamente en su estado final
- **AND** no se aplica ninguna animación

#### Scenario: Despliegue del menú móvil
- **WHEN** el visitante activa el control de menú en un viewport estrecho
- **THEN** el panel de navegación se despliega hacia abajo con una transición de altura
- **AND** el indicador del control gira para reflejar el estado abierto
- **AND** el foco permanece en el control que lo alterna

#### Scenario: La primera pantalla no desborda el viewport
- **WHEN** se carga la página de inicio
- **THEN** la suma de la altura del header y la de la portada no supera la altura del viewport

#### Scenario: Salto a un anclaje
- **WHEN** el visitante navega a un enlace interno de sección
- **THEN** el encabezado de esa sección queda por debajo del header, sin quedar tapado

### Requirement: Navegación por teclado y accesibilidad
Todos los controles interactivos del sitio MUST ser operables por teclado y cumplir el contraste mínimo AA.

#### Scenario: Botones como enlaces reales
- **WHEN** un control lleva al visitante a otra página o ancla
- **THEN** se renderiza como un elemento `<a>` con `href`
- **AND** no depende de un manejador de clic para navegar

#### Scenario: Contraste de texto
- **WHEN** se muestra texto sobre cualquier superficie del sitio
- **THEN** la relación de contraste es de al menos 4.5:1 para texto normal y 3:1 para texto grande

#### Scenario: Menú móvil accesible
- **WHEN** el visitante abre o cierra el menú de navegación en móvil
- **THEN** el control refleja su estado en `aria-expanded`
- **AND** el foco permanece en el control tras alternarlo

#### Scenario: Efectos decorativos no interfieren
- **WHEN** se aplica la capa de scanline o grano sobre el fondo
- **THEN** no intercepta eventos de puntero
- **AND** queda excluida del árbol de accesibilidad

