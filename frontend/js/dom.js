/* =========================================================
   dom.js
   Utilidades de manipulación del DOM: pintar tarjetas de
   citas, mostrar/limpiar errores de validación y helpers
   generales reutilizados por app.js.
   ========================================================= */

/** Evita que texto ingresado por el usuario rompa el HTML al mostrarlo. */
function escaparHTML(texto) {
    const div = document.createElement('div');
    div.textContent = texto || '';
    return div.innerHTML;
}

/** Formatea una fecha ISO (yyyy-mm-dd) a un texto legible en español. */
function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Sin definir';
    const fecha = new Date(fechaISO + 'T00:00:00');
    return fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Muestra un mensaje de error bajo un campo y marca el contenedor como inválido. */
function mostrarError(idCampo, mensaje) {
    const input = document.getElementById(idCampo);
    const span = document.getElementById(`error-${idCampo}`);
    if (span) span.textContent = mensaje;
    if (input) input.closest('.campo')?.classList.add('is-invalid');
}

/** Limpia el mensaje de error y el estado inválido de un campo. */
function limpiarError(idCampo) {
    const input = document.getElementById(idCampo);
    const span = document.getElementById(`error-${idCampo}`);
    if (span) span.textContent = '';
    if (input) input.closest('.campo')?.classList.remove('is-invalid');
}

/** Limpia todos los mensajes de error de una lista de ids de campos. */
function limpiarErrores(idsCampos) {
    idsCampos.forEach(limpiarError);
}

/** Construye el elemento <article> de una tarjeta de cita a partir de los datos. */
function crearTarjetaCita(cita) {
    const articulo = document.createElement('article');
    articulo.className = 'cita-card';
    articulo.dataset.id = cita.id;

    const raza = cita.raza ? ` · ${escaparHTML(cita.raza)}` : '';

    articulo.innerHTML = `
        <button type="button" class="cita-eliminar" data-id="${cita.id}" aria-label="Eliminar solicitud">&times;</button>
        <span class="cita-especialidad">${escaparHTML(cita.especialidad)}</span>
        <p class="cita-nombre">${escaparHTML(cita.nombreMascota)} (${escaparHTML(cita.especieMascota)}${raza})</p>
        <p>Dueño/a: ${escaparHTML(cita.nombre)}</p>
        <p>Sede ${escaparHTML(cita.sede)}</p>
        <p>${formatearFecha(cita.fecha)}</p>
        <p>${escaparHTML(cita.telefono)}</p>
    `;
    return articulo;
}

/** Vuelve a pintar toda la lista de citas guardadas en el contenedor indicado. */
function renderizarCitas(citas, contenedor, elementoVacio, contador, botonBorrar) {
    contenedor.querySelectorAll('.cita-card').forEach((el) => el.remove());

    if (citas.length === 0) {
        elementoVacio.hidden = false;
        botonBorrar.hidden = true;
        contador.textContent = '0';
        return;
    }

    elementoVacio.hidden = true;
    botonBorrar.hidden = false;
    contador.textContent = String(citas.length);

    citas
        .slice()
        .reverse()
        .forEach((cita) => contenedor.appendChild(crearTarjetaCita(cita)));
}
