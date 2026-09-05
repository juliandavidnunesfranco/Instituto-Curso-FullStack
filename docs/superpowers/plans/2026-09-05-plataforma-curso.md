# Plataforma del curso — Plan de Implementación

> **Para quien ejecute este plan:** usar `superpowers:subagent-driven-development`
> (recomendado) o `superpowers:executing-plans`. Los pasos usan casillas
> (`- [ ]`) para seguimiento.

**Objetivo:** Una plataforma donde los estudiantes entran con su correo
institucional, leen las lecciones, descargan el homework, y al correr
`npm test` su nota llega sola y les desbloquea la siguiente unidad.

**Arquitectura:** Next.js 16 en `plataforma/`, dentro de este mismo
repositorio, leyendo las lecciones de las carpetas de módulos que ya existen.
La identidad del alumno se embebe en el ZIP en el momento de la descarga —
cuando la sesión OAuth está viva— porque el reporter de Jest corre en la
terminal y no alcanza la cookie del navegador. Google Sheets es el almacén.

**Stack:** Next.js 16.3.4, React 19.2.8, `next-auth@5.0.0-beta.32`,
`googleapis@178`, `jszip@3.10.1`, `react-markdown@10`, Jest.

**Spec:** [`docs/superpowers/specs/2026-09-05-plataforma-curso-design.md`](../specs/2026-09-05-plataforma-curso-design.md)

## Restricciones globales

- **Next.js 16.3.4.** No 14 ni 15. Node ≥ 20.9.0, TypeScript ≥ 5.1.
- **Las APIs de request son asíncronas:** `params`, `searchParams`,
  `cookies()` y `headers()` devuelven promesas. Hay que esperarlas.
- **Identificador de unidad = nombre de carpeta** (`02-JS-I`, `08-HTML`).
  Nunca el `permalink` del `README.json`.
- **Todo vive en `plataforma/`.** Del material del curso solo se toca una
  cosa: añadir `"manual": true` a tres `README.json` (Tarea 9).
- **Ninguna página lee Sheets ni disco directamente.** Siempre por `lib/`.
- **El reporter nunca interrumpe los tests.** Si la red falla, avisa y
  devuelve los resultados intactos.
- **Textos de interfaz en español.**
- **Nunca commitear credenciales.** Todo secreto va en `.env.local`,
  que ya está en `.gitignore`.

---

## Estructura de archivos

```
plataforma/
├── next.config.ts               # rastreo de archivos fuera del Root Directory
├── .env.local.ejemplo
├── jest.config.js
└── src/
    ├── auth.ts               # Auth.js: Google + verificación de dominio
    ├── lib/
    │   ├── lecciones.ts         # lee las 51 lecciones del repo
    │   ├── sheets.ts            # única puerta a Google Sheets
    │   ├── alumnos.ts           # alta y búsqueda de alumnos
    │   ├── entregas.ts          # registro de resultados y nota
    │   ├── avance.ts            # máquina de estados del gating
    │   └── zip.ts               # arma el ZIP con la identidad dentro
    ├── reporter/
    │   └── plantilla/           # se copia dentro de cada ZIP
    │       ├── index.js         # el testResultsProcessor
    │       └── README.md        # instrucciones para el alumno
    └── app/
        ├── layout.tsx
        ├── page.tsx                      # índice de unidades
        ├── unidad/[id]/page.tsx          # lección + descarga
        ├── mi-avance/page.tsx            # notas del alumno
        ├── docente/page.tsx              # tabla del grupo
        └── api/
            ├── auth/[...nextauth]/route.ts
            ├── homework/[id]/route.ts    # ZIP personalizado
            └── resultado/route.ts        # recibe el POST del reporter
```

**Responsabilidad de cada `lib/`:** una sola fuente de datos. `lecciones.ts`
solo toca el disco; `sheets.ts` solo toca la API de Google; el resto compone
sobre ellos. Eso permite probar la lógica (`avance`, `entregas`) sin red.

---

## Fases

| Fase | Entrega funcionando | Tareas |
| --- | --- | --- |
| 1 | Sitio con las 51 lecciones navegables | 1–3 |
| 2 | Login institucional y alta en Sheets | 4–5 |
| 3 | Descarga del homework y llegada de notas | 6–8 |
| 4 | Gating, panel del alumno y del docente | 9–11 |

Cada fase deja software que funciona. Se puede parar después de cualquiera.

---

# FASE 1 — Lecciones

## Tarea 1: Proyecto Next.js 16

**Archivos:**
- Crear: `plataforma/` (proyecto completo)
- Crear: `plataforma/.env.local.ejemplo`
- Crear: `plataforma/next.config.ts`
- Modificar: `.gitignore` (raíz)

**Interfaces:**
- Produce: proyecto arrancable con `npm run dev` en `plataforma/`.

- [ ] **Paso 1: Crear el proyecto**

Desde la raíz del repositorio. **`--disable-git` es obligatorio**: sin él,
`create-next-app` inicializa un repositorio anidado y git guardaría
`plataforma/` como *gitlink* — una referencia vacía— en vez de los archivos.

```bash
npx create-next-app@16.3.4 plataforma \
  --typescript --app --eslint --src-dir \
  --no-tailwind --no-turbopack --import-alias "@/*" \
  --use-npm --disable-git --yes
```

- [ ] **Paso 2: Quitar lo que choca con la raíz y verificar**

`create-next-app` genera su propio `CLAUDE.md` y `AGENTS.md`, que competirían
con el `CLAUDE.md` del repositorio.

```bash
cd plataforma && rm -f CLAUDE.md AGENTS.md
test -d .git && echo "⚠️  BORRAR plataforma/.git" || echo "✅ sin repo anidado"
node -p "require('next/package.json').version"
```

Esperado: `16.3.4`.

- [ ] **Paso 3: Configurar el rastreo de archivos externos**

Las lecciones viven un nivel arriba, fuera del Root Directory que Vercel
construye. Sin esto el ZIP se genera bien en local y falla en producción
con `ENOENT`.

`plataforma/next.config.ts`:

```ts
import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '..'),
  outputFileTracingIncludes: {
    '/api/homework/[id]': ['../{Introductorio,Modulo_*}/**/homework/**'],
    '/unidad/[id]': ['../{Introductorio,Modulo_*}/**/README.*'],
    '/': ['../{Introductorio,Modulo_*}/**/README.json'],
  },
}

export default config
```

- [ ] **Paso 4: Plantilla de entorno**

`plataforma/.env.local.ejemplo`:

```bash
# --- Google OAuth (consola de Google Cloud > Credenciales) ---
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
# Secreto de sesión: generar con  npx auth secret
AUTH_SECRET=
# Dominio institucional permitido. Sin esto NO arranca la validación.
DOMINIO_PERMITIDO=launiversidad.edu

# --- Google Sheets (cuenta de servicio) ---
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
# Clave privada con \n escapados, entre comillas
GOOGLE_PRIVATE_KEY=

# --- URL pública, la que recibe el POST del reporter ---
NEXT_PUBLIC_URL_BASE=http://localhost:3000
```

- [ ] **Paso 5: Ignorar artefactos**

Añadir al `.gitignore` de la raíz:

```gitignore
# ---- Plataforma del curso ----
plataforma/.next/
plataforma/node_modules/
plataforma/.env.local
```

- [ ] **Paso 6: Verificar que arranca**

```bash
cd plataforma && npm run dev
```

Esperado: sirve en `http://localhost:3000` sin errores.

- [ ] **Paso 7: Commit**

```bash
git add plataforma .gitignore
git commit -m "Crear proyecto base de la plataforma en Next.js 16"
```

---

## Tarea 2: Lector de lecciones

**Archivos:**
- Crear: `plataforma/src/lib/lecciones.ts`
- Test: `plataforma/src/lib/lecciones.test.ts`
- Crear: `plataforma/jest.config.js`

**Interfaces:**
- Produce:

```ts
export type Unidad = {
  id: string            // "02-JS-I" — nombre de carpeta, identificador canónico
  modulo: string        // "Introductorio"
  titulo: string        // "JavaScript I"
  orden: number         // para ordenar dentro del módulo
  rutaMd: string        // ruta absoluta al README.md
  tieneHomework: boolean
  manual: boolean       // sin tests: requiere desbloqueo del docente
}
export function listarUnidades(): Unidad[]
export function leerUnidad(id: string): { unidad: Unidad; markdown: string } | null
```

- [ ] **Paso 1: Instalar Jest**

```bash
cd plataforma && npm install -D jest @types/jest ts-jest
```

`plataforma/jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
}
```

- [ ] **Paso 2: Escribir el test que falla**

`plataforma/src/lib/lecciones.test.ts`:

```ts
import { listarUnidades, leerUnidad } from './lecciones';

describe('listarUnidades', () => {
  it('encuentra las 51 lecciones de los cinco modulos', () => {
    expect(listarUnidades().length).toBe(51);
  });

  it('usa el nombre de carpeta como identificador, no el permalink', () => {
    const u = listarUnidades().find((x) => x.id === '02-JS-I');
    expect(u).toBeDefined();
    expect(u!.titulo).toBe('JavaScript I');
    expect(u!.modulo).toBe('Introductorio');
  });

  it('marca que 02-JS-I tiene homework', () => {
    const u = listarUnidades().find((x) => x.id === '02-JS-I');
    expect(u!.tieneHomework).toBe(true);
  });

  it('ordena las unidades de un modulo por su campo orden', () => {
    const intro = listarUnidades().filter((u) => u.modulo === 'Introductorio');
    const ordenes = intro.map((u) => u.orden);
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
  });
});

describe('leerUnidad', () => {
  it('devuelve el markdown de una unidad existente', () => {
    const r = leerUnidad('02-JS-I');
    expect(r).not.toBeNull();
    expect(r!.markdown.length).toBeGreaterThan(100);
  });

  it('devuelve null si la unidad no existe', () => {
    expect(leerUnidad('no-existe')).toBeNull();
  });
});
```

- [ ] **Paso 3: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/lecciones.test.ts
```

Esperado: FAIL — `Cannot find module './lecciones'`.

- [ ] **Paso 4: Implementar**

`plataforma/src/lib/lecciones.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';

/** Raiz del repositorio: un nivel arriba de plataforma/ */
const RAIZ = path.resolve(process.cwd(), '..');

/** Solo estas carpetas tienen lecciones. Los Extras_* son datasets. */
const MODULOS = [
  'Introductorio',
  'Modulo_Uno',
  'Modulo_Dos',
  'Modulo_Tres',
  'Modulo_Cuatro',
];

export type Unidad = {
  id: string;
  modulo: string;
  titulo: string;
  orden: number;
  rutaMd: string;
  tieneHomework: boolean;
  manual: boolean;
};

/**
 * Una unidad es una carpeta con README.json + README.md.
 * El id es el nombre de la carpeta: unico y estable, a diferencia del
 * permalink, que solo sirve para mostrar en el sitio de Eleventy.
 */
export function listarUnidades(): Unidad[] {
  const unidades: Unidad[] = [];

  for (const modulo of MODULOS) {
    const dirModulo = path.join(RAIZ, modulo);
    if (!fs.existsSync(dirModulo)) continue;

    for (const carpeta of fs.readdirSync(dirModulo)) {
      const rutaJson = path.join(dirModulo, carpeta, 'README.json');
      const rutaMd = path.join(dirModulo, carpeta, 'README.md');
      if (!fs.existsSync(rutaJson) || !fs.existsSync(rutaMd)) continue;

      let meta: Record<string, unknown>;
      try {
        meta = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
      } catch {
        continue; // un README.json roto no debe tumbar el sitio entero
      }
      if (typeof meta.lessonTitle !== 'string') continue;

      const dirHomework = path.join(dirModulo, carpeta, 'homework');
      unidades.push({
        id: carpeta,
        modulo,
        titulo: meta.lessonTitle,
        orden:
          typeof (meta.eleventyNavigation as { order?: number })?.order === 'number'
            ? (meta.eleventyNavigation as { order: number }).order
            : 999,
        rutaMd,
        tieneHomework: fs.existsSync(dirHomework),
        manual: meta.manual === true,
      });
    }
  }

  return unidades.sort(
    (a, b) =>
      MODULOS.indexOf(a.modulo) - MODULOS.indexOf(b.modulo) || a.orden - b.orden,
  );
}

export function leerUnidad(
  id: string,
): { unidad: Unidad; markdown: string } | null {
  const unidad = listarUnidades().find((u) => u.id === id);
  if (!unidad) return null;
  return { unidad, markdown: fs.readFileSync(unidad.rutaMd, 'utf8') };
}
```

- [ ] **Paso 5: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/lecciones.test.ts
```

Esperado: PASS, 6 tests.

Si el conteo de 51 falla, imprimir `listarUnidades().length` y ajustar el
número en el test al valor real — el material puede haber cambiado. Lo que no
se ajusta es el resto de aserciones.

- [ ] **Paso 6: Commit**

```bash
git add plataforma/src/lib/lecciones.ts plataforma/src/lib/lecciones.test.ts plataforma/jest.config.js plataforma/package.json
git commit -m "Agregar lector de lecciones desde el material del repositorio"
```

---

## Tarea 3: Páginas de lecciones

**Archivos:**
- Modificar: `plataforma/src/app/page.tsx`
- Crear: `plataforma/src/app/unidad/[id]/page.tsx`

**Interfaces:**
- Consume: `listarUnidades()`, `leerUnidad()` de la Tarea 2.

- [ ] **Paso 1: Instalar el renderizador de markdown**

```bash
cd plataforma && npm install react-markdown remark-gfm
```

- [ ] **Paso 2: Índice de unidades**

`plataforma/src/app/page.tsx`:

```tsx
import Link from 'next/link';
import { listarUnidades } from '@/lib/lecciones';

export default function Portada() {
  const unidades = listarUnidades();
  const modulos = [...new Set(unidades.map((u) => u.modulo))];

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Curso de Desarrollo Web Full Stack</h1>

      {modulos.map((modulo) => (
        <section key={modulo}>
          <h2>{modulo.replace(/_/g, ' ')}</h2>
          <ol>
            {unidades
              .filter((u) => u.modulo === modulo)
              .map((u) => (
                <li key={u.id} style={{ margin: '0.4rem 0' }}>
                  <Link href={`/unidad/${u.id}`}>{u.titulo}</Link>
                  {u.tieneHomework && ' 📝'}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Paso 3: Página de una lección**

**`params` es una promesa en Next 16.**

`plataforma/src/app/unidad/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { leerUnidad, listarUnidades } from '@/lib/lecciones';

export function generateStaticParams() {
  return listarUnidades().map((u) => ({ id: u.id }));
}

export default async function PaginaUnidad(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const datos = leerUnidad(id);
  if (!datos) notFound();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver al índice</Link>
      <h1>{datos.unidad.titulo}</h1>
      <article>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {datos.markdown}
        </ReactMarkdown>
      </article>
    </main>
  );
}
```

- [ ] **Paso 4: Verificar en el navegador**

```bash
cd plataforma && npm run dev
```

Abrir `http://localhost:3000`. Esperado: cinco módulos con sus unidades; al
entrar en "JavaScript I" se ve la lección renderizada.

- [ ] **Paso 5: Verificar el build**

```bash
cd plataforma && npm run build
```

Esperado: compila sin errores de tipos.

- [ ] **Paso 6: Commit**

```bash
git add plataforma/src/app
git commit -m "Agregar indice y paginas de leccion"
```

**🎉 Fin de la Fase 1.** Sitio propio con las 51 lecciones.

---

# FASE 2 — Autenticación

## Tarea 4: Login con Google Workspace

**Archivos:**
- Crear: `plataforma/src/auth.ts`
- Crear: `plataforma/src/app/api/auth/[...nextauth]/route.ts`
- Test: `plataforma/src/lib/dominio.test.ts`
- Crear: `plataforma/src/lib/dominio.ts`

**Interfaces:**
- Produce:
  - `export function dominioPermitido(email: string | null | undefined, dominio: string): boolean`
  - `export const { handlers, auth, signIn, signOut }` desde `src/auth.ts`

- [ ] **Paso 1: Escribir el test de la validación de dominio**

Esto se prueba aparte de Auth.js porque es la regla de seguridad y debe ser
verificable sin red. El parámetro `hd` de Google es una sugerencia de
interfaz: se puede omitir. **La comprobación del servidor es la que manda.**

`plataforma/src/lib/dominio.test.ts`:

```ts
import { dominioPermitido } from './dominio';

describe('dominioPermitido', () => {
  it('acepta un correo del dominio institucional', () => {
    expect(dominioPermitido('ana@launiversidad.edu', 'launiversidad.edu')).toBe(true);
  });

  it('rechaza un correo de otro dominio', () => {
    expect(dominioPermitido('ana@gmail.com', 'launiversidad.edu')).toBe(false);
  });

  it('rechaza un dominio que solo termina igual', () => {
    expect(dominioPermitido('ana@falsalauniversidad.edu', 'launiversidad.edu')).toBe(false);
  });

  it('rechaza un subdominio no autorizado', () => {
    expect(dominioPermitido('ana@mal.launiversidad.edu.co', 'launiversidad.edu')).toBe(false);
  });

  it('no distingue mayusculas', () => {
    expect(dominioPermitido('Ana@LaUniversidad.EDU', 'launiversidad.edu')).toBe(true);
  });

  it('rechaza vacio, nulo o sin arroba', () => {
    expect(dominioPermitido(null, 'launiversidad.edu')).toBe(false);
    expect(dominioPermitido(undefined, 'launiversidad.edu')).toBe(false);
    expect(dominioPermitido('', 'launiversidad.edu')).toBe(false);
    expect(dominioPermitido('sinarroba', 'launiversidad.edu')).toBe(false);
  });

  it('rechaza un correo con dos arrobas', () => {
    expect(dominioPermitido('a@b@launiversidad.edu', 'launiversidad.edu')).toBe(false);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/dominio.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 3: Implementar**

`plataforma/src/lib/dominio.ts`:

```ts
/**
 * Verifica que el correo pertenezca exactamente al dominio institucional.
 *
 * Se compara la parte posterior a la unica arroba, no con endsWith: un
 * dominio como "falsalauniversidad.edu" termina igual que el permitido y
 * pasaria una comprobacion ingenua.
 */
export function dominioPermitido(
  email: string | null | undefined,
  dominio: string,
): boolean {
  if (!email) return false;
  const partes = email.split('@');
  if (partes.length !== 2) return false;
  return partes[1].toLowerCase() === dominio.toLowerCase();
}
```

- [ ] **Paso 4: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/dominio.test.ts
```

Esperado: PASS, 7 tests.

- [ ] **Paso 5: Configurar Auth.js**

```bash
cd plataforma && npm install next-auth@5.0.0-beta.32
```

`plataforma/src/auth.ts`:

```ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { dominioPermitido } from '@/lib/dominio';

const DOMINIO = process.env.DOMINIO_PERMITIDO ?? '';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Sugerencia de interfaz: Google muestra solo cuentas del dominio.
      // NO es una garantia; la validacion real esta en signIn.
      authorization: { params: { hd: DOMINIO, prompt: 'select_account' } },
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!DOMINIO) {
        console.error('DOMINIO_PERMITIDO sin definir: se rechaza todo login');
        return false;
      }
      return dominioPermitido(profile?.email, DOMINIO);
    },
    async session({ session }) {
      return session;
    },
  },
  pages: { signIn: '/login' },
});
```

`plataforma/src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/auth';
export const { GET, POST } = handlers;
```

- [ ] **Paso 6: Verificar el rechazo con una cuenta ajena**

Con las credenciales de Google Cloud puestas en `.env.local`, arrancar e
intentar entrar con una cuenta **de otro dominio** (un Gmail personal).

Esperado: el login se rechaza. Si entra, `DOMINIO_PERMITIDO` no está definido
o el callback no se está ejecutando — no continuar hasta que rechace.

- [ ] **Paso 7: Commit**

```bash
git add plataforma/src/auth.ts plataforma/src/lib/dominio.ts plataforma/src/lib/dominio.test.ts plataforma/src/app/api/auth plataforma/package.json
git commit -m "Agregar login con Google restringido al dominio institucional"
```

---

## Tarea 5: Google Sheets y alta de alumnos

**Archivos:**
- Crear: `plataforma/src/lib/sheets.ts`
- Crear: `plataforma/src/lib/alumnos.ts`
- Test: `plataforma/src/lib/alumnos.test.ts`

**Interfaces:**
- Produce:

```ts
// sheets.ts
export type Fila = Record<string, string>;
export interface Hojas {
  leer(hoja: string): Promise<Fila[]>;
  agregar(hoja: string, fila: Fila): Promise<void>;
}
export function hojasDeGoogle(): Hojas;

// alumnos.ts
export type Rol = 'alumno' | 'docente';
export type Alumno = {
  email: string; nombre: string; reporter_id: string; rol: Rol; alta: string;
};
export function buscarPorEmail(h: Hojas, email: string): Promise<Alumno | null>;
export function buscarPorReporterId(h: Hojas, id: string): Promise<Alumno | null>;
export function altaSiNoExiste(h: Hojas, email: string, nombre: string): Promise<Alumno>;
```

`Hojas` es una interfaz a propósito: permite probar `alumnos.ts` con un doble
en memoria, sin tocar la red, y cambiar Sheets por Postgres más adelante sin
tocar nada más.

- [ ] **Paso 1: Escribir el test con un doble en memoria**

`plataforma/src/lib/alumnos.test.ts`:

```ts
import type { Fila, Hojas } from './sheets';
import { altaSiNoExiste, buscarPorEmail, buscarPorReporterId } from './alumnos';

function hojasFalsas(inicial: Record<string, Fila[]> = {}): Hojas {
  const datos: Record<string, Fila[]> = { alumnos: [], ...inicial };
  return {
    async leer(hoja) {
      return datos[hoja] ?? [];
    },
    async agregar(hoja, fila) {
      (datos[hoja] ??= []).push(fila);
    },
  };
}

describe('altaSiNoExiste', () => {
  it('crea el alumno en el primer login', async () => {
    const h = hojasFalsas();
    const a = await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    expect(a.email).toBe('ana@u.edu');
    expect(a.rol).toBe('alumno');
    expect(a.reporter_id).toHaveLength(32);
    expect(await h.leer('alumnos')).toHaveLength(1);
  });

  it('no duplica la fila en el segundo login', async () => {
    const h = hojasFalsas();
    const primero = await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    const segundo = await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    expect(segundo.reporter_id).toBe(primero.reporter_id);
    expect(await h.leer('alumnos')).toHaveLength(1);
  });

  it('no distingue mayusculas al buscar', async () => {
    const h = hojasFalsas();
    await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    await altaSiNoExiste(h, 'ANA@U.EDU', 'Ana');
    expect(await h.leer('alumnos')).toHaveLength(1);
  });

  it('da un reporter_id distinto a cada alumno', async () => {
    const h = hojasFalsas();
    const a = await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    const b = await altaSiNoExiste(h, 'luis@u.edu', 'Luis');
    expect(a.reporter_id).not.toBe(b.reporter_id);
  });
});

describe('buscarPorReporterId', () => {
  it('encuentra al alumno por su id', async () => {
    const h = hojasFalsas();
    const a = await altaSiNoExiste(h, 'ana@u.edu', 'Ana');
    const hallado = await buscarPorReporterId(h, a.reporter_id);
    expect(hallado!.email).toBe('ana@u.edu');
  });

  it('devuelve null si el id no existe', async () => {
    expect(await buscarPorReporterId(hojasFalsas(), 'inventado')).toBeNull();
  });
});

describe('buscarPorEmail', () => {
  it('devuelve null si el alumno no existe', async () => {
    expect(await buscarPorEmail(hojasFalsas(), 'nadie@u.edu')).toBeNull();
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/alumnos.test.ts
```

Esperado: FAIL — módulos no encontrados.

- [ ] **Paso 3: Implementar el acceso a Sheets**

```bash
cd plataforma && npm install googleapis
```

`plataforma/src/lib/sheets.ts`:

```ts
import { google } from 'googleapis';

export type Fila = Record<string, string>;

export interface Hojas {
  leer(hoja: string): Promise<Fila[]>;
  agregar(hoja: string, fila: Fila): Promise<void>;
}

/** Cache en memoria por hoja. La cuota de Sheets ronda 60 lecturas/min. */
const CACHE_MS = 60_000;
const cache = new Map<string, { en: number; filas: Fila[] }>();

/** Reintenta una escritura con espera creciente: 0.5 s, 1 s, 2 s. */
async function conReintento<T>(fn: () => Promise<T>): Promise<T> {
  let ultimo: unknown;
  for (let intento = 0; intento < 3; intento++) {
    try {
      return await fn();
    } catch (error) {
      ultimo = error;
      await new Promise((r) => setTimeout(r, 500 * 2 ** intento));
    }
  }
  throw ultimo;
}

/**
 * La primera fila de cada hoja son los encabezados y define las columnas.
 * Se leen siempre completas porque el volumen es de decenas de filas.
 */
export function hojasDeGoogle(): Hojas {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    // En el entorno la clave lleva los saltos escapados
    key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const api = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID!;

  return {
    async leer(hoja) {
      const guardado = cache.get(hoja);
      if (guardado && Date.now() - guardado.en < CACHE_MS) return guardado.filas;

      const res = await api.spreadsheets.values.get({
        spreadsheetId,
        range: hoja,
      });
      const [encabezados, ...filas] = res.data.values ?? [];
      if (!encabezados) return [];

      const resultado = filas.map((fila) =>
        Object.fromEntries(
          encabezados.map((c: string, i: number) => [c, String(fila[i] ?? '')]),
        ),
      );
      cache.set(hoja, { en: Date.now(), filas: resultado });
      return resultado;
    },

    async agregar(hoja, fila) {
      const res = await api.spreadsheets.values.get({
        spreadsheetId,
        range: `${hoja}!1:1`,
      });
      const encabezados = (res.data.values?.[0] ?? []) as string[];

      await conReintento(() =>
        api.spreadsheets.values.append({
          spreadsheetId,
          range: hoja,
          valueInputOption: 'RAW',
          requestBody: { values: [encabezados.map((c) => fila[c] ?? '')] },
        }),
      );

      // Tras escribir, el cache queda obsoleto.
      cache.delete(hoja);
    },
  };
}
```

**Dos límites conocidos de este caché, aceptados a esta escala:**

1. **Es por instancia.** En Vercel cada función tiene su propia memoria, así
   que el ahorro de cuota es parcial. Suficiente para un grupo; si el curso
   crece, el reemplazo es Postgres, no un caché mejor.
2. **Hay una carrera teórica en el alta.** Dos logins simultáneos del mismo
   alumno podrían leer "no existe" a la vez y crear dos filas. Con 40 alumnos
   entrando a mano es improbable; si ocurre, se borra la fila sobrante en la
   planilla. No se añade bloqueo porque Sheets no ofrece transacciones y el
   remedio sería más frágil que el problema.

- [ ] **Paso 4: Implementar el alta de alumnos**

`plataforma/src/lib/alumnos.ts`:

```ts
import { randomUUID } from 'node:crypto';
import type { Fila, Hojas } from './sheets';

export type Rol = 'alumno' | 'docente';

export type Alumno = {
  email: string;
  nombre: string;
  reporter_id: string;
  rol: Rol;
  alta: string;
};

function aAlumno(f: Fila): Alumno {
  return {
    email: f.email,
    nombre: f.nombre,
    reporter_id: f.reporter_id,
    rol: f.rol === 'docente' ? 'docente' : 'alumno',
    alta: f.alta,
  };
}

export async function buscarPorEmail(
  h: Hojas,
  email: string,
): Promise<Alumno | null> {
  const filas = await h.leer('alumnos');
  const f = filas.find(
    (x) => x.email?.toLowerCase() === email.toLowerCase(),
  );
  return f ? aAlumno(f) : null;
}

export async function buscarPorReporterId(
  h: Hojas,
  id: string,
): Promise<Alumno | null> {
  const filas = await h.leer('alumnos');
  const f = filas.find((x) => x.reporter_id === id);
  return f ? aAlumno(f) : null;
}

/** Idempotente: dos logins seguidos no crean dos filas. */
export async function altaSiNoExiste(
  h: Hojas,
  email: string,
  nombre: string,
): Promise<Alumno> {
  const existente = await buscarPorEmail(h, email);
  if (existente) return existente;

  const nuevo: Alumno = {
    email: email.toLowerCase(),
    nombre,
    reporter_id: randomUUID().replace(/-/g, ''),
    rol: 'alumno',
    alta: new Date().toISOString(),
  };
  await h.agregar('alumnos', nuevo as unknown as Fila);
  return nuevo;
}
```

- [ ] **Paso 5: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/alumnos.test.ts
```

Esperado: PASS, 7 tests.

- [ ] **Paso 6: Preparar la hoja de cálculo**

Crear un documento de Google Sheets con tres hojas —`alumnos`, `entregas`,
`desbloqueos`— y poner en la fila 1 de cada una exactamente estos encabezados:

```
alumnos:      email | nombre | reporter_id | rol | alta
entregas:     fecha | email | unidad | archivo | total | pasados | fallados | nota | intentos
desbloqueos:  fecha | email | unidad | motivo | docente
```

Compartir el documento con el correo de la cuenta de servicio, con permiso de
edición. Sin ese paso la API responde 403 aunque las credenciales sean
correctas.

- [ ] **Paso 7: Enganchar el alta al login**

En `plataforma/src/auth.ts`, dentro del callback `signIn`, después de validar el
dominio:

```ts
async signIn({ profile }) {
  if (!DOMINIO) {
    console.error('DOMINIO_PERMITIDO sin definir: se rechaza todo login');
    return false;
  }
  if (!dominioPermitido(profile?.email, DOMINIO)) return false;

  await altaSiNoExiste(
    hojasDeGoogle(),
    profile!.email as string,
    (profile!.name as string) ?? '',
  );
  return true;
},
```

Añadir arriba: `import { altaSiNoExiste } from '@/lib/alumnos';` y
`import { hojasDeGoogle } from '@/lib/sheets';`.

- [ ] **Paso 8: Verificar de extremo a extremo**

Entrar con una cuenta del dominio. Esperado: aparece una fila nueva en la hoja
`alumnos` con un `reporter_id` de 32 caracteres. Volver a entrar: **no** debe
aparecer una segunda fila.

- [ ] **Paso 9: Commit**

```bash
git add plataforma/src/lib/sheets.ts plataforma/src/lib/alumnos.ts plataforma/src/lib/alumnos.test.ts plataforma/src/auth.ts plataforma/package.json
git commit -m "Agregar acceso a Google Sheets y alta automatica de alumnos"
```

**🎉 Fin de la Fase 2.** Login institucional con registro en la planilla.

---

# FASE 3 — Homework y notas

## Tarea 6: ZIP del homework con la identidad dentro

**Archivos:**
- Crear: `plataforma/src/lib/zip.ts`
- Crear: `plataforma/src/reporter/plantilla/index.js`
- Crear: `plataforma/src/reporter/plantilla/README.md`
- Test: `plataforma/src/lib/zip.test.ts`
- Crear: `plataforma/src/app/api/homework/[id]/route.ts`

**Interfaces:**
- Consume: `Unidad`, `listarUnidades()` de la Tarea 2.
- Produce:

```ts
export async function armarZipHomework(
  unidad: Unidad,
  reporterId: string,
  urlBase: string,
): Promise<Buffer>;
```

- [ ] **Paso 1: Escribir el test**

```bash
cd plataforma && npm install jszip
```

`plataforma/src/lib/zip.test.ts`:

```ts
import JSZip from 'jszip';
import { armarZipHomework } from './zip';
import { listarUnidades } from './lecciones';

const unidad = listarUnidades().find((u) => u.id === '02-JS-I')!;

describe('armarZipHomework', () => {
  it('incluye el config.json con el id del alumno', async () => {
    const buf = await armarZipHomework(unidad, 'abc123', 'https://p.edu');
    const zip = await JSZip.loadAsync(buf);
    const cfg = JSON.parse(
      await zip.file('.reporter/config.json')!.async('string'),
    );
    expect(cfg.id).toBe('abc123');
    expect(cfg.url).toBe('https://p.edu/api/resultado');
    expect(cfg.unidad).toBe('02-JS-I');
  });

  it('incluye el reporter y el package.json que lo engancha', async () => {
    const buf = await armarZipHomework(unidad, 'abc123', 'https://p.edu');
    const zip = await JSZip.loadAsync(buf);
    expect(zip.file('.reporter/index.js')).not.toBeNull();

    const pkg = JSON.parse(await zip.file('package.json')!.async('string'));
    expect(pkg.scripts.test).toContain('--testResultsProcessor');
    expect(pkg.scripts.test).toContain('./.reporter/index.js');
  });

  it('incluye los archivos del homework del alumno', async () => {
    const buf = await armarZipHomework(unidad, 'abc123', 'https://p.edu');
    const zip = await JSZip.loadAsync(buf);
    expect(zip.file('homework.js')).not.toBeNull();
    expect(zip.file('tests/JSI.test.js')).not.toBeNull();
  });

  it('da ids distintos a dos alumnos para la misma unidad', async () => {
    const a = await JSZip.loadAsync(
      await armarZipHomework(unidad, 'aaa', 'https://p.edu'),
    );
    const b = await JSZip.loadAsync(
      await armarZipHomework(unidad, 'bbb', 'https://p.edu'),
    );
    const ca = JSON.parse(await a.file('.reporter/config.json')!.async('string'));
    const cb = JSON.parse(await b.file('.reporter/config.json')!.async('string'));
    expect(ca.id).not.toBe(cb.id);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/zip.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 3: Escribir el reporter**

Adaptado del original del curso (commit `4a00a18`), con dos cambios: la
identidad sale de `config.json` en vez de `~/.gitconfig`, y un fallo de red
nunca interrumpe los tests.

`plataforma/src/reporter/plantilla/index.js`:

```js
const fs = require('fs');
const path = require('path');

/**
 * Procesador de resultados de Jest. Envia el resultado a la plataforma y
 * DEVUELVE SIEMPRE los resultados intactos: un problema de red no puede
 * impedir que el alumno vea si su codigo pasa.
 */
module.exports = function reportar(resultados) {
  try {
    const cfg = JSON.parse(
      fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'),
    );

    const intentos = contarIntento();

    const envios = resultados.testResults.map((suite) => {
      const cuerpo = {
        id: cfg.id,
        unidad: cfg.unidad,
        archivo: path.basename(suite.testFilePath),
        total: suite.numPassingTests + suite.numFailingTests + suite.numPendingTests,
        pasados: suite.numPassingTests,
        fallados: suite.numFailingTests,
        intentos,
      };

      return fetch(cfg.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
        .then(async (res) => {
          if (res.status === 401) {
            console.log(
              '\n⚠️  La plataforma no reconoce este homework.\n' +
                '   Vuelve a descargarlo desde tu cuenta.\n',
            );
            return;
          }
          if (!res.ok) {
            console.log(`\n⚠️  La plataforma respondio ${res.status}. Nota no registrada.\n`);
            return;
          }
          const datos = await res.json();
          console.log(`\n📤 Enviado. Tu nota en esta unidad: ${datos.nota}/100\n`);
        })
        .catch(() => {
          console.log('\n⚠️  Sin conexion: la nota no se registro. Tus tests si corrieron.\n');
        });
    });

    // No se espera a que terminen: Jest ya tiene su resultado.
    Promise.all(envios).catch(() => {});
  } catch (error) {
    console.log('\n⚠️  No se pudo enviar el resultado:', error.message, '\n');
  }

  return resultados;
};

/** Lleva la cuenta local de cuantas veces se corrio npm test. */
function contarIntento() {
  const ruta = path.join(__dirname, 'intentos.json');
  let n = 0;
  try {
    n = JSON.parse(fs.readFileSync(ruta, 'utf8')).n || 0;
  } catch {
    n = 0;
  }
  n += 1;
  try {
    fs.writeFileSync(ruta, JSON.stringify({ n }));
  } catch {
    // si no se puede escribir, se sigue igual
  }
  return n;
}
```

`plataforma/src/reporter/plantilla/README.md`:

```markdown
# Cómo entregar este homework

1. `npm install`
2. Resuelve los ejercicios en `homework.js`.
3. `npm test`

Al correr los tests, tu resultado se envía solo a la plataforma y ahí ves tu
nota. No hace falta que subas nada.

**No edites `.reporter/config.json`**: contiene tu identificador. Si lo
pierdes, vuelve a descargar el homework desde tu cuenta.
```

- [ ] **Paso 4: Implementar el armado del ZIP**

`plataforma/src/lib/zip.ts`:

```ts
import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import type { Unidad } from './lecciones';

const PLANTILLA = path.join(process.cwd(), 'src', 'reporter', 'plantilla');

/** Agrega recursivamente el contenido de un directorio al zip. */
function agregarDirectorio(zip: JSZip, dir: string, prefijo = ''): void {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);
    const destino = prefijo ? `${prefijo}/${entrada.name}` : entrada.name;
    if (entrada.isDirectory()) {
      agregarDirectorio(zip, ruta, destino);
    } else {
      zip.file(destino, fs.readFileSync(ruta));
    }
  }
}

export async function armarZipHomework(
  unidad: Unidad,
  reporterId: string,
  urlBase: string,
): Promise<Buffer> {
  const zip = new JSZip();

  // 1. Los archivos del ejercicio
  const dirHomework = path.join(path.dirname(unidad.rutaMd), 'homework');
  agregarDirectorio(zip, dirHomework);

  // 2. El reporter
  zip.file('.reporter/index.js', fs.readFileSync(path.join(PLANTILLA, 'index.js')));
  zip.file('COMO-ENTREGAR.md', fs.readFileSync(path.join(PLANTILLA, 'README.md')));

  // 3. La identidad del alumno
  zip.file(
    '.reporter/config.json',
    JSON.stringify(
      { id: reporterId, unidad: unidad.id, url: `${urlBase}/api/resultado` },
      null,
      2,
    ),
  );

  // 4. package.json que engancha el reporter a npm test
  zip.file(
    'package.json',
    JSON.stringify(
      {
        name: `homework-${unidad.id.toLowerCase()}`,
        version: '1.0.0',
        scripts: {
          test: 'jest --testResultsProcessor ./.reporter/index.js',
        },
        devDependencies: { jest: '^27.5.1' },
      },
      null,
      2,
    ),
  );

  return zip.generateAsync({ type: 'nodebuffer' });
}
```

- [ ] **Paso 5: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/zip.test.ts
```

Esperado: PASS, 4 tests.

- [ ] **Paso 6: Ruta de descarga**

`plataforma/src/app/api/homework/[id]/route.ts`:

```ts
import { auth } from '@/auth';
import { listarUnidades } from '@/lib/lecciones';
import { buscarPorEmail } from '@/lib/alumnos';
import { hojasDeGoogle } from '@/lib/sheets';
import { armarZipHomework } from '@/lib/zip';

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const sesion = await auth();
  if (!sesion?.user?.email) {
    return new Response('No autorizado', { status: 401 });
  }

  const { id } = await props.params;
  const unidad = listarUnidades().find((u) => u.id === id);
  if (!unidad || !unidad.tieneHomework) {
    return new Response('Unidad sin homework', { status: 404 });
  }

  const alumno = await buscarPorEmail(hojasDeGoogle(), sesion.user.email);
  if (!alumno) return new Response('Alumno no registrado', { status: 403 });

  const zip = await armarZipHomework(
    unidad,
    alumno.reporter_id,
    process.env.NEXT_PUBLIC_URL_BASE!,
  );

  return new Response(new Uint8Array(zip), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${unidad.id}-homework.zip"`,
    },
  });
}
```

- [ ] **Paso 7: Probar el circuito completo a mano**

Con sesión iniciada, descargar `http://localhost:3000/api/homework/02-JS-I`.
Descomprimir en una carpeta aparte y:

```bash
npm install && npm test
```

Esperado: los 35 tests corren (fallan, porque el homework está sin resolver) y
la consola muestra el aviso del reporter. Todavía no hay nota: falta la
Tarea 7.

- [ ] **Paso 8: Commit**

```bash
git add plataforma/src/lib/zip.ts plataforma/src/lib/zip.test.ts plataforma/src/reporter plataforma/src/app/api/homework plataforma/package.json
git commit -m "Agregar generacion del ZIP de homework con identidad embebida"
```

---

## Tarea 7: Registro de entregas y cálculo de nota

**Archivos:**
- Crear: `plataforma/src/lib/entregas.ts`
- Test: `plataforma/src/lib/entregas.test.ts`
- Crear: `plataforma/src/app/api/resultado/route.ts`

**Interfaces:**
- Consume: `Hojas` de la Tarea 5.
- Produce:

```ts
export type Entrega = {
  fecha: string; email: string; unidad: string; archivo: string;
  total: number; pasados: number; fallados: number; nota: number; intentos: number;
};
export function calcularNota(pasados: number, total: number): number;
export function registrar(
  h: Hojas,
  datos: Omit<Entrega, 'fecha' | 'nota'>,
): Promise<Entrega>;
export function listarPorEmail(h: Hojas, email: string): Promise<Entrega[]>;
export function mejorPorUnidad(entregas: Entrega[]): Map<string, Entrega>;
```

- [ ] **Paso 1: Escribir el test**

`plataforma/src/lib/entregas.test.ts`:

```ts
import type { Fila, Hojas } from './sheets';
import {
  calcularNota, registrar, listarPorEmail, mejorPorUnidad, type Entrega,
} from './entregas';

function hojasFalsas(): Hojas {
  const datos: Record<string, Fila[]> = { entregas: [] };
  return {
    async leer(hoja) { return datos[hoja] ?? []; },
    async agregar(hoja, fila) { (datos[hoja] ??= []).push(fila); },
  };
}

function entrega(p: Partial<Entrega> = {}): Entrega {
  return {
    fecha: '2026-09-05T10:00:00Z', email: 'ana@u.edu', unidad: '02-JS-I',
    archivo: 'JSI.test.js', total: 10, pasados: 5, fallados: 5, nota: 50,
    intentos: 1, ...p,
  };
}

describe('calcularNota', () => {
  it('da 100 con todos los tests pasados', () => {
    expect(calcularNota(35, 35)).toBe(100);
  });
  it('da 0 sin ninguno pasado', () => {
    expect(calcularNota(0, 35)).toBe(0);
  });
  it('redondea las parciales', () => {
    expect(calcularNota(1, 3)).toBe(33);
  });
  it('devuelve 0 si no hay tests, sin dividir por cero', () => {
    expect(calcularNota(0, 0)).toBe(0);
  });
});

describe('registrar', () => {
  it('guarda la entrega con su nota y fecha', async () => {
    const h = hojasFalsas();
    const e = await registrar(h, {
      email: 'ana@u.edu', unidad: '02-JS-I', archivo: 'JSI.test.js',
      total: 35, pasados: 35, fallados: 0, intentos: 4,
    });
    expect(e.nota).toBe(100);
    expect(e.fecha).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(await h.leer('entregas')).toHaveLength(1);
  });

  it('anade una fila por envio, sin sobrescribir el historial', async () => {
    const h = hojasFalsas();
    const base = {
      email: 'ana@u.edu', unidad: '02-JS-I', archivo: 'JSI.test.js',
      fallados: 0, intentos: 1,
    };
    await registrar(h, { ...base, total: 35, pasados: 10 });
    await registrar(h, { ...base, total: 35, pasados: 35 });
    expect(await h.leer('entregas')).toHaveLength(2);
  });
});

describe('mejorPorUnidad', () => {
  it('se queda con la entrega de mayor nota', () => {
    const mejor = mejorPorUnidad([
      entrega({ pasados: 5, nota: 50 }),
      entrega({ pasados: 10, nota: 100 }),
      entrega({ pasados: 7, nota: 70 }),
    ]);
    expect(mejor.get('02-JS-I')!.nota).toBe(100);
  });

  it('separa las unidades', () => {
    const mejor = mejorPorUnidad([
      entrega({ unidad: '02-JS-I', nota: 100 }),
      entrega({ unidad: '03-JS-II', nota: 40 }),
    ]);
    expect(mejor.size).toBe(2);
    expect(mejor.get('03-JS-II')!.nota).toBe(40);
  });

  it('devuelve un mapa vacio sin entregas', () => {
    expect(mejorPorUnidad([]).size).toBe(0);
  });
});

describe('listarPorEmail', () => {
  it('filtra por alumno', async () => {
    const h = hojasFalsas();
    await registrar(h, {
      email: 'ana@u.edu', unidad: '02-JS-I', archivo: 'a', total: 1,
      pasados: 1, fallados: 0, intentos: 1,
    });
    await registrar(h, {
      email: 'luis@u.edu', unidad: '02-JS-I', archivo: 'a', total: 1,
      pasados: 1, fallados: 0, intentos: 1,
    });
    expect(await listarPorEmail(h, 'ana@u.edu')).toHaveLength(1);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/entregas.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 3: Implementar**

`plataforma/src/lib/entregas.ts`:

```ts
import type { Fila, Hojas } from './sheets';

export type Entrega = {
  fecha: string;
  email: string;
  unidad: string;
  archivo: string;
  total: number;
  pasados: number;
  fallados: number;
  nota: number;
  intentos: number;
};

/** Nota de 0 a 100. Sin tests devuelve 0: no se divide por cero. */
export function calcularNota(pasados: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((pasados / total) * 100);
}

export async function registrar(
  h: Hojas,
  datos: Omit<Entrega, 'fecha' | 'nota'>,
): Promise<Entrega> {
  const entrega: Entrega = {
    ...datos,
    fecha: new Date().toISOString(),
    nota: calcularNota(datos.pasados, datos.total),
  };
  await h.agregar('entregas', {
    fecha: entrega.fecha,
    email: entrega.email,
    unidad: entrega.unidad,
    archivo: entrega.archivo,
    total: String(entrega.total),
    pasados: String(entrega.pasados),
    fallados: String(entrega.fallados),
    nota: String(entrega.nota),
    intentos: String(entrega.intentos),
  });
  return entrega;
}

function aEntrega(f: Fila): Entrega {
  return {
    fecha: f.fecha,
    email: f.email,
    unidad: f.unidad,
    archivo: f.archivo,
    total: Number(f.total) || 0,
    pasados: Number(f.pasados) || 0,
    fallados: Number(f.fallados) || 0,
    nota: Number(f.nota) || 0,
    intentos: Number(f.intentos) || 0,
  };
}

export async function listarPorEmail(
  h: Hojas,
  email: string,
): Promise<Entrega[]> {
  const filas = await h.leer('entregas');
  return filas
    .filter((f) => f.email?.toLowerCase() === email.toLowerCase())
    .map(aEntrega);
}

/** La nota vigente de una unidad es la de su mejor entrega. */
export function mejorPorUnidad(entregas: Entrega[]): Map<string, Entrega> {
  const mejor = new Map<string, Entrega>();
  for (const e of entregas) {
    const actual = mejor.get(e.unidad);
    if (!actual || e.nota > actual.nota) mejor.set(e.unidad, e);
  }
  return mejor;
}
```

- [ ] **Paso 4: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/entregas.test.ts
```

Esperado: PASS, 10 tests.

- [ ] **Paso 5: Ruta que recibe el POST**

Es la única ruta sin sesión de navegador: se autentica con el `reporter_id`.

`plataforma/src/app/api/resultado/route.ts`:

```ts
import { buscarPorReporterId } from '@/lib/alumnos';
import { hojasDeGoogle } from '@/lib/sheets';
import { registrar } from '@/lib/entregas';

export async function POST(req: Request) {
  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await req.json();
  } catch {
    return Response.json({ error: 'JSON invalido' }, { status: 400 });
  }

  const { id, unidad, archivo, total, pasados, fallados, intentos } = cuerpo;

  if (typeof id !== 'string' || typeof unidad !== 'string') {
    return Response.json({ error: 'Faltan id o unidad' }, { status: 400 });
  }

  const hojas = hojasDeGoogle();
  const alumno = await buscarPorReporterId(hojas, id);
  if (!alumno) {
    return Response.json({ error: 'Identificador desconocido' }, { status: 401 });
  }

  const entrega = await registrar(hojas, {
    email: alumno.email,
    unidad,
    archivo: typeof archivo === 'string' ? archivo : '',
    total: Number(total) || 0,
    pasados: Number(pasados) || 0,
    fallados: Number(fallados) || 0,
    intentos: Number(intentos) || 1,
  });

  return Response.json({ nota: entrega.nota });
}
```

- [ ] **Paso 6: Probar el circuito completo**

Descargar el homework de `02-JS-I`, descomprimirlo, `npm install`, resolver
**una** función y correr `npm test`.

Esperado: la consola imprime `📤 Enviado. Tu nota en esta unidad: N/100` y
aparece una fila nueva en la hoja `entregas`.

Probar también el rechazo: editar `.reporter/config.json` poniendo un `id`
inventado y correr `npm test`. Esperado: el aviso de "vuelve a descargarlo" y
**ninguna** fila nueva.

- [ ] **Paso 7: Commit**

```bash
git add plataforma/src/lib/entregas.ts plataforma/src/lib/entregas.test.ts plataforma/src/app/api/resultado
git commit -m "Agregar registro de entregas y calculo de nota"
```

**🎉 Fin de la Fase 3.** Las notas llegan solas al correr los tests.

---

# FASE 4 — Gating y paneles

## Tarea 8: Máquina de estados del avance

**Archivos:**
- Crear: `plataforma/src/lib/avance.ts`
- Test: `plataforma/src/lib/avance.test.ts`

**Interfaces:**
- Consume: `Unidad` (Tarea 2), `Entrega` (Tarea 7), `Hojas` (Tarea 5).
- Produce:

```ts
export type Desbloqueo = {
  fecha: string; email: string; unidad: string; motivo: string; docente: string;
};
export type Estado = 'completa' | 'abierta' | 'bloqueada';
export type EstadoUnidad = { unidad: Unidad; estado: Estado; nota: number | null };
export function calcularAvance(
  unidades: Unidad[],
  entregas: Entrega[],
  desbloqueos: Desbloqueo[],
): EstadoUnidad[];
export function listarDesbloqueos(h: Hojas, email: string): Promise<Desbloqueo[]>;
export function desbloquear(
  h: Hojas, email: string, unidad: string, motivo: string, docente: string,
): Promise<void>;
```

- [ ] **Paso 1: Escribir el test**

Esta es la lógica de mayor riesgo del sistema: si se equivoca, un alumno queda
bloqueado sin motivo o avanza sin haber hecho nada.

`plataforma/src/lib/avance.test.ts`:

```ts
import { calcularAvance, type Desbloqueo } from './avance';
import type { Unidad } from './lecciones';
import type { Entrega } from './entregas';

function unidad(id: string, orden: number, manual = false): Unidad {
  return {
    id, modulo: 'Introductorio', titulo: id, orden,
    rutaMd: `/tmp/${id}/README.md`, tieneHomework: !manual, manual,
  };
}

function entrega(unidad: string, pasados: number, total: number): Entrega {
  return {
    fecha: '2026-09-05T10:00:00Z', email: 'ana@u.edu', unidad,
    archivo: 't.test.js', total, pasados, fallados: total - pasados,
    nota: total ? Math.round((pasados / total) * 100) : 0, intentos: 1,
  };
}

function desbloqueo(unidad: string): Desbloqueo {
  return {
    fecha: '2026-09-05T10:00:00Z', email: 'ana@u.edu', unidad,
    motivo: 'revisado a mano', docente: 'julian@u.edu',
  };
}

const UNIDADES = [unidad('A', 1), unidad('B', 2), unidad('C', 3)];

describe('calcularAvance', () => {
  it('abre la primera unidad y bloquea el resto sin entregas', () => {
    const r = calcularAvance(UNIDADES, [], []);
    expect(r.map((x) => x.estado)).toEqual(['abierta', 'bloqueada', 'bloqueada']);
  });

  it('no abre la siguiente si no se pasaron todos los tests', () => {
    const r = calcularAvance(UNIDADES, [entrega('A', 9, 10)], []);
    expect(r[0].estado).toBe('abierta');
    expect(r[0].nota).toBe(90);
    expect(r[1].estado).toBe('bloqueada');
  });

  it('abre la siguiente al pasar todos los tests', () => {
    const r = calcularAvance(UNIDADES, [entrega('A', 10, 10)], []);
    expect(r[0].estado).toBe('completa');
    expect(r[1].estado).toBe('abierta');
    expect(r[2].estado).toBe('bloqueada');
  });

  it('usa la mejor entrega, no la ultima', () => {
    const r = calcularAvance(
      UNIDADES,
      [entrega('A', 10, 10), entrega('A', 3, 10)],
      [],
    );
    expect(r[0].estado).toBe('completa');
    expect(r[0].nota).toBe(100);
  });

  it('encadena varias unidades completas', () => {
    const r = calcularAvance(
      UNIDADES,
      [entrega('A', 10, 10), entrega('B', 5, 5)],
      [],
    );
    expect(r.map((x) => x.estado)).toEqual(['completa', 'completa', 'abierta']);
  });

  it('una unidad manual solo se completa con desbloqueo', () => {
    const us = [unidad('A', 1, true), unidad('B', 2)];
    expect(calcularAvance(us, [], [])[1].estado).toBe('bloqueada');
    expect(calcularAvance(us, [], [desbloqueo('A')])[1].estado).toBe('abierta');
  });

  it('el desbloqueo manual destraba a un alumno atascado', () => {
    const r = calcularAvance(UNIDADES, [entrega('A', 1, 10)], [desbloqueo('B')]);
    expect(r[1].estado).toBe('abierta');
  });

  it('una unidad manual no exige nota', () => {
    const us = [unidad('A', 1, true)];
    expect(calcularAvance(us, [], [desbloqueo('A')])[0].nota).toBeNull();
  });

  it('no rompe con la lista de unidades vacia', () => {
    expect(calcularAvance([], [], [])).toEqual([]);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd plataforma && npx jest src/lib/avance.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 3: Implementar**

`plataforma/src/lib/avance.ts`:

```ts
import type { Fila, Hojas } from './sheets';
import type { Unidad } from './lecciones';
import { mejorPorUnidad, type Entrega } from './entregas';

export type Desbloqueo = {
  fecha: string;
  email: string;
  unidad: string;
  motivo: string;
  docente: string;
};

export type Estado = 'completa' | 'abierta' | 'bloqueada';

export type EstadoUnidad = {
  unidad: Unidad;
  estado: Estado;
  nota: number | null;
};

/**
 * Recorre las unidades en orden. Una unidad esta abierta si es la primera,
 * si la anterior esta completa, o si tiene un desbloqueo manual.
 *
 * Completar exige el 100% de los tests. Las unidades sin tests (manual)
 * solo se completan con un desbloqueo del docente: de otro modo el curso
 * quedaria trabado en la primera, que es 01a-Git y no tiene tests.
 */
export function calcularAvance(
  unidades: Unidad[],
  entregas: Entrega[],
  desbloqueos: Desbloqueo[],
): EstadoUnidad[] {
  const mejor = mejorPorUnidad(entregas);
  const desbloqueadas = new Set(desbloqueos.map((d) => d.unidad));

  const resultado: EstadoUnidad[] = [];
  let anteriorCompleta = true; // la primera siempre esta abierta

  for (const unidad of unidades) {
    const e = mejor.get(unidad.id);

    const completa = unidad.manual
      ? desbloqueadas.has(unidad.id)
      : Boolean(e && e.total > 0 && e.pasados === e.total);

    const abierta = anteriorCompleta || desbloqueadas.has(unidad.id);

    resultado.push({
      unidad,
      estado: completa ? 'completa' : abierta ? 'abierta' : 'bloqueada',
      nota: unidad.manual ? null : (e?.nota ?? null),
    });

    anteriorCompleta = completa;
  }

  return resultado;
}

export async function listarDesbloqueos(
  h: Hojas,
  email: string,
): Promise<Desbloqueo[]> {
  const filas = await h.leer('desbloqueos');
  return filas
    .filter((f) => f.email?.toLowerCase() === email.toLowerCase())
    .map((f) => ({
      fecha: f.fecha, email: f.email, unidad: f.unidad,
      motivo: f.motivo, docente: f.docente,
    }));
}

export async function desbloquear(
  h: Hojas,
  email: string,
  unidad: string,
  motivo: string,
  docente: string,
): Promise<void> {
  await h.agregar('desbloqueos', {
    fecha: new Date().toISOString(),
    email, unidad, motivo, docente,
  } as unknown as Fila);
}
```

- [ ] **Paso 4: Ejecutar y ver que pasa**

```bash
cd plataforma && npx jest src/lib/avance.test.ts
```

Esperado: PASS, 9 tests.

- [ ] **Paso 5: Commit**

```bash
git add plataforma/src/lib/avance.ts plataforma/src/lib/avance.test.ts
git commit -m "Agregar maquina de estados del avance por unidad"
```

---

## Tarea 9: Marcar las unidades sin tests

**Archivos:**
- Modificar: `Introductorio/01a-Git/README.json`
- Modificar: `Introductorio/08-HTML/README.json`
- Modificar: `Introductorio/09-CSS-Positioning/README.json`

**Interfaces:**
- Consume: el campo `manual` que `listarUnidades()` ya lee (Tarea 2).

Estas tres unidades no tienen tests automáticos: son visuales o de proceso.
Sin marcarlas, el curso quedaría bloqueado en `01a-Git` para todo el mundo,
porque es la primera y nunca podría completarse.

- [ ] **Paso 1: Comprobar cuáles carecen de tests**

```bash
cd /home/juliandev/Instituto
for d in Introductorio/*/; do
  [ -d "$d/homework" ] || continue
  n=$(find "$d/homework" -name '*.test.js' | wc -l)
  [ "$n" -eq 0 ] && echo "sin tests: $d"
done
```

Esperado: `01a-Git`, `08-HTML`, `09-CSS-Positioning`. Si aparece otra, se
marca igual.

- [ ] **Paso 2: Añadir la clave**

Es un cambio aditivo: ni Eleventy ni Jest leen `manual`.

```bash
cd /home/juliandev/Instituto
for u in 01a-Git 08-HTML 09-CSS-Positioning; do
  f="Introductorio/$u/README.json"
  node -e "
    const fs=require('fs');
    const j=JSON.parse(fs.readFileSync('$f','utf8'));
    j.manual=true;
    fs.writeFileSync('$f', JSON.stringify(j,null,2)+'\n');
  "
  echo "marcada: $u"
done
```

- [ ] **Paso 3: Verificar que siguen siendo JSON válido**

```bash
cd /home/juliandev/Instituto
for u in 01a-Git 08-HTML 09-CSS-Positioning; do
  node -e "console.log('$u ->', require('./Introductorio/$u/README.json').manual)"
done
```

Esperado: `true` en las tres.

- [ ] **Paso 4: Verificar que el sitio de Eleventy sigue construyendo**

```bash
cd /home/juliandev/Instituto/Introductorio && npx @11ty/eleventy 2>&1 | tail -2
```

Esperado: construye sin errores. La clave nueva se ignora.

- [ ] **Paso 5: Commit**

```bash
git add Introductorio/01a-Git/README.json Introductorio/08-HTML/README.json Introductorio/09-CSS-Positioning/README.json
git commit -m "Marcar como manuales las unidades sin tests automaticos"
```

---

## Tarea 10: Panel del alumno

**Archivos:**
- Crear: `plataforma/src/app/mi-avance/page.tsx`
- Modificar: `plataforma/src/app/unidad/[id]/page.tsx`

**Interfaces:**
- Consume: `calcularAvance()`, `listarDesbloqueos()`, `listarPorEmail()`,
  `listarUnidades()`.

- [ ] **Paso 1: Página de avance**

`plataforma/src/app/mi-avance/page.tsx`:

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { listarUnidades } from '@/lib/lecciones';
import { listarPorEmail } from '@/lib/entregas';
import { calcularAvance, listarDesbloqueos } from '@/lib/avance';
import { hojasDeGoogle } from '@/lib/sheets';

const ICONO = { completa: '✅', abierta: '📖', bloqueada: '🔒' } as const;

export default async function MiAvance() {
  const sesion = await auth();
  if (!sesion?.user?.email) redirect('/login');

  const hojas = hojasDeGoogle();
  const [entregas, desbloqueos] = await Promise.all([
    listarPorEmail(hojas, sesion.user.email),
    listarDesbloqueos(hojas, sesion.user.email),
  ]);
  const avance = calcularAvance(listarUnidades(), entregas, desbloqueos);
  const completas = avance.filter((a) => a.estado === 'completa').length;

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver</Link>
      <h1>Mi avance</h1>
      <p>
        Has completado <strong>{completas}</strong> de {avance.length} unidades.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th>Unidad</th>
            <th>Estado</th>
            <th>Nota</th>
          </tr>
        </thead>
        <tbody>
          {avance.map(({ unidad, estado, nota }) => (
            <tr key={unidad.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.4rem 0' }}>
                {estado === 'bloqueada' ? (
                  unidad.titulo
                ) : (
                  <Link href={`/unidad/${unidad.id}`}>{unidad.titulo}</Link>
                )}
              </td>
              <td>{ICONO[estado]} {estado}</td>
              <td>{nota === null ? '—' : `${nota}/100`}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Historial de entregas</h2>
      {entregas.length === 0 && <p>Todavía no has entregado nada.</p>}
      <ul>
        {entregas
          .slice()
          .reverse()
          .map((e, i) => (
            <li key={i}>
              {new Date(e.fecha).toLocaleString('es')} — {e.unidad}:{' '}
              {e.pasados}/{e.total} ({e.nota}/100)
            </li>
          ))}
      </ul>
    </main>
  );
}
```

El historial cumple una función de seguridad, no solo informativa: si alguien
entregara con su identificador, el alumno vería una entrega que no hizo.

- [ ] **Paso 2: Botón de descarga y bloqueo en la página de unidad**

Reemplazar el contenido de `plataforma/src/app/unidad/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { auth } from '@/auth';
import { leerUnidad, listarUnidades } from '@/lib/lecciones';
import { listarPorEmail } from '@/lib/entregas';
import { calcularAvance, listarDesbloqueos } from '@/lib/avance';
import { hojasDeGoogle } from '@/lib/sheets';

export default async function PaginaUnidad(props: {
  params: Promise<{ id: string }>;
}) {
  const sesion = await auth();
  if (!sesion?.user?.email) redirect('/login');

  const { id } = await props.params;
  const datos = leerUnidad(id);
  if (!datos) notFound();

  const hojas = hojasDeGoogle();
  const [entregas, desbloqueos] = await Promise.all([
    listarPorEmail(hojas, sesion.user.email),
    listarDesbloqueos(hojas, sesion.user.email),
  ]);
  const avance = calcularAvance(listarUnidades(), entregas, desbloqueos);
  const estado = avance.find((a) => a.unidad.id === id)!;

  if (estado.estado === 'bloqueada') {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1>🔒 {datos.unidad.titulo}</h1>
        <p>
          Esta unidad se abre cuando completes la anterior. Revisa{' '}
          <Link href="/mi-avance">tu avance</Link> para ver qué te falta.
        </p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/mi-avance">← Mi avance</Link>
      <h1>{datos.unidad.titulo}</h1>

      {datos.unidad.tieneHomework && (
        <p style={{ padding: '1rem', background: '#eef', borderRadius: 8 }}>
          <a href={`/api/homework/${id}`}>📦 Descargar el homework</a>
          <br />
          <small>
            Descomprime, corre <code>npm install</code>, resuelve y{' '}
            <code>npm test</code>. Tu nota llega sola.
          </small>
        </p>
      )}

      <article>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {datos.markdown}
        </ReactMarkdown>
      </article>
    </main>
  );
}
```

**Nota:** al requerir sesión, esta página deja de poder prerenderizarse; hay
que quitar el `generateStaticParams` que tenía en la Tarea 3.

- [ ] **Paso 3: Verificar el gating en el navegador**

Con una cuenta de alumno sin entregas: la primera unidad se abre, la segunda
muestra el candado. Tras completar la primera al 100%, la segunda se abre.

- [ ] **Paso 4: Commit**

```bash
git add plataforma/src/app/mi-avance plataforma/src/app/unidad
git commit -m "Agregar panel del alumno y bloqueo de unidades"
```

---

## Tarea 11: Panel del docente

**Archivos:**
- Crear: `plataforma/src/app/docente/page.tsx`
- Crear: `plataforma/src/app/docente/acciones.ts`

**Interfaces:**
- Consume: `desbloquear()`, `calcularAvance()`, `listarUnidades()`,
  `buscarPorEmail()`.

- [ ] **Paso 1: Acción de desbloqueo**

`plataforma/src/app/docente/acciones.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { buscarPorEmail } from '@/lib/alumnos';
import { hojasDeGoogle } from '@/lib/sheets';
import { desbloquear } from '@/lib/avance';

export async function desbloquearUnidad(formData: FormData) {
  const sesion = await auth();
  if (!sesion?.user?.email) throw new Error('No autorizado');

  const hojas = hojasDeGoogle();
  const quien = await buscarPorEmail(hojas, sesion.user.email);
  if (quien?.rol !== 'docente') throw new Error('Solo el docente puede desbloquear');

  const email = String(formData.get('email'));
  const unidad = String(formData.get('unidad'));
  const motivo = String(formData.get('motivo') ?? '');
  if (!email || !unidad) return;

  await desbloquear(hojas, email, unidad, motivo, quien.email);
  revalidatePath('/docente');
}
```

La comprobación de rol va **dentro** de la acción, no solo en la página: una
Server Action es un endpoint y se puede invocar directamente.

- [ ] **Paso 2: Tabla del grupo**

`plataforma/src/app/docente/page.tsx`:

```tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { buscarPorEmail } from '@/lib/alumnos';
import { hojasDeGoogle } from '@/lib/sheets';
import { listarUnidades } from '@/lib/lecciones';
import { calcularAvance } from '@/lib/avance';
import { desbloquearUnidad } from './acciones';

export default async function PanelDocente() {
  const sesion = await auth();
  if (!sesion?.user?.email) redirect('/login');

  const hojas = hojasDeGoogle();
  const quien = await buscarPorEmail(hojas, sesion.user.email);
  if (quien?.rol !== 'docente') {
    return <main style={{ padding: '2rem' }}><h1>Solo para docentes</h1></main>;
  }

  const unidades = listarUnidades();

  // Las tres hojas se leen UNA vez y se agrupan en memoria.
  // Llamar a listarPorEmail() dentro del bucle haria dos lecturas de hoja
  // completa por alumno: con 40 alumnos son 80 peticiones en un solo render
  // y la cuota de Sheets es de unas 60 por minuto.
  const [filasAlumnos, filasEntregas, filasDesbloqueos] = await Promise.all([
    hojas.leer('alumnos'),
    hojas.leer('entregas'),
    hojas.leer('desbloqueos'),
  ]);

  const porEmail = <T extends { email?: string }>(filas: T[], email: string) =>
    filas.filter((f) => f.email?.toLowerCase() === email.toLowerCase());

  const grupo = filasAlumnos
    .filter((f) => f.rol !== 'docente')
    .map((a) => {
      const entregas = porEmail(filasEntregas, a.email).map((f) => ({
        fecha: f.fecha, email: f.email, unidad: f.unidad, archivo: f.archivo,
        total: Number(f.total) || 0, pasados: Number(f.pasados) || 0,
        fallados: Number(f.fallados) || 0, nota: Number(f.nota) || 0,
        intentos: Number(f.intentos) || 0,
      }));
      const desbloqueos = porEmail(filasDesbloqueos, a.email).map((f) => ({
        fecha: f.fecha, email: f.email, unidad: f.unidad,
        motivo: f.motivo, docente: f.docente,
      }));
      const avance = calcularAvance(unidades, entregas, desbloqueos);
      return {
        email: a.email,
        nombre: a.nombre,
        completas: avance.filter((x) => x.estado === 'completa').length,
        actual: avance.find((x) => x.estado === 'abierta')?.unidad.titulo ?? '—',
      };
    });

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver</Link>
      <h1>Avance del grupo</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th>Alumno</th>
            <th>Completadas</th>
            <th>Trabajando en</th>
          </tr>
        </thead>
        <tbody>
          {grupo.map((g) => (
            <tr key={g.email} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '0.4rem 0' }}>{g.nombre}<br />
                <small>{g.email}</small>
              </td>
              <td>{g.completas} / {unidades.length}</td>
              <td>{g.actual}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Desbloquear una unidad</h2>
      <p>
        <small>
          Para las unidades sin tests (Git, HTML, CSS) y para destrabar a quien
          se haya quedado atascado.
        </small>
      </p>
      <form action={desbloquearUnidad}>
        <select name="email" required defaultValue="">
          <option value="" disabled>Alumno</option>
          {grupo.map((g) => (
            <option key={g.email} value={g.email}>{g.nombre}</option>
          ))}
        </select>{' '}
        <select name="unidad" required defaultValue="">
          <option value="" disabled>Unidad</option>
          {unidades.map((u) => (
            <option key={u.id} value={u.id}>{u.titulo}</option>
          ))}
        </select>{' '}
        <input name="motivo" placeholder="Motivo" />{' '}
        <button type="submit">Desbloquear</button>
      </form>
    </main>
  );
}
```

- [ ] **Paso 3: Darse el rol de docente**

En la hoja `alumnos`, cambiar a mano el valor de la columna `rol` a `docente`
en la fila propia.

- [ ] **Paso 4: Verificar**

Entrar en `/docente`. Esperado: la tabla del grupo. Con una cuenta de alumno,
el mensaje "Solo para docentes". Desbloquear una unidad y comprobar que
aparece la fila en la hoja `desbloqueos` y que el alumno ya la ve abierta.

- [ ] **Paso 5: Ejecutar toda la batería**

```bash
cd plataforma && npx jest
```

Esperado: PASS en los 6 archivos de test (lecciones, dominio, alumnos, zip,
entregas, avance) — 43 tests.

- [ ] **Paso 6: Verificar el build**

```bash
cd plataforma && npm run build
```

Esperado: compila sin errores.

- [ ] **Paso 7: Commit**

```bash
git add plataforma/src/app/docente
git commit -m "Agregar panel del docente con desbloqueo manual"
```

**🎉 Fin de la Fase 4.**

---

## Puesta en producción

1. **Google Cloud** — crear proyecto, activar la API de Sheets, crear
   credenciales OAuth (tipo aplicación web) y una cuenta de servicio.
2. **Sheets** — crear el documento con las tres hojas y compartirlo con el
   correo de la cuenta de servicio, con permiso de edición.
3. **Vercel** — importar el repositorio y poner **Root Directory =
   `plataforma`**. Cargar todas las variables de `.env.local.ejemplo`.
4. **URIs de redirección** en Google Cloud: añadir
   `https://<dominio-vercel>/api/auth/callback/google`.
5. **`NEXT_PUBLIC_URL_BASE`** debe ser la URL pública, no `localhost`: es la
   que queda escrita dentro de cada ZIP.

**Verificar en un despliegue de preview antes de repartir nada:** descargar un
homework desde producción y comprobar que el ZIP trae los archivos. El fallo de
`outputFileTracingIncludes` (Tarea 1) no aparece en local — solo en Vercel.

---

## Trabajo futuro

- **Exámenes** con preguntas de opción múltiple, para las unidades sin tests.
- **Fechas límite** por unidad.
- **Postgres** si el curso pasa de un grupo: solo se reemplaza `sheets.ts`,
  porque el resto habla con la interfaz `Hojas`.
- **Jubilar Eleventy** una vez la plataforma sirva todo el contenido; eso
  eliminaría la dependencia de los paquetes del CDN externo
  (`docs/restricciones.md` §4).
