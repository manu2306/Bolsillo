# Errores de la IA

Quién detectó cada error es la clave para el criterio «dirigir bien a la IA».

| # | Etapa | Error de la IA | Quién lo detectó y cómo | Corrección |
|---|---|---|---|---|
| 1 | 0 | Entregó los 6 pasos de la etapa en un solo mensaje, contra la regla del prompt de «nunca varios pasos juntos». | **La IA**, al comparar lo que había hecho con las reglas del prompt cuando reiniciamos la etapa. | Desde entonces, un paso por mensaje. |
| 2 | 0 | Diseñó un mini-reto que obligaba a editar `.gitignore` con la API key real ya guardada en `.env`, y la clave quedó desprotegida. | **Yo**: `git check-ignore -v .env` no devolvió nada y `git status` mostró `?? .env`. | `git restore .gitignore`, tras comprobar con `git ls-files` que `.env` no estaba en ningún commit. |
| 3 | 1 | Situó el cambio a móvil en 900 px, pero la tabla de Gastos variables necesita 1065 px y se cortaba. | **La IA, antes de entregar**, midiendo el ancho real de cada página en 9 tamaños de pantalla. | Límite subido a 1100 px. |
| 4 | 1 | Validó la adaptación a distintos anchos mirando solo si había desplazamiento horizontal, sin revisar que las cifras cupieran: entre 1100 y 1439 px se partían en dos líneas. | **Yo**, al ver el Panel a pantalla completa en mi portátil. La IA lo reprodujo a 1280 px y me pidió confirmar con una captura. | El diseño de escritorio se reduce entero con `zoom` (90/85/80/76 %). Capturas en `capturas/etapa1-*`. |

## Incidencias que no fueron errores de la IA

- **Etapa 0:** `.env.example` no aparecía en `git status` porque lo guardé después de `git add .`. Se diagnosticó con `Get-ChildItem` y `git check-ignore`.
- **Etapa 1:** al abrir las páginas con doble clic (`file:///`), Chrome muestra un aviso de seguridad al cerrar el menú móvil. Es una limitación de `file:///` y desaparece cuando el servidor sirve las páginas.

- **Etapa 2:** marqué el paso como hecho sin abrir las páginas. La IA lo detectó porque el registro de uvicorn no tenía ninguna línea `GET`, y repetimos las comprobaciones.