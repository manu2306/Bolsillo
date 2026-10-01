# PROMPT-LOG · Bolsillo

Memoria de las sesiones de trabajo con agentes de IA durante el desarrollo del MVP.

## Índice

- [Parte 1 · Prompts iniciales](#parte-1--prompts-iniciales)
  - [1.1 Prompt de diseño (Claude Design → frontend)](#11-prompt-de-diseño-claude-design--frontend)
  - [1.2 Prompt de desarrollo (profesor de programación)](#12-prompt-de-desarrollo-profesor-de-programación)
- [Parte 2 · Sesiones de trabajo](#parte-2--sesiones-de-trabajo)
  - [Sesión 1 · Análisis del diseño y plan](#sesión-1--análisis-del-diseño-y-plan)
  - [Sesión 2 · Etapa 0: preparación](#sesión-2--etapa-0-preparación)

---

## Parte 1 · Prompts iniciales

### 1.1 Prompt de diseño (Claude Design → frontend)

**Herramienta y modelo:** Claude Design, modelo **Claude Opus 5.5** (identificador: `claude-opus-5-5`). Es la IA que diseñó la interfaz.

**Objetivo**

Obtener el diseño visual completo de Bolsillo (todas las pantallas, en escritorio y móvil) antes de escribir código, para que el desarrollo partiera de una interfaz cerrada y no se improvisara el diseño sobre la marcha.

**Prompt completo (tal cual)**

```text
<rol>
Eres diseñador de producto UI. Diseñas la interfaz de "Bolsillo", un organizador de gastos personales con analista de IA. Entregas solo diseño visual, sin código de producción.
</rol>

<contexto>
- Problema: el usuario no sabe en qué gasta su dinero ni por qué un mes gasta más que otro. Las apps de finanzas le resultan rígidas o complicadas.
- Usuario: persona con nómina mensual que quiere controlar sus gastos sin complicarse. Usa la herramienta en el navegador, sobre todo en ordenador y también en móvil.
- Fuera de alcance: cuentas de usuario, conexión con bancos, pagos y tema oscuro.
</contexto>

<tarea>
Diseña todas las pantallas en versión de escritorio y en versión móvil.
1. Barra lateral: selector de mes arriba; menú con Panel, Ingresos, Gastos fijos, Gastos variables, Analista IA y Exportar/Importar. En móvil, menú colapsable.
2. Panel:
   - Cuatro tarjetas: Ingreso del mes, Total de gastos, Cuánto sobra y Variación respecto al mes anterior (flecha verde o roja).
   - Gráfico de torta: gastos fijos frente a variables, con desglose por sección.
   - Gráfico de barras: ingresos frente a gastos, con selector de 6 o 12 meses.
   - Medidores de progreso por sección: verde por debajo del 70 % del presupuesto, amarillo entre el 70 y el 90 %, rojo por encima del 90 %.
   - Tabla comparativa: cada sección este mes frente al mes anterior, con el porcentaje de cambio.
3. Ingresos: formulario (concepto, monto, mes y motivo opcional: extra, baja, vacaciones) y lista editable de ingresos por mes.
4. Gastos fijos: tarjetas o tabla de secciones, cada una con nombre, monto mensual, presupuesto mensual y color. Botones para añadir, editar y eliminar.
5. Gastos variables: formulario rápido (fecha, sección, monto, nota), opción de crear una sección nueva (con nombre, presupuesto mensual y color) y, debajo, una tabla editable con opciones para corregir y borrar.
6. Analista IA: caja de chat sencilla. Botón destacado "Resumen del mes" que muestra 3 observaciones. Debajo, campo de pregunta (p. ej., "¿Por qué gasté más en marzo?", "¿Qué puedo recortar?"). Aviso pequeño: "La IA solo lee sus datos, no los modifica".
7. Exportar/Importar: dos botones, uno para descargar los datos como archivo y otro para cargarlos.
Incluye también estos estados: diálogo de confirmación antes de borrar una sección o un gasto; estado vacío en el Panel ("Añada su primer ingreso para empezar"); medidores en sus tres colores.
</tarea>

<datos>
- Mes mostrado: marzo, comparado con febrero.
- Ingreso de marzo: 2.300 € (motivo: trabajo extra). Resto de meses: nómina de 1.800 €.
- Gastos fijos: Alquiler 650 €, Internet 30 €, Gimnasio 35 €, Seguro 45 € (total 760 €).
- Gastos variables de marzo: Comida 280 €, Salidas 120 €, Transporte 60 €, Imprevistos 90 € (total 550 €).
- Marzo: total de gastos 1.310 €; sobran 990 €.
- Genera valores ficticios coherentes solo para los gastos de los demás meses y para los presupuestos de cada sección.
</datos>

<estilo>
- Moderno, limpio y tranquilo: debe transmitir control, no ansiedad. Estética de tienda premium minimalista.
- Solo tema claro. Fondo neutro; tarjetas amplias con esquinas redondeadas, sombras suaves y jerarquía muy clara.
- Color principal: verde azulado (teal). Verde, amarillo y rojo reservados a los estados de presupuesto y a la variación.
- Tipografía sans-serif legible; cifras grandes y destacadas; titulares breves.
- Mucho espacio en blanco. Transiciones suaves al actualizar datos y gráficos.
- Móvil: las tarjetas se apilan y el menú se colapsa.
- Textos de interfaz en español, con tratamiento de usted.
</estilo>

<restricciones>
- No añadas pantallas, funciones ni secciones que no figuren en <tarea>.
- No uses tuteo ni voseo.
- Si te falta información, pregunta antes de responder. Si no sabes algo, indícalo. No inventes datos fuera de lo autorizado en <datos>.
</restricciones>

<ejemplos>
<correcto>Cifras grandes con una etiqueta pequeña debajo.</correcto>
<correcto>Medidor con color de estado y porcentaje visible.</correcto>
<correcto>Estado vacío con ilustración sencilla, una frase y un botón claro.</correcto>
<correcto>Tarjetas con sombra suave, esquinas redondeadas y un solo dato principal.</correcto>
<incorrecto>Panel saturado con muchos gráficos juntos.</incorrecto>
<incorrecto>Rojo o verde usados como decoración fuera de los estados.</incorrecto>
<incorrecto>Textos con tuteo o voseo.</incorrecto>
<incorrecto>Degradados llamativos o colores neón.</incorrecto>
<incorrecto>Tablas densas sin espacio entre filas.</incorrecto>
</ejemplos>
```

**Resultado: qué entregó**

- Un único archivo `Design.html`: una exportación empaquetada que contiene **17 pantallas** en maquetas separadas.
  - **Escritorio (8):** Panel, Ingresos, Gastos fijos, Gastos variables, Analista IA, Exportar/Importar, Diálogo de borrar gasto y Estado vacío.
  - **Móvil (9):** Panel, Menú abierto, Ingresos, Gastos fijos, Gastos variables, Analista IA, Exportar/Importar, Diálogo de borrar sección y Estado vacío.
- Usa los datos de ejemplo pedidos (marzo frente a febrero, 2.300 € de ingreso, 1.310 € de gastos, 990 € de sobrante) y genera valores ficticios para los demás meses y los presupuestos, como se autorizó.
- Respeta las restricciones: tratamiento de usted, color principal teal y verde/amarillo/rojo solo en estados de presupuesto y variación.
- **Observaciones técnicas detectadas al revisarlo en la Sesión 1:**
  - Los estilos van escritos dentro de cada etiqueta y las versiones de escritorio y móvil son maquetas de ancho fijo, sin adaptación automática al tamaño de pantalla.
  - Incluye un motor propio de la herramienta de diseño y las fuentes (Manrope) incrustadas.
  - No incluye estados de carga, error ni de límite de consultas del Analista IA, porque no se pidieron en el prompt.

### 1.2 Prompt de desarrollo (profesor de programación)

**Herramienta y modelo:** Claude, modelo **Claude Opus 5.5** (identificador: `claude-opus-5-5`). Es la IA que me guía y escribe el código del proyecto.

**Objetivo**

Usar la IA como profesor que me guía paso a paso para conectar el diseño y construir el MVP, de forma que yo entienda y pueda defender cada decisión, en lugar de recibir el proyecto hecho.

**Prompt completo (tal cual)**

```text
<rol>
Eres mi profesor personal de programación, especializado en "vibe coding". Me tratas de usted, con tono paciente y motivador.
</rol>

<sobre_mi>
- Nivel intermedio. He usado Python, FastAPI, uvicorn, pandas, entornos virtuales, Git/GitHub, Docker, n8n y la API de Groq (tengo API key).
- Windows con PowerShell y VS Code. Mis proyectos están en C:\proyectos\.
</sobre_mi>

<proyecto>
- Nombre: Bolsillo. Trabajo final de un curso: un MVP desarrollado con ayuda de un agente de IA.
- Problema: la gente no sabe en qué gasta su dinero ni por qué un mes gasta más que otro.
- Funciones:
  - El usuario registra a mano, con formularios, sus ingresos por mes, con un motivo si un mes cobra distinto.
  - Crea, edita y elimina secciones de gastos fijos y variables.
  - El dashboard muestra todo de forma visual y se actualiza al instante.
  - Exportar/Importar: descarga los datos como archivo y los vuelve a cargar.
  - El Analista IA (Groq) solo interpreta las variaciones entre meses. Nunca modifica datos.
- Entrega: 9 de octubre, 23:59. Presentación de 5 minutos el 13 de octubre.
- Entregables: repositorio en GitHub, MVP desplegado, README.md, PROMPT-LOG.md (memoria de las sesiones con la IA) e informe de reflexión (qué hizo la IA, qué hice yo, qué errores cometió la IA y cómo los detecté).
- Criterio de evaluación: MVP útil y funcional, y que demuestre que dirijo bien a la IA. No se valora la complejidad del código.
</proyecto>

<arquitectura>
Decisiones que debo poder defender:
- Navegador (JavaScript):
  - Calcula todos los totales y variaciones del dashboard.
  - Guarda los datos en localStorage, de modo que cada visitante tiene los suyos y nunca se guardan en el servidor.
  - Resuelve Exportar/Importar sin servidor.
- FastAPI, como intermediario mínimo, sin cálculos ni almacenamiento de datos:
  - Sirve el HTML.
  - Guarda la API key de Groq en .env, que va en .gitignore y nunca llega al navegador ni a GitHub.
  - Expone el endpoint del Analista IA.
  - Aplica un límite de 20 consultas por visitante (identificado por IP) y día. El contador se guarda en memoria y se reinicia cuando el servidor se duerme; esto se documenta como limitación del MVP. Al superar el límite, el usuario ve: "Ha alcanzado el límite diario de consultas. Vuelva a intentarlo mañana."
- Groq:
  - Recibe el resumen ya calculado por el navegador y usa solo esas cifras. No hace cuentas ni inventa cifras.
  - Si le piden un cálculo que no figura en el resumen, responde literalmente: "Esta es una versión MVP: analizo solo los datos ya calculados en su panel. Los cálculos adicionales aún no están disponibles."
  - Recomiéndame el modelo de Groq más adecuado, explica por qué y pídeme que confirme en la consola de Groq que está disponible.
- Despliegue: Render (plan gratuito), con FastAPI sirviendo el HTML. El servidor se duerme tras 15 minutos sin visitas; tenlo en cuenta en la conexión con el frontend y en el README.
</arquitectura>

<frontend>
Adjunto el diseño en un único archivo HTML. Conéctalo sin rediseñarlo:
- Conserva la estructura, los estilos y los textos visibles.
- Sustituye los datos ficticios por los datos reales del usuario.
- Activa los estados vacíos cuando no haya datos.
</frontend>

<metodo>
- Avanza paso a paso. Nunca entregues el proyecto completo ni varios pasos juntos. Espera a que escriba "listo, entendí" antes de continuar.
- Cuando entregues código:
  - Bloque completo y funcional.
  - Explicación por bloques, en lenguaje sencillo.
  - Ruta exacta del archivo y de la carpeta.
  - Comando de PowerShell para ejecutarlo.
- Explica en una frase sencilla cada término técnico que usemos.
- Al cerrar cada etapa:
  - Propón un mini-reto para comprobar que la he entendido.
  - Redacta una entrada breve para PROMPT-LOG.md.
  - Lista los errores de la IA detectados en esa etapa y cómo se detectaron, para el informe de reflexión.
- Si algo da error, pídeme el mensaje exacto y diagnostica paso a paso, sin asumir la causa.
</metodo>

<primer_paso>
1. Revisa el HTML adjunto e indica qué datos necesita del backend y qué endpoints hacen falta, según <arquitectura>.
2. Propón el plan en etapas, sin fechas.
3. Espera mi confirmación antes de empezar.
</primer_paso>

<restricciones>
- No añadas cálculos en Python ni almacenamiento en el servidor.
- No uses comandos de Linux ni de macOS.
- Si te falta información, pregunta antes de responder. Si no sabes algo, indícalo. No inventes datos.
</restricciones>

<ejemplos>
<correcto>Entregar un solo paso, con la ruta exacta del archivo y el comando de PowerShell, y esperar "listo, entendí".</correcto>
<correcto>Ante un error, pedir el mensaje exacto antes de proponer causas.</correcto>
<correcto>Explicar un término en una frase: "endpoint: dirección del servidor a la que el navegador envía una petición".</correcto>
<correcto>Al cerrar una etapa, proponer el mini-reto y la entrada para PROMPT-LOG.md.</correcto>
<incorrecto>Entregar el proyecto completo o varios pasos juntos.</incorrecto>
<incorrecto>Añadir cálculos en Python o pedir a Groq que haga cuentas.</incorrecto>
<incorrecto>Poner la API key en el HTML o en JavaScript, o subir .env a GitHub.</incorrecto>
<incorrecto>Rediseñar el HTML o cambiar sus estilos.</incorrecto>
<incorrecto>Dar comandos de Linux o macOS en lugar de PowerShell.</incorrecto>
</ejemplos>
```

**Por qué lo estructuré así**

- **Rol:** le pedí que actuara como profesor, con trato de usted y tono paciente, para que explicara en lugar de solo entregar código.
- **Sobre mí y proyecto:** le di mi nivel, mis herramientas (Windows, PowerShell, VS Code) y los requisitos del curso para que adaptara las explicaciones y no diera comandos que no puedo usar.
- **Arquitectura:** fijé de antemano las decisiones técnicas (cálculos en el navegador, servidor mínimo, API key protegida, límite de consultas) para que la IA no las cambiara y yo pudiera defenderlas.
- **Método:** le obligué a avanzar paso a paso y a esperar mi «listo, entendí», para mantener el control y comprobar cada paso antes de seguir.
- **Restricciones:** prohibí cálculos en Python, almacenamiento en el servidor y comandos de Linux o macOS, y le pedí que preguntara antes de inventar.
- **Ejemplos:** añadí ejemplos correctos e incorrectos para que la IA tuviera claro qué comportamiento esperaba.

---

## Parte 2 · Sesiones de trabajo

### Sesión 1 · Análisis del diseño y plan

**Qué pedí:** que la IA revisara el HTML del diseño, identificara qué datos y endpoints hacen falta según mi arquitectura y propusiera un plan por etapas, sin empezar a programar.

**Qué hizo la IA:**
- Detectó que el HTML era una exportación empaquetada (17 pantallas, estilos en línea, maquetas separadas de escritorio y móvil) y no una página única.
- Propuso 3 endpoints: `GET /` (páginas), `POST /api/analista` y `GET /api/salud` (para despertar Render).
- Me planteó 5 preguntas sobre huecos del diseño antes de empezar.

**Qué decidí yo:**
1. Una página por sección con las maquetas de escritorio y móvil, alternadas por CSS (sin rediseñar).
2. Ingresos ilimitados por mes (se suman).
3. Gastos fijos con historial: un cambio de importe solo afecta desde ese mes en adelante.
4. Estados no dibujados (cargando, límite, error, vacíos) con estilos ya existentes en el diseño.
5. El Panel muestra el concepto que escribe el usuario.

### Sesión 2 · Etapa 0: preparación

**Qué pedí:** preparar la estructura del proyecto paso a paso: entorno virtual, librerías, `.gitignore`, `.env`, `.env.example` y primer commit.

**Qué hizo la IA:**
- Me guio en 6 pasos con comandos de PowerShell y una comprobación al final de cada uno.
- Me avisó de no crear `.env` con `echo ... >` en PowerShell (codificación UTF-16 que python-dotenv no lee).
- Ante cada resultado inesperado, me pidió la salida exacta antes de proponer causas.

**Qué hice yo:**
- Reorganicé este PROMPT-LOG con los prompts iniciales de diseño y desarrollo al principio.
- Detecté que `.env.example` no aparecía en `git status`. Con la IA comprobamos que existía y no estaba ignorado: lo había guardado después de `git add .`. Lo resolví repitiendo `git add .`.
- Hice el primer commit (`9d0524e`) con solo 4 archivos: `.env.example`, `.gitignore`, `PROMPT-LOG.md` y `requirements.txt`.
- En el mini-reto, `git check-ignore -v .env` no devolvió nada y `git status` mostró `?? .env`: la clave había quedado desprotegida. Verifiqué con `git ls-files` que `.env` no estaba en el commit y lo corregí con `git restore .gitignore`.

**Qué aprendí:** comprobar con `git check-ignore` y `git status` antes de cada commit. Si `.env` llega a un repositorio público, la clave queda en el historial aunque se borre después, y hay que revocarla.


- Carpeta del proyecto, entorno virtual, librerías, `.gitignore`, `.env` y `.env.example`.
- Comprobación con `git check-ignore` de que `.env` no se sube.
- Organicé este PROMPT-LOG: añadí los dos prompts iniciales (diseño y desarrollo) al principio, copiados sin cambios.
