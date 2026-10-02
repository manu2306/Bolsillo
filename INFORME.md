# Informe de reflexión · Bolsillo

**Proyecto:** Bolsillo, un organizador de gastos personales con analista de IA.
**Repositorio:** https://github.com/manu2306/Bolsillo

## 1. Cómo trabajé con la IA

Usé tres IA, cada una con un papel distinto:

| IA | Modelo | Para qué |
|---|---|---|
| Claude Design | Claude Opus 5.5 | Diseñar todas las pantallas antes de programar. |
| Claude | Claude Opus 5.5 | Guiarme paso a paso y escribir el código. |
| Groq | `openai/gpt-oss-120b` | El analista que usa el usuario final dentro de la app. |

Antes de escribir una línea de código preparé dos prompts largos (están completos en `PROMPT-LOG.md`). En el de desarrollo fijé yo la arquitectura para que la IA no la decidiera por mí: los cálculos en el navegador, los datos en `localStorage`, un servidor mínimo que solo protege la clave, y un analista que interpreta pero no calcula. También le impuse un método: un paso cada vez, explicar cada término y pedirme el mensaje exacto ante cualquier error.

## 2. Qué hizo la IA

- Convirtió el diseño exportado (17 pantallas empaquetadas) en 6 páginas HTML reales, sin rediseñarlas, y lo verificó comparando capturas píxel a píxel con el original.
- Escribió el código: el servidor (`main.py`) y los archivos JavaScript de cada pantalla.
- Resolvió huecos que el diseño no cubría (formulario de secciones fijas, edición de secciones variables, estados de carga y error) reutilizando estilos que ya existían.
- Consultó la documentación de Groq para elegir el modelo, en lugar de responder de memoria.
- Llevó un registro de sus propios errores a medida que aparecían.

## 3. Qué hice yo

- **Definí el problema, las funciones y la arquitectura** en los prompts iniciales.
- **Tomé las decisiones que el diseño dejaba abiertas:** ingresos ilimitados por mes, gastos fijos con historial (un cambio de importe solo vale de ese mes en adelante), una página por sección con versión de escritorio y móvil, y mostrar en el Panel el concepto que escribe el usuario.
- **Ejecuté y probé cada paso** en mi ordenador y en el navegador.
- **Detecté errores que la IA no podía ver** (apartado 4), porque dependían de mi pantalla, de mi navegador o de mi clave de Groq.
- **Reconozco un límite:** no entiendo cada línea del JavaScript. Sí entiendo qué hace cada archivo, cómo se comunican y cómo comprobar que funcionan, que es lo que me permitió dirigir el trabajo.

## 4. Errores de la IA y cómo se detectaron

| Error | Quién lo detectó y cómo | Corrección |
|---|---|---|
| Entregó seis pasos de golpe, contra la regla de «un paso cada vez» de mi prompt. | La IA, al releer mis reglas cuando reiniciamos la etapa. | Un paso por mensaje. |
| Me propuso un ejercicio que dejaba mi clave sin proteger (editar `.gitignore` con la clave real ya guardada). | **Yo:** `git check-ignore -v .env` no devolvió nada. | `git restore .gitignore`, tras comprobar que la clave no estaba en ningún commit. |
| Dio por buena la adaptación a distintas pantallas sin revisar que los textos cupieran: en mi portátil las cifras se partían en dos líneas. | **Yo**, al abrir el Panel a pantalla completa. La IA lo reprodujo y me pidió confirmarlo con una captura. | El diseño se reduce entero en pantallas de menos de 1440 px. |
| No previó la caché del navegador: tras una actualización mezclaba un archivo nuevo con uno antiguo y un formulario no se abría. | **Yo**, pegando el error exacto de la consola. Se diagnosticó en tres pasos. | El servidor obliga al navegador a comprobar si hay versiones nuevas. |
| En el Panel, la leyenda mezclaba mis datos con los de ejemplo del diseño. | La IA, antes de entregar, comparando su resultado con el diseño (107.000 píxeles distintos). | Tras corregirlo, 0 píxeles distintos en móvil. |
| El «Resumen del mes» del analista llegó en un solo párrafo, impersonal y con las cifras mal escritas («1200 euros»). | **Yo**, con la primera prueba real: la IA no podía probarlo porque no tiene mi clave. | Las cantidades viajan ya escritas («1.200 €») y el resumen se pide en un formato fijo de 3 observaciones. |
| Nunca me pidió revisar el contenido de `.env.example`; solo vigilaba `.env`. Yo había guardado ahí la clave real por error. | La protección de GitHub, que bloqueó la subida. | Borramos la clave de todo el historial de Git. |
| Claude Design dejó en móvil los campos de «Nueva sección» estrechos y descolocados. | La IA de desarrollo, al revisar capturas. | Los campos ocupan todo el ancho. |

Las capturas de estas pruebas están en [`docs/capturas/`](docs/capturas/).

Un riesgo que se evitó comprobando: muchas guías recomiendan el modelo `llama-3.3-70b-versatile`, que Groq retiró del plan gratuito en agosto de 2026. La IA lo vio en la documentación y yo confirmé el modelo elegido con una llamada real.

## 5. Qué aprendí

1. **La IA acierta más cuando las decisiones ya están tomadas.** Fijar la arquitectura en el prompt evitó que el proyecto creciera sin control.
2. **Comprobar es mi trabajo, no el de la IA.** Los errores más importantes solo se veían en mi equipo: mi pantalla, mi navegador, mi clave.
3. **El mensaje exacto de error vale más que una descripción.** Con el texto literal de la consola, el fallo de la caché se resolvió en minutos.
4. **A una IA no se le deben pedir cuentas.** Por eso el analista recibe las cifras ya calculadas y, si le piden un cálculo nuevo, responde que no está disponible. Es la decisión técnica que defiendo en la presentación.
5. **Los secretos se revisan en todos los archivos**, no solo en el que se supone que los contiene.
