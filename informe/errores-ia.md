# Errores de la IA

Quién detectó cada error es la clave para el criterio «dirigir bien a la IA».

| # | Etapa | Error de la IA | Quién lo detectó y cómo | Corrección |
|---|---|---|---|---|
| 1 | 0 | Entregó los 6 pasos de la etapa en un solo mensaje, contra la regla del prompt de «nunca varios pasos juntos». | **La IA**, al comparar lo que había hecho con las reglas del prompt cuando reiniciamos la etapa. | Desde entonces, un paso por mensaje. |
| 2 | 0 | Diseñó un mini-reto que obligaba a editar `.gitignore` con la API key real ya guardada en `.env`, y la clave quedó desprotegida. | **Yo**: `git check-ignore -v .env` no devolvió nada y `git status` mostró `?? .env`. | `git restore .gitignore`, tras comprobar con `git ls-files` que `.env` no estaba en ningún commit. |
| 3 | 1 | Situó el cambio a móvil en 900 px, pero la tabla de Gastos variables necesita 1065 px y se cortaba. | **La IA, antes de entregar**, midiendo el ancho real de cada página en 9 tamaños de pantalla. | Límite subido a 1100 px. |
| 4 | 1 | Validó la adaptación a distintos anchos mirando solo si había desplazamiento horizontal, sin revisar que las cifras cupieran: entre 1100 y 1439 px se partían en dos líneas. | **Yo**, al ver el Panel a pantalla completa en mi portátil. La IA lo reprodujo a 1280 px y me pidió confirmar con una captura. | El diseño de escritorio se reduce entero con `zoom` (90/85/80/76 %). Capturas en `capturas/etapa1-*`. |
| 5 | 1 | Al unir las maquetas de escritorio y móvil en una página dejó identificadores HTML repetidos (dos campos `inc-c`). | **La IA**, al revisar su propio trabajo en la etapa 4. | Los de la maqueta móvil llevan el sufijo `-m`. |
| 6 | 5 | En el formulario de sección, los campos salían estrechos y pegados a la derecha, por un estilo heredado del bloque del diseño que reutilizó. | **La IA, antes de entregar**, al revisar una captura del formulario. | Corrigió la alineación del contenedor de campos. |
| 7 | 5 | No previó que el navegador guardaría copias antiguas de los archivos JavaScript: tras actualizar, mezclaba un archivo nuevo con otro viejo y el formulario de sección no se abría. | **Yo**, al pegar el error exacto de la consola. Se diagnosticó en tres pasos: `Comun.COLORES` daba `undefined`, pero el archivo en disco era el nuevo, así que el fallo estaba en la caché. | `main.py` añade `Cache-Control: no-cache` a cada archivo. |
| 8 | Diseño | **Error de la IA de diseño (Claude Design):** en móvil, los campos del bloque «Nueva sección» quedaban estrechos y pegados a la derecha. | **La IA de desarrollo**, al revisar capturas de la etapa 6 y compararlas con el diseño original. | Los campos ocupan todo el ancho, como el resto de formularios. |
| 9 | 7 | En el Panel, la leyenda del anillo mezclaba las secciones reales con las de ejemplo del diseño, y «Cuánto sobra» perdía su color verde. | **La IA, antes de entregar**: cargó en la app los mismos datos de ejemplo del diseño y comparó las dos imágenes píxel a píxel (107.000 píxeles distintos). | Tras corregirlo: 0 píxeles distintos en móvil y 267 en escritorio (el «58 %» ya no se parte en dos líneas). Captura en `capturas/etapa7-*`. |
| 10 | 8 | Al cargar dos veces seguidas el mismo archivo, la segunda vez no ocurría nada: el navegador no avisa si el archivo elegido es el mismo. | **La IA, antes de entregar**, con una prueba automática que cargaba el mismo archivo dos veces. | El selector de archivos se vacía después de cada carga. |

## Incidencias que no fueron errores de la IA

- **Etapa 0:** `.env.example` no aparecía en `git status` porque lo guardé después de `git add .`. Se diagnosticó con `Get-ChildItem` y `git check-ignore`.
- **Etapa 1:** al abrir las páginas con doble clic (`file:///`), Chrome muestra un aviso de seguridad al cerrar el menú móvil. Es una limitación de `file:///` y desaparece cuando el servidor sirve las páginas.
- **Etapa 2:** marqué el paso como hecho sin abrir las páginas. La IA lo detectó porque el registro de uvicorn no tenía ninguna línea `GET`, y repetimos las comprobaciones.
- **Etapa 3:** escribí en PowerShell unas líneas que eran de JavaScript. La IA me explicó la diferencia entre PowerShell y la consola del navegador (F12).
