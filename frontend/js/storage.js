/* =========================================================
   storage.js
   Persistencia local (localStorage) de las solicitudes de
   cita enviadas desde este navegador. En una fase posterior
   esto puede reemplazarse por una llamada real a la API
   (POST /api/citas) del backend.
   ========================================================= */

const CLAVE_CITAS = 'marea_salud_citas';

function obtenerCitas() {
    try {
        const datos = localStorage.getItem(CLAVE_CITAS);
        return datos ? JSON.parse(datos) : [];
    } catch (error) {
        console.error('No se pudieron leer las citas guardadas:', error);
        return [];
    }
}

function guardarCitas(citas) {
    localStorage.setItem(CLAVE_CITAS, JSON.stringify(citas));
}

function agregarCita(cita) {
    const citas = obtenerCitas();
    citas.push(cita);
    guardarCitas(citas);
    return citas;
}

function eliminarCita(id) {
    const citas = obtenerCitas().filter((c) => c.id !== id);
    guardarCitas(citas);
    return citas;
}

function borrarTodasLasCitas() {
    guardarCitas([]);
    return [];
}
