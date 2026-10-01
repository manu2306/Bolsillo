// exportar.js — Descarga los datos como archivo y los vuelve a cargar. Todo ocurre en el navegador.

(function () {
  const VERDE = "rgb(46, 122, 75)";
  const ROJO = "rgb(174, 58, 46)";

  // Selector de archivos del sistema (invisible): se abre al pulsar "Cargar archivo"
  const selector = document.createElement("input");
  selector.type = "file";
  selector.accept = ".json,application/json";
  selector.hidden = true;
  document.body.append(selector);

  // Mensaje de resultado bajo el botón pulsado, con el estilo de los textos del diseño
  function avisar(nombreBoton, texto, color) {
    document.querySelectorAll('[data-b="' + nombreBoton + '"]').forEach(function (boton) {
      let aviso = boton.parentElement.querySelector("[data-aviso]");
      if (!aviso) {
        aviso = boton.parentElement.querySelector("p").cloneNode(false);
        aviso.dataset.aviso = "";
        aviso.setAttribute("role", "status");
        boton.after(aviso);
      }
      aviso.textContent = texto;
      aviso.style.color = color;
      aviso.style.fontWeight = 600;
    });
  }

  function resumen(datos) {
    const n = function (cuantos, uno, varios) { return cuantos + " " + (cuantos === 1 ? uno : varios); };
    return n(datos.ingresos.length, "ingreso", "ingresos") + ", " +
           n(datos.secciones.length, "sección", "secciones") + " y " +
           n(datos.gastos.length, "gasto", "gastos");
  }

  // ---------- Descargar ----------

  function descargar() {
    const datos = Datos.cargar();
    const hoy = new Date();
    const fecha = hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");
    const archivo = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = "bolsillo-datos-" + fecha + ".json";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
    avisar("descargar", "Archivo descargado: " + resumen(datos) + ".", VERDE);
  }

  // ---------- Cargar ----------

  function cargar(archivo) {
    const lector = new FileReader();
    lector.onload = function () {
      let nuevos;
      try {
        nuevos = JSON.parse(lector.result);
      } catch (error) {
        return avisar("cargar", "No se ha podido leer el archivo. Compruebe que es un archivo descargado desde Bolsillo.", ROJO);
      }
      // Solo se aceptan archivos con la forma exacta de los datos de Bolsillo
      if (!Datos.sonValidos(nuevos)) {
        return avisar("cargar", "El archivo no tiene datos válidos de Bolsillo. Sus datos actuales no se han cambiado.", ROJO);
      }
      const actuales = Datos.cargar();
      const hayDatos = actuales.ingresos.length + actuales.secciones.length + actuales.gastos.length > 0;
      const aplicar = function () {
        Datos.guardar(nuevos);
        avisar("cargar", "Datos cargados: " + resumen(nuevos) + ".", VERDE);
      };
      if (!hayDatos) return aplicar();
      // Si ya hay datos, se pide confirmación antes de sustituirlos
      Comun.confirmar({
        titulo: "¿Sustituir sus datos actuales?",
        texto: "Los datos de este navegador se cambiarán por los del archivo. Esta acción no se puede deshacer.",
        nombre: archivo.name,
        detalle: resumen(nuevos),
        boton: "Sí, sustituir",
      }).then(function (si) { if (si) aplicar(); });
    };
    lector.readAsText(archivo);
  }

  // ---------- Conexión de botones ----------

  document.addEventListener("click", function (evento) {
    const boton = evento.target.closest('button[data-b]');
    if (!boton) return;
    if (boton.dataset.b === "descargar") descargar();
    if (boton.dataset.b === "cargar") { selector.value = ""; selector.click(); }
  });
  selector.addEventListener("change", function () {
    if (selector.files.length > 0) cargar(selector.files[0]);
    selector.value = ""; // así se puede volver a elegir el mismo archivo
  });
})();
