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

  // Lo gastado en una sección durante un mes (fija: su importe; variable: la suma de sus gastos)
  function gastoDeSeccion(datos, seccion, mes) {
    if (seccion.tipo === "fijo") return montoFijo(seccion, mes) || 0;
    return sumar(gastosDelMes(datos, mes)
      .filter(function (g) { return g.seccionId === seccion.id; })
      .map(function (g) { return g.monto; }));
  }

  // Totales de un mes: ingresos, gastos fijos, gastos variables, gastos y lo que sobra
  function totales(datos, mes) {
    const ingresos = sumar(datos.ingresos.filter(function (i) { return i.mes === mes; }).map(function (i) { return i.monto; }));
    const fijos = sumar(fijasDelMes(datos, mes).map(function (s) { return montoFijo(s, mes); }));
    const vars = sumar(gastosDelMes(datos, mes).map(function (g) { return g.monto; }));
    const gastos = sumar([fijos, vars]);
    return { mes: mes, ingresos: ingresos, fijos: fijos, variables: vars, gastos: gastos, sobra: sumar([ingresos, -gastos]) };
  }

  // Cambio en porcentaje entre dos cantidades. Devuelve null si no se puede comparar (antes era 0).
  function cambio(antes, ahora) {
    if (antes === 0) return null;
    return Math.round((ahora - antes) / antes * 1000) / 10;
  }

  function mesAnterior(mes) {
    const [anio, numero] = mes.split("-").map(Number);
    const fecha = new Date(anio, numero - 2, 1);
    return fecha.getFullYear() + "-" + String(fecha.getMonth() + 1).padStart(2, "0");
  }

  // Resumen completo de un mes comparado con el anterior.
  // Es lo que dibuja el Panel y lo único que se enviará al Analista IA.
  function resumen(datos, mes) {
    const anterior = mesAnterior(mes);
    const ahora = totales(datos, mes);
    const antes = totales(datos, anterior);
    const secciones = datos.secciones
      .map(function (s) {
        const actual = gastoDeSeccion(datos, s, mes);
        const previo = gastoDeSeccion(datos, s, anterior);
        return {
          nombre: s.nombre, tipo: s.tipo, color: s.color, presupuesto: s.presupuesto,
          actual: actual, anterior: previo, cambio: cambio(previo, actual),
          uso: s.presupuesto ? Math.round(actual / s.presupuesto * 100) : null, // % del presupuesto gastado
          existe: s.tipo === "variable" || montoFijo(s, mes) !== null || montoFijo(s, anterior) !== null,
        };
      })
      .filter(function (s) { return s.existe; })
      .sort(function (a, b) { return (a.tipo === b.tipo) ? 0 : (a.tipo === "fijo" ? -1 : 1); }); // fijas primero

    return {
      mes: mes, mesAnterior: anterior,
      ingresos: ahora.ingresos,
      conceptos: datos.ingresos.filter(function (i) { return i.mes === mes; })
        .map(function (i) { return { concepto: i.concepto, monto: i.monto, motivo: i.motivo }; }),
      fijos: ahora.fijos, variables: ahora.variables, gastos: ahora.gastos,
      sobra: ahora.sobra,
      sobraPorcentaje: ahora.ingresos ? Math.round(ahora.sobra / ahora.ingresos * 100) : null,
      anterior: antes,
      variacion: cambio(antes.gastos, ahora.gastos),          // % de cambio del gasto total
      diferencia: sumar([ahora.gastos, -antes.gastos]),        // euros de más o de menos
      secciones: secciones,
    };
  }

  // Ingresos y gastos de los últimos "cuantos" meses, terminando en "mes"
  function serie(datos, mes, cuantos) {
    const lista = [];
    let m = mes;
    for (let i = 0; i < cuantos; i++) { lista.unshift(totales(datos, m)); m = mesAnterior(m); }
    return lista;
  }

  // Tope "redondo" para el eje del gráfico: el menor de 3 × (1, 2, 2,5, 4, 5 u 8 × 10ⁿ) que cubre el máximo
  function topeEje(maximo) {
    if (maximo <= 0) return 300;
    for (let potencia = 1; potencia < 1e9; potencia *= 10) {
      for (const base of [1, 2, 2.5, 4, 5, 8]) {
        if (base * potencia * 3 >= maximo) return base * potencia * 3;
      }
    }
    return maximo;
  }

  return { sumar, montoFijo, fijasDelMes, variables, gastosDelMes, gastoDeSeccion, totales, cambio, mesAnterior, resumen, serie, topeEje };
})();
