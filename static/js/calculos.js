// calculos.js — Todas las cuentas de Bolsillo se hacen aquí, en el navegador.

const Calculos = (function () {
  // Suma una lista de números y redondea a céntimos
  function sumar(numeros) {
    const total = numeros.reduce(function (suma, n) { return suma + n; }, 0);
    return Math.round(total * 100) / 100;
  }

  // Importe de un gasto fijo en un mes concreto.
  // Cada sección fija guarda un historial: [{ desde: "2026-01", monto: 650 }, { desde: "2026-04", monto: 700 }]
  // Vale el último cambio anterior o igual al mes. Si la sección aún no existía, devuelve null.
  function montoFijo(seccion, mes) {
    let vigente = null;
    seccion.montos.forEach(function (cambio) {
      if (cambio.desde <= mes && (vigente === null || cambio.desde > vigente.desde)) vigente = cambio;
    });
    return vigente ? vigente.monto : null;
  }

  // Secciones fijas que existen en un mes
  function fijasDelMes(datos, mes) {
    return datos.secciones.filter(function (s) { return s.tipo === "fijo" && montoFijo(s, mes) !== null; });
  }

  // Secciones variables (existen en todos los meses)
  function variables(datos) {
    return datos.secciones.filter(function (s) { return s.tipo === "variable"; });
  }

  // Gastos variables de un mes, del más reciente al más antiguo
  function gastosDelMes(datos, mes) {
    return datos.gastos
      .filter(function (g) { return g.fecha.startsWith(mes); })
      .sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }

  return { sumar, montoFijo, fijasDelMes, variables, gastosDelMes };
})();
