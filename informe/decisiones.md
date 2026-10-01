# Decisiones técnicas

## Candidata para la presentación («1 decisión técnica que tomaron ustedes»)

**La IA de Groq solo interpreta cifras que ya ha calculado el navegador; nunca hace cuentas ni modifica datos.**
- **Problema que evita:** los modelos de lenguaje se equivocan con la aritmética e inventan cifras con total seguridad.
- **Cómo se aplica:** JavaScript calcula los totales y las variaciones y envía a Groq solo un resumen. Si el usuario pide un cálculo que no está en ese resumen, Groq responde con un mensaje fijo de «versión MVP».
- **Por qué es buena para la presentación:** se ve en la demo, es una decisión de diseño y no de código, y muestra que sé dónde no confiar en la IA.

(Se confirmará cuando el Analista IA esté funcionando.)

## Arquitectura (fijada en el prompt inicial)

| Decisión | Por qué |
|---|---|
| Todos los cálculos en el navegador (JavaScript) | El servidor no necesita ver los datos; menos riesgo y menos código. |
| Datos en `localStorage` | Cada visitante tiene los suyos y nunca se guardan en el servidor. |
| FastAPI como intermediario mínimo | Solo sirve las páginas y protege la API key de Groq. |
| API key en `.env`, fuera de GitHub | Si se publica, cualquiera puede usarla a mi costa. |
| Límite de 20 consultas por IP y día, en memoria | Protege el gasto de Groq. Se reinicia cuando Render duerme el servidor: limitación documentada del MVP. |
| Groq solo interpreta cifras ya calculadas | Evita que la IA invente números o haga cuentas mal. |

## Decisiones sobre el diseño (sesión 1)

1. **Una página por sección con las maquetas de escritorio y móvil**, alternadas por CSS. Así no hay que rediseñar.
2. **Ingresos ilimitados por mes**: el ingreso del mes es la suma.
3. **Gastos fijos con historial**: un cambio de importe solo afecta desde ese mes en adelante; los meses pasados conservan su valor.
4. **Estados no dibujados** (cargando, límite, error, vacíos): se hacen con estilos que ya existen en el diseño.
5. **El Panel muestra el concepto** que escribe el usuario bajo el ingreso del mes.

## Ajustes técnicos al montar el diseño (etapa 1)

Ninguno cambia el aspecto: a 1440 px las páginas son idénticas al diseño, con 0 píxeles distintos.

| Ajuste | Por qué |
|---|---|
| Marco exterior al 100 % del ancho y con alto mínimo de pantalla | Con ancho fijo aparecía barra horizontal; con alto fijo, los datos que no cupieran quedarían cortados. |
| Diálogos y menú móvil fijos en pantalla | Si el usuario ha bajado por la página, el diálogo debe aparecer donde está mirando. |
| Cambio a móvil por debajo de 1100 px | La tabla de Gastos variables necesita 1065 px. |
| `zoom` del diseño entre 1100 y 1439 px | El diseño mide 1440 px; así se reduce entero en lugar de partir las cifras. |
| Menú móvil con CSS `:target` | Funciona sin JavaScript. |

## Reparto del trabajo

| Lo hizo la IA | Lo hice yo |
|---|---|
| Desempaquetar el diseño y extraer las pantallas (requería un navegador automático). | Definir la arquitectura y las reglas del prompt. |
| Montar las páginas y verificarlas píxel a píxel. | Decidir las 5 cuestiones abiertas del diseño. |
| Proponer comandos y explicar cada paso. | Ejecutar cada paso y comprobar los resultados. |
| | Detectar los errores 2 y 4 y exigir confirmación antes de corregir. |

| Solo se publica la carpeta `static/` | El diseño original, el informe y `.env` quedan fuera del alcance del navegador. |
