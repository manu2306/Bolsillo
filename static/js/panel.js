// panel.js — Dibuja el Panel con los resultados de calculos.js. Aquí no se hace ninguna cuenta nueva.

(function () {
  let meses = 6; // meses que muestra el gráfico de barras (6 o 12)

  // Colores de estado que ya usa el diseño
  const ROJO = { texto: "rgb(174, 58, 46)", fondo: "rgb(251, 233, 230)", barra: "rgb(213, 88, 75)" };
  const VERDE = { texto: "rgb(46, 122, 75)", fondo: "rgb(231, 243, 235)", barra: "rgb(60, 154, 95)" };
  const AMBAR = { texto: "rgb(138, 90, 11)", barra: "rgb(224, 164, 58)" };
  const GRIS = { texto: "rgb(90, 102, 99)", fondo: "rgb(238, 237, 232)" };
  const FLECHA_ARRIBA = '<path d="M12 19V5"></path><path d="m5 12 7-7 7 7"></path>';
  const FLECHA_ABAJO = '<path d="M12 5v14"></path><path d="m5 12 7 7 7-7"></path>';

  function b(raiz, nombre) { return raiz.querySelector('[data-b="' + nombre + '"]'); }

  // De cada maqueta se guardan los moldes del diseño (una leyenda, una barra, un medidor, una fila...)
  const paneles = Comun.vistas().map(function (vista) {
    const cuerpo = b(vista, "t-cuerpo");
    const panel = {
      vista: vista,
      conDatos: vista.querySelector('main[data-estado="con-datos"]'),
      vacio: vista.querySelector('main[data-estado="vacio"]'),
      moldeLeyenda: b(vista, "d-item").cloneNode(true),
      moldeColumna: b(vista, "b-col").cloneNode(true),
      moldeMedidor: b(vista, "m-item").cloneNode(true),
      moldeFila: b(cuerpo, "t-fila").cloneNode(true),
      etiquetas: {  // las tres etiquetas de cambio del diseño: sin cambio, sube y baja
        neutro: b(cuerpo, "t-neutro").cloneNode(true),
        sube: b(cuerpo, "t-sube").cloneNode(true),
        baja: b(cuerpo, "t-baja").cloneNode(true),
      },
      filaTotal: b(cuerpo, "t-total"),
      altoBarras: parseFloat(b(vista, "b-alto").style.height),
      anchoBarra: { 6: parseFloat(b(vista, "b-in").style.width), 12: 0 },
      estiloBoton: { activo: b(vista, "b-6").getAttribute("style"), inactivo: b(vista, "b-12").getAttribute("style") },
    };
    panel.anchoBarra[12] = Math.round(panel.anchoBarra[6] * 0.64); // 22 → 14 px y 14 → 9 px, como en el diseño
    return panel;
  });

  // Etiqueta de cambio (sube en rojo, baja en verde, sin cambio en gris)
  function etiquetaCambio(panel, cambio) {
    const tipo = cambio === null || cambio === 0 ? "neutro" : (cambio > 0 ? "sube" : "baja");
    const etiqueta = panel.etiquetas[tipo].cloneNode(true);
    etiqueta.lastChild.textContent = cambio === null ? "—" : Comun.porcentaje(cambio);
    return etiqueta;
  }

  // ---------- Tarjetas ----------

  function pintarTarjetas(vista, r) {
    const anterior = Comun.mesEnMinusculas(r.mesAnterior);
    b(vista, "k-ingreso").textContent = Comun.euros(r.ingresos);
    b(vista, "k-ingreso-tag").textContent = r.conceptos.map(function (c) { return c.concepto; }).join(" · ");
    b(vista, "k-ingreso-caja").hidden = r.conceptos.length === 0;

    b(vista, "k-gastos").textContent = Comun.euros(r.gastos);
    b(vista, "k-gastos-det").textContent = "Fijos " + Comun.euros(r.fijos) + " · Variables " + Comun.euros(r.variables);

    b(vista, "k-sobra").textContent = Comun.euros(r.sobra);
    b(vista, "k-sobra").style.color = r.sobra < 0 ? ROJO.texto : "rgb(11, 92, 86)";
    b(vista, "k-sobra-det").textContent = r.sobraPorcentaje === null ? "Sin ingresos este mes"
      : (r.sobra < 0 ? "Ha gastado más de lo que ingresó" : r.sobraPorcentaje + " % de su ingreso");

    // Variación: gastar más es rojo con flecha arriba; gastar menos, verde con flecha abajo
    const color = r.variacion === null || r.variacion === 0 ? GRIS : (r.variacion > 0 ? ROJO : VERDE);
    const icono = b(vista, "k-var-icono");
    b(vista, "k-var").textContent = r.variacion === null ? "—" : Comun.porcentaje(r.variacion);
    b(vista, "k-var").style.color = color.texto;
    icono.style.background = color.fondo;
    icono.style.color = color.texto;
    icono.querySelector("svg").setAttribute("stroke", color.texto);
    icono.querySelector("svg").innerHTML = r.variacion !== null && r.variacion < 0 ? FLECHA_ABAJO : FLECHA_ARRIBA;
    icono.hidden = r.variacion === null || r.variacion === 0;
    b(vista, "k-var-det").textContent =
      r.variacion === null ? "Sin gastos en " + anterior + " para comparar"
      : r.diferencia > 0 ? "Ha gastado " + Comun.euros(r.diferencia) + " más que en " + anterior
      : r.diferencia < 0 ? "Ha gastado " + Comun.euros(-r.diferencia) + " menos que en " + anterior
      : "Ha gastado lo mismo que en " + anterior;
  }

  // ---------- Gráfico de anillo: fijos frente a variables ----------

  function pintarAnillo(panel, r) {
    const vista = panel.vista;
    const svg = b(vista, "d-svg");
    const conGasto = r.secciones.filter(function (s) { return s.actual > 0; });
    const RADIO = 84, CONTORNO = 2 * Math.PI * RADIO, HUECO = 2.5;

    // Cada sección es un arco del círculo, proporcional a su gasto
    let recorrido = 0;
    svg.innerHTML = "";
    conGasto.forEach(function (s) {
      const largo = s.actual / r.gastos * CONTORNO;
      const arco = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      const atributos = {
        cx: 110, cy: 110, r: RADIO, fill: "none", stroke: s.color, "stroke-width": 26,
        "stroke-dasharray": Math.max(largo - HUECO, 0.5).toFixed(2) + " " + CONTORNO.toFixed(2),
        "stroke-dashoffset": (-recorrido).toFixed(2), transform: "rotate(-90 110 110)",
      };
      Object.keys(atributos).forEach(function (a) { arco.setAttribute(a, atributos[a]); });
      svg.append(arco);
      recorrido += largo;
    });
    svg.setAttribute("aria-label", "Gastos de " + Comun.mesEnMinusculas(r.mes) + ": fijos " + r.fijos + " euros, variables " + r.variables + " euros");
    b(vista, "d-total").textContent = Comun.euros(r.gastos);
    b(vista, "d-sub").textContent = "Desglose por sección, " + Comun.mesEnMinusculas(r.mes);

    // Leyenda: un grupo para fijos y otro para variables
    [["d-fijos", "fijo", r.fijos], ["d-variables", "variable", r.variables]].forEach(function (grupo) {
      const caja = b(vista, grupo[0]);
      const cabecera = b(vista, grupo[0] + "-cab");
      cabecera.querySelector("strong").textContent = Comun.euros(grupo[2]);
      cabecera.lastChild.textContent = " · " + (r.gastos ? Math.round(grupo[2] / r.gastos * 100) : 0) + " %";
      while (caja.children.length > 1) caja.lastElementChild.remove(); // se conserva solo la cabecera del grupo
      conGasto.filter(function (s) { return s.tipo === grupo[1]; }).forEach(function (s) {
        const item = panel.moldeLeyenda.cloneNode(true);
        b(item, "d-punto").style.background = s.color;
        b(item, "d-nombre").textContent = s.nombre;
        b(item, "d-monto").textContent = Comun.euros(s.actual);
        caja.append(item);
      });
    });
  }

  // ---------- Gráfico de barras: ingresos frente a gastos ----------

  function pintarBarras(panel, datos, mes) {
    const vista = panel.vista;
    const serie = Calculos.serie(datos, mes, meses);
    const tope = Calculos.topeEje(Math.max.apply(null, serie.map(function (t) { return Math.max(t.ingresos, t.gastos); })));

    b(vista, "b-rango").textContent = Comun.nombreMes(serie[0].mes) + " – " + Comun.nombreMes(mes).toLowerCase();
    [6, 12].forEach(function (n) {
      const boton = b(vista, "b-" + n);
      boton.setAttribute("style", meses === n ? panel.estiloBoton.activo : panel.estiloBoton.inactivo);
      boton.setAttribute("aria-pressed", meses === n ? "true" : "false");
    });

    // Rótulos del eje: 0, un tercio, dos tercios y el tope
    vista.querySelectorAll('[data-b="b-eje"]').forEach(function (rotulo, i) {
      rotulo.textContent = i === 0 ? "0" : Comun.euros(tope / 3 * i);
    });

    const columnas = b(vista, "b-cols");
    columnas.replaceChildren();
    serie.forEach(function (t, i) {
      const columna = panel.moldeColumna.cloneNode(true);
      const corto = Comun.nombreMes(t.mes).slice(0, 3);
      const anio = t.mes.slice(0, 4);
      const ultimo = i === serie.length - 1;
      [["b-in", t.ingresos, "Ingresos"], ["b-out", t.gastos, "Gastos"]].forEach(function (x) {
        const barra = b(columna, x[0]);
        barra.style.width = panel.anchoBarra[meses] + "px";
        barra.style.height = Math.round(x[1] / tope * panel.altoBarras) + "px";
        barra.title = x[2] + " " + corto + " " + anio + ": " + Comun.euros(x[1]);
      });
      const etiqueta = b(columna, "b-etq");
      etiqueta.textContent = corto;
      etiqueta.style.color = ultimo ? "rgb(22, 32, 30)" : "rgb(90, 102, 99)";
      etiqueta.style.fontWeight = ultimo ? 800 : 500;
      columnas.append(columna);
    });
  }

  // ---------- Medidores de presupuesto ----------

  function pintarMedidores(panel, r) {
    const lista = b(panel.vista, "m-lista");
    const conPresupuesto = r.secciones.filter(function (s) { return s.presupuesto > 0 && (s.tipo === "variable" || s.actual > 0); });
    lista.replaceChildren();
    conPresupuesto.forEach(function (s) {
      // Verde por debajo del 70 %, ámbar entre el 70 y el 90 %, rojo por encima del 90 %
      const color = s.uso > 90 ? ROJO : (s.uso >= 70 ? AMBAR : VERDE);
      const item = panel.moldeMedidor.cloneNode(true);
      b(item, "m-punto").style.background = s.color;
      b(item, "m-nombre").lastChild.textContent = s.nombre;
      b(item, "m-pct").textContent = s.uso + " %";
      b(item, "m-pct").style.color = color.texto;
      b(item, "m-barra").setAttribute("aria-label", s.nombre);
      b(item, "m-barra").setAttribute("aria-valuenow", Math.min(s.uso, 100));
      b(item, "m-relleno").style.width = Math.min(s.uso, 100) + "%";
      b(item, "m-relleno").style.background = color.barra;
      b(item, "m-det").textContent = Comun.euros(s.actual) + " de " + Comun.euros(s.presupuesto);
      lista.append(item);
    });
    if (conPresupuesto.length === 0) {
      const aviso = panel.moldeMedidor.cloneNode(true);
      const texto = b(aviso, "m-det");
      texto.textContent = "Añada un presupuesto a sus secciones para ver aquí los medidores.";
      aviso.replaceChildren(texto);
      aviso.style.gridColumn = "1 / -1";
      lista.append(aviso);
    }
  }

  // ---------- Tabla: este mes frente al anterior ----------

  function pintarTabla(panel, r) {
    const vista = panel.vista;
    const cuerpo = b(vista, "t-cuerpo");
    b(vista, "t-titulo").textContent = Comun.nombreMes(r.mes).split(" ")[0] + " frente a " + Comun.mesEnMinusculas(r.mesAnterior);
    b(vista, "t-th-ant").textContent = Comun.nombreMes(r.mesAnterior).slice(0, 3);
    b(vista, "t-th-act").textContent = Comun.nombreMes(r.mes).slice(0, 3);

    cuerpo.replaceChildren();
    r.secciones.forEach(function (s) {
      const fila = panel.moldeFila.cloneNode(true);
      b(fila, "t-punto").style.background = s.color;
      b(fila, "t-nombre").textContent = s.nombre;
      if (b(fila, "t-tipo")) b(fila, "t-tipo").textContent = s.tipo === "fijo" ? "Fijo" : "Variable";
      b(fila, "t-ant").textContent = Comun.euros(s.anterior);
      b(fila, "t-act").textContent = Comun.euros(s.actual);
      b(fila, "t-cambio").replaceChildren(etiquetaCambio(panel, s.cambio));
      cuerpo.append(fila);
    });
    b(panel.filaTotal, "t-total-ant").textContent = Comun.euros(r.anterior.gastos);
    b(panel.filaTotal, "t-total-act").textContent = Comun.euros(r.gastos);
    b(panel.filaTotal, "t-total-cambio").replaceChildren(etiquetaCambio(panel, r.variacion));
    cuerpo.append(panel.filaTotal);
  }

  // ---------- Todo junto ----------

  function pintar() {
    const datos = Datos.cargar();
    const mes = Datos.mes();
    const r = Calculos.resumen(datos, mes);
    const sinNada = datos.ingresos.length === 0; // estado vacío del diseño: aún no hay ningún ingreso

    paneles.forEach(function (panel) {
      panel.vacio.hidden = !sinNada;
      panel.conDatos.hidden = sinNada;
      panel.vista.querySelectorAll('[data-b="sub"]').forEach(function (sub) {
        sub.textContent = sinNada ? Comun.nombreMes(mes) : Comun.nombreMes(mes) + " · comparado con " + Comun.mesEnMinusculas(r.mesAnterior);
      });
      if (sinNada) return;
      pintarTarjetas(panel.vista, r);
      pintarAnillo(panel, r);
      pintarBarras(panel, datos, mes);
      pintarMedidores(panel, r);
      pintarTabla(panel, r);
    });
  }

  // Botones "6 meses" y "12 meses"
  document.addEventListener("click", function (evento) {
    const boton = evento.target.closest('[data-b="b-6"], [data-b="b-12"]');
    if (!boton) return;
    meses = boton.dataset.b === "b-6" ? 6 : 12;
    pintar();
  });

  document.addEventListener("bolsillo:cambio", pintar);
  pintar();
})();
