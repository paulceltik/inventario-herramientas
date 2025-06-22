from flask import Flask, render_template, request
import gspread
import json
import os
from oauth2client.service_account import ServiceAccountCredentials

app = Flask(__name__)

scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]

# Si estás en local, usa creds.json; si estás en Render, usa variable de entorno
if "GOOGLE_SHEETS_CREDENTIALS" in os.environ:
    google_creds = json.loads(os.environ["GOOGLE_SHEETS_CREDENTIALS"])
else:
    with open("creds.json") as f:
        google_creds = json.load(f)

creds = ServiceAccountCredentials.from_json_keyfile_dict(google_creds, scope)
cliente_gs = gspread.authorize(creds)
hoja = cliente_gs.open("Inventario Taller").sheet1

# Lista de herramientas y estados
herramientas = [
    "Llave inglesa", "Destornillador", "Alicate", "Multímetro", "Taladro",
    "Martillo", "Cinta métrica", "Pistola de calor", "Llave Allen", "Compresómetro"
]

estados = ["Buena", "Malograda", "No sirve"]

# Lista de técnicos
tecnicos = ["Juan", "María", "Carlos", "Ana", "Pedro"]

@app.route("/", methods=["GET", "POST"])
def formulario():
    if request.method == "POST":
        tecnico = request.form.get("tecnico")
        for herramienta in herramientas:
            tiene = request.form.get(f"tiene_{herramienta}")
            cantidad = request.form.get(f"cantidad_{herramienta}")
            estado = request.form.get(f"estado_{herramienta}")
            observacion = request.form.get(f"observacion_{herramienta}")

            if tiene:
                hoja.append_row([tecnico, herramienta, cantidad, estado, observacion])
        return "¡Inventario registrado correctamente!"

    return render_template("formulario.html", herramientas=herramientas, estados=estados, tecnicos=tecnicos)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Render asigna el puerto por variable de entorno
    app.run(host="0.0.0.0", port=port, debug=True)

