from flask import Flask, render_template, request, redirect
import openpyxl
import os

app = Flask(__name__)

# Datos base
archivo_excel = "registro_inventario.xlsx"
tecnicos = ["Carlos", "María", "Luis", "Ana"]
herramientas = ["Llave inglesa", "Destornillador", "Martillo", "Alicate", "Taladro"]
estados = ["Buena", "Malograda", "No sirve"]

# Crear archivo Excel si no existe
if not os.path.exists(archivo_excel):
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Inventario"
    ws.append(["Técnico", "Herramienta", "Cantidad", "Estado", "Observación"])
    wb.save(archivo_excel)

@app.route("/", methods=["GET", "POST"])
def formulario():
    if request.method == "POST":
        tecnico = request.form.get("tecnico")
        wb = openpyxl.load_workbook(archivo_excel)
        ws = wb["Inventario"]

        for herramienta in herramientas:
            tiene = request.form.get(f"tiene_{herramienta}") == "on"
            cantidad = request.form.get(f"cantidad_{herramienta}", "0")
            estado = request.form.get(f"estado_{herramienta}", "Sin especificar")
            observacion = request.form.get(f"observacion_{herramienta}", "")

            if tiene:
                ws.append([tecnico, herramienta, cantidad, estado, observacion])

        wb.save(archivo_excel)
        return redirect("/")

    return render_template("formulario.html", tecnicos=tecnicos, herramientas=herramientas, estados=estados)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
