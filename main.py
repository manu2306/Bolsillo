from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

# Carpeta donde están las páginas, el CSS y las fuentes
CARPETA_STATIC = Path(__file__).parent / "static"

app = FastAPI(title="Bolsillo")


@app.get("/api/salud")
def salud():
    """Responde 'ok'. El navegador la usará para despertar el servidor en Render."""
    return {"estado": "ok"}


# Sirve las páginas de la carpeta static. Va al final para no tapar las rutas /api.
app.mount("/", StaticFiles(directory=CARPETA_STATIC, html=True), name="static")