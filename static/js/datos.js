// datos.js — Guarda y lee los datos del usuario en el navegador (localStorage).
// No hace cálculos ni habla con el servidor.

const Datos = (function () {
  const CLAVE_DATOS = "bolsillo.datos.v1"; // nombre con el que se guardan los datos
  const CLAVE_MES = "bolsillo.mes";        // mes que el usuario está viendo

  // Forma de los datos cuando el usuario aún no ha escrito nada
  function vacios() {
    return { version: 1, ingresos: [], secciones: [], gastos: [] };
  }

  // Comprueba que algo leído (de localStorage o de un archivo) tiene la forma correcta:
  // las tres listas, y dentro de cada una los campos que la aplicación necesita.
  function sonValidos(d) {
    if (d === null || typeof d !== "object" || d.version !== 1) return false;
    if (!Array.isArray(d.ingresos) || !Array.isArray(d.secciones) || !Array.isArray(d.gastos)) return false;

    const texto = function (v) { return typeof v === "string" && v !== ""; };
    const monto = function (v) { return typeof v === "number" && isFinite(v) && v >= 0; };
    const mes = function (v) { return typeof v === "string" && /^\d{4}-\d{2}$/.test(v); };

    const ingresosBien = d.ingresos.every(function (i) {
      return i && texto(i.id) && mes(i.mes) && texto(i.concepto) && monto(i.monto) && typeof i.motivo === "string";
    });
    const seccionesBien = d.secciones.every(function (s) {
      if (!s || !texto(s.id) || !texto(s.nombre) || !monto(s.presupuesto) || !texto(s.color)) return false;
      if (s.tipo === "variable") return true;
      return s.tipo === "fijo" && Array.isArray(s.montos) && s.montos.length > 0 &&
        s.montos.every(function (m) { return m && mes(m.desde) && monto(m.monto); });
    });
    const ids = d.secciones.map(function (s) { return s && s.id; });
    const gastosBien = d.gastos.every(function (g) {
      return g && texto(g.id) && typeof g.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(g.fecha) &&
        monto(g.monto) && typeof g.nota === "string" && ids.includes(g.seccionId); // el gasto apunta a una sección que existe
    });
    return ingresosBien && seccionesBien && gastosBien;
  }

  // Lee los datos guardados. Si no hay nada o están dañados, devuelve datos vacíos.
  function cargar() {
    try {
      const d = JSON.parse(localStorage.getItem(CLAVE_DATOS));
      return sonValidos(d) ? d : vacios();
    } catch (error) {
      return vacios();
    }
  }

  // Guarda todos los datos y avisa a la página para que se redibuje
  function guardar(datos) {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
    document.dispatchEvent(new CustomEvent("bolsillo:cambio"));
  }

  // Identificador único para cada ingreso, sección o gasto
  function nuevoId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // Mes de hoy en formato "2026-10"
  function mesDeHoy() {
    const hoy = new Date();
    return hoy.getFullYear() + "-" + String(hoy.getMonth() + 1).padStart(2, "0");
  }

  // Mes que el usuario está viendo (por defecto, el de hoy)
  function mes() {
    const guardado = localStorage.getItem(CLAVE_MES);
    return /^\d{4}-\d{2}$/.test(guardado || "") ? guardado : mesDeHoy();
  }

  function cambiarMes(nuevoMes) {
    localStorage.setItem(CLAVE_MES, nuevoMes);
    document.dispatchEvent(new CustomEvent("bolsillo:cambio"));
  }

  return { vacios, sonValidos, cargar, guardar, nuevoId, mesDeHoy, mes, cambiarMes };
})();
