// ingresos.js — Pantalla de Ingresos: añadir, editar y eliminar ingresos.

(function () {
  const MOTIVOS = ["Extra", "Baja", "Vacaciones"];
  const ESTILO_MOTIVO_ELEGIDO = "background: rgb(227, 241, 238); color: rgb(11, 92, 86); border: 1px solid rgb(15, 118, 110);";
  let editandoId = null; // id del ingreso que se está editando (o null)

  // Cada maqueta (escritorio y móvil) tiene su formulario y su lista
  const paneles = Comun.vistas().map(function (vista) {
    const formulario = vista.querySelector("form");
    const lista = vista.querySelector("ul");
    const campos = formulario.querySelectorAll("input");
    const panel = {
      formulario: formulario,
      lista: lista,
      concepto: campos[0],
      monto: campos[1],
      mes: formulario.querySelector("select"),
      motivos: Array.from(formulario.querySelectorAll("fieldset button")),
      botonAnadir: formulario.querySelector(":scope > button"),
      // Las dos primeras filas del diseño sirven de molde: una normal y una en edición
      moldeFila: lista.children[0].cloneNode(true),
      moldeEdicion: lista.children[1].cloneNode(true),
    };
    panel.motivos.forEach(function (boton) { boton.dataset.estiloBase = boton.getAttribute("style"); });
    return panel;
  });

  // ---------- Formulario "Añadir ingreso" ----------

  function pintarFormulario(panel) {
    // El desplegable ofrece el mes elegido y los 11 anteriores
    const elegido = panel.mes.value || Datos.mes();
    panel.mes.innerHTML = "";
    for (let i = 0; i < 12; i++) {
      const mes = Comun.moverMes(Datos.mes(), -i);
      const opcion = new Option(Comun.nombreMes(mes), mes);
      panel.mes.add(opcion);
    }
    panel.mes.value = Array.from(panel.mes.options).some(function (o) { return o.value === elegido; }) ? elegido : Datos.mes();
  }

  function motivoElegido(panel) {
    const boton = panel.motivos.find(function (b) { return b.getAttribute("aria-pressed") === "true"; });
    return boton ? boton.textContent.trim() : "";
  }

  function elegirMotivo(panel, botonPulsado) {
    panel.motivos.forEach(function (boton) {
      const elegido = boton === botonPulsado && boton.getAttribute("aria-pressed") !== "true";
      boton.setAttribute("aria-pressed", elegido ? "true" : "false");
      boton.setAttribute("style", boton.dataset.estiloBase + (elegido ? ESTILO_MOTIVO_ELEGIDO : ""));
    });
  }

  function anadir(panel) {
    const concepto = panel.concepto.value.trim();
    const monto = Comun.leerMonto(panel.monto.value);
    if (!concepto) return Comun.marcarError(panel.concepto);
    if (monto === null) return Comun.marcarError(panel.monto);

    const datos = Datos.cargar();
    datos.ingresos.push({
      id: Datos.nuevoId(),
      mes: panel.mes.value,
      concepto: concepto,
      monto: monto,
      motivo: motivoElegido(panel),
    });
    panel.concepto.value = "";
    panel.monto.value = "";
    elegirMotivo(panel, null);
    Datos.guardar(datos); // guarda y redibuja
  }

  // ---------- Lista "Ingresos por mes" ----------

  function filaNormal(panel, ingreso) {
    const fila = panel.moldeFila.cloneNode(true);
    const textos = fila.querySelectorAll(":scope > div:first-child > span");
    const nombreMes = Comun.nombreMes(ingreso.mes);
    textos[0].textContent = nombreMes;

    // El concepto lleva dentro la etiqueta del motivo; se quita si no hay motivo
    const etiqueta = textos[1].querySelector("span");
    textos[1].firstChild.textContent = ingreso.concepto;
    if (ingreso.motivo) etiqueta.textContent = ingreso.motivo;
    else etiqueta.remove();

    fila.querySelector(":scope > span").textContent = Comun.euros(ingreso.monto);

    const botones = fila.querySelectorAll("button");
    botones[0].setAttribute("aria-label", "Editar ingreso de " + nombreMes);
    botones[0].dataset.accion = "editar";
    botones[1].setAttribute("aria-label", "Eliminar ingreso de " + nombreMes);
    botones[1].dataset.accion = "eliminar";
    fila.dataset.id = ingreso.id;
    return fila;
  }

  function filaEdicion(panel, ingreso) {
    const fila = panel.moldeEdicion.cloneNode(true);
    fila.querySelector(":scope > span").textContent = "Editando · " + Comun.nombreMes(ingreso.mes);
    const campos = fila.querySelectorAll("input");
    campos[0].value = ingreso.concepto;
    campos[1].value = Comun.montoParaCampo(ingreso.monto);
    const motivo = fila.querySelector("select");
    motivo.innerHTML = "";
    motivo.add(new Option("Sin motivo", ""));
    MOTIVOS.forEach(function (m) { motivo.add(new Option(m, m)); });
    motivo.value = ingreso.motivo;

    const botones = fila.querySelectorAll("button");
    botones[0].dataset.accion = "cancelar";
    botones[1].dataset.accion = "guardar";
    fila.dataset.id = ingreso.id;
    return fila;
  }

  function filaVacia(panel) {
    const fila = panel.moldeFila.cloneNode(true);
    const textos = fila.querySelectorAll(":scope > div:first-child > span");
    textos[0].textContent = "Sin ingresos en estos meses";
    textos[1].textContent = "Añada el primero con el formulario";
    fila.querySelector(":scope > span").remove();
    fila.querySelector(":scope > div:last-child").remove();
    return fila;
  }

  function pintarLista(panel) {
    // Se muestran los ingresos del mes elegido y los 5 anteriores, del más reciente al más antiguo
    const hasta = Datos.mes();
    const desde = Comun.moverMes(hasta, -5);
    const ingresos = Datos.cargar().ingresos
      .filter(function (i) { return i.mes >= desde && i.mes <= hasta; })
      .sort(function (a, b) { return b.mes.localeCompare(a.mes); });

    panel.lista.innerHTML = "";
    if (ingresos.length === 0) panel.lista.append(filaVacia(panel));
    ingresos.forEach(function (ingreso) {
      const fila = ingreso.id === editandoId ? filaEdicion(panel, ingreso) : filaNormal(panel, ingreso);
      panel.lista.append(fila);
    });
  }

  function guardarEdicion(fila) {
    const campos = fila.querySelectorAll("input");
    const concepto = campos[0].value.trim();
    const monto = Comun.leerMonto(campos[1].value);
    if (!concepto) return Comun.marcarError(campos[0]);
    if (monto === null) return Comun.marcarError(campos[1]);

    const datos = Datos.cargar();
    const ingreso = datos.ingresos.find(function (i) { return i.id === fila.dataset.id; });
    ingreso.concepto = concepto;
    ingreso.monto = monto;
    ingreso.motivo = fila.querySelector("select").value;
    editandoId = null;
    Datos.guardar(datos);
  }

  function eliminar(id) {
    const datos = Datos.cargar();
    datos.ingresos = datos.ingresos.filter(function (i) { return i.id !== id; });
    Datos.guardar(datos);
  }

  // ---------- Conexión de botones ----------

  function pintar() {
    paneles.forEach(function (panel) {
      pintarFormulario(panel);
      pintarLista(panel);
    });
  }

  paneles.forEach(function (panel) {
    panel.botonAnadir.addEventListener("click", function () { anadir(panel); });
    panel.formulario.addEventListener("submit", function (evento) { evento.preventDefault(); anadir(panel); });
    panel.formulario.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" && evento.target.tagName === "INPUT") { evento.preventDefault(); anadir(panel); }
    });
    panel.motivos.forEach(function (boton) {
      boton.addEventListener("click", function () { elegirMotivo(panel, boton); });
    });

    panel.lista.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button[data-accion]");
      if (!boton) return;
      const fila = boton.closest("li");
      const accion = boton.dataset.accion;
      if (accion === "editar") { editandoId = fila.dataset.id; pintar(); }
      if (accion === "cancelar") { editandoId = null; pintar(); }
      if (accion === "guardar") guardarEdicion(fila);
      if (accion === "eliminar") eliminar(fila.dataset.id);
    });
  });

  document.addEventListener("bolsillo:cambio", pintar);
  pintar();
})();
