/* =========================================================
   app.js — Lógica de la interfaz del panel de recepción.
   Maneja navegación entre vistas, tablas, modales y el
   flujo de trabajo: cliente → mascota → cita → consulta.
   ========================================================= */

const estado = {
    clientes: [],
    mascotas: [],
    citas: [],
    vistaActual: 'agenda',
};

/* ---------------------------------------------------------
   Utilidades generales
   --------------------------------------------------------- */

function mostrarToast(mensaje, tipo = 'ok') {
    const toast = document.getElementById('toast');
    toast.textContent = mensaje;
    toast.className = `toast${tipo === 'error' ? ' error' : ''}`;
    toast.hidden = false;
    clearTimeout(mostrarToast._timeout);
    mostrarToast._timeout = setTimeout(() => { toast.hidden = true; }, 4000);
}

function formatearFechaHora(fechaISO) {
    const fecha = new Date(fechaISO);
    const fechaTexto = fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    const horaTexto = fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return { fechaTexto, horaTexto, fecha };
}

function esHoy(fechaISO) {
    const hoy = new Date();
    const fecha = new Date(fechaISO);
    return fecha.getFullYear() === hoy.getFullYear()
        && fecha.getMonth() === hoy.getMonth()
        && fecha.getDate() === hoy.getDate();
}

function badgeEstado(estadoCita) {
    const clases = { Pendiente: 'badge-pendiente', Atendida: 'badge-atendida', Cancelada: 'badge-cancelada' };
    return `<span class="badge ${clases[estadoCita] || ''}">${estadoCita}</span>`;
}

function nombreMascota(cita) {
    return cita.paciente ? cita.paciente.nombre : '(mascota eliminada)';
}

function nombreDueño(cita) {
    return cita.paciente && cita.paciente.dueño ? cita.paciente.dueño.nombre : '—';
}

/* ---------------------------------------------------------
   Reloj y estado de conexión
   --------------------------------------------------------- */

function actualizarReloj() {
    const ahora = new Date();
    document.getElementById('relojActual').textContent = ahora.toLocaleString('es-CO', {
        weekday: 'long', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

async function verificarConexion() {
    const punto = document.getElementById('puntoConexion');
    const texto = document.getElementById('textoConexion');
    try {
        await api.verificarConexion();
        punto.className = 'punto ok';
        texto.textContent = 'Conectado al servidor';
    } catch (error) {
        punto.className = 'punto error';
        texto.textContent = 'Sin conexión al servidor';
    }
}

/* ---------------------------------------------------------
   Navegación entre vistas
   --------------------------------------------------------- */

const TITULOS_VISTA = {
    agenda: ['Agenda de hoy', 'Resumen de las citas programadas para hoy.'],
    citas: ['Citas', 'Consulta, agenda y actualiza el estado de las citas.'],
    clientes: ['Clientes', 'Registra y administra los dueños de mascota.'],
    mascotas: ['Mascotas', 'Registra y administra las mascotas de tus clientes.'],
};

function cambiarVista(vista) {
    estado.vistaActual = vista;

    document.querySelectorAll('.nav-item').forEach((boton) => {
        boton.classList.toggle('is-active', boton.dataset.vista === vista);
    });
    document.querySelectorAll('.vista').forEach((seccion) => {
        seccion.hidden = seccion.id !== `vista-${vista}`;
    });

    const [titulo, subtitulo] = TITULOS_VISTA[vista];
    document.getElementById('tituloVista').textContent = titulo;
    document.getElementById('subtituloVista').textContent = subtitulo;
}

/* ---------------------------------------------------------
   Carga de datos
   --------------------------------------------------------- */

async function cargarTodo() {
    try {
        const [clientes, mascotas, citas] = await Promise.all([
            api.clientes.listar(),
            api.mascotas.listar(),
            api.citas.listar(),
        ]);
        estado.clientes = clientes;
        estado.mascotas = mascotas;
        estado.citas = citas;
        renderizarTodo();
    } catch (error) {
        mostrarToast(`No se pudieron cargar los datos: ${error.message}`, 'error');
    }
}

function renderizarTodo() {
    renderizarAgenda();
    renderizarCitas();
    renderizarClientes();
    renderizarMascotas();
}

/* ---------------------------------------------------------
   Vista: Agenda de hoy
   --------------------------------------------------------- */

function renderizarAgenda() {
    const citasHoy = estado.citas
        .filter((cita) => esHoy(cita.fechaHora))
        .sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

    document.getElementById('resumenPendientes').textContent = citasHoy.filter((c) => c.estado === 'Pendiente').length;
    document.getElementById('resumenAtendidas').textContent = citasHoy.filter((c) => c.estado === 'Atendida').length;
    document.getElementById('resumenCanceladas').textContent = citasHoy.filter((c) => c.estado === 'Cancelada').length;
    document.getElementById('resumenClientes').textContent = estado.clientes.length;

    const tabla = document.getElementById('tablaAgendaHoy');
    const cuerpo = tabla.querySelector('tbody');
    const vacio = tabla.parentElement.querySelector('.tabla-vacia');

    cuerpo.innerHTML = '';
    vacio.hidden = citasHoy.length > 0;
    tabla.hidden = citasHoy.length === 0;

    citasHoy.forEach((cita) => {
        const { horaTexto } = formatearFechaHora(cita.fechaHora);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${horaTexto}</td>
            <td class="celda-principal">${nombreMascota(cita)}</td>
            <td>${nombreDueño(cita)}</td>
            <td class="celda-secundaria">${cita.motivo}</td>
            <td>${badgeEstado(cita.estado)}</td>
            <td class="acciones-fila">${accionesCita(cita)}</td>
        `;
        cuerpo.appendChild(fila);
    });
}

/* ---------------------------------------------------------
   Vista: Citas
   --------------------------------------------------------- */

function accionesCita(cita) {
    if (cita.estado !== 'Pendiente') return '';
    return `
        <button class="btn-fila" data-accion="atender" data-id="${cita._id}">Registrar atención</button>
        <button class="btn-fila peligro" data-accion="cancelar" data-id="${cita._id}">Cancelar</button>
    `;
}

function renderizarCitas() {
    const textoBusqueda = document.getElementById('buscarCitas').value.trim().toLowerCase();
    const filtroEstado = document.getElementById('filtroEstadoCita').value;

    const citasFiltradas = estado.citas
        .filter((cita) => !filtroEstado || cita.estado === filtroEstado)
        .filter((cita) => {
            if (!textoBusqueda) return true;
            return nombreMascota(cita).toLowerCase().includes(textoBusqueda)
                || nombreDueño(cita).toLowerCase().includes(textoBusqueda);
        })
        .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

    const tabla = document.getElementById('tablaCitas');
    const cuerpo = tabla.querySelector('tbody');
    const vacio = tabla.parentElement.querySelector('.tabla-vacia');

    cuerpo.innerHTML = '';
    vacio.hidden = citasFiltradas.length > 0;
    tabla.hidden = citasFiltradas.length === 0;

    citasFiltradas.forEach((cita) => {
        const { fechaTexto, horaTexto } = formatearFechaHora(cita.fechaHora);
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${fechaTexto} · ${horaTexto}</td>
            <td class="celda-principal">${nombreMascota(cita)}</td>
            <td>${nombreDueño(cita)}</td>
            <td class="celda-secundaria">${cita.motivo}</td>
            <td>${badgeEstado(cita.estado)}</td>
            <td class="acciones-fila">${accionesCita(cita)}</td>
        `;
        cuerpo.appendChild(fila);
    });
}

async function manejarAccionCita(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;

    const { accion, id } = boton.dataset;
    const cita = estado.citas.find((c) => c._id === id);
    if (!cita) return;

    if (accion === 'atender') {
        abrirModalConsulta(cita);
    } else if (accion === 'cancelar') {
        if (!confirm(`¿Cancelar la cita de ${nombreMascota(cita)}?`)) return;
        try {
            await api.citas.actualizarEstado(id, 'Cancelada');
            mostrarToast('Cita cancelada.');
            await cargarTodo();
        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    }
}

/* ---------------------------------------------------------
   Vista: Clientes
   --------------------------------------------------------- */

function renderizarClientes() {
    const textoBusqueda = document.getElementById('buscarClientes').value.trim().toLowerCase();

    const clientesFiltrados = estado.clientes.filter((cliente) => {
        if (!textoBusqueda) return true;
        return [cliente.nombre, cliente.email, cliente.telefono]
            .filter(Boolean)
            .some((campo) => campo.toLowerCase().includes(textoBusqueda));
    });

    const tabla = document.getElementById('tablaClientes');
    const cuerpo = tabla.querySelector('tbody');
    const vacio = tabla.parentElement.querySelector('.tabla-vacia');

    cuerpo.innerHTML = '';
    vacio.hidden = clientesFiltrados.length > 0;
    tabla.hidden = clientesFiltrados.length === 0;

    clientesFiltrados.forEach((cliente) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="celda-principal">${cliente.nombre}</td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email}</td>
            <td class="celda-secundaria">${cliente.direccion || '—'}</td>
            <td class="acciones-fila">
                <button class="btn-fila" data-accion="editar-cliente" data-id="${cliente._id}">Editar</button>
                <button class="btn-fila peligro" data-accion="desactivar-cliente" data-id="${cliente._id}">Desactivar</button>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
}

async function manejarAccionCliente(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;
    const { accion, id } = boton.dataset;
    const cliente = estado.clientes.find((c) => c._id === id);
    if (!cliente) return;

    if (accion === 'editar-cliente') {
        abrirModalCliente(cliente);
    } else if (accion === 'desactivar-cliente') {
        if (!confirm(`¿Desactivar a ${cliente.nombre}? Ya no aparecerá disponible para agendar citas.`)) return;
        try {
            await api.clientes.desactivar(id);
            mostrarToast('Cliente desactivado.');
            await cargarTodo();
        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    }
}

/* ---------------------------------------------------------
   Vista: Mascotas
   --------------------------------------------------------- */

function renderizarMascotas() {
    const textoBusqueda = document.getElementById('buscarMascotas').value.trim().toLowerCase();

    const mascotasFiltradas = estado.mascotas.filter((mascota) => {
        if (!textoBusqueda) return true;
        const nombreDuenio = mascota.dueño ? mascota.dueño.nombre : '';
        return [mascota.nombre, nombreDuenio].filter(Boolean).some((campo) => campo.toLowerCase().includes(textoBusqueda));
    });

    const tabla = document.getElementById('tablaMascotas');
    const cuerpo = tabla.querySelector('tbody');
    const vacio = tabla.parentElement.querySelector('.tabla-vacia');

    cuerpo.innerHTML = '';
    vacio.hidden = mascotasFiltradas.length > 0;
    tabla.hidden = mascotasFiltradas.length === 0;

    mascotasFiltradas.forEach((mascota) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="celda-principal">${mascota.nombre}</td>
            <td>${mascota.especie}</td>
            <td class="celda-secundaria">${mascota.raza || '—'}</td>
            <td>${mascota.dueño ? mascota.dueño.nombre : '—'}</td>
            <td class="acciones-fila">
                <button class="btn-fila" data-accion="editar-mascota" data-id="${mascota._id}">Editar</button>
                <button class="btn-fila" data-accion="agendar-mascota" data-id="${mascota._id}">Agendar cita</button>
                <button class="btn-fila peligro" data-accion="desactivar-mascota" data-id="${mascota._id}">Desactivar</button>
            </td>
        `;
        cuerpo.appendChild(fila);
    });
}

async function manejarAccionMascota(evento) {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton) return;
    const { accion, id } = boton.dataset;
    const mascota = estado.mascotas.find((m) => m._id === id);
    if (!mascota) return;

    if (accion === 'editar-mascota') {
        abrirModalMascota(mascota);
    } else if (accion === 'agendar-mascota') {
        abrirModalCita(mascota._id);
    } else if (accion === 'desactivar-mascota') {
        if (!confirm(`¿Desactivar a ${mascota.nombre}?`)) return;
        try {
            await api.mascotas.desactivar(id);
            mostrarToast('Mascota desactivada.');
            await cargarTodo();
        } catch (error) {
            mostrarToast(error.message, 'error');
        }
    }
}

/* ---------------------------------------------------------
   Modales: apertura / cierre genérico
   --------------------------------------------------------- */

function abrirModal(idModal) {
    document.getElementById(idModal).hidden = false;
}

function cerrarModal(idModal) {
    document.getElementById(idModal).hidden = true;
    document.querySelectorAll(`#${idModal} .form-error`).forEach((p) => { p.hidden = true; });
}

document.querySelectorAll('[data-cerrar-modal]').forEach((boton) => {
    boton.addEventListener('click', () => cerrarModal(boton.dataset.cerrarModal));
});

document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (evento) => {
        if (evento.target === overlay) cerrarModal(overlay.id);
    });
});

/* ---------------------------------------------------------
   Modal: Cliente
   --------------------------------------------------------- */

function abrirModalCliente(cliente = null) {
    document.getElementById('modalClienteTitulo').textContent = cliente ? 'Editar cliente' : 'Nuevo cliente';
    document.getElementById('clienteId').value = cliente ? cliente._id : '';
    document.getElementById('clienteNombre').value = cliente ? cliente.nombre : '';
    document.getElementById('clienteTelefono').value = cliente ? cliente.telefono : '';
    document.getElementById('clienteEmail').value = cliente ? cliente.email : '';
    document.getElementById('clienteDireccion').value = cliente ? (cliente.direccion || '') : '';
    abrirModal('modalCliente');
}

document.getElementById('formCliente').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const id = document.getElementById('clienteId').value;
    const datos = {
        nombre: document.getElementById('clienteNombre').value.trim(),
        telefono: document.getElementById('clienteTelefono').value.trim(),
        email: document.getElementById('clienteEmail').value.trim(),
        direccion: document.getElementById('clienteDireccion').value.trim(),
    };

    try {
        if (id) {
            await api.clientes.actualizar(id, datos);
            mostrarToast('Cliente actualizado.');
        } else {
            await api.clientes.crear(datos);
            mostrarToast('Cliente registrado.');
        }
        cerrarModal('modalCliente');
        await cargarTodo();
    } catch (error) {
        const p = document.getElementById('errorCliente');
        p.textContent = error.message;
        p.hidden = false;
    }
});

/* ---------------------------------------------------------
   Modal: Mascota
   --------------------------------------------------------- */

function poblarSelectClientes(select, valorSeleccionado = '') {
    select.innerHTML = '<option value="" disabled>Selecciona un cliente…</option>'
        + estado.clientes.map((c) => `<option value="${c._id}">${c.nombre} · ${c.telefono}</option>`).join('');
    if (valorSeleccionado) select.value = valorSeleccionado;
}

function abrirModalMascota(mascota = null) {
    if (estado.clientes.length === 0) {
        mostrarToast('Registra primero un cliente para poder asignarle una mascota.', 'error');
        return;
    }
    document.getElementById('modalMascotaTitulo').textContent = mascota ? 'Editar mascota' : 'Nueva mascota';
    document.getElementById('mascotaId').value = mascota ? mascota._id : '';
    poblarSelectClientes(document.getElementById('mascotaDueño'), mascota && mascota.dueño ? mascota.dueño._id : '');
    document.getElementById('mascotaNombre').value = mascota ? mascota.nombre : '';
    document.getElementById('mascotaEspecie').value = mascota ? mascota.especie : '';
    document.getElementById('mascotaRaza').value = mascota ? (mascota.raza || '') : '';
    abrirModal('modalMascota');
}

document.getElementById('formMascota').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const id = document.getElementById('mascotaId').value;
    const datos = {
        nombre: document.getElementById('mascotaNombre').value.trim(),
        especie: document.getElementById('mascotaEspecie').value.trim(),
        raza: document.getElementById('mascotaRaza').value.trim(),
        dueño: document.getElementById('mascotaDueño').value,
    };

    try {
        if (id) {
            await api.mascotas.actualizar(id, datos);
            mostrarToast('Mascota actualizada.');
        } else {
            await api.mascotas.crear(datos);
            mostrarToast('Mascota registrada.');
        }
        cerrarModal('modalMascota');
        await cargarTodo();
    } catch (error) {
        const p = document.getElementById('errorMascota');
        p.textContent = error.message;
        p.hidden = false;
    }
});

/* ---------------------------------------------------------
   Modal: Cita
   --------------------------------------------------------- */

function poblarSelectMascotas(select, valorSeleccionado = '') {
    select.innerHTML = '<option value="" disabled selected>Selecciona una mascota…</option>'
        + estado.mascotas.map((m) => `<option value="${m._id}">${m.nombre} (${m.especie})</option>`).join('');
    if (valorSeleccionado) select.value = valorSeleccionado;
}

function abrirModalCita(idMascotaPreseleccionada = '') {
    if (estado.mascotas.length === 0) {
        mostrarToast('Registra primero una mascota para poder agendar una cita.', 'error');
        return;
    }
    const selectMascota = document.getElementById('citaMascota');
    poblarSelectMascotas(selectMascota, idMascotaPreseleccionada);
    actualizarInfoDueñoCita();

    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('citaFecha').min = hoy;
    document.getElementById('citaFecha').value = hoy;
    document.getElementById('citaHora').value = '';
    document.getElementById('citaMotivo').value = '';
    abrirModal('modalCita');
}

function actualizarInfoDueñoCita() {
    const idMascota = document.getElementById('citaMascota').value;
    const mascota = estado.mascotas.find((m) => m._id === idMascota);
    const info = document.getElementById('citaDuenoInfo');
    info.textContent = mascota && mascota.dueño
        ? `Dueño: ${mascota.dueño.nombre} · ${mascota.dueño.telefono}`
        : '';
}

document.getElementById('citaMascota').addEventListener('change', actualizarInfoDueñoCita);

document.getElementById('formCita').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const idMascota = document.getElementById('citaMascota').value;
    const fecha = document.getElementById('citaFecha').value;
    const hora = document.getElementById('citaHora').value;
    const motivo = document.getElementById('citaMotivo').value.trim();

    const datos = {
        paciente: idMascota,
        fechaHora: new Date(`${fecha}T${hora}`).toISOString(),
        motivo,
    };

    try {
        await api.citas.agendar(datos);
        mostrarToast('Cita agendada correctamente.');
        cerrarModal('modalCita');
        await cargarTodo();
        cambiarVista('citas');
    } catch (error) {
        const p = document.getElementById('errorCita');
        p.textContent = error.message;
        p.hidden = false;
    }
});

/* ---------------------------------------------------------
   Modal: Consulta (registrar atención)
   --------------------------------------------------------- */

function abrirModalConsulta(cita) {
    document.getElementById('consultaCitaId').value = cita._id;
    document.getElementById('consultaDiagnostico').value = '';
    document.getElementById('consultaTratamiento').value = '';
    document.getElementById('consultaPatologia').value = '';
    abrirModal('modalConsulta');
}

document.getElementById('formConsulta').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datos = {
        cita: document.getElementById('consultaCitaId').value,
        diagnostico: document.getElementById('consultaDiagnostico').value.trim(),
        tratamiento: document.getElementById('consultaTratamiento').value.trim(),
        patologiaDetectada: document.getElementById('consultaPatologia').value.trim(),
    };

    try {
        await api.consultas.guardar(datos);
        mostrarToast('Atención registrada. La cita quedó marcada como atendida.');
        cerrarModal('modalConsulta');
        await cargarTodo();
    } catch (error) {
        const p = document.getElementById('errorConsulta');
        p.textContent = error.message;
        p.hidden = false;
    }
});

/* ---------------------------------------------------------
   Enlaces de eventos generales
   --------------------------------------------------------- */

document.getElementById('navMenu').addEventListener('click', (evento) => {
    const boton = evento.target.closest('.nav-item');
    if (boton) cambiarVista(boton.dataset.vista);
});

document.getElementById('btnAccionRapida').addEventListener('click', () => abrirModalCita());
document.getElementById('btnNuevoCliente').addEventListener('click', () => abrirModalCliente());
document.getElementById('btnNuevaMascota').addEventListener('click', () => abrirModalMascota());

document.getElementById('tablaAgendaHoy').addEventListener('click', manejarAccionCita);
document.getElementById('tablaCitas').addEventListener('click', manejarAccionCita);
document.getElementById('tablaClientes').addEventListener('click', manejarAccionCliente);
document.getElementById('tablaMascotas').addEventListener('click', manejarAccionMascota);

document.getElementById('buscarCitas').addEventListener('input', renderizarCitas);
document.getElementById('filtroEstadoCita').addEventListener('change', renderizarCitas);
document.getElementById('buscarClientes').addEventListener('input', renderizarClientes);
document.getElementById('buscarMascotas').addEventListener('input', renderizarMascotas);

/* ---------------------------------------------------------
   Arranque
   --------------------------------------------------------- */

actualizarReloj();
setInterval(actualizarReloj, 30000);

verificarConexion();
cargarTodo();
setInterval(verificarConexion, 15000);
setInterval(cargarTodo, 60000);
