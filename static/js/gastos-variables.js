// gastos-variables.js — Pantalla de Gastos variables: anotar gastos y gestionar sus secciones.

(function () {
  const NUEVA = "__nueva__";      // valor de la opción "+ Crear sección nueva"
  let editandoGastoId = null;     // gasto que se está corrigiendo (o null)
  let editandoSeccionId = null;   // sección que se está editando (null = sección nueva)

  function b(raiz, nombre) { return raiz.querySelector('[data-b="' + nombre + '"]'); }

  // Cada maqueta (escritorio y móvil) tiene su formulario, su bloque de sección y su lista
  const paneles = Comun.vistas().map(function (vista) {
    const lista = b(vista, "lista");
    const panel = {
      vista: vista,
      lista: lista,
      moldeFila: b(lista, "fila").cloneNode(true),          // filas del diseño usadas como molde
      moldeEdicion: b(lista, "fila-edicion").cloneNode(true),
      bloque: b(vista, "bloque-seccion"),
    };
    b(vista, "fecha").value = Comun.fechaParaCampo(Comun.fechaPorDefecto(Datos.mes()));
    return panel;
  });

  // ---------- Desplegables de sección ----------

  function rellenarSecciones(select, datos, elegida, conOpcionNueva) {
    select.innerHTML = "";
    Calculos.variables(datos).forEach(function (s) { select.add(new Option(s.nombre, s.id)); });
    if (conOpcionNueva) select.add(new Option("+ Crear sección nueva", NUEVA));
    if (Array.from(select.options).some(function (o) { return o.value === elegida; })) select.value = elegida;
  }

  // ---------- Lista de gastos del mes ----------

  function filaNormal(panel, gasto, seccion) {
    const fila = panel.moldeFila.cloneNode(true);
    fila.dataset.id = gasto.id;
    const nota = gasto.nota || seccion.nombre;
    b(fila, "f-punto").style.background = seccion.color;
    b(fila, "f-nota").textContent = gasto.nota;
    b(fila, "f-monto").textContent = Comun.euros(gasto.monto);
    if (b(fila, "f-fecha")) b(fila, "f-fecha").textContent = Comun.fechaCorta(gasto.fecha);          // escritorio
    if (b(fila, "f-seccion")) b(fila, "f-seccion").lastChild.textContent = seccion.nombre;           // escritorio
    if (b(fila, "f-detalle")) {                                                                       // móvil
      b(fila, "f-nota").textContent = nota;
      b(fila, "f-detalle").textContent = seccion.nombre + " · " + Comun.fechaCorta(gasto.fecha);
    }
    b(fila, "f-corregir").setAttribute("aria-label", "Corregir " + nota);
    b(fila, "f-borrar").setAttribute("aria-label", "Borrar " + nota);
    return fila;
  }

  function filaEdicion(panel, gasto, datos) {
    const fila = panel.moldeEdicion.cloneNode(true);
    fila.dataset.id = gasto.id;
    b(fila, "e-fecha").value = Comun.fechaParaCampo(gasto.fecha);
    rellenarSecciones(b(fila, "e-seccion"), datos, gasto.seccionId, false);
    b(fila, "e-nota").value = gasto.nota;
    b(fila, "e-monto").value = Comun.montoParaCampo(gasto.monto);
    return fila;
  }

  function filaVacia(panel) {
    const fila = panel.moldeFila.cloneNode(true);
    if (fila.tagName === "TR") {
      const celda = fila.children[2].cloneNode(false);
      celda.colSpan = 5;
      celda.textContent = "Sin gastos este mes. Anote el primero con el formulario.";
      fila.replaceChildren(celda);
    } else {
      b(fila, "f-nota").textContent = "Sin gastos este mes";
      b(fila, "f-detalle").textContent = "Anote el primero con el formulario";
      b(fila, "f-punto").remove();
      b(fila, "f-monto").remove();
      fila.lastElementChild.remove();
    }
    return fila;
  }

  function pintar() {
    const datos = Datos.cargar();
    const mes = Datos.mes();
    const gastos = Calculos.gastosDelMes(datos, mes);
    const total = Calculos.sumar(gastos.map(function (g) { return g.monto; }));
    const nombreDelMes = Comun.nombreMes(mes).split(" ")[0].toLowerCase();

    paneles.forEach(function (panel) {
      const select = b(panel.vista, "seccion");
      rellenarSecciones(select, datos, select.value, true);
      // Si hay secciones y el bloque está cerrado, no se deja elegida la opción "+ Crear sección nueva"
      if (select.value === NUEVA && select.options.length > 1 && panel.bloque.hidden) select.selectedIndex = 0;

      b(panel.vista, "lista-titulo").textContent = "Gastos de " + nombreDelMes;
      const resumen = b(panel.vista, "lista-resumen");
      resumen.querySelector("strong").textContent = Comun.euros(total);
      if (resumen.firstChild.nodeType === Node.TEXT_NODE) {
        resumen.firstChild.textContent = gastos.length + (gastos.length === 1 ? " gasto · " : " gastos · ");
      }

      panel.lista.replaceChildren();
      if (gastos.length === 0) panel.lista.append(filaVacia(panel));
      gastos.forEach(function (gasto) {
        const seccion = datos.secciones.find(function (s) { return s.id === gasto.seccionId; });
        panel.lista.append(gasto.id === editandoGastoId ? filaEdicion(panel, gasto, datos) : filaNormal(panel, gasto, seccion));
      });
    });
  }

  // ---------- Añadir, corregir y borrar gastos ----------

  // Lee y comprueba los cuatro campos de un gasto. Devuelve null si alguno está mal.
  function leerGasto(campoFecha, campoSeccion, campoMonto, campoNota) {
    const fecha = Comun.leerFecha(campoFecha.value, Datos.mes());
    const monto = Comun.leerMonto(campoMonto.value);
    if (fecha === null) { Comun.marcarError(campoFecha); return null; }
    if (!campoSeccion.value || campoSeccion.value === NUEVA) { Comun.marcarError(campoSeccion); return null; }
    if (monto === null) { Comun.marcarError(campoMonto); return null; }
    return { fecha: fecha, seccionId: campoSeccion.value, monto: monto, nota: campoNota.value.trim() };
  }

  function anadir(panel) {
    const v = panel.vista;
    if (b(v, "seccion").value === NUEVA) { abrirBloque(null); return; }
    const gasto = leerGasto(b(v, "fecha"), b(v, "seccion"), b(v, "monto"), b(v, "nota"));
    if (!gasto) return;
    gasto.id = Datos.nuevoId();
    const datos = Datos.cargar();
    datos.gastos.push(gasto);
    b(v, "monto").value = "";
    b(v, "nota").value = "";
    Datos.guardar(datos);
    // Si el gasto es de otro mes, se salta a ese mes para que el usuario lo vea en la lista
    if (!gasto.fecha.startsWith(Datos.mes())) Datos.cambiarMes(gasto.fecha.slice(0, 7));
  }

  function guardarEdicion(fila) {
    const cambios = leerGasto(b(fila, "e-fecha"), b(fila, "e-seccion"), b(fila, "e-monto"), b(fila, "e-nota"));
    if (!cambios) return;
    const datos = Datos.cargar();
    Object.assign(datos.gastos.find(function (g) { return g.id === fila.dataset.id; }), cambios);
    editandoGastoId = null;
    Datos.guardar(datos);
  }

  function borrar(id) {
    const datos = Datos.cargar();
    const gasto = datos.gastos.find(function (g) { return g.id === id; });
    const seccion = datos.secciones.find(function (s) { return s.id === gasto.seccionId; });
    const nombreDelMes = Comun.nombreMes(gasto.fecha.slice(0, 7)).split(" ")[0].toLowerCase();
    Comun.confirmar({
      titulo: "¿Eliminar este gasto?",
      texto: "Se quitará de la tabla y de los totales de " + nombreDelMes + ". Esta acción no se puede deshacer.",
      color: seccion.color,
      nombre: gasto.nota || seccion.nombre,
      detalle: seccion.nombre + " · " + Comun.fechaCorta(gasto.fecha),
      monto: Comun.euros(gasto.monto),
    }).then(function (si) {
      if (!si) return;
      datos.gastos = datos.gastos.filter(function (g) { return g.id !== id; });
      Datos.guardar(datos);
    });
  }

  // ---------- Bloque de sección (crear o editar) ----------

  function elegirColor(bloque, color) {
    bloque.querySelectorAll('[data-b="bs-color"]').forEach(function (boton, i) {
      const elegido = Comun.COLORES[i] === color;
      boton.setAttribute("aria-pressed", elegido ? "true" : "false");
      boton.style.borderColor = elegido ? "rgb(22, 32, 30)" : "transparent";
    });
  }

  function colorElegido(bloque) {
    const botones = Array.from(bloque.querySelectorAll('[data-b="bs-color"]'));
    const i = botones.findIndex(function (x) { return x.getAttribute("aria-pressed") === "true"; });
    return Comun.COLORES[i < 0 ? 0 : i];
  }

  function abrirBloque(seccion) {
    editandoSeccionId = seccion ? seccion.id : null;
    const usados = Datos.cargar().secciones.map(function (s) { return s.color; });
    const libre = Comun.COLORES.find(function (c) { return !usados.includes(c); }) || Comun.COLORES[0];
    paneles.forEach(function (panel) {
      const bl = panel.bloque;
      b(bl, "bs-titulo").textContent = seccion ? "Editar sección" : "Nueva sección";
      b(bl, "bs-guardar").querySelector("span").textContent = seccion ? "Guardar" : "Crear sección";
      b(bl, "bs-eliminar").hidden = !seccion;
      b(bl, "bs-nombre").value = seccion ? seccion.nombre : "";
      b(bl, "bs-presupuesto").value = seccion && seccion.presupuesto ? Comun.montoParaCampo(seccion.presupuesto) : "";
      elegirColor(bl, seccion ? seccion.color : libre);
      bl.hidden = false;
    });
    const visible = paneles.find(function (p) { return p.vista.offsetParent !== null; });
    if (visible) b(visible.bloque, "bs-nombre").focus();
  }

  function cerrarBloque() {
    paneles.forEach(function (panel) {
      panel.bloque.hidden = true;
      const select = b(panel.vista, "seccion");
      if (select.value === NUEVA) select.selectedIndex = 0;
    });
  }

  function guardarBloque(bloque) {
    const nombre = b(bloque, "bs-nombre").value.trim();
    const textoPresupuesto = b(bloque, "bs-presupuesto").value.trim();
    const presupuesto = textoPresupuesto ? Comun.leerMonto(textoPresupuesto) : 0; // el presupuesto es opcional
    if (!nombre) return Comun.marcarError(b(bloque, "bs-nombre"));
    if (presupuesto === null) return Comun.marcarError(b(bloque, "bs-presupuesto"));

    const datos = Datos.cargar();
    let seccion;
    if (editandoSeccionId === null) {
      seccion = { id: Datos.nuevoId(), nombre: nombre, tipo: "variable", presupuesto: presupuesto, color: colorElegido(bloque) };
      datos.secciones.push(seccion);
    } else {
      seccion = datos.secciones.find(function (s) { return s.id === editandoSeccionId; });
      seccion.nombre = nombre;
      seccion.presupuesto = presupuesto;
      seccion.color = colorElegido(bloque);
    }
    paneles.forEach(function (panel) { panel.bloque.hidden = true; });
    Datos.guardar(datos);
    // La sección recién creada o editada queda elegida en el formulario
    paneles.forEach(function (panel) { b(panel.vista, "seccion").value = seccion.id; });
  }

  function eliminarSeccion() {
    const datos = Datos.cargar();
    const seccion = datos.secciones.find(function (s) { return s.id === editandoSeccionId; });
    const suyos = datos.gastos.filter(function (g) { return g.seccionId === seccion.id; }).length;
    Comun.confirmar({
      titulo: "¿Eliminar la sección " + seccion.nombre + "?",
      texto: "Se eliminarán la sección, su presupuesto y sus gastos de todos los meses. Esta acción no se puede deshacer.",
      color: seccion.color,
      nombre: seccion.nombre,
      detalle: suyos + (suyos === 1 ? " gasto anotado" : " gastos anotados") +
               (seccion.presupuesto ? " · presupuesto " + Comun.euros(seccion.presupuesto) : ""),
    }).then(function (si) {
      if (!si) return;
      datos.secciones = datos.secciones.filter(function (s) { return s.id !== seccion.id; });
      datos.gastos = datos.gastos.filter(function (g) { return g.seccionId !== seccion.id; });
      paneles.forEach(function (panel) { panel.bloque.hidden = true; });
      Datos.guardar(datos);
    });
  }

  function editarSeccionElegida(panel) {
    const select = b(panel.vista, "seccion");
    const seccion = Datos.cargar().secciones.find(function (s) { return s.id === select.value; });
    if (seccion) abrirBloque(seccion);
    else Comun.marcarError(select);
  }

  // ---------- Conexión de botones ----------

  paneles.forEach(function (panel) {
    panel.vista.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button[data-b]");
      if (!boton) return;
      const fila = boton.closest("[data-id]");
      const accion = boton.dataset.b;
      if (accion === "anadir") anadir(panel);
      if (accion === "abrir-seccion") abrirBloque(null);
      if (accion === "editar-seccion") editarSeccionElegida(panel);
      if (accion === "bs-cerrar") cerrarBloque();
      if (accion === "bs-guardar") guardarBloque(panel.bloque);
      if (accion === "bs-eliminar") eliminarSeccion();
      if (accion === "bs-color") {
        const i = Array.from(panel.bloque.querySelectorAll('[data-b="bs-color"]')).indexOf(boton);
        elegirColor(panel.bloque, Comun.COLORES[i]);
      }
      if (accion === "f-corregir") { editandoGastoId = fila.dataset.id; pintar(); }
      if (accion === "f-borrar") borrar(fila.dataset.id);
      if (accion === "e-cancelar") { editandoGastoId = null; pintar(); }
      if (accion === "e-guardar") guardarEdicion(fila);
    });

    // Elegir "+ Crear sección nueva" en el desplegable abre el bloque
    b(panel.vista, "seccion").addEventListener("change", function (evento) {
      if (evento.target.value === NUEVA) abrirBloque(null);
    });

    // La tecla Enter envía el formulario o el bloque en el que se está escribiendo
    panel.vista.addEventListener("keydown", function (evento) {
      if (evento.key !== "Enter" || evento.target.tagName !== "INPUT") return;
      evento.preventDefault();
      const fila = evento.target.closest('[data-b="fila-edicion"]');
      if (fila) guardarEdicion(fila);
      else if (evento.target.closest('[data-b="bloque-seccion"]')) guardarBloque(panel.bloque);
      else anadir(panel);
    });
  });

  // Al cambiar de mes, la fecha propuesta del formulario pasa a ese mes
  let mesPintado = Datos.mes();
  document.addEventListener("bolsillo:cambio", function () {
    if (Datos.mes() !== mesPintado) {
      mesPintado = Datos.mes();
      paneles.forEach(function (panel) { b(panel.vista, "fecha").value = Comun.fechaParaCampo(Comun.fechaPorDefecto(mesPintado)); });
    }
    pintar();
  });
  pintar();
})();
