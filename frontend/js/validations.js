/* =========================================================
   validations.js
   Reglas de validación del formulario de agendamiento.
   Expresiones regulares para formato + lógica simple para
   reglas que no son de formato (por ejemplo, fechas pasadas).
   ========================================================= */

const REGEX = {
    nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,60}$/,
    documento: /^\d{6,10}$/,
    correo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    telefono: /^\d{7,10}$/,
};

/**
 * Valida todos los campos del formulario de citas.
 * @param {Object} datos - valores capturados del formulario
 * @returns {Object} mapa { campo: mensajeDeError } — vacío si todo es válido
 */
function validarFormularioCita(datos) {
    const errores = {};

    if (!REGEX.nombre.test(datos.nombre.trim())) {
        errores.nombre = 'Escribe un nombre válido (solo letras y espacios).';
    }

    if (!REGEX.documento.test(datos.documento.trim())) {
        errores.documento = 'El documento debe tener entre 6 y 10 dígitos.';
    }

    if (!REGEX.correo.test(datos.correo.trim())) {
        errores.correo = 'Escribe un correo electrónico válido.';
    }

    if (!REGEX.telefono.test(datos.telefono.trim())) {
        errores.telefono = 'El teléfono debe tener entre 7 y 10 dígitos.';
    }

    if (!datos.especialidad) {
        errores.especialidad = 'Selecciona una especialidad.';
    }

    // Regla lógica (no de formato): la fecha no puede ser anterior a hoy
    if (datos.fecha) {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const fechaElegida = new Date(datos.fecha + 'T00:00:00');
        if (fechaElegida < hoy) {
            errores.fecha = 'Elige una fecha a partir de hoy.';
        }
    } else {
        errores.fecha = 'Selecciona una fecha preferida.';
    }

    return errores;
}
