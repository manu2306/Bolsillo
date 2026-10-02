# Decisiones técnicas

## Candidata para la presentación («1 decisión técnica que tomaron ustedes»)

**La IA de Groq solo interpreta cifras que ya ha calculado el navegador; nunca hace cuentas ni modifica datos.**
- **Problema que evita:** los modelos de lenguaje se equivocan con la aritmética e inventan cifras con total seguridad.
- **Cómo se aplica:** JavaScript calcula los totales y las variaciones y envía a Groq solo un resumen. Si el usuario pide un cálculo que no está en ese resumen, Groq responde con un mensaje fijo de «versión MVP».
- **Por qué es buena para la presentación:** se ve en la demo, es una decisión de diseño y no de código, y muestra que sé dónde no confiar en la IA.

Confirmada: el Analista IA ya funciona así.

## Arquitectura (fijada en el prompt inicial)

| Decisión | Por qué |
|---|---|
| Todos los cálculos en el navegador (JavaScript) | El servidor no necesita ver los datos; menos riesgo y menos código. |
| Datos en `localStorage` | Cada visitante tiene los suyos y nunca se guardan en el servidor. |
| FastAPI como intermediario mínimo | Solo sirve las páginas y protege la API key de Groq. |
| API key en `.env`, fuera de GitHub | Si se publica, cualquiera puede usarla a mi costa. |
| Límite de 20 consultas por IP y día, en memoria | Protege el gasto de Groq. Se reinicia cuando Render duerme el servidor: limitación documentada del MVP. |
| Groq solo interpreta cifras ya calculadas | Evita que la IA invente números o haga cuentas mal. |
| Solo se publica la carpeta `static/` | El diseño original, el informe y `.env` quedan fuera del alcance del navegador. |
| Cada cambio lanza el aviso `bolsillo:cambio` y las pantallas se redibujan al recibirlo | Así el dashboard se actualiza al instante sin recargar la página. |
| El servidor obliga al navegador a comprobar si hay archivos nuevos (`Cache-Control: no-cache`) | Tras una actualización nadie se queda con una mezcla de archivos viejos y nuevos. |
| Todas las cuentas están en un solo archivo, `calculos.js` | Es fácil de revisar y demuestra que el servidor no calcula nada. |

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

## Huecos del diseño resueltos con estilos existentes (etapas 4 y 5)

| Hueco | Cómo se resolvió |
|---|---|
| No había formulario para crear o editar secciones fijas | Se reutiliza el bloque «Nueva sección» de Gastos variables dentro del marco de los diálogos, con un campo más: «Monto mensual». |
| Solo había diálogo de borrar gasto (escritorio) y de borrar sección (móvil) | Un único diálogo con los dos estilos, usado en todos los borrados, también en Ingresos. |
| No se indicaba el estado «motivo elegido» ni «lista vacía» | Colores de la etiqueta verde del diseño y un texto breve. |
| El presupuesto de una sección | Es opcional; sin presupuesto la tarjeta muestra «—». |
| Eliminar una sección fija | La borra de todos los meses, como dice el texto del diálogo del diseño. |
| El diseño no permitía editar ni eliminar secciones variables | Botón «Editar sección», copia del de «Crear sección nueva», que abre el mismo bloque con una papelera. |
| Eliminar una sección variable | Borra también sus gastos de todos los meses; el diálogo avisa de cuántos son. |
| Un gasto con fecha de otro mes | Se guarda en su mes y la pantalla salta a ese mes para que se vea. |
| La fecha se escribe a mano | Admite «27/03/2026», «27/3» o solo «27»; lo que falta se toma del mes elegido. |

## Reglas del Panel (etapa 7)

| Regla | Por qué |
|---|---|
| `calculos.js` hace las cuentas y `panel.js` solo dibuja | El mismo resumen calculado es el que se enviará al Analista IA: la IA nunca calcula. |
| El estado vacío aparece mientras no haya ningún ingreso | Es lo que dice el texto del diseño: «Añada su primer ingreso para empezar». |
| Gastar más que el mes anterior se muestra en rojo con flecha arriba; gastar menos, en verde con flecha abajo | El diseño solo dibujó el caso rojo; el verde usa los colores de la etiqueta «−7,7 %» de su tabla. |
| Si el mes anterior no tiene gastos, la variación muestra «—» | No se puede calcular un porcentaje sobre cero, y no se inventa. |
| El eje del gráfico de barras se adapta al valor más alto | El diseño lo tenía fijo en 2.400 €; con otros ingresos las barras se saldrían. |
| Los medidores solo aparecen para secciones con presupuesto | Sin tope no hay nada que medir. |

## Exportar e importar (etapa 8)

| Regla | Por qué |
|---|---|
| El archivo es JSON y se genera y se lee en el navegador | El servidor nunca ve los datos del usuario. |
| Antes de aceptar un archivo se comprueba campo a campo | Un archivo dañado o de otro programa no puede romper la aplicación ni borrar los datos. |
| Si ya hay datos, se pide confirmación antes de sustituirlos | Cargar un archivo reemplaza todo; es la única acción que puede hacer perder datos. |

## Analista IA (etapas 9 y 10)

| Regla | Por qué |
|---|---|
| Modelo `openai/gpt-oss-120b`, con `openai/gpt-oss-20b` de reserva | Es de la lista de producción de Groq, está en el plan gratuito y redacta bien en español. Si falla, se prueba el de reserva. |
| El navegador envía un resumen con todas las diferencias ya calculadas | La IA no tiene que restar ni dividir: solo interpreta. |
| Las cantidades se envían ya escritas como texto («1.200 €», «+9,6 %») | La IA las copia tal cual: no puede equivocarse al dar formato ni al redondear. |
| El resumen del mes se pide en formato JSON con 3 observaciones | Así la pantalla puede numerarlas como en el diseño; si la IA no obedece, el servidor parte el texto por frases. |
| Las reglas de la IA están en el servidor, no en el navegador | El usuario no puede cambiarlas, y su pregunta se trata solo como una pregunta. |
| Si no hay datos en el mes, se responde sin llamar a Groq | No se gasta una de las 20 consultas diarias. |
| La pantalla avisa si el servidor tarda | En Render el servidor se duerme tras 15 minutos sin visitas y la primera consulta puede tardar. |

**Limitaciones del MVP (para el README):**
- El contador de consultas está en memoria: se reinicia cuando Render duerme el servidor.
- La IP se toma de una cabecera que un usuario avanzado podría falsear.
- La conversación no se guarda: al recargar la página empieza de nuevo.

## Reparto del trabajo

| Lo hizo la IA | Lo hice yo |
|---|---|
| Desempaquetar el diseño y extraer las pantallas (requería un navegador automático). | Definir la arquitectura y las reglas del prompt. |
| Montar las páginas y verificarlas píxel a píxel. | Decidir las 5 cuestiones abiertas del diseño. |
| Proponer comandos y explicar cada paso. | Ejecutar cada paso y comprobar los resultados. |
| | Detectar los errores 2 y 4 y exigir confirmación antes de corregir. |
