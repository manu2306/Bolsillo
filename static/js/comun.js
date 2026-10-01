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

  return { MESES, nombreMes, moverMes, euros };
})();
