## 1. Marcadores de las herramientas

- [x] 1.1 Obtener los trazados oficiales de Claude y OpenAI desde simple-icons, sin instalar el paquete como dependencia
- [x] 1.2 Crear `src/components/icons/Claude.astro` siguiendo el patrón existente: `interface Props { class?: string }`, valor por defecto `"h-10 w-10"`, `class={className}` en la raíz y sin `width`/`height` fijos
- [x] 1.3 Crear `src/components/icons/OpenAI.astro` con el mismo patrón
- [x] 1.4 Fijar el color de marca en cada trazado: `#D97757` en Claude y `#FFFFFF` en OpenAI, en lugar del `currentColor` monocromo que entrega simple-icons
- [x] 1.5 Marcar ambos SVG como decorativos, ya que el título de la tarjeta nombra la herramienta

## 2. Tarjetas en la sección de habilidades

- [x] 2.1 Importar `Claude` y `OpenAI` en `src/components/Skills.astro`
- [x] 2.2 Añadir la tarjeta de Claude con una descripción acotada a su uso como asistente en desarrollo y aprendizaje, sin afirmar entrenamiento de modelos ni librerías de ML
- [x] 2.3 Añadir la tarjeta de ChatGPT / OpenAI con una descripción del mismo alcance
- [x] 2.4 Comprobar que ambas usan `CardSkills` sin estilos propios que las diferencien de las cuatro existentes

## 3. Verificación

- [x] 3.1 Ejecutar `npm run build` sin errores ni advertencias nuevas
- [x] 3.2 Verificar en navegador que la rejilla muestra seis tarjetas en tres filas exactas en escritorio, sin fila incompleta
- [x] 3.3 Verificar la columna única en móvil y que el espaciado de las tarjetas nuevas coincide con el de las demás
- [x] 3.4 Confirmar que no hay desbordamiento horizontal en 360, 768 y 1440 px
- [x] 3.5 Comparar los logos renderizados con los oficiales para confirmar que son reconocibles y no reproducciones aproximadas
