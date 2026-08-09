## Context

La sección de habilidades vive en `src/components/Skills.astro`: una `TerminalWindow` titulada `~/skills.json` que envuelve una rejilla `grid-cols-1 md:grid-cols-2` con cuatro `CardSkills`. Cada tarjeta recibe `title` y `description` como props y el icono por `<slot />`.

Los diez iconos de `src/components/icons/` siguen ya un patrón uniforme tras el rediseño terminal: frontmatter con `interface Props { class?: string }`, un valor por defecto tipo `"h-10 w-10"`, sin atributos `width`/`height` en el SVG, y `class={className}` en la raíz. Los logos de terceros (Python, Java, JavaScript, TypeScript, Tailwind) conservan sus colores de marca en `fill`; es la excepción explícita y documentada a la regla de "ningún hexadecimal literal en componentes", porque un logo desteñido deja de ser reconocible.

La restricción real de este cambio no es técnica sino de fidelidad: los trazados de los logos de Claude y OpenAI son formas concretas —un destello asimétrico de ocho brazos y un nudo hexagonal— que no se pueden reproducir de memoria sin que el resultado sea reconociblemente incorrecto.

## Goals / Non-Goals

**Goals:**

- Que las dos herramientas de IA aparezcan con el mismo peso visual que los lenguajes ya listados.
- Iconos fieles a la marca y coherentes con el patrón de los diez existentes.
- Rejilla de seis tarjetas, tres filas exactas en escritorio.
- Cero dependencias nuevas.

**Non-Goals:**

- No se añade GitHub Copilot ni librerías de ML; quedaron fuera al acotar el alcance.
- No se reordenan ni se reescriben las cuatro tarjetas existentes.
- No se toca `CardSkills.astro`, `TerminalWindow.astro` ni la definición de la rejilla.
- No se añade una sección separada de IA: las herramientas conviven con el resto en Skills.

## Decisions

### D1 — Una tarjeta por herramienta, no una tarjeta agrupada

Claude y ChatGPT reciben cada uno su tarjeta. La alternativa era una sola tarjeta "Asistentes de IA" con ambos iconos, como ya se hace con `JavaScript && TypeScript`.

Se descarta por dos razones. La primera es aritmética: agrupar deja cinco tarjetas y una fila coja en `md:grid-cols-2`. La segunda es de contenido: el agrupamiento de JavaScript y TypeScript se sostiene porque son el mismo ecosistema —uno compila al otro—, mientras que Claude y ChatGPT son productos de empresas distintas y agruparlos sólo comunica "uso chatbots", que dice menos que nombrarlos.

Se descarta también la variante de dos tarjetas temáticas —"Asistentes de IA" más "IA aplicada"— porque la segunda necesitaría respaldarse en librerías de ML, explícitamente fuera de alcance. Una tarjeta que enumere herramientas que no se dominan es peor que no tener la tarjeta.

### D2 — Trazados desde fuentes publicadas, no reproducidos a mano

Los SVG se copian literalmente de una fuente publicada y verificable, nunca se redibujan.

**Claude** sale de `simple-icons`, que lo publica bajo CC0 con `viewBox="0 0 24 24"`.

**OpenAI no está en simple-icons** —se comprobó en la API del repositorio, no hay ningún icono con ese slug ni equivalente—, así que su marca se toma de Wikimedia Commons (`File:ChatGPT-Logo.svg`, dominio público, `viewBox="0 0 320 320"`). Cumple igualmente el criterio que importa: es una fuente publicada y verificable, no una aproximación.

Se descartan las dos alternativas. Dibujar los trazados a mano produce logos aproximados que un ojo entrenado detecta de inmediato, y el logo de una marca ajena mal dibujado queda peor que no ponerlo. Añadir `simple-icons` como dependencia mete cientos de iconos en el árbol para consumir dos; se copian los dos trazados a componentes propios y no se instala nada.

Los dos iconos acaban con `viewBox` distintos (24 y 320), así que no se gana la uniformidad que daría una fuente única. No importa: cada componente escala por su propio `viewBox` más la clase recibida, y se verificó que ambos se dibujan a 48×48 con `h-12 w-12` pese a la diferencia.

### D3 — Color de marca en lugar de `currentColor`

simple-icons entrega los trazados monocromos, pensados para colorearse con `currentColor`. Aquí se les fija su color de marca: **Claude `#D97757`** (el coral de Anthropic) y **OpenAI `#FFFFFF`** (su marca es negra, y sobre `--color-canvas` la variante en blanco es la legible).

El motivo es la coherencia de la rejilla. Los cinco logos que ya están son a todo color; dos marcadores monocromos en verde acento entre ellos leerían como iconos de sistema, no como logos de producto. Los iconos de `Github` y `LinkedIn` sí usan `currentColor`, pero viven en el footer, donde forman parte de una línea de status y no de una cuadrícula de logos.

Esto extiende la excepción ya documentada sobre valores hexadecimales en componentes: aplica a marcas de terceros, no a colores del tema.

### D4 — Descripciones acotadas al uso real

Las descripciones hablan de asistencia en el desarrollo, revisión de código y aprendizaje. No mencionan entrenar modelos, hacer fine-tuning ni trabajar con librerías de ML.

Es una decisión de diseño y no de redacción: el portafolio existe para conseguir entrevistas, y una habilidad inflada se convierte en un problema en cuanto alguien pregunta por ella. Describir el uso real de un asistente es una afirmación defendible; "IA aplicada" a secas no lo es.

## Risks / Trade-offs

- **Los logos de marca cambian con el tiempo** → simple-icons los mantiene actualizados y los componentes quedan aislados en un fichero cada uno, así que actualizarlos es sustituir un atributo `d`.
- **Blanco puro para OpenAI sobre fondo oscuro** → es el uso previsto de esa variante de marca, y su contraste sobre `--color-canvas` es máximo. Si en el futuro se añade un tema claro, este icono es de los primeros que habría que revisar.
- **Un ojo crítico puede leer "uso asistentes de IA" como una habilidad de poco peso** → se mitiga con descripciones que nombran para qué se usan; ocultarlas no sería mejor, porque el hero y el RoadMap ya prometen IA y hoy Skills no la respalda.
- **Seis tarjetas alargan la sección** → el crecimiento es una fila; la sección sigue entrando de sobra en un scroll y la rejilla no cambia de definición.

## Migration Plan

1. Obtener los trazados oficiales de Claude y OpenAI desde simple-icons.
2. Crear `Claude.astro` y `OpenAI.astro` siguiendo el patrón de los iconos existentes.
3. Añadir las dos `CardSkills` a `Skills.astro` con sus imports.
4. Verificar en navegador: seis tarjetas, tres filas exactas en escritorio, columna única en móvil, sin desbordamiento horizontal y logos reconocibles.

**Rollback:** revertir el commit. No hay estado, datos ni configuración implicados.

## Open Questions

- **Orden dentro de la rejilla.** Las nuevas van al final, tras Tailwind. Si la IA pesa más en el perfil que el CSS, quizá deberían ir antes; queda como ajuste de una línea.
- **GitHub Copilot.** Descartado en este alcance. Si se incorpora más adelante volverían a ser siete tarjetas y habría que decidir de nuevo entre agrupar o dejar una fila coja.
