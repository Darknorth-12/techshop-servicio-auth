# Diseño del servicio web de registro e inicio de sesión

**Evidencia:** GA7-220501096-AA5-EV01 — Diseño y desarrollo de servicios web (caso)
**Proyecto:** TechShop
**Tecnología:** Node.js + Express (API REST con respuestas JSON)

## 1. Requerimiento

Se requiere un servicio web para registro e inicio de sesión. El servicio
recibe un usuario y una contraseña:

- Si la autenticación es correcta, responde un mensaje de **autenticación
  satisfactoria**.
- En caso contrario, responde **error en la autenticación**.

## 2. Decisiones de diseño

| Decisión | Justificación |
|---|---|
| API REST con JSON | Es el estándar para que cualquier cliente (la app web, la app Android o Postman) consuma el servicio. |
| Dos endpoints `POST` | Registro e inicio de sesión envían datos sensibles; no deben ir en la URL como en un `GET`. |
| Códigos HTTP significativos | 201, 200, 400, 401, 409, 404 y 500 permiten al cliente saber qué pasó sin leer el mensaje. |
| Contraseñas con bcrypt | Nunca se guarda la contraseña: solo su hash con sal. Si el archivo de datos se filtra, no se exponen las contraseñas. |
| Mismo error para usuario inexistente y contraseña errónea | Evita que un atacante descubra qué usuarios existen. |
| Usuario sin distinguir mayúsculas | `Elkin.G` y `elkin.g` son el mismo usuario; evita cuentas confusas. |
| Arquitectura por capas | Misma organización de los módulos Java del proyecto (controlador → servicio → repositorio). |
| Persistencia en archivo JSON | Suficiente para la evidencia sin instalar una base de datos; solo habría que reemplazar la capa de repositorio. |

## 3. Arquitectura

```
Cliente (Postman / app web / app Android)
        │  HTTP + JSON
        ▼
  app.js  ── rutas y manejo central de errores
        │
        ▼
  controllers/auth.controller.js  ── lee la petición, arma la respuesta
        │
        ▼
  services/auth.service.js        ── reglas de negocio + bcrypt
        │
        ▼
  repositories/usuario.repository.js ── lee y escribe data/usuarios.json
```

Archivos de apoyo: `utils/validaciones.js` (reglas de los datos) y
`utils/errores.js` (error con código HTTP).

## 4. Modelo de datos

Entidad **Usuario** (almacenada en `data/usuarios.json`):

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | número | Identificador consecutivo |
| `usuario` | texto | Nombre de usuario (3 a 20 caracteres) |
| `contrasenaHash` | texto | Hash bcrypt de la contraseña |
| `fechaRegistro` | texto (ISO 8601) | Fecha y hora del registro |

## 5. Contrato de la API

Todas las respuestas son JSON y siguen el formato
`{ "exito": true|false, "mensaje": "...", ... }`.

### 5.1 POST /api/registro

Cuerpo de la petición:

```json
{ "usuario": "elkin.g", "contrasena": "Clave1234" }
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| 201 Created | Registro exitoso | `{"exito":true,"mensaje":"Usuario registrado correctamente","usuario":{"id":1,"usuario":"elkin.g"}}` |
| 400 Bad Request | Datos inválidos o JSON mal formado | `{"exito":false,"mensaje":"Datos de registro inválidos","errores":[...]}` |
| 409 Conflict | El usuario ya existe | `{"exito":false,"mensaje":"El usuario ya está registrado"}` |

Reglas de validación del registro:

| Campo | Regla |
|---|---|
| `usuario` | Obligatorio, texto, 3 a 20 caracteres, solo letras, números, punto y guion bajo |
| `contrasena` | Obligatoria, texto, 8 a 64 caracteres, con al menos una letra y un número |

### 5.2 POST /api/login

Cuerpo de la petición:

```json
{ "usuario": "elkin.g", "contrasena": "Clave1234" }
```

| Estado | Cuándo | Respuesta |
|---|---|---|
| 200 OK | Credenciales correctas | `{"exito":true,"mensaje":"Autenticación satisfactoria"}` |
| 401 Unauthorized | Usuario inexistente o contraseña incorrecta | `{"exito":false,"mensaje":"Error en la autenticación"}` |
| 400 Bad Request | Falta el usuario o la contraseña | `{"exito":false,"mensaje":"Debe enviar usuario y contraseña"}` |

### 5.3 GET /api/salud

Comprueba que el servicio está activo: `200 {"exito":true,"mensaje":"Servicio activo"}`.

### 5.4 Errores generales

| Estado | Cuándo |
|---|---|
| 404 | Ruta que no existe |
| 500 | Error inesperado del servidor (el detalle solo queda en el registro del servidor, no se envía al cliente) |

## 6. Flujo del inicio de sesión

```
Recibe usuario y contraseña
   │
   ├─ ¿Faltan datos? ──────────────► 400 "Debe enviar usuario y contraseña"
   │
   ▼
Busca el usuario (sin distinguir mayúsculas)
   │
   ▼
Compara la contraseña con el hash (bcrypt)
   │
   ├─ Coincide ────────────────────► 200 "Autenticación satisfactoria"
   └─ No existe o no coincide ─────► 401 "Error en la autenticación"
```

## 7. Alcance y mejoras futuras

Esta evidencia cubre el caso solicitado: registro y verificación de
credenciales. Para un sistema en producción se recomienda agregar: emisión de
un token (JWT) al iniciar sesión, límite de intentos por IP (rate limiting),
HTTPS, y una base de datos real en lugar del archivo JSON.
