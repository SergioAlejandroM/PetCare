const API_URL = '/api';

async function peticion(ruta, {method = 'GET', body} = {}) {
    const opciones = { method, headers: {} };
    if(body !== undefined){
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(body);
    };

    const respuesta = await fetch(`${API_URL}${ruta}`, opciones);
    const json = await respuesta.json().catch(() => null);

    if(!respuesta.ok || !json || json.ok == false){
        throw new Error(json?.error || `Error ${respuesta.status}`);
    };

    return json.data;
}

const api = {
    verificarConexion: () => peticion('/health'),
    clientes: {
        listar:     ()          => peticion('/clientes'),
        crear:      (d)         => peticion('/clientes', { method: 'POST', body: d }),
        actualizar: (id, d)     => peticion(`/clientes/${id}`, { method: 'PUT', body: d }),
        desactivar: (id)        => peticion(`/clientes/${id}/desactivar`, { method: 'PATCH' }),
    },
    mascotas: {
        listar:     ()          => peticion('/pacientes'),
        crear:      (d)         => peticion('/pacientes', { method: 'POST', body: d }),
        actualizar: (id, d)     => peticion(`/pacientes/${id}`, { method: 'PUT', body: d }),
        desactivar: (id)        => peticion(`/pacientes/${id}/desactivar`, { method: 'PATCH' }),
    },
    citas: {
        listar:           ()             => peticion('/citas'),
        agendar:          (d)            => peticion('/citas', { method: 'POST', body: d }),
        actualizarEstado: (id, estado)   => peticion(`/citas/${id}/estado`, { method: 'PATCH', body: { estado } }),
    },
    consultas: {
        guardar: (d) => peticion('/consultas', { method: 'POST', body: d }),
    },
}