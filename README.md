# 🐾 PetCare Hub (Huellitas Vet)

Plataforma web para la gestión de una clínica veterinaria: registro de clientes y mascotas, agendamiento de citas e historial médico de cada paciente.

El proyecto se compone de un **backend** (API REST en Node.js + MongoDB) y un **frontend** (panel de recepción en HTML, CSS y JavaScript vanilla) que el propio servidor Express sirve, por lo que se levanta todo con un solo comando.

---

## ✨ Funcionalidades

- **Agenda de hoy:** resumen de citas pendientes y atendidas del día.
- **Clientes (dueños):** crear, listar, editar y desactivar.
- **Mascotas (pacientes):** crear, listar, editar y desactivar; consulta del contacto del dueño.
- **Citas:** agendar, listar y cambiar de estado (`Pendiente`, `Atendida`, `Cancelada`).
- **Consultas / historial médico:** diagnóstico, tratamiento y patología detectada por cita; al guardarla, la cita pasa automáticamente a `Atendida`.
- **Indicador de conexión** con el backend en la barra lateral (`/api/health`).

### Reglas de negocio implementadas

- Borrado lógico (*soft delete*): clientes y mascotas se desactivan con `activo: false`, sin perder su historial.
- No se puede agendar una cita en una fecha pasada.
- Una mascota no puede tener dos citas activas en la misma fecha y hora.
- Cada cita admite una única consulta (relación 1 a 1).
- El email del cliente es único; teléfono validado (7 a 10 dígitos).

---

## 🧱 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Backend | Node.js, Express 5, Mongoose 9, CORS, dotenv |
| Base de datos | MongoDB (NoSQL) |
| Frontend | HTML5, CSS3, JavaScript vanilla (módulos por responsabilidad) |
| Desarrollo | nodemon |

Arquitectura del backend: **MVC** (modelos, controladores y rutas) con un middleware centralizado de manejo de errores.

---

## 📁 Estructura del proyecto

```
PetCare/
├── backend/
│   ├── config/         # Conexión a MongoDB
│   ├── controllers/    # Lógica de cada recurso
│   ├── middleware/     # Manejo de errores (ApiError, asyncHandler)
│   ├── models/         # Esquemas Mongoose
│   ├── routes/         # Definición de rutas
│   ├── src/app.js      # Configuración de Express
│   ├── server.js       # Punto de entrada
│   └── README.md       # Documentación detallada de la API
├── frontend/
│   ├── assets/         # Favicon e imágenes
│   ├── css/styles.css
│   ├── js/
│   │   ├── api.js          # Cliente de la API
│   │   ├── app.js          # Lógica principal de la interfaz
│   │   ├── dom.js          # Utilidades del DOM
│   │   ├── storage.js      # Persistencia local (localStorage)
│   │   └── validations.js  # Validaciones del formulario
│   └── index.html
└── README.md
```

---

## 🗃️ Modelo de datos

```
Cliente 1 ────< Paciente 1 ────< Cita 1 ──── 1 Consulta
```

| Entidad | Campos principales |
| --- | --- |
| **Cliente** | nombre, telefono, email (único), direccion, activo |
| **Paciente** | nombre, especie, raza, dueño (ref. Cliente), activo |
| **Cita** | paciente (ref.), fechaHora, motivo, estado |
| **Consulta** | cita (ref., única), diagnostico, tratamiento, patologiaDetectada |

Un dueño tiene varias mascotas; una mascota tiene un solo dueño y puede tener varias citas; cada cita se asocia a una sola consulta.

---

## 🚀 Instalación y ejecución

### Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- [MongoDB](https://www.mongodb.com/) local o una base en [MongoDB Atlas](https://www.mongodb.com/atlas)

### Pasos

1. **Clonar el repositorio**

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd PetCare/backend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno.** Crea un archivo `.env` dentro de `backend/`:

   ```env
   MONGODB_URI=mongodb://localhost:27017/petcare
   PORT=3000
   ```

   > El archivo `.env` está en el `.gitignore`; nunca subas tus credenciales al repositorio.

4. **Iniciar el servidor**

   ```bash
   npm run dev     # desarrollo (nodemon)
   npm start       # producción
   ```

5. **Abrir la aplicación** en [http://localhost:3000](http://localhost:3000). El backend sirve el frontend de forma estática, así que no necesitas un servidor adicional.

Para verificar que todo funciona: `GET http://localhost:3000/api/health` responde `{ "ok": true }` cuando la base de datos está conectada.

---

## 🔌 API REST

**Base URL:** `http://localhost:3000/api`

| Recurso | Método | Ruta | Descripción |
| --- | --- | --- | --- |
| Cliente | POST | `/clientes` | Crear cliente |
| Cliente | GET | `/clientes` | Listar clientes activos |
| Cliente | GET | `/clientes/:id` | Obtener cliente |
| Cliente | PUT | `/clientes/:id` | Actualizar cliente |
| Cliente | PATCH | `/clientes/:id/desactivar` | Desactivar cliente |
| Paciente | POST | `/pacientes` | Crear mascota |
| Paciente | GET | `/pacientes` | Listar mascotas activas |
| Paciente | GET | `/pacientes/:id` | Obtener mascota |
| Paciente | GET | `/pacientes/:id/dueno` | Contacto del dueño |
| Paciente | GET | `/pacientes/:id/historial` | Historial de consultas |
| Paciente | PUT | `/pacientes/:id` | Actualizar mascota |
| Paciente | PATCH | `/pacientes/:id/desactivar` | Desactivar mascota |
| Cita | POST | `/citas` | Agendar cita |
| Cita | GET | `/citas` | Listar citas |
| Cita | PATCH | `/citas/:id/estado` | Cambiar estado |
| Consulta | POST | `/consultas` | Guardar consulta / diagnóstico |
| Sistema | GET | `/health` | Estado del servidor y la BD |

Formato de respuesta:

```json
{ "ok": true, "data": { } }
{ "ok": false, "error": "mensaje descriptivo" }
```

📖 La documentación completa de cada endpoint (cuerpos, respuestas y códigos de error) está en [`backend/README.md`](./backend/README.md).

---

## 👥 Equipo

Proyecto grupal desarrollado por:

- Julian Acuña
- Sergio Manrique
- Tatiana Valero
- Julian Cipagauta

---
