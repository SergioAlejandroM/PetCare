# API PetCare Hub — Documentación de Endpoints

**Base URL:** `http://localhost:3000/api`

Todas las respuestas siguen el mismo formato:

```json
// Éxito
{ "ok": true, "data": { ... } }

// Error
{ "ok": false, "error": "mensaje descriptivo" }
```

---

## Clientes

### Crear cliente

`POST /clientes`

**Body:**

```json
{
  "nombre": "Juan Pérez",
  "telefono": "3001234567",
  "email": "juan@example.com",
  "direccion": "Calle 10 #5-20"
}
```

**Respuesta `201`:** el cliente creado, incluyendo `_id` y `activo: true`.

---

### Listar clientes

`GET /clientes`

Devuelve solo clientes con `activo: true`. **No incluye sus mascotas** — para eso usa el endpoint de historial/dueño desde `Paciente`.

**Respuesta `200`:**

```json
{ "ok": true, "data": [ { "_id": "...", "nombre": "...", "telefono": "...", "email": "...", "direccion": "...", "activo": true } ] }
```

---

### Obtener cliente por ID

`GET /clientes/:id`

Devuelve la información de contacto de un cliente puntual.

**Respuestas:**

- `200` → cliente encontrado
- `404` → `"Cliente no encontrado"`
- `400` → `"ID inválido"` (si el `:id` no tiene formato de ObjectId)

---

### Actualizar cliente

`PUT /clientes/:id`

**Body:** cualquier subconjunto de `nombre`, `telefono`, `email`, `direccion`. **Respuesta `200`:** cliente actualizado.

---

### Desactivar cliente

`PATCH /clientes/:id/desactivar`

No elimina el registro — pone `activo: false`. El cliente deja de aparecer en `GET /clientes` pero su historial no se pierde.

**Respuesta `200`:** cliente con `activo: false`.

---

## Pacientes (Mascotas)

### Crear mascota

`POST /pacientes`

**Body:**

```json
{
  "nombre": "Firulais",
  "especie": "Perro",
  "raza": "Labrador",
  "dueño": "ID_DEL_CLIENTE"
}
```

**Respuesta `201`:** la mascota creada.

---

### Listar mascotas

`GET /pacientes`

Devuelve solo mascotas activas. **No incluye el campo `dueño`** — la info del dueño se consulta aparte (ver siguiente endpoint).

---

### Obtener mascota por ID

`GET /pacientes/:id`

Devuelve una mascota puntual (sin el campo `dueño`, igual que el listado).

**Respuestas:**

- `200` → mascota encontrada
- `404` → `"Paciente no encontrado"`
- `400` → `"ID inválido"`

---

### Obtener contacto del dueño de una mascota

`GET /pacientes/:id/dueño`

**Respuesta `200`:**

```json
{ "ok": true, "data": { "_id": "...", "nombre": "...", "telefono": "...", "email": "...", "direccion": "..." } }
```

---

### Obtener historial de un paciente

`GET /pacientes/:id/historial`

Devuelve todas las consultas asociadas a las citas de esa mascota, con la cita incluida (`populate`).

**Respuesta `200`:**

```json
{
  "ok": true,
  "data": [
    {
      "_id": "...",
      "cita": { "_id": "...", "fechaHora": "...", "motivo": "...", "estado": "atendida" },
      "diagnostico": "...",
      "tratamiento": "...",
      "patologiaDetectada": "..."
    }
  ]
}
```

---

### Actualizar mascota

`PUT /pacientes/:id`

**Body:** cualquier subconjunto de `nombre`, `especie`, `raza`.

---

### Desactivar mascota

`PATCH /pacientes/:id/desactivar`

Soft delete — igual que en Cliente.

---

## Citas

### Agendar cita

`POST /citas`

**Body:**

```json
{
  "paciente": "ID_DEL_PACIENTE",
  "fechaHora": "2026-09-25T10:00:00.000Z",
  "motivo": "Control de rutina"
}
```

**Respuesta `201`:** cita creada con `estado: "pendiente"` por defecto.

---

### Listar citas

`GET /citas`

Devuelve todas las citas con el `paciente` poblado (nombre, especie, etc.).

---

### Actualizar estado de una cita

`PATCH /citas/:id/estado`

**Body:**

```json
{ "estado": "atendida" }
```

Valores válidos: `"pendiente"`, `"atendida"`, `"cancelada"`. Cualquier otro valor responde `400` `"Estado inválido"`.

> Nota: el estado también cambia **automáticamente a `"atendida"`** cuando se guarda una consulta asociada (ver abajo) — no es necesario llamar este endpoint manualmente en ese caso.

---

## Consultas (Historial médico)

### Guardar consulta / diagnóstico

`POST /consultas`

**Body:**

```json
{
  "cita": "ID_DE_LA_CITA",
  "diagnostico": "Saludable, sin anomalías",
  "tratamiento": "Ninguno, control preventivo",
  "patologiaDetectada": "Ninguna"
}
```

**Efecto secundario:** marca automáticamente la `Cita` asociada como `estado: "atendida"`.

**Respuestas:**

- `201` → consulta creada
- `404` → `"La cita asociada no existe"`
- `400` → si ya existe una consulta para esa misma cita (relación 1 a 1)

---

## Códigos de error comunes

| Código | Significado |
| --- | --- |
| `400` | Datos inválidos, ID mal formado, o duplicado (ej. email repetido) |
| `404` | Recurso no encontrado |
| `500` | Error interno no controlado |

---

## Resumen rápido de rutas

| Recurso | Método | Ruta |
| --- | --- | --- |
| Cliente | POST | `/clientes` |
| Cliente | GET | `/clientes` |
| Cliente | GET | `/clientes/:id` |
| Cliente | PUT | `/clientes/:id` |
| Cliente | PATCH | `/clientes/:id/desactivar` |
| Paciente | POST | `/pacientes` |
| Paciente | GET | `/pacientes` |
| Paciente | GET | `/pacientes/:id` |
| Paciente | GET | `/pacientes/:id/dueno` |
| Paciente | GET | `/pacientes/:id/historial` |
| Paciente | PUT | `/pacientes/:id` |
| Paciente | PATCH | `/pacientes/:id/desactivar` |
| Cita | POST | `/citas` |
| Cita | GET | `/citas` |
| Cita | PATCH | `/citas/:id/estado` |
| Consulta | POST | `/consultas` |