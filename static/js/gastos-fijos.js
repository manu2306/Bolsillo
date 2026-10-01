// gastos-fijos.js — Pantalla de Gastos fijos: crear, editar y eliminar secciones.

(function () {
  let editandoId = null; // id de la sección que se está editando (null = sección nueva)

  // Cada maqueta (escritorio y móvil) tiene sus tarjetas y su formulario
  const paneles = Comun.vistas().map(function (vista) {
    const tarjetas = Array.from(vista.querySelectorAll('[data-b="tarjeta"]'));
    const panel = {
      vista: vista,
      molde: tarjetas[0].cloneNode(true),            // una tarjeta del diseño sirve de molde
      contenedor: tarjetas[0].parentElement,
      siguiente: tarjetas[tarjetas.length - 1].nextElementSibling, // lo que va después de las tarjetas
      formulario: vista.querySelector('[data-dialogo="seccion"]'),
    };
    tarjetas.forEach(function (t) { t.remove(); });   // fuera los datos de ejemplo
    return panel;
  });

  // ---------- Tarjetas y totales ----------

  function tarjeta(panel, seccion, mes) {
    const t = panel.molde.cloneNode(true);
    t.dataset.id = seccion.id;
    t.querySelector('[data-b="punto"]').style.background = seccion.color;
    t.querySelector('[data-b="nombre"]').lastChild.textContent = seccion.nombre;
    t.querySelector('[data-b="monto"]').textContent = Comun.euros(Calculos.montoFijo(seccion, mes));
    t.querySelector('[data-b="presupuesto"]').textContent = seccion.presupuesto ? Comun.euros(seccion.presupuesto) : "—";
    t.querySelector('[data-b="editar"]').setAttribute("aria-label", "Editar " + seccion.nombre);
    t.querySelector('[data-b="eliminar"]').setAttribute("aria-label", "Eliminar " + seccion.nombre);
    return t;
  }

  function pintar() {
    const datos = Datos.cargar();
    const mes = Datos.mes();
    const secciones = Calculos.fijasDelMes(datos, mes);
    const total = Calculos.sumar(secciones.map(function (s) { return Calculos.montoFijo(s, mes); }));
    const presupuesto = Calculos.sumar(secciones.map(function (s) { return s.presupuesto; }));

    paneles.forEach(function (panel) {
      panel.vista.querySelector('[data-b="total"]').textContent = Comun.euros(total);
      panel.vista.querySelector('[data-b="presupuesto-total"]').textContent = Comun.euros(presupuesto);
      panel.vista.querySelector('[data-b="num"]').textContent = secciones.length;
      panel.contenedor.querySelectorAll('[data-b="tarjeta"]').forEach(function (t) { t.remove(); });
      secciones.forEach(function (seccion) {
        panel.contenedor.insertBefore(tarjeta(panel, seccion, mes), panel.siguiente);
      });
    });
  }

  // ---------- Formulario de sección (añadir o editar) ----------

  function campo(formulario, nombre) { return formulario.querySelector('input[data-d="' + nombre + '"]'); }

  function elegirColor(formulario, color) {
    formulario.querySelectorAll('button[data-d="color"]').forEach(function (boton, i) {
      const elegido = Comun.COLORES[i] === color;
      boton.setAttribute("aria-pressed", elegido ? "true" : "false");
      boton.style.borderColor = elegido ? "rgb(22, 32, 30)" : "transparent";
    });
  }

  function colorElegido(formulario) {
    const botones = Array.from(formulario.querySelectorAll('button[data-d="color"]'));
    const i = botones.findIndex(function (b) { return b.getAttribute("aria-pressed") === "true"; });
    return Comun.COLORES[i < 0 ? 0 : i];
  }

  function abrirFormulario(seccion) {
    editandoId = seccion ? seccion.id : null;
    const datos = Datos.cargar();
    // Para una sección nueva se propone el primer color que no esté en uso
    const usados = datos.secciones.map(function (s) { return s.color; });
    const libre = Comun.COLORES.find(function (c) { return !usados.includes(c); }) || Comun.COLORES[0];

    paneles.forEach(function (panel) {
      const f = panel.formulario;
      f.querySelector('[data-d="titulo"]').textContent = seccion ? "Editar sección" : "Añadir sección";
      campo(f, "nombre").value = seccion ? seccion.nombre : "";
      campo(f, "monto").value = seccion ? Comun.montoParaCampo(Calculos.montoFijo(seccion, Datos.mes())) : "";
      campo(f, "presupuesto").value = seccion && seccion.presupuesto ? Comun.montoParaCampo(seccion.presupuesto) : "";
      elegirColor(f, seccion ? seccion.color : libre);
      f.hidden = false;
    });
    const visible = paneles.find(function (p) { return p.vista.offsetParent !== null; });
    if (visible) campo(visible.formulario, "nombre").focus();
  }

  function cerrarFormulario() {
    paneles.forEach(function (panel) { panel.formulario.hidden = true; });
  }

  function guardarFormulario(f) {
    const nombre = campo(f, "nombre").value.trim();
    const monto = Comun.leerMonto(campo(f, "monto").value);
    const textoPresupuesto = campo(f, "presupuesto").value.trim();
    const presupuesto = textoPresupuesto ? Comun.leerMonto(textoPresupuesto) : 0; // el presupuesto es opcional
    if (!nombre) return Comun.marcarError(campo(f, "nombre"));
    if (monto === null) return Comun.marcarError(campo(f, "monto"));
    if (presupuesto === null) return Comun.marcarError(campo(f, "presupuesto"));

    const datos = Datos.cargar();
    const mes = Datos.mes();
    if (editandoId === null) {
      datos.secciones.push({
        id: Datos.nuevoId(), nombre: nombre, tipo: "fijo", presupuesto: presupuesto,
        color: colorElegido(f), montos: [{ desde: mes, monto: monto }],
      });
    } else {
      const seccion = datos.secciones.find(function (s) { return s.id === editandoId; });
      seccion.nombre = nombre;
      seccion.presupuesto = presupuesto;
      seccion.color = colorElegido(f);
      // Historial: el nuevo importe vale desde el mes elegido; los meses anteriores no cambian
      if (Calculos.montoFijo(seccion, mes) !== monto) {
        const cambio = seccion.montos.find(function (m) { return m.desde === mes; });
        if (cambio) cambio.monto = monto;
        else seccion.montos.push({ desde: mes, monto: monto });
      }
    }
    cerrarFormulario();
    Datos.guardar(datos);
  }

  // ---------- Eliminar ----------

  function eliminar(id) {
    const datos = Datos.cargar();
    const seccion = datos.secciones.find(function (s) { return s.id === id; });
    Comun.confirmar({
      titulo: "¿Eliminar la sección " + seccion.nombre + "?",
      texto: "Se eliminarán la sección y su presupuesto. Esta acción no se puede deshacer.",
      color: seccion.color,
      nombre: seccion.nombre,
      detalle: Comun.euros(Calculos.montoFijo(seccion, Datos.mes())) + " al mes" +
               (seccion.presupuesto ? " · presupuesto " + Comun.euros(seccion.presupuesto) : ""),
    }).then(function (si) {
      if (!si) return;
      datos.secciones = datos.secciones.filter(function (s) { return s.id !== id; });
      Datos.guardar(datos);
    });
  }

  // ---------- Conexión de botones ----------

  paneles.forEach(function (panel) {
    panel.vista.addEventListener("click", function (evento) {
      const boton = evento.target.closest("button");
      if (evento.target === panel.formulario) return cerrarFormulario(); // clic fuera del formulario
      if (!boton) return;
      const tarjetaPulsada = boton.closest('[data-b="tarjeta"]');
      if (boton.dataset.b === "anadir") abrirFormulario(null);
      if (boton.dataset.b === "editar") {
        abrirFormulario(Datos.cargar().secciones.find(function (s) { return s.id === tarjetaPulsada.dataset.id; }));
      }
      if (boton.dataset.b === "eliminar") eliminar(tarjetaPulsada.dataset.id);
      if (boton.dataset.d === "cerrar") cerrarFormulario();
      if (boton.dataset.d === "guardar") guardarFormulario(panel.formulario);
      if (boton.dataset.d === "color") {
        const i = Array.from(panel.formulario.querySelectorAll('button[data-d="color"]')).indexOf(boton);
        elegirColor(panel.formulario, Comun.COLORES[i]);
      }
    });
    panel.formulario.addEventListener("keydown", function (evento) {
      if (evento.key === "Enter" && evento.target.tagName === "INPUT") guardarFormulario(panel.formulario);
      if (evento.key === "Escape") cerrarFormulario();
    });
  });

  document.addEventListener("bolsillo:cambio", pintar);
  pintar();
})();
