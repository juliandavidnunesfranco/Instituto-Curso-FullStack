# Plataforma del curso — Diseño

**Fecha:** 2026-09-05
**Estado:** aprobado el mecanismo de identidad; pendiente revisión del spec completo

---

## 1. Qué se construye

Una plataforma web donde los estudiantes de la universidad:

1. Entran con su correo institucional (Google Workspace).
2. Leen las lecciones del curso, servidas desde la plataforma.
3. Descargan el homework de cada unidad.
4. Lo resuelven en su computadora (`npm i` → editar → `npm test`).
5. Al correr los tests, el resultado viaja solo a la plataforma.
6. Reciben una nota y desbloquean la unidad siguiente.

El docente ve el avance de todo el grupo y puede desbloquear unidades a mano.

**No se construye** (fuera de alcance, ver §10): exámenes, foros, mensajería,
entrega de proyectos que no sean homework con tests.

---

## 2. Decisiones tomadas

| Decisión | Elección | Motivo |
| --- | --- | --- |
| Autenticación | Google OAuth, restringido por dominio | Los correos institucionales son Google Workspace |
| Identidad del reporter | Id personal embebido en el ZIP al descargar | El reporter corre en terminal y no alcanza la sesión del navegador |
| Persistencia | Google Sheets | 20–40 alumnos; el docente puede mirar la planilla directamente |
| Gating | 100% de tests para abrir la siguiente unidad | Decisión del docente |
| Nota | `pasados / total × 100` | Directa y explicable al alumno |
| Despliegue | Vercel | Es de los creadores de Next.js; sin disco persistente, que Sheets no necesita |
| Framework | Next.js 16.3.4 | Ver `docs/restricciones.md` §5 |
| Librería de auth | `next-auth@5.0.0-beta.32` | Nativa de App Router; declara `next: ^16.0.0`. Ver §10 |

### Identificador de unidad

Una unidad se identifica **siempre por el nombre de su carpeta**: `02-JS-I`,
`08-HTML`, `01a-Git`. Ese es el valor de `slug` en las rutas, de `unidad` en
las hojas y en el cuerpo del `POST`.

El `permalink` de `README.json` (`/JavaScript_I/`) es solo el título legible
de la lección en el sitio de Eleventy y **no se usa como identificador**: dos
unidades podrían compartirlo y el nombre de carpeta ya es único y estable.

**Descartado:** identidad por `~/.gitconfig` (la edita cualquiera y permite
entregar en nombre de otro) y GitHub Actions (innecesarias: el reporter envía
desde la máquina del alumno).

---

## 3. El problema de identidad y cómo se resuelve

El reporter de Jest corre en la terminal del alumno. Un proceso de Node **no
puede leer la cookie de sesión del navegador**, así que un `POST` suyo llegaría
anónimo. El sistema original resolvía esto leyendo el correo de `~/.gitconfig`
— dato que el propio alumno controla y puede falsear.

La solución mueve la autenticación al **momento de la descarga**, que es el
único instante donde la sesión del navegador y los archivos coinciden:

```
navegador (sesión OAuth viva)          terminal (sin sesión)
──────────────────────────────         ─────────────────────
alumno pulsa "Descargar homework"
        ↓
servidor lee la sesión, genera ZIP
con .reporter/config.json que
contiene su id personal
        ↓
        └──────── ZIP ────────────────→ npm i / editar / npm test
                                                ↓
                                        POST con el id
                                                ↓
                                        servidor valida contra
                                        la hoja de alumnos
```

**Riesgo aceptado:** el `id` es un secreto portador. Si un alumno comparte su
ZIP, otro puede entregar en su nombre. Mitigación: el panel del alumno lista
sus entregas con fecha, de modo que una entrega ajena es visible. No se
persigue impedirlo por completo — quien comparte su credencial asume el
resultado, igual que con una contraseña.

---

## 4. Arquitectura

```
plataforma/                     ← proyecto Next.js 16, directorio aparte
│
├── Rutas públicas
│   └── /login                  Google OAuth
│
├── Rutas de alumno (sesión requerida)
│   ├── /                       índice de unidades, con candado según avance
│   ├── /unidad/[slug]          lección + botón de descarga
│   └── /mi-avance              notas e historial de entregas
│
├── Rutas de docente (rol requerido)
│   ├── /docente                tabla del grupo
│   └── /docente/[email]        detalle y desbloqueo manual
│
└── API
    ├── /api/auth/[...nextauth] Auth.js
    ├── /api/homework/[slug]    genera y envía el ZIP personalizado
    └── /api/resultado          recibe el POST del reporter (sin sesión)
```

`/api/resultado` es la única ruta que acepta peticiones sin sesión de
navegador. Se autentica con el `id` del cuerpo.

### Capas

| Módulo | Responsabilidad | Depende de |
| --- | --- | --- |
| `lib/lecciones.ts` | Leer el markdown del curso desde `Introductorio/` | sistema de archivos |
| `lib/sheets.ts` | Única puerta a Google Sheets: leer y escribir filas | `googleapis` |
| `lib/alumnos.ts` | Alta, búsqueda por correo o por id | `sheets.ts` |
| `lib/entregas.ts` | Registrar resultados, calcular nota | `sheets.ts` |
| `lib/avance.ts` | Decidir qué unidades están abiertas | `entregas.ts` |
| `lib/zip.ts` | Armar el ZIP con el `config.json` del alumno | `archiver` |
| `auth.ts` | Configuración de Auth.js y restricción de dominio | `next-auth` |

Ninguna página lee Sheets ni el disco directamente.

---

## 5. Modelo de datos (Google Sheets)

Un solo documento con tres hojas.

### Hoja `alumnos`

| Columna | Tipo | Ejemplo |
| --- | --- | --- |
| `email` | texto (clave) | `ana.perez@launiversidad.edu` |
| `nombre` | texto | `Ana Pérez` |
| `reporter_id` | texto (32 hex) | `a7f3c9...` |
| `rol` | `alumno` \| `docente` | `alumno` |
| `alta` | ISO 8601 | `2026-09-05T14:22:00Z` |

La fila se crea sola en el primer login válido.

### Hoja `entregas`

| Columna | Tipo | Ejemplo |
| --- | --- | --- |
| `fecha` | ISO 8601 | `2026-09-08T19:03:11Z` |
| `email` | texto | `ana.perez@launiversidad.edu` |
| `unidad` | slug | `02-JS-I` |
| `archivo` | texto | `JSI.test.js` |
| `total` | entero | `35` |
| `pasados` | entero | `35` |
| `fallados` | entero | `0` |
| `nota` | entero 0–100 | `100` |
| `intentos` | entero | `4` |

Se **añade** una fila por envío; no se sobrescribe. El historial completo es
el registro de aprendizaje, y la nota vigente de una unidad es la de su mejor
entrega.

### Hoja `desbloqueos`

| Columna | Tipo | Ejemplo |
| --- | --- | --- |
| `fecha` | ISO 8601 | `2026-09-10T10:00:00Z` |
| `email` | texto | `ana.perez@launiversidad.edu` |
| `unidad` | slug | `08-HTML` |
| `motivo` | texto | `Entregó el CV por correo` |
| `docente` | texto | `julian@launiversidad.edu` |

Sirve para las unidades sin tests y para destrabar a un alumno atascado.

---

## 6. Unidades sin tests automáticos

Tres de las diez unidades no tienen tests: `01a-Git`, `08-HTML` y
`09-CSS-Positioning`. Son visuales o de proceso, y no se pueden calificar
solas.

**Regla:** una unidad sin tests se marca añadiendo `"manual": true` a su
`README.json` (por ejemplo `Introductorio/08-HTML/README.json`). Es el único
cambio que este proyecto introduce en el material del curso, y es aditivo: ni
Eleventy ni los tests leen esa clave. El gating la trata así:

- No pide resultado de tests.
- Se abre la siguiente **solo** con una fila en `desbloqueos`.
- En el panel del docente aparecen destacadas como "requieren revisión".

Sin esta regla, el curso quedaría bloqueado en `01a-Git` para todo el mundo.

---

## 7. Flujo de datos

### Login

1. El alumno pulsa "Entrar con Google".
2. Auth.js usa `hd=launiversidad.edu` para mostrar solo cuentas del dominio.
3. **El servidor vuelve a verificar el dominio** al recibir el perfil. El
   parámetro `hd` es una sugerencia de interfaz, no una garantía: un atacante
   puede omitirlo. La comprobación del lado servidor es la que manda.
4. Si el correo no existe en `alumnos`, se crea la fila con un `reporter_id`
   nuevo (`crypto.randomUUID()` sin guiones).

### Descarga del homework

1. `GET /api/homework/02-JS-I` con sesión válida.
2. El servidor busca el `reporter_id` del alumno.
3. Arma en memoria un ZIP con: los archivos de `Introductorio/02-JS-I/homework/`,
   un `package.json` con `test: "jest --testResultsProcessor ./.reporter/index.js"`,
   el `.reporter/index.js`, y un `.reporter/config.json` con `{ id, url }`.
4. Responde con `Content-Disposition: attachment`.

### Envío del resultado

1. `npm test` ejecuta Jest; el `testResultsProcessor` recibe el objeto de
   resultados.
2. El reporter lee `.reporter/config.json` y hace `POST` a `url` con:

```json
{
  "id": "a7f3c9...",
  "unidad": "02-JS-I",
  "archivo": "JSI.test.js",
  "total": 35,
  "pasados": 35,
  "fallados": 0,
  "intentos": 4
}
```

3. `/api/resultado` busca el `id` en `alumnos`. Si no existe, responde `401`.
4. Calcula la nota, añade la fila en `entregas` y responde `200` con la nota,
   que el reporter imprime en la terminal.

**El reporter nunca interrumpe los tests.** Si la red falla o el servidor
responde error, escribe un aviso y devuelve los resultados intactos. Un
problema de conectividad no puede impedir que el alumno vea si su código pasa.

### Cálculo del avance

`lib/avance.ts` recibe la lista de unidades ordenada y las entregas del alumno:

- Unidad con tests: **completa** si alguna entrega tiene `pasados === total`.
- Unidad sin tests (`manual`): **completa** si hay fila en `desbloqueos`.
- Una unidad está **abierta** si es la primera, o si la anterior está completa,
  o si tiene un desbloqueo manual.

---

## 8. Manejo de errores

| Situación | Respuesta |
| --- | --- |
| Correo fuera del dominio | Se rechaza el login con mensaje explícito |
| `id` desconocido en `/api/resultado` | `401`; el reporter sugiere volver a descargar el homework |
| Sheets no responde | `503`; el reporter reintenta una vez y luego avisa sin fallar |
| Cuota de Sheets agotada | Caché de 60 s en lecturas; las escrituras se reintentan con espera creciente |
| Alumno pide una unidad bloqueada | Se redirige al índice con un aviso de qué le falta |
| ZIP de una unidad inexistente | `404` |

---

## 9. Pruebas

Lo que se prueba con tests automáticos, por ser lógica pura y de riesgo:

- `lib/avance.ts` — la máquina de estados del gating: primera unidad abierta,
  desbloqueo en cadena, unidades manuales, alumno sin entregas.
- `lib/entregas.ts` — cálculo de nota, incluido `total = 0` (no debe dividir
  por cero) y la selección de la mejor entrega.
- `lib/alumnos.ts` — alta idempotente: dos logins seguidos no crean dos filas.
- La validación de dominio en `auth.ts` — que un correo de otro dominio se
  rechace aunque venga con perfil válido.
- El reporter — que ante un fallo de red devuelva los resultados sin lanzar.

Sheets se sustituye por un doble en memoria; los tests no tocan la red.

---

## 10. Fuera de alcance

No entran en esta versión: exámenes, foros, mensajería, subida de proyectos
sin tests, analítica más allá de la tabla de avance, ni app móvil.

**Riesgos anotados para revisar más adelante:**

- **Auth.js v5 está en beta.** Se eligió igualmente porque el gating vive en
  Server Components y su helper `auth()` está pensado para eso; con
  `next-auth@4.24.15` (estable, también compatible con Next 16) habría que
  pasar la sesión a mano en cada capa. La beta lleva años en uso productivo,
  pero es beta. **Señal para reconsiderar:** si aparece un fallo de sesión que
  no se resuelva en un día, se vuelve a la v4 — el cambio queda contenido en
  `auth.ts` y en las llamadas a `auth()`.
- **Sheets como base de datos** funciona para 40 alumnos. Si el curso crece a
  varios grupos, `lib/sheets.ts` es la única pieza a reemplazar por Postgres.
- **Datos personales.** Se guardan nombre y correo institucional de menores
  de edad potencialmente. Conviene confirmar qué exige la universidad antes
  de publicar.
