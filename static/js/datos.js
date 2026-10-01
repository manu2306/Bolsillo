// datos.js — Guarda y lee los datos del usuario en el navegador (localStorage).
// No hace cálculos ni habla con el servidor.

const Datos = (function () {
  const CLAVE_DATOS = "bolsillo.datos.v1"; // nombre con el que se guardan los datos
  const CLAVE_MES = "bolsillo.mes";        // mes que el usuario está viendo

  // Forma de los datos cuando el usuario aún no ha escrito nada
  function vacios() {
    return { version: 1, ingresos: [], secciones: [], gastos: [] };
  }

  // Comprueba que algo leído (de localStorage o de un archivo) tiene la forma correcta
  function sonValidos(d) {
    return (
      d !== null &&
      typeof d === "object" &&
      d.version === 1 &&
      Array.isArray(d.ingresos) &&
      Array.isArray(d.secciones) &&
      Array.isArray(d.gastos)
    );
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
