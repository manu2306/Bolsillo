// analista.js — Pantalla del Analista IA. Envía al servidor el resumen YA CALCULADO y muestra la respuesta.
// La IA solo lee: esta pantalla nunca guarda ni cambia datos.

(function () {
  const AVISO_SIN_CONEXION = "No se ha podido conectar con el analista. Compruebe su conexión e inténtelo de nuevo.";
  const AVISO_DESPERTANDO = "El servidor se está despertando. La primera consulta puede tardar hasta un minuto…";
  let ocupado = false; // true mientras se espera una respuesta

  function b(raiz, nombre) { return raiz.querySelector('[data-b="' + nombre + '"]'); }

  // De cada maqueta se guardan los moldes de los mensajes del diseño y se vacía la conversación de ejemplo
  const paneles = Comun.vistas().map(function (vista) {
    const chat = b(vista, "chat");
    const resumen = b(chat, "m-resumen").cloneNode(true);
    const panel = {
      vista: vista,
      chat: chat,
      moldeUsuario: b(chat, "m-usuario").cloneNode(true),
      moldeResumen: resumen,
      moldePunto: b(resumen, "r-lista").children[0].cloneNode(true),
      moldeTexto: b(chat, "m-texto").cloneNode(true),
    };
    chat.replaceChildren();
    return panel;
  });

  // ---------- Mensajes de la conversación ----------

  // Añade un mensaje a las dos maquetas y devuelve los dos elementos creados
  function anadir(crear) {
    return paneles.map(function (panel) {
      const mensaje = crear(panel);
      panel.chat.append(mensaje);
      if (panel.vista.offsetParent !== null) mensaje.scrollIntoView({ behavior: "smooth", block: "nearest" });
      return mensaje;
    });
  }

  function mensajeUsuario(texto) {
    anadir(function (panel) {
      const m = panel.moldeUsuario.cloneNode(true);
      b(m, "m-contenido").textContent = texto;
      return m;
    });
  }

  function mensajeTexto(texto) {
    return anadir(function (panel) {
      const m = panel.moldeTexto.cloneNode(true);
      b(m, "m-contenido").textContent = texto;
      return m;
    });
  }

  function mensajeResumen(titulo, puntos) {
    anadir(function (panel) {
      const m = panel.moldeResumen.cloneNode(true);
      b(m, "r-titulo").textContent = titulo;
      const lista = b(m, "r-lista");
      lista.replaceChildren();
      puntos.forEach(function (texto, i) {
        const punto = panel.moldePunto.cloneNode(true);
        punto.children[0].textContent = i + 1;
        punto.children[1].textContent = texto;
        lista.append(punto);
      });
      return m;
    });
  }

  function bloquear(si) {
    ocupado = si;
    paneles.forEach(function (panel) {
      b(panel.vista, "btn-resumen").disabled = si;
      b(panel.vista, "form").querySelector('button[type="submit"]').disabled = si;
      b(panel.vista, "btn-resumen").style.opacity = si ? 0.6 : "";
    });
  }

  // ---------- Consulta al servidor ----------

  function consultar(pregunta) {
    if (ocupado) return;
    const datos = Datos.cargar();
    const mes = Datos.mes();
    // Las cantidades viajan ya escritas ("1.200 €"); el espacio especial de euros() se cambia por uno normal
    const limpio = function (texto) { return texto.replace(/\u00A0/g, " "); };
    const resumen = Calculos.resumenParaAnalista(datos, mes, {
      mes: Comun.nombreMes,
      euros: function (n) { return limpio(Comun.euros(n)); },
      porcentaje: function (n) { return limpio(Comun.porcentaje(n)); },
    });
    const nombreDelMes = Comun.mesEnMinusculas(mes);
    mensajeUsuario(pregunta || "Resumen del mes");

    // Sin datos no se gasta una consulta: se responde aquí mismo
    if (!resumen.hayDatos) {
      mensajeTexto("Todavía no hay ingresos ni gastos en " + nombreDelMes + ". Añádalos y podré analizarlos.");
      return;
    }

    bloquear(true);
    const espera = mensajeTexto("Analizando sus datos…");
    // En Render el servidor se duerme tras 15 minutos sin visitas: si tarda, se avisa
    const avisoLento = setTimeout(function () {
      espera.forEach(function (m) { b(m, "m-contenido").textContent = AVISO_DESPERTANDO; });
    }, 5000);
    const control = new AbortController();
    const limite = setTimeout(function () { control.abort(); }, 90000);

    fetch("/api/analista", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumen: resumen, pregunta: pregunta || null }),
      signal: control.signal,
    })
      .then(function (respuesta) {
        return respuesta.json().catch(function () { return {}; }).then(function (cuerpo) {
          return { ok: respuesta.ok, cuerpo: cuerpo };
        });
      })
      .then(function (r) {
        espera.forEach(function (m) { m.remove(); });
        // Si el servidor rechaza la consulta (por ejemplo, límite diario), se muestra su mensaje
        if (!r.ok) return mensajeTexto(typeof r.cuerpo.detail === "string" ? r.cuerpo.detail : AVISO_SIN_CONEXION);
        // El resumen llega como una lista de 3 observaciones; una pregunta, como texto
        const observaciones = Array.isArray(r.cuerpo.observaciones) ? r.cuerpo.observaciones.filter(Boolean) : [];
        if (observaciones.length > 0) mensajeResumen("Resumen de " + nombreDelMes, observaciones.slice(0, 3));
        else mensajeTexto(String(r.cuerpo.respuesta || "").trim());
      })
      .catch(function () {
        espera.forEach(function (m) { m.remove(); });
        mensajeTexto(AVISO_SIN_CONEXION);
      })
      .finally(function () {
        clearTimeout(avisoLento);
        clearTimeout(limite);
        bloquear(false);
      });
  }

  // ---------- Conexión de botones ----------

  paneles.forEach(function (panel) {
    const campo = b(panel.vista, "pregunta");
    b(panel.vista, "btn-resumen").addEventListener("click", function () { consultar(""); });
    b(panel.vista, "form").addEventListener("submit", function (evento) {
      evento.preventDefault();
      const pregunta = campo.value.trim();
      if (!pregunta) return Comun.marcarError(campo);
      if (ocupado) return;
      campo.value = "";
      consultar(pregunta);
    });
  });

  // El ejemplo del campo de pregunta usa el mes elegido
  function pintar() {
    paneles.forEach(function (panel) {
      b(panel.vista, "pregunta").placeholder = "Por ejemplo: ¿Por qué gasté más en " + Comun.mesEnMinusculas(Datos.mes()) + "?";
    });
  }
  document.addEventListener("bolsillo:cambio", pintar);
  pintar();

  // Saludo inicial y llamada de "despertador" al servidor (no envía ningún dato)
  mensajeTexto("Pulse «Resumen del mes» o escriba su pregunta. Analizo las cifras que ya ha calculado su panel.");
  fetch("/api/salud").catch(function () {});
})();
