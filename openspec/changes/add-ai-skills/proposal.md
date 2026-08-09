## Why

El perfil que el sitio proyecta ya declara la IA como uno de sus tres ejes: el hero dice "Desarrollo (Java, Python) · Ciberseguridad · IA", el RoadMap marca 2025 como "Enfoque: ciberseguridad & IA" y Sobre Mí habla de "la aplicación ética de la inteligencia artificial". Pero la sección de Skills —el único sitio donde esas afirmaciones se concretan en herramientas— sólo lista Python, Java, JavaScript/TypeScript y Tailwind CSS.

Es una brecha entre lo que el sitio afirma y lo que demuestra: un visitante que llegue buscando el perfil de IA no encuentra ninguna herramienta que lo respalde. Este cambio cierra esa brecha añadiendo las dos herramientas de IA que se usan de verdad.

## What Changes

- Dos tarjetas nuevas en la sección de Skills: **Claude** (Anthropic) y **ChatGPT / OpenAI**, con el mismo componente `CardSkills` que las cuatro existentes.
- Dos componentes de icono nuevos, `Claude.astro` y `OpenAI.astro`, siguiendo el patrón ya establecido: prop `class` opcional, sin `width`/`height` fijos y `viewBox` propio.
- Los marcadores se dibujan con su color de marca, como ya hacen Python, Java, JavaScript, TypeScript y Tailwind, para que la rejilla no mezcle iconos monocromos con iconos a color.
- La rejilla pasa de 4 a 6 tarjetas. En `md:grid-cols-2` eso son tres filas exactas, sin la fila incompleta que dejaría un número impar.
- Una tarjeta por herramienta, no una tarjeta temática agrupando ambas. Se descartó una segunda tarjeta de "IA aplicada" porque las librerías de ML (TensorFlow, PyTorch, scikit-learn) quedaron explícitamente fuera del alcance, y sin ellas esa tarjeta afirmaría más de lo que hay detrás.

**No forma parte de este cambio:** GitHub Copilot, las librerías de ML de Python, y cualquier reordenación de las tarjetas ya existentes.

## Capabilities

### New Capabilities

- `ai-skills-showcase`: Presencia de las herramientas de IA en la sección de habilidades: qué herramientas se muestran, cómo se representan sus marcadores y cómo encajan en la rejilla sin romper su simetría ni la coherencia visual con el resto de tarjetas.

### Modified Capabilities

<!-- Ninguna: openspec/specs/ sigue vacío. El change terminal-redesign-github-repos
     define terminal-ui-system pero aún no está archivado, así que no hay spec
     principal contra la que escribir un delta. -->

## Impact

**Código afectado**

- `src/components/Skills.astro` — dos entradas `CardSkills` nuevas y sus imports.
- `src/components/icons/Claude.astro` — nuevo.
- `src/components/icons/OpenAI.astro` — nuevo.

**Sin efecto sobre**

- `CardSkills.astro` y `TerminalWindow.astro` se reutilizan tal cual; no necesitan cambios.
- La rejilla ya es `grid-cols-1 md:grid-cols-2`, así que no hay que tocar el layout.
- Ninguna dependencia nueva: los iconos son SVG en línea, igual que los diez ya existentes.

**Riesgos**

- Los trazados SVG de marcas ajenas hay que obtenerlos de una fuente fiable en lugar de reproducirlos de memoria, o el resultado será un logo reconociblemente incorrecto.
- Afirmar una habilidad que no se sostenga en una entrevista es un riesgo de contenido, no técnico: las descripciones deben ceñirse al uso real de las herramientas y no prometer entrenamiento de modelos ni trabajo con librerías de ML.
