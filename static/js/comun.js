// comun.js — Piezas que usan todas las páginas: formato de euros y fechas, y el selector de mes.

const Comun = (function () {
  const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                 "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // "2026-03" -> "Marzo 2026"
  function nombreMes(mes) {
    const [anio, numero] = mes.split("-").map(Number);
    return MESES[numero - 1] + " " + anio;
  }

  // Suma o resta meses: moverMes("2026-01", -1) -> "2025-12"
  function moverMes(mes, cuantos) {
    const [anio, numero] = mes.split("-").map(Number);
    const fecha = new Date(anio, numero - 1 + cuantos, 1);
    return fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0");
  }

  // 2300 -> "2.300 €"   48.5 -> "48,50 €"
  function euros(cantidad) {
    const redondeado = Math.round(cantidad * 100) / 100;
    const esEntero = Number.isInteger(redondeado);
    const [entera, decimales] = Math.abs(redondeado).toFixed(esEntero ? 0 : 2).split(".");
    const conPuntos = entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return (redondeado < 0 ? "−" : "") + conPuntos + (decimales ? "," + decimales : "") + " €";
  }

  // Lee lo que el usuario escribe en un campo de monto: "1.800,50" -> 1800.5
  // Devuelve null si no es un número mayor que cero.
  function leerMonto(texto) {
    let limpio = String(texto).replace(/[\s€]/g, "");
    if (limpio.includes(",")) limpio = limpio.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) limpio = limpio.replace(/\./g, "");
    if (!/^\d+(\.\d+)?$/.test(limpio)) return null;
    const numero = Math.round(parseFloat(limpio) * 100) / 100;
    return numero > 0 ? numero : null;
  }

  // 1800 -> "1.800,00" (para rellenar un campo al editar)
  function montoParaCampo(cantidad) {
    const [entera, decimales] = cantidad.toFixed(2).split(".");
    return entera.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + decimales;
  }

  // Las dos maquetas de cada página (escritorio y móvil) se rellenan igual
  function vistas() {
    return Array.from(document.querySelectorAll(".vista-escritorio, .vista-movil"));
  }

  // Marca en rojo un campo mal rellenado y pone el cursor en él
  function marcarError(campo) {
    campo.style.borderColor = "#AE3A2E";
    campo.focus();
    campo.addEventListener("input", function () { campo.style.borderColor = ""; }, { once: true });
    return false;
  }

  // Los 6 colores de sección que ofrece el diseño
  const COLORES = ["rgb(15, 118, 110)", "rgb(59, 91, 146)", "rgb(122, 140, 196)",
                   "rgb(179, 155, 107)", "rgb(142, 108, 138)", "rgb(94, 124, 138)"];

  // Abre el diálogo de confirmación del diseño y espera la respuesta.
  // Uso: Comun.confirmar({ titulo, texto, color, nombre, detalle, monto }).then(function (si) { ... })
  function confirmar(opciones) {
    const dialogos = Array.from(document.querySelectorAll('[data-dialogo="borrar"]'));
    dialogos.forEach(function (dialogo) {
      ["titulo", "texto", "nombre", "detalle", "monto"].forEach(function (parte) {
        dialogo.querySelector('[data-d="' + parte + '"]').textContent = opciones[parte] || "";
      });
      const punto = dialogo.querySelector('[data-d="color"]');
      punto.style.background = opciones.color || "";
      punto.hidden = !opciones.color;
      dialogo.hidden = false;
    });
    return new Promise(function (responder) {
      function cerrar(respuesta) {
        dialogos.forEach(function (d) { d.hidden = true; });
        document.removeEventListener("click", alPulsar, true);
        document.removeEventListener("keydown", alTeclear);
        responder(respuesta);
      }
      function alPulsar(evento) {
        if (evento.target.closest('[data-d="confirmar"]')) cerrar(true);
        else if (evento.target.closest('[data-d="cancelar"]') || evento.target.matches('[data-dialogo="borrar"]')) cerrar(false);
      }
      function alTeclear(evento) { if (evento.key === "Escape") cerrar(false); }
      document.addEventListener("click", alPulsar, true);
      document.addEventListener("keydown", alTeclear);
    });
  }

  // Escribe el mes elegido en todos los selectores de mes de la página
  function pintarMes() {
    const texto = nombreMes(Datos.mes());
    document.querySelectorAll('button[aria-label="Mes anterior"]').forEach(function (boton) {
      boton.parentElement.querySelector("span").textContent = texto;
    });
  }

  // Las flechas del selector cambian de mes
  document.addEventListener("click", function (evento) {
    const boton = evento.target.closest("button[aria-label]");
    if (!boton) return;
    if (boton.getAttribute("aria-label") === "Mes anterior") Datos.cambiarMes(moverMes(Datos.mes(), -1));
    if (boton.getAttribute("aria-label") === "Mes siguiente") Datos.cambiarMes(moverMes(Datos.mes(), 1));
  });

  // Se repinta al cargar la página y cada vez que cambian los datos o el mes
  document.addEventListener("bolsillo:cambio", pintarMes);
  document.addEventListener("DOMContentLoaded", pintarMes);

  return { MESES, COLORES, nombreMes, moverMes, euros, leerMonto, montoParaCampo, vistas, marcarError, confirmar };
})();
