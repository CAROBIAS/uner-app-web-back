# Backend – Sistema de Gestión de Turnos (Clínica Médica)

API del Trabajo Final Integrador de *Desarrollo de Aplicaciones Web*.
Stack obligatorio: **NestJS + TypeORM + PostgreSQL** (frontend en Angular, servido con Nginx y PM2).

> ⚠️ **Leé esta guía completa antes de abrir o modificar el proyecto.** Cada advertencia indica qué pasa si no se cumple. Muchas de esas consecuencias no te afectan solo a vos: rompen el proyecto para todo el equipo.

---

## Índice

1. [Verificar el entorno ANTES de empezar](#1-verificar-el-entorno-antes-de-empezar)
2. [Puesta en marcha paso a paso](#2-puesta-en-marcha-paso-a-paso)
3. [Variables del archivo `.env`](#3-variables-del-archivo-env)
4. [Usuarios de prueba](#4-usuarios-de-prueba)
5. [Endpoints disponibles](#5-endpoints-disponibles)
6. [Cómo proteger tus endpoints](#6-cómo-proteger-tus-endpoints)
7. [⚠️ Lo que NO hay que hacer](#7-️-lo-que-no-hay-que-hacer)
8. [Problemas frecuentes](#8-problemas-frecuentes)
9. [Estructura de carpetas](#9-estructura-de-carpetas)

---

## 1. Verificar el entorno ANTES de empezar

Ejecutá cada comando en una terminal (CMD o la terminal de VS Code) y compará con el resultado esperado. **Si algo no coincide, resolvelo antes de seguir.**

### 1.1 Node.js

```bash
node -v
```

| Resultado | Qué significa |
|---|---|
| `v24.15.0` o superior dentro de la 24 (por ejemplo `v24.21.0`) | ✅ Correcto. Es la versión recomendada (LTS) |
| `v26.x.x` o superior | ✅ Funciona |
| `v22.22.3` o superior dentro de la 22 | ⚠️ Funciona, pero conviene que todo el equipo use la 24 LTS |
| `v24.14.x` o menor dentro de la 24, `v22.22.2` o menor, `v20.x`, etc. | ❌ Hay que actualizar |
| `"node" no se reconoce como un comando...` | ❌ Node no está instalado |

**Si tenés una versión menor:** cada `npm install` va a mostrar avisos `npm warn EBADENGINE`, y los comandos del CLI de Nest (por ejemplo `nest generate`) pueden fallar. Las herramientas internas del CLI de Nest exigen Node `^22.22.3`, `^24.15.0` o `>=26.0.0`.

**Cómo actualizar:** descargá el instalador **Windows Installer (.msi)** de la versión **LTS** desde <https://nodejs.org/es/download> y ejecutalo encima de la versión actual. No hace falta desinstalar nada. En el paso *Tools for Native Modules* dejá la casilla **sin tildar**: si la tildás, instala varios GB de herramientas que no hacen falta. Después cerrá y volvé a abrir la terminal.

> No uses `winget upgrade` para Node: en algunos equipos `winget` asocia mal la versión instalada y puede intentar instalar otra versión mayor.

### 1.2 npm

```bash
npm -v
```

**Resultado esperado:** `11.x.x` o superior. npm viene con Node: si actualizaste Node, npm ya quedó actualizado.

### 1.3 Git

```bash
git --version
```

**Resultado esperado:** `git version 2.x.x`. Si usás solo GitHub Desktop y este comando falla, no es un problema para trabajar en el proyecto.

### 1.4 Base de datos PostgreSQL propia

**Cada integrante necesita su propia base PostgreSQL.** No se comparte la base entre integrantes (ver la [sección 7](#7-️-lo-que-no-hay-que-hacer)).

Opciones:

| Opción | Cuándo conviene |
|---|---|
| **Neon** (en la nube, plan gratuito, sin tarjeta) | Si no querés instalar nada ni consumir recursos de tu máquina. Se suspende sola después de 5 minutos sin uso |
| **PostgreSQL local** | Si ya lo tenés instalado o preferís trabajar sin internet |

**Sin una base de datos accesible, el backend NO arranca:** TypeORM reintenta la conexión varias veces y se detiene con `Unable to connect to the database`.

Pasos para crear la base en Neon:

1. Entrá a <https://neon.com> y registrate. Si te pide tarjeta, no sigas.
2. Creá un proyecto. En **Region** elegí **São Paulo (AWS sa-east-1)**, que es la más cercana. La versión de Postgres dejala por defecto.
3. Hacé clic en **Connect**, elegí la base `neondb` y **desactivá "Connection pooling"**: el host **no** debe contener `-pooler`.
4. Vas a ver una cadena `postgresql://USUARIO:CONTRASEÑA@HOST/neondb?sslmode=require`. De ahí salen los datos para el `.env` (ver la [sección 3](#3-variables-del-archivo-env)).

> **Nunca compartas esa cadena** (contiene tu contraseña) por el grupo, en el repo ni en capturas de pantalla.

---

## 2. Puesta en marcha paso a paso

### 2.1 Instalar dependencias

Parado en la carpeta del repositorio (`uner-app-web-back`):

```bash
npm install
```

**Resultado esperado:**
- Una línea del tipo `added XXX packages, and audited XXX packages`.
- **Ninguna** línea que diga `npm ERR!`.
- Estos avisos son **normales** y no hay que hacer nada con ellos:
  - `25 vulnerabilities (2 low, 21 moderate, 2 high)`. Ver por qué en la [sección 7](#7-️-lo-que-no-hay-que-hacer). **No ejecutes `npm audit fix --force`.**
  - `npm warn install-scripts 2 packages have install scripts not yet covered by allowScripts` (`@parcel/watcher` y `unrs-resolver`). **No los apruebes.**
- Si aparece `npm warn EBADENGINE`, tu Node es viejo: volvé al [punto 1.1](#11-nodejs).

### 2.2 Crear tu archivo `.env`

El `.env` **no está en el repo** a propósito: cada uno tiene el suyo con sus propias credenciales. Se crea copiando el ejemplo:

```bash
copy .env.example .env
```

(En PowerShell: `Copy-Item .env.example .env`)

**Resultado esperado:** `1 archivo(s) copiado(s).` y un archivo `.env` nuevo en la raíz del proyecto.

### 2.3 Completar el `.env`

Abrilo con VS Code y completalo según la [sección 3](#3-variables-del-archivo-env). Como mínimo:

1. Los datos de **tu** base de datos (`DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `DB_SSL`).
2. Tu propio **`JWT_SECRET`**, generado con:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   **Resultado esperado:** una línea de 64 caracteres (números y letras de la `a` a la `f`). Copiala y pegala como valor de `JWT_SECRET`.

Antes de seguir, verificá en GitHub Desktop que el `.env` **no aparezca** en la pestaña *Changes*. Si aparece, **no hagas commit** y avisá al grupo: significa que el `.gitignore` se modificó.

### 2.4 Arrancar el backend

```bash
npm run start:dev
```

**Resultado esperado:** la consola tiene que mostrar, entre otras, estas líneas, en verde y sin errores en rojo:

```
LOG [InstanceLoader] TypeOrmCoreModule dependencies initialized
LOG [InstanceLoader] UsuariosModule dependencies initialized
LOG [InstanceLoader] SeedModule dependencies initialized
LOG [InstanceLoader] AuthModule dependencies initialized
LOG [InstanceLoader] MedicosModule dependencies initialized
LOG [InstanceLoader] ReservasModule dependencies initialized
LOG [RouterExplorer] Mapped {/api, GET} route
LOG [RouterExplorer] Mapped {/api/usuarios, GET} route
LOG [RouterExplorer] Mapped {/api/auth/login, POST} route
LOG [RouterExplorer] Mapped {/api/auth/perfil, GET} route
LOG [RouterExplorer] Mapped {/api/medicos, GET} route
LOG [RouterExplorer] Mapped {/api/medicos/:id/valor-consulta, PATCH} route
LOG [RouterExplorer] Mapped {/api/reservas, POST} route
LOG [RouterExplorer] Mapped {/api/reservas, GET} route
LOG [RouterExplorer] Mapped {/api/reservas/:id/cancelar, PATCH} route
LOG [SeedService] Usuarios: 21 insertados, 0 ya existían
LOG [SeedService] Medicos: 5 insertados, 0 ya existían
LOG [NestApplication] Nest application successfully started
Aplicación corriendo en: http://localhost:3000
```

- La **primera vez**, el seed dice `21 insertados, 0 ya existían` y `5 insertados, 0 ya existían`. Las siguientes veces dice `0 insertados, 21 ya existían` y `0 insertados, 5 ya existían`: **es lo correcto**, no duplica datos.
- La primera conexión a Neon puede tardar unos segundos de más si la base estaba suspendida.
- `start:dev` queda **mirando los archivos**: cada vez que guardás un cambio, se reinicia solo (`File change detected...`).
- Para detenerlo: `Ctrl + C` y, si pregunta *¿Desea terminar el trabajo por lotes (S/N)?*, respondé `S`.

### 2.5 Verificar que la API responde

Con el backend corriendo, abrí en el navegador:

```
http://localhost:3000/api
```

**Resultado esperado:** la página muestra `Hello World!`.

Para probar el login (un `POST`) se necesita una herramienta que envíe pedidos HTTP; el navegador no sirve para eso desde la barra de direcciones. Recomendado: la extensión **REST Client** de VS Code (autor **Huachao Mao**). Creá un archivo `pruebas.http` **fuera de la carpeta del repo** con esto:

```http
@baseUrl = http://localhost:3000/api

### Login
# @name login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "documento": "40123456",
  "clave": "asd123"
}

### Perfil (ejecutar antes el Login)
GET {{baseUrl}}/auth/perfil
Authorization: Bearer {{login.response.body.accessToken}}

### Login como administrador
# @name loginAdmin
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "documento": "28456123",
  "clave": "asd123"
}

### Buscar usuario por documento (ejecutar antes el Login como administrador)
GET {{baseUrl}}/usuarios?documento=40123456
Authorization: Bearer {{loginAdmin.response.body.accessToken}}
```

Hacé clic en **Send Request** sobre cada pedido. **Resultado esperado:** `200 OK` en todos. *Perfil* y *Buscar usuario por documento* devuelven los datos de *Rodríguez Sofía* (`"rol": "PACIENTE"`).

Si preferís la consola de Windows (CMD), `curl` viene incluido desde Windows 10:

```
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"documento\":\"28456123\",\"clave\":\"asd123\"}"
curl "http://localhost:3000/api/usuarios?documento=40123456" -H "Authorization: Bearer TU_TOKEN"
```

En CMD, las comillas dentro del JSON van como `\"`, y la URL con `?` va entre comillas.

> El archivo de pruebas va **fuera del repo** para que no se suba por error.

---

## 3. Variables del archivo `.env`

| Variable | Ejemplo | Para qué sirve | Qué pasa si está mal |
|---|---|---|---|
| `PORT` | `3000` | Puerto donde escucha el backend | Si ya está en uso: error `EADDRINUSE` y el backend no arranca |
| `DB_HOST` | `ep-xxx.sa-east-1.aws.neon.tech` o `localhost` | Servidor de la base | Mal escrito: `getaddrinfo ENOTFOUND` y no conecta. **Solo el host**: sin `postgresql://`, sin `/neondb` y sin `?sslmode=...`. En Neon, **sin** `-pooler` |
| `DB_PORT` | `5432` | Puerto de PostgreSQL | No conecta |
| `DB_USER` | `neondb_owner` o `postgres` | Usuario de la base | `password authentication failed` |
| `DB_PASS` | *(tu contraseña)* | Contraseña de la base | `password authentication failed` |
| `DB_NAME` | `neondb` o `clinica_db` | Nombre de la base | `database "xxx" does not exist` |
| `DB_SYNC` | `true` | Si es `true`, TypeORM crea y actualiza las tablas automáticamente según las entidades | En `false` con una base vacía, **no se crean las tablas**: el seed y cualquier consulta fallan. Ver advertencias en la [sección 7](#7-️-lo-que-no-hay-que-hacer) |
| `DB_SSL` | `true` en Neon, `false` en local | Conexión cifrada | En Neon con `false`: la conexión es rechazada. En local con `true`: `The server does not support SSL connections` |
| `DB_SEED` | `true` | Si es `true`, al arrancar carga los usuarios de prueba que falten (no duplica ni modifica los existentes) | En `false` no carga nada. Sirve para probar con la base vacía |
| `JWT_SECRET` | *(64 caracteres generados)* | Clave con la que se firman los tokens de sesión | **Vacío: el backend no arranca** y muestra `Falta configurar JWT_SECRET en el archivo .env`. Si es corto o conocido, cualquiera podría fabricar tokens válidos |
| `JWT_EXPIRES_IN` | `1h` | Duración del token (`30m`, `1h`, `8h`...) | Formato inválido: el login falla al generar el token |
| `SWAGGER_HABILITADO` | `true` | Si es `true`, publica la documentación interactiva de la API en `http://localhost:3000/api/docs` | En `false` (o si falta) no se publica la documentación; la API funciona igual |

> Los valores booleanos van en minúsculas y sin comillas: `true` o `false`. Cualquier otro valor (`True`, `"true"`, `1`) se interpreta como **desactivado**.

---

## 4. Usuarios de prueba

Los carga el seed automáticamente (`DB_SEED=true`). **Clave de todos: `asd123`**. En la base se guarda hasheada con bcrypt, nunca en texto plano.

El login se hace con el **documento**.

### Administradores

| Apellido | Nombre | Documento | Estado |
|---|---|---|---|
| Gómez | Laura | 28456123 | ACTIVO |
| Pereyra | Diego | 31789456 | ACTIVO |
| Acosta | Valeria | 33214587 | ACTIVO |
| Medina | Ricardo | 25698741 | BAJA |

### Médicos

| Apellido | Nombre | Documento | Estado |
|---|---|---|---|
| Fernández | Martín | 24567890 | ACTIVO |
| López | Carolina | 27345678 | ACTIVO |
| Díaz | Javier | 29876543 | ACTIVO |
| Romero | Natalia | 30123987 | ACTIVO |
| Sosa | Gustavo | 26789012 | ACTIVO |
| Herrera | Patricia | 23456781 | BAJA |

### Pacientes

| Apellido | Nombre | Documento | Estado |
|---|---|---|---|
| Rodríguez | Sofía | 40123456 | ACTIVO |
| Martínez | Lucas | 38765432 | ACTIVO |
| García | Camila | 41234567 | ACTIVO |
| Pérez | Mateo | 39876501 | ACTIVO |
| Sánchez | Julieta | 42345678 | ACTIVO |
| Torres | Nicolás | 37654321 | ACTIVO |
| Ramírez | Florencia | 43456789 | ACTIVO |
| Flores | Tomás | 36543210 | ACTIVO |
| Benítez | Agustina | 44567890 | ACTIVO |
| Álvarez | Joaquín | 35432109 | ACTIVO |
| Ruiz | Marcela | 34321098 | BAJA |

Los emails siguen el formato `apellido_nombre@ejemplo.com`, en minúsculas y sin tildes (por ejemplo, `gomez_laura@ejemplo.com`).

### Datos de médicos (tabla `medicos`)

El seed también carga la tabla `medicos` para los médicos **activos**, vinculada al usuario por documento:

| Documento | Médico | Matrícula | Valor de la consulta |
|---|---|---|---|
| 24567890 | Fernández Martín | 10001 | 15000 |
| 27345678 | López Carolina | 10002 | 18000 |
| 29876543 | Díaz Javier | 10003 | 20000 |
| 30123987 | Romero Natalia | 10004 | 17000 |
| 26789012 | Sosa Gustavo | 10005 | 16000 |

> ⚠️ El **id del médico** (`medicos.id`) **no es** el id de su usuario (`usuarios.id`). Los endpoints de reservas y de valor de consulta usan el **id del médico**, que se obtiene con `GET /api/medicos`.

### Consultas útiles (SQL Editor de Neon o cliente de Postgres)

Cambiar el estado de un usuario, para probar el rechazo de usuarios dados de baja:

```sql
UPDATE usuarios SET estado = 'BAJA' WHERE documento = '40123456';
UPDATE usuarios SET estado = 'ACTIVO' WHERE documento = '40123456';
```

Vaciar la tabla para probar desde cero. Primero poné `DB_SEED=false` en tu `.env`, si no el seed la vuelve a llenar al arrancar:

```sql
TRUNCATE usuarios RESTART IDENTITY CASCADE;
```

> ⚠️ `CASCADE` borra también los datos de las tablas relacionadas (médicos, reservas). Usalo solo en **tu** base.

---

## 5. Endpoints disponibles

Todas las rutas tienen el prefijo `/api`.

| Método | Ruta | Roles | Descripción |
|---|---|---|---|
| `GET` | `/api` | Público (sin token) | Chequeo rápido de que el backend responde (`Hello World!`) |
| `POST` | `/api/auth/login` | Público (sin token) | Inicia sesión y devuelve el token |
| `GET` | `/api/auth/perfil` | Cualquiera logueado | Devuelve los datos del usuario del token |
| `GET` | `/api/usuarios?documento=...` | `ADMINISTRADOR`, `MEDICO` | Busca un usuario por número de documento |
| `GET` | `/api/medicos` | Cualquiera logueado | Lista los médicos con matrícula y valor de la consulta |
| `PATCH` | `/api/medicos/:id/valor-consulta` | `ADMINISTRADOR` | Modifica el valor de la consulta de un médico |
| `POST` | `/api/reservas` | `PACIENTE` | Reserva un turno para el paciente logueado |
| `GET` | `/api/reservas` | Cualquiera logueado | Lista reservas (el paciente ve solo las suyas) |
| `PATCH` | `/api/reservas/:id/cancelar` | `PACIENTE`, `ADMINISTRADOR` | Cancela una reserva |

Con `SWAGGER_HABILITADO=true`, la documentación interactiva está en `http://localhost:3000/api/docs`. Para probar endpoints protegidos desde ahí, usá el botón **Authorize** y pegá el `accessToken` del login.

### `POST /api/auth/login`

**Cuerpo:**

```json
{
  "documento": "40123456",
  "clave": "asd123"
}
```

**Respuesta `200 OK`:**

```json
{
  "accessToken": "eyJhbGciOi...",
  "usuario": {
    "id": 11,
    "documento": "40123456",
    "apellidos": "Rodríguez",
    "nombres": "Sofía",
    "email": "rodriguez_sofia@ejemplo.com",
    "rol": "PACIENTE"
  }
}
```

**Errores:**

| Código | Mensaje | Cuándo |
|---|---|---|
| `400` | Lista de errores de validación | Falta `documento` o `clave`, vienen vacíos, o se envían campos de más |
| `401` | `Credenciales inválidas` | El documento no existe **o** la clave es incorrecta. Es el mismo mensaje a propósito, para no revelar qué documentos están registrados |
| `403` | `Usuario dado de baja` | Documento y clave correctos, pero el usuario está en `BAJA` |

### Endpoints que requieren token

Se envía el token en el encabezado:

```
Authorization: Bearer <accessToken>
```

| Código | Mensaje | Cuándo |
|---|---|---|
| `401` | `Token no enviado` | Falta el encabezado `Authorization` o no empieza con `Bearer ` |
| `401` | `Token inválido o vencido` | El token fue alterado, se firmó con otro `JWT_SECRET` o pasó su duración (`JWT_EXPIRES_IN`) |
| `401` | `Sesión no válida` | Solo en `/perfil`: el usuario ya no existe o pasó a `BAJA` después de iniciar sesión |
| `403` | `No tiene permisos para esta acción` | El endpoint está restringido a otros roles |

### `GET /api/usuarios?documento=...`

Busca un usuario por número de documento. Pensado para tareas administrativas (por ejemplo, identificar al paciente antes de operar sobre sus turnos).

**Roles:** `ADMINISTRADOR`, `MEDICO`.

**Parámetros (query):**

| Parámetro | Obligatorio | Formato |
|---|---|---|
| `documento` | Sí | Solo números, sin puntos ni espacios (ej.: `40123456`) |

**Ejemplo:** `GET /api/usuarios?documento=40123456`

**Respuesta `200 OK`** (nunca incluye la clave):

```json
{
  "id": 11,
  "documento": "40123456",
  "apellidos": "Rodríguez",
  "nombres": "Sofía",
  "email": "rodriguez_sofia@ejemplo.com",
  "estado": "ACTIVO",
  "rol": "PACIENTE"
}
```

- `estado`: `ACTIVO` o `BAJA`. El usuario se devuelve aunque esté en `BAJA`; es responsabilidad de quien consume el endpoint decidir qué hacer en ese caso.
- `rol`: `ADMINISTRADOR`, `MEDICO` o `PACIENTE`.

**Errores** (además de los de token):

| Código | Mensaje | Cuándo |
|---|---|---|
| `400` | `["El documento es obligatorio"]` | Falta el parámetro `documento` o viene vacío |
| `400` | `["El documento debe contener solo números"]` | El documento tiene letras, puntos, espacios, etc. |
| `400` | `["property xxx should not exist"]` | Se envió otro parámetro además de `documento` |
| `404` | `Usuario no encontrado` | No existe un usuario con ese documento |

### `GET /api/medicos`

Lista todos los médicos de la tabla `medicos`, ordenados por id.

**Roles:** cualquier usuario logueado.

**Respuesta `200 OK`:**

```json
[
  {
    "id": 1,
    "id_usuario": 5,
    "nombres": "Martín",
    "apellidos": "Fernández",
    "matricula": 10001,
    "valor_consulta": 15000
  }
]
```

- `id`: id del **médico**. Es el que se usa en reservas y en `valor-consulta`.
- `id_usuario`: id de su usuario en la tabla `usuarios`.

### `PATCH /api/medicos/:id/valor-consulta`

Modifica el valor de la consulta de un médico. Las reservas ya hechas **no cambian**: conservan el valor congelado al momento de reservar.

**Roles:** `ADMINISTRADOR`.

**Ejemplo:** `PATCH /api/medicos/1/valor-consulta`

**Cuerpo:**

```json
{
  "valor_consulta": 18000
}
```

- `valor_consulta`: número entero, mínimo `1`.

**Respuesta `200 OK`:** el médico actualizado, con el mismo formato que en `GET /api/medicos` (un solo objeto, no una lista).

**Errores** (además de los de token y rol):

| Código | Mensaje | Cuándo |
|---|---|---|
| `400` | Lista de errores de validación | `valor_consulta` falta, no es entero o es menor a `1`; el `:id` de la URL no es un número; o se envían campos de más |
| `400` | `Medico dado de baja` | El usuario del médico está en `BAJA` |
| `404` | `Medico no encontrado` | No existe un médico con ese id |

### `POST /api/reservas`

Reserva un turno. El paciente de la reserva es **el usuario logueado**.

**Roles:** `PACIENTE`.

**Cuerpo:**

```json
{
  "id_medico": 1,
  "fecha_hora": "2026-11-10T09:00:00"
}
```

- `id_medico`: id del **médico** (de `GET /api/medicos`), número entero.
- `fecha_hora`: fecha y hora en formato ISO 8601. Enviala **sin zona horaria** (sin `Z` ni `-03:00`), como en el ejemplo: las validaciones de horario usan la hora local del servidor.

**Reglas que se validan:**

- Solo de lunes a viernes.
- Hora en punto (minutos y segundos en `0`), entre las `08:00` y las `15:00` inclusive (el último turno termina a las `16:00`).
- La fecha tiene que estar entre hoy y los 29 días corridos siguientes (un turno en el día 30 contado desde hoy se rechaza).
- El médico tiene que existir y estar `ACTIVO`.
- El médico no puede tener otra reserva no cancelada en el mismo horario.
- Se guarda `valor_congelado` con el valor de la consulta del médico en ese momento.

**Respuesta `201 Created`:**

```json
{
  "id": 1,
  "id_medico": 1,
  "id_paciente": 11,
  "fecha_hora": "2026-11-10T12:00:00.000Z",
  "estado": "PENDIENTE",
  "valor_congelado": 15000
}
```

> `fecha_hora` vuelve en **UTC** (con `Z`). Con el servidor en hora argentina (UTC-3), un turno de las `09:00` vuelve como `12:00:00.000Z`. El frontend tiene que convertirla a hora local para mostrarla.

**Errores** (además de los de token y rol):

| Código | Mensaje | Cuándo |
|---|---|---|
| `400` | Lista de errores de validación | `id_medico` no es entero, `fecha_hora` no es ISO 8601, falta alguno o se envían campos de más |
| `400` | `Solo se permiten reservas de lunes a viernes.` | La fecha cae sábado o domingo |
| `400` | `Los turnos deben ser de una hora exacta entre las 08:00 y las 16:00 hs.` | No es hora en punto o está fuera de la franja |
| `400` | `Las reservas solo se permiten desde hoy y hasta con 30 días corridos de antelación.` | Fecha anterior a hoy, o fuera del rango de días permitido |
| `400` | `El médico ya cuenta con un turno reservado en este horario.` | Turno ocupado |
| `404` | `Médico no encontrado o inactivo.` | El médico no existe o su usuario está en `BAJA` |

### `GET /api/reservas`

Lista reservas, ordenadas de la más reciente a la más antigua (por `fecha_hora`).

**Roles:** cualquier usuario logueado.

- `PACIENTE`: solo sus propias reservas.
- `MEDICO` y `ADMINISTRADOR`: todas las reservas.

**Respuesta `200 OK`:** una lista de reservas, con el mismo formato que la respuesta de `POST /api/reservas`.

### `PATCH /api/reservas/:id/cancelar`

Cancela una reserva. No lleva cuerpo.

**Roles:** `PACIENTE`, `ADMINISTRADOR`.

**Ejemplo:** `PATCH /api/reservas/1/cancelar`

**Reglas:**

- `PACIENTE`: solo sus propias reservas, y hasta el día anterior al turno (antes de las `00:00` del día del turno). Queda en estado `CANCELADA_PACIENTE`.
- `ADMINISTRADOR`: cualquier reserva, hasta el momento en que empieza el turno. Queda en estado `CANCELADA_ADMIN`.

**Respuesta `200 OK`:** la reserva actualizada, con el mismo formato que la respuesta de `POST /api/reservas`.

**Errores** (además de los de token y rol):

| Código | Mensaje | Cuándo |
|---|---|---|
| `400` | Error de validación | El `:id` de la URL no es un número |
| `400` | `La reserva ya se encuentra cancelada.` | La reserva ya estaba cancelada |
| `400` | `Fuera de término: Los pacientes solo pueden cancelar hasta el día anterior a la cita.` | Paciente cancelando el mismo día del turno o después |
| `400` | `No se puede cancelar un turno cuya hora de inicio ya ha transcurrido.` | Administrador cancelando un turno que ya empezó |
| `403` | `No tiene permisos para cancelar este turno.` | Paciente intentando cancelar una reserva de otro paciente |
| `404` | `Reserva no encontrada.` | No existe una reserva con ese id |

### Estados de una reserva

| Estado | Significado |
|---|---|
| `PENDIENTE` | Reservada, todavía no atendida |
| `ATENDIDO` | El médico la marcó como atendida |
| `AUSENTE` | El médico marcó que el paciente no asistió |
| `CANCELADA_PACIENTE` | Cancelada por el paciente |
| `CANCELADA_ADMIN` | Cancelada por un administrador |

---

## 6. Cómo proteger tus endpoints

La protección es **global**: **todos los endpoints exigen token por defecto**, incluidos los que crees en tus módulos. No hace falta agregar `@UseGuards(...)`.

Si te olvidás de algo, el endpoint queda protegido de más (lo vas a notar al probar con un `401`), nunca abierto a cualquiera.

### `@Public()`: endpoint sin token

Solo para endpoints que deban ser accesibles sin iniciar sesión. **Casi ningún endpoint del sistema debería serlo.**

```ts
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Get('algo-publico')
algoPublico() { ... }
```

### `@Roles(...)`: restringir a uno o varios roles

```ts
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';

// Solo administradores (ej.: modificar el valor de la consulta)
@Roles(RolUsuario.ADMINISTRADOR)
@Patch(':id/valor-consulta')
actualizarValorConsulta(...) { ... }

// Médicos o administradores
@Roles(RolUsuario.MEDICO, RolUsuario.ADMINISTRADOR)
@Get('agenda')
agenda(...) { ... }
```

- Sin `@Roles(...)`, alcanza con estar logueado, con cualquier rol.
- Se puede poner sobre un método o sobre la clase del controlador entero.

### `@UsuarioActual()`: saber quién hace el pedido

Devuelve `{ id, rol }` del usuario del token. Sirve, por ejemplo, para que un paciente vea solo **sus** turnos o un médico solo **su** agenda.

```ts
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import type { UsuarioToken } from '../auth/interfaces/usuario-token.interface';

@Get('mis-turnos')
misTurnos(@UsuarioActual() usuario: UsuarioToken) {
  return this.reservasService.buscarPorPaciente(usuario.id);
}
```

> ⚠️ `UsuarioToken` se importa con **`import type`**. Sin el `type`, el proyecto **no compila** (error `TS1272`), por la configuración de `isolatedModules` y `emitDecoratorMetadata` del `tsconfig.json`.

### Usar datos de usuarios desde otro módulo

`UsuariosModule` exporta `UsuariosService` (`findById`, `findByDocumento`). Para usarlo desde otro módulo del backend, importá `UsuariosModule` en tu módulo (desde el frontend se usa el endpoint `GET /api/usuarios?documento=...`):

```ts
@Module({
  imports: [UsuariosModule],
  ...
})
export class ReservasModule {}
```

### DTOs y validación

La validación es **global y estricta** (`whitelist` + `forbidNonWhitelisted` + `transform`):

- **Cada propiedad de un DTO de entrada necesita al menos un decorador de `class-validator`** (`@IsString()`, `@IsInt()`, `@IsDateString()`, etc.). Una propiedad **sin decorador** se considera no permitida y el pedido se rechaza con `400 property xxx should not exist`, aunque esté declarada en la clase.
- Cualquier campo que el cliente envíe y el DTO no declare se rechaza con `400`.
- `transform: true` convierte los parámetros a los tipos del DTO (por ejemplo, un `id` de la URL a número).

### Agregar datos al seed

El seed está en `src/seed/` y hoy carga `usuarios` y `medicos` (en ese orden). Para cargar datos de otra tabla:

1. Registrá la entidad en `SeedModule`, dentro de `TypeOrmModule.forFeature([...])` (hoy: `[Usuario, Medico]`).
2. Poné los datos en un archivo nuevo dentro de `src/seed/data/`.
3. Agregá un método en `SeedService` y llamalo en `onApplicationBootstrap()` **después** de las tablas de las que dependa (por ejemplo, `medicos` se carga después de `usuarios` porque necesita el `id_usuario`).
4. Mantené el mismo criterio: **si ya existe, no insertarlo de nuevo** (idempotente).

---

## 7. ⚠️ Lo que NO hay que hacer

| ❌ No hacer | Consecuencia |
|---|---|
| **`npm audit fix --force`** | "Arregla" las 25 vulnerabilidades **bajando** Jest, ts-jest y otras herramientas a versiones muy viejas (por ejemplo, `jest@25`). Rompe la configuración de tests y puede romper la compilación, para todos los que hagan pull. Las vulnerabilidades están **solo en herramientas de desarrollo** (Jest y `@nestjs/mau`), no en el código que corre la API, y no afectan al TP |
| **Subir el `.env` al repo** | Expone la contraseña de tu base y tu `JWT_SECRET`: cualquiera con acceso al repo puede entrar a tu base o fabricar tokens válidos. Si pasa, **cambiá la contraseña de la base y el secreto inmediatamente**, porque borrar el archivo después no lo quita del historial de Git |
| **Compartir una misma base entre integrantes** | Cada uno arranca el backend con **su** versión de las entidades. Con `DB_SYNC=true`, TypeORM "corrige" la base según el código de quien arrancó: si alguien está en una rama desactualizada, **puede borrar columnas y sus datos** para todos. Además, los datos de prueba se pisan (turnos ocupados por otro, cancelaciones ajenas) |
| **Cambiar columnas con `DB_SYNC=true` sobre datos que importan** | Si se renombra una columna, TypeORM borra la vieja (con sus datos) y crea una nueva vacía. En tu base de prueba no es grave: se recarga con el seed |
| **Actualizar TypeORM a la versión 1.x** | Cambia la API respecto de la 0.3.x: lo que ya está hecho deja de funcionar y casi todos los ejemplos de internet son de la 0.3 |
| **Modificar la entidad `usuarios` o sus enums** | La consigna exige respetar el modelo de datos tal cual. Además, el login, el seed y los guards dependen de esos campos |
| **Aprobar los `install-scripts` que pide npm** (`npm install-scripts approve ...`) | Permite ejecutar scripts de instalación de paquetes que el proyecto no necesita. Todo funciona sin aprobarlos |
| **Instalar paquetes por tu cuenta sin avisar** | Modifica `package.json` y `package-lock.json` para todos. Puede generar conflictos al hacer merge y dependencias incompatibles. Consultalo con el grupo antes |
| **Usar `winget upgrade` para actualizar Node** | En algunos equipos `winget` asocia mal la versión instalada y puede instalar otra versión mayor (por ejemplo, la 22) |
| **Usar una versión de Node no soportada** (ver [punto 1.1](#11-nodejs)) | Avisos `EBADENGINE` y posibles fallas del CLI de Nest |
| **Poner `@Public()` en endpoints que no deben serlo** | Cualquiera, sin iniciar sesión, puede usar ese endpoint |
| **Dejar `JWT_SECRET` con un valor corto o copiado de internet** | Cualquiera que lo conozca puede fabricar un token de administrador |

---

## 8. Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| `Unable to connect to the database. Retrying (1)...` | La base no está accesible: datos del `.env` mal, Postgres local apagado o sin internet (Neon) | Revisá `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` y `DB_SSL`. Detené con `Ctrl + C` mientras lo corregís |
| `getaddrinfo ENOTFOUND ...` | `DB_HOST` mal escrito o con datos de más | Poné **solo** el host, sin `postgresql://` ni `/neondb` |
| `password authentication failed` | Usuario o contraseña incorrectos | Copialos de nuevo desde **Connect** en Neon |
| `connection is insecure` / `SSL is required` | Neon con `DB_SSL=false` | `DB_SSL=true` |
| `The server does not support SSL connections` | Postgres local con `DB_SSL=true` | `DB_SSL=false` |
| `Falta configurar JWT_SECRET en el archivo .env` | `JWT_SECRET` vacío o inexistente | Generalo con el comando del [punto 2.3](#23-completar-el-env) |
| `npm warn EBADENGINE` | Versión de Node no soportada | Actualizá Node ([punto 1.1](#11-nodejs)) |
| `Error: listen EADDRINUSE: address already in use :::3000` | Ya hay otro backend corriendo (otra terminal) | Cerrá la otra terminal con `Ctrl + C`, o cambiá `PORT` |
| `relation "usuarios" does not exist` | `DB_SYNC=false` con una base vacía | `DB_SYNC=true` y volvé a arrancar |
| `Usuarios: 0 insertados, 21 ya existían` | Los usuarios ya estaban cargados | Es lo esperado, no es un error |
| `401 Token no enviado` en tu endpoint | Falta el encabezado `Authorization: Bearer ...`, o el endpoint debería ser público y no tiene `@Public()` | Enviá el token del login, o agregá `@Public()` si corresponde |
| `401 Token inválido o vencido` | Pasó la duración del token, o cambiaste `JWT_SECRET` | Volvé a hacer login |
| `403 No tiene permisos para esta acción` | El rol del usuario no está en el `@Roles(...)` del endpoint | Iniciá sesión con un usuario del rol correcto |
| `400 property xxx should not exist` | Enviaste un campo que el DTO no declara, **o** la propiedad del DTO no tiene decorador de `class-validator` | Sacá el campo, o agregale un decorador a la propiedad |
| `TS1272: A type referenced in a decorated signature must be imported with 'import type'` | Se importó una interfaz (por ejemplo `UsuarioToken`) sin `type` | `import type { UsuarioToken } from ...` |
| La primera respuesta tarda varios segundos | Neon estaba suspendido | Es normal; las siguientes son rápidas |
| El servidor se reinicia solo (`File change detected`) | `start:dev` detectó que guardaste un archivo | Es normal |

---

## 9. Estructura de carpetas

```
src/
├── auth/                          → Inicio de sesión y protección de endpoints
│   ├── decorators/                → @Public(), @Roles(...), @UsuarioActual()
│   ├── dto/                       → LoginDto (entrada), LoginResponseDto (salida)
│   ├── guards/                    → JwtAuthGuard (token), RolesGuard (roles) — globales
│   ├── interfaces/                → UsuarioToken ({ id, rol })
│   ├── auth.controller.ts         → POST /auth/login, GET /auth/perfil
│   ├── auth.module.ts             → Configuración del JWT y registro de los guards
│   └── auth.service.ts            → Lógica de login y perfil
├── medicos/                       → Médicos y valor de la consulta
│   ├── dto/                       → UpdateValorConsultaDto (entrada), MedicoResponseDto (salida)
│   ├── entities/medico.entity.ts  → Tabla medicos (1:1 con usuarios), matrícula y valor_consulta
│   ├── medicos.controller.ts      → GET /medicos, PATCH /medicos/:id/valor-consulta
│   ├── medicos.module.ts          → Exporta MedicosService
│   └── medicos.service.ts         → listar, actualizarValorConsulta, existeMedicoActivo, obtenerValorActual
├── reservas/                      → Turnos y reglas de negocio
│   ├── dto/                       → CrearReservaDto (entrada), ReservaResponseDto (salida)
│   ├── entities/reserva.entity.ts → Tabla reservas, con valor_congelado
│   ├── enums/                     → EstadoReserva (PENDIENTE, ATENDIDO, AUSENTE, CANCELADA_PACIENTE, CANCELADA_ADMIN)
│   ├── reservas.controller.ts     → POST /reservas, GET /reservas, PATCH /reservas/:id/cancelar
│   ├── reservas.module.ts         → Exporta ReservasService
│   └── reservas.service.ts        → crear (validaciones), cancelar (por rol), listarPorUsuario
├── seed/                          → Carga automática de datos de prueba
│   ├── data/medicos.data.ts       → Los 5 médicos activos (matrícula y valor de consulta)
│   ├── data/usuarios.data.ts      → Los 21 usuarios de prueba
│   ├── seed.module.ts
│   └── seed.service.ts            → Se ejecuta al arrancar si DB_SEED=true
├── usuarios/                      → Usuarios (solo consulta; el ABM es de otro equipo)
│   ├── dto/                       → BuscarUsuarioDto (entrada), UsuarioResponseDto (salida, sin clave)
│   ├── entities/usuario.entity.ts → Tabla usuarios, según el modelo de la consigna
│   ├── enums/                     → EstadoUsuario (ACTIVO, BAJA), RolUsuario (MEDICO, PACIENTE, ADMINISTRADOR)
│   ├── usuarios.controller.ts     → GET /usuarios?documento=...
│   ├── usuarios.module.ts         → Exporta UsuariosService
│   └── usuarios.service.ts        → findById, findByDocumento
├── app.controller.ts              → GET /api (chequeo, público)
├── app.module.ts                  → Módulo raíz: configuración, conexión a la base y módulos
└── main.ts                        → Arranque: prefijo /api, validación global, Swagger, puerto
```

Cada funcionalidad nueva va en **su propia carpeta** dentro de `src/` (por ejemplo `src/medicos/`, `src/reservas/`), con su módulo, entidad, DTOs, servicio y controlador, y se registra en `imports` de `app.module.ts`. Las entidades se cargan solas (`autoLoadEntities`) con solo registrarlas en `TypeOrmModule.forFeature([...])` de su módulo.