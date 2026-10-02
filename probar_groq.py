import os

from dotenv import load_dotenv
from groq import Groq

MODELO = "openai/gpt-oss-120b"

# Lee la clave del archivo .env (nunca se escribe en el código)
load_dotenv()
clave = os.environ.get("GROQ_API_KEY")
if not clave:
    raise SystemExit("No se ha encontrado GROQ_API_KEY en el archivo .env")

cliente = Groq(api_key=clave)
respuesta = cliente.chat.completions.create(
    model=MODELO,
    messages=[{"role": "user", "content": "Responda solo con la palabra: funciona"}],
    reasoning_effort="low",
    include_reasoning=False,
    max_completion_tokens=200,
)

print("Modelo:", MODELO)
print("Respuesta:", respuesta.choices[0].message.content)