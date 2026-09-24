/* =========================================================
   app.js
   Punto de entrada: conecta la interfaz (menú móvil, FAQ,
   tarjetas de especialidad y el flujo de agendamiento) con
   las utilidades de validations.js, storage.js y dom.js.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Menú móvil ---------- */
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        const abierto = navLinks.classList.toggle('is-open');
        navToggle.classList.toggle('is-open', abierto);
        navToggle.setAttribute('aria-expanded', String(abierto));
    });

    navLinks.querySelectorAll('a').forEach((enlace) => {
        enlace.addEventListener('click', () => {
            navLinks.classList.remove('is-open');
            navToggle.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });

    /* ---------- Acordeón de preguntas frecuentes ---------- */
    document.querySelectorAll('.faq-item').forEach((item) => {
        const pregunta = item.querySelector('.faq-question');
        pregunta.addEventListener('click', () => {
            const yaAbierto = item.classList.contains('is-open');
            document.querySelectorAll('.faq-item').forEach((otro) => {
                otro.classList.remove('is-open');
                otro.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            });
            if (!yaAbierto) {
                item.classList.add('is-open');
                pregunta.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ---------- Tarjetas de especialidad → preseleccionan el formulario ---------- */
    const selectEspecialidad = document.getElementById('especialidad');
    document.querySelectorAll('.esp-card').forEach((card) => {
        card.addEventListener('click', () => {
            const especialidad = card.dataset.especialidad;
            const opcion = Array.from(selectEspecialidad.options)
                .find((op) => op.value === especialidad);
            if (opcion) {
                selectEspecialidad.value = especialidad;
                limpiarError('especialidad');
            }
            document.getElementById('agendar').scrollIntoView({ behavior: 'smooth' });
            document.getElementById('nombre').focus({ preventScroll: true });
        });
    });

    /* ---------- Formulario de agendamiento ---------- */
    const formulario = document.getElementById('formCita');
    const mensajeExito = document.getElementById('formSuccess');
    const listaCitas = document.getElementById('listaCitas');
    const citasVacio = document.getElementById('citasVacio');
    const contadorCitas = document.getElementById('contadorCitas');
    const btnBorrarCitas = document.getElementById('btnBorrarCitas');

    const CAMPOS_VALIDABLES = ['nombre', 'documento', 'correo', 'telefono', 'especialidad', 'fecha'];

    function pintarCitas() {
        renderizarCitas(obtenerCitas(), listaCitas, citasVacio, contadorCitas, btnBorrarCitas);
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        limpiarErrores(CAMPOS_VALIDABLES);
        mensajeExito.hidden = true;

        const datos = {
            nombre: formulario.nombre.value,
            tipoDocumento: formulario.tipoDocumento.value,
            documento: formulario.documento.value,
            correo: formulario.correo.value,
            telefono: formulario.telefono.value,
            eps: formulario.eps.value,
            especialidad: formulario.especialidad.value,
            sede: formulario.sede.value,
            fecha: formulario.fecha.value,
            motivo: formulario.motivo.value,
        };

        const errores = validarFormularioCita(datos);

        if (Object.keys(errores).length > 0) {
            Object.entries(errores).forEach(([campo, mensaje]) => mostrarError(campo, mensaje));
            const primerCampoInvalido = document.getElementById(Object.keys(errores)[0]);
            primerCampoInvalido?.focus();
            return;
        }

        const nuevaCita = {
            id: Date.now().toString(),
            ...datos,
            creadaEn: new Date().toISOString(),
        };

        agregarCita(nuevaCita);
        pintarCitas();

        mensajeExito.hidden = false;
        formulario.reset();

        clearTimeout(window._ocultarExitoTimeout);
        window._ocultarExitoTimeout = setTimeout(() => { mensajeExito.hidden = true; }, 5000);
    });

    listaCitas.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.cita-eliminar');
        if (!boton) return;
        eliminarCita(boton.dataset.id);
        pintarCitas();
    });

    btnBorrarCitas.addEventListener('click', () => {
        if (confirm('¿Borrar todas tus solicitudes de cita guardadas en este navegador?')) {
            borrarTodasLasCitas();
            pintarCitas();
        }
    });

    /* Fecha mínima seleccionable = hoy */
    document.getElementById('fecha').min = new Date().toISOString().split('T')[0];

    pintarCitas();
});
