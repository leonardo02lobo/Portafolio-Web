## ADDED Requirements

### Requirement: Herramientas de IA en la sección de habilidades
La sección de habilidades SHALL incluir las herramientas de IA que forman parte del perfil declarado, con el mismo tratamiento que el resto de tecnologías.

#### Scenario: Claude presente
- **WHEN** un visitante llega a la sección de habilidades
- **THEN** ve una tarjeta dedicada a Claude
- **AND** la tarjeta muestra su marcador, su nombre y una descripción de su uso

#### Scenario: ChatGPT presente
- **WHEN** un visitante llega a la sección de habilidades
- **THEN** ve una tarjeta dedicada a ChatGPT / OpenAI
- **AND** la tarjeta muestra su marcador, su nombre y una descripción de su uso

#### Scenario: Mismo tratamiento que el resto
- **WHEN** se renderiza una tarjeta de herramienta de IA
- **THEN** usa el mismo componente de tarjeta que Python, Java, JavaScript/TypeScript y Tailwind CSS
- **AND** no introduce estilos propios que la distingan de las demás

#### Scenario: Descripciones acotadas al uso real
- **WHEN** se redacta la descripción de una herramienta de IA
- **THEN** describe su uso como asistente en el flujo de desarrollo y aprendizaje
- **AND** no afirma entrenamiento de modelos ni trabajo con librerías de aprendizaje automático

### Requirement: Marcadores de las herramientas de IA
Cada herramienta de IA SHALL tener un componente de icono propio que siga el patrón de los iconos ya existentes en el sitio.

#### Scenario: Icono adaptable por quien lo usa
- **WHEN** un componente incluye un icono de IA pasándole una clase de tamaño
- **THEN** el icono se dibuja con ese tamaño
- **AND** cuando no recibe clase usa su tamaño por defecto

#### Scenario: Sin dimensiones fijas en el marcado
- **WHEN** se define un componente de icono de IA
- **THEN** no declara atributos `width` ni `height` fijos en el SVG
- **AND** escala mediante su `viewBox` y las clases recibidas

#### Scenario: Color de marca coherente con la rejilla
- **WHEN** se renderiza el marcador de una herramienta de IA junto a los de los lenguajes
- **THEN** se dibuja con el color de su marca, igual que los marcadores ya presentes
- **AND** la rejilla no mezcla marcadores monocromos con marcadores a color

#### Scenario: Marcador decorativo
- **WHEN** un icono de IA acompaña a un título que ya nombra la herramienta
- **THEN** el icono queda excluido del árbol de accesibilidad
- **AND** el nombre de la herramienta sigue disponible como texto

#### Scenario: Trazado fiel a la marca
- **WHEN** se incorpora el trazado SVG de una marca ajena
- **THEN** procede de una fuente publicada y verificable, no de una reproducción aproximada
- **AND** el resultado es reconocible como la marca que representa

### Requirement: Simetría de la rejilla de habilidades
La rejilla de habilidades MUST mantenerse sin filas incompletas al incorporar las nuevas tarjetas.

#### Scenario: Filas completas en escritorio
- **WHEN** la sección se muestra en un viewport de dos columnas
- **THEN** el número total de tarjetas es par
- **AND** ninguna fila queda con un hueco vacío

#### Scenario: Columna única en móvil
- **WHEN** la sección se muestra en un viewport estrecho
- **THEN** las tarjetas se apilan en una sola columna
- **AND** las tarjetas de IA conservan el mismo espaciado que las demás

#### Scenario: Sin desbordamiento horizontal
- **WHEN** la sección se muestra en cualquier ancho de viewport
- **THEN** las tarjetas nuevas no provocan desplazamiento horizontal en la página
