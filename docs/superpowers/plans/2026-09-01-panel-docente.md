# Panel Docente — Plan de Implementación

> **Para quien ejecute este plan:** usar `superpowers:subagent-driven-development`
> o `superpowers:executing-plans`. Los pasos usan casillas (`- [ ]`) para seguimiento.

**Objetivo:** Un panel web en Next.js 16 donde Julián publique las lecciones,
vea el avance de sus alumnos y les tome exámenes, sin ejecutar código ajeno
en su servidor.

**Arquitectura:** Los tests corren en GitHub Actions dentro del repositorio de
cada alumno; el workflow guarda el JSON de Jest en el propio repo y el panel
lo lee por la API de GitHub. El panel nunca ejecuta código de alumnos. Las
lecciones se leen del markdown que ya existe en `Introductorio/`. Los exámenes
se definen en JSON y las respuestas se guardan en SQLite.

**Stack:** Next.js 16.3.4 (App Router, TypeScript), better-sqlite3, Octokit,
react-markdown. Node ≥ 20.9.

**Spec:** este documento (el diseño se acordó en conversación; las decisiones
tomadas quedan en "Decisiones" más abajo).

## Restricciones globales

- **Next.js 16.3.4**, no 14 ni 15. Ver `docs/restricciones.md` §5.
- **Node ≥ 20.9.0**, TypeScript ≥ 5.1. Entorno actual: Node v22.16.0.
- **Las APIs de request son asíncronas.** `params`, `searchParams`, `cookies()`
  y `headers()` devuelven promesas y hay que esperarlas.
- **El panel NUNCA ejecuta código de alumnos.** Solo lee resultados.
- **Vive en `panel/`**, directorio aparte en la raíz del repo. No modifica el
  material de `Introductorio/` ni de los módulos.
- Textos de interfaz en español.

## Decisiones tomadas

| Decisión | Elección | Motivo |
| --- | --- | --- |
| Ejecución de tests | GitHub Actions | Sin riesgo de código arbitrario; enseña git |
| Persistencia | SQLite (`better-sqlite3`) | Un archivo, sin servidor. Suficiente para ~10 alumnos |
| Autenticación | **Ninguna en fase 1** | Grupo privado y pequeño. Ver "Riesgo aceptado" |
| Lecciones | Leídas del markdown existente | Una sola fuente de verdad |

**Riesgo aceptado:** sin login, cualquiera con el enlace puede ver el avance
de otros y responder un examen en nombre de otro. Es aceptable para un grupo
familiar. Si más adelante hace falta, se agrega GitHub OAuth (los alumnos ya
tendrán cuenta por el flujo de Actions).

---

## Estructura de archivos

```
panel/
├── package.json
├── next.config.ts
├── tsconfig.json
├── .env.local.ejemplo
├── datos/
│   ├── alumnos.json          # lista de alumnos (usuario GitHub + nombre)
│   └── panel.db              # SQLite, generado, ignorado por git
├── contenido/
│   └── examenes/
│       └── js-basico.json    # definición de un examen
└── src/
    ├── lib/
    │   ├── lecciones.ts      # lee Introductorio/**/README.{md,json}
    │   ├── alumnos.ts        # lee datos/alumnos.json
    │   ├── github.ts         # trae resultados de Jest desde GitHub
    │   ├── examenes.ts       # carga definiciones y corrige respuestas
    │   └── db.ts             # SQLite: esquema y consultas
    └── app/
        ├── layout.tsx
        ├── page.tsx                     # portada: índice de lecciones
        ├── leccion/[slug]/page.tsx      # una lección renderizada
        ├── avance/page.tsx              # tabla docente
        ├── alumno/[usuario]/page.tsx    # vista del alumno
        └── examen/[id]/page.tsx         # examen + resultado
```

**Responsabilidades:** cada archivo de `lib/` es la única puerta a su fuente
de datos. Las páginas no leen el disco ni llaman a GitHub directamente.

---

## Fases

El plan está en cuatro fases. **Cada fase deja software funcionando.** Se puede
parar después de cualquiera.

| Fase | Entrega | Tareas |
| --- | --- | --- |
| 1 | Panel con las lecciones navegables | 1–3 |
| 2 | Avance de alumnos vía GitHub Actions | 4–6 |
| 3 | Exámenes con autocorrección | 7–9 |
| 4 | Vista individual del alumno | 10 |

---

## FASE 1 — Panel con lecciones

### Tarea 1: Proyecto Next.js 16 en `panel/`

**Archivos:**
- Crear: `panel/` (proyecto completo)
- Crear: `panel/.env.local.ejemplo`
- Modificar: `.gitignore` (raíz)

**Interfaces:**
- Produce: proyecto Next.js arrancable con `npm run dev` en el puerto 3000.

- [ ] **Paso 1: Crear el proyecto**

Desde la raíz del repo. **`--disable-git` es obligatorio**: sin él,
create-next-app inicializa un repo anidado y git registraría `panel/` como
gitlink en vez de guardar los archivos (el mismo problema que tuvo este repo
con los 11 repos absorbidos — ver `PROCEDENCIA.md`).

```bash
npx create-next-app@16.3.4 panel \
  --typescript --app --eslint --src-dir \
  --no-tailwind --no-turbopack --import-alias "@/*" \
  --use-npm --skip-install --disable-git --yes
```

Verificado el 2026-09-01: genera `panel/src/app/`, Next 16.3.4 y React 19.2.8.

- [ ] **Paso 2: Instalar y verificar la versión**

```bash
cd panel && npm install
node -p "require('next/package.json').version"
```

Esperado: `16.3.4`. Si sale otra, corregir en `package.json` y reinstalar.

- [ ] **Paso 2b: Quitar los archivos que chocan con la raíz**

create-next-app genera su propio `CLAUDE.md` y `AGENTS.md`, que competirían
con el `CLAUDE.md` del repositorio. Se eliminan:

```bash
cd panel && rm -f CLAUDE.md AGENTS.md
```

Verificar además que no quedó repo anidado:

```bash
test -d panel/.git && echo "⚠️  BORRAR panel/.git" || echo "✅ sin repo anidado"
```

- [ ] **Paso 3: Ignorar artefactos**

Agregar al `.gitignore` de la raíz:

```gitignore
# ---- Panel docente ----
panel/.next/
panel/out/
panel/node_modules/
panel/datos/panel.db
panel/.env.local
```

- [ ] **Paso 4: Crear la plantilla de entorno**

`panel/.env.local.ejemplo`:

```bash
# Token de GitHub con permiso de lectura sobre los repos de los alumnos.
# Crear en: https://github.com/settings/tokens
# Permisos necesarios: repo:status, public_repo (o repo si son privados)
GITHUB_TOKEN=

# Usuario u organizacion donde viven los repos de los alumnos
GITHUB_ORG=juliandavidnunesfranco
```

- [ ] **Paso 5: Verificar que arranca**

```bash
cd panel && npm run dev
```

Esperado: sirve en `http://localhost:3000` sin errores.

- [ ] **Paso 6: Commit**

```bash
git add panel .gitignore
git commit -m "Crear proyecto base del panel docente en Next.js 16"
```

---

### Tarea 2: Lector de lecciones

**Archivos:**
- Crear: `panel/src/lib/lecciones.ts`
- Test: `panel/src/lib/lecciones.test.ts`

**Interfaces:**
- Produce:
  - `type Leccion = { slug: string; titulo: string; orden: number; rutaMd: string }`
  - `listarLecciones(): Leccion[]` — ordenadas por `orden`
  - `leerLeccion(slug: string): { leccion: Leccion; markdown: string } | null`

- [ ] **Paso 1: Instalar Jest**

```bash
cd panel && npm install -D jest @types/jest ts-jest
npx ts-jest config:init
```

- [ ] **Paso 2: Escribir el test que falla**

`panel/src/lib/lecciones.test.ts`:

```typescript
import { listarLecciones, leerLeccion } from './lecciones';

describe('listarLecciones', () => {
  it('devuelve las lecciones del curso ordenadas', () => {
    const lecciones = listarLecciones();
    expect(lecciones.length).toBeGreaterThan(5);
    const ordenes = lecciones.map((l) => l.orden);
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
  });

  it('incluye la leccion de CSS con su slug', () => {
    const css = listarLecciones().find((l) => l.titulo === 'CSS');
    expect(css).toBeDefined();
    expect(css!.slug).toBe('CSS');
  });
});

describe('leerLeccion', () => {
  it('devuelve el markdown de una leccion existente', () => {
    const r = leerLeccion('CSS');
    expect(r).not.toBeNull();
    expect(r!.markdown.length).toBeGreaterThan(100);
  });

  it('devuelve null si la leccion no existe', () => {
    expect(leerLeccion('no-existe')).toBeNull();
  });
});
```

- [ ] **Paso 3: Ejecutar y ver que falla**

```bash
cd panel && npx jest src/lib/lecciones.test.ts
```

Esperado: FAIL — `Cannot find module './lecciones'`.

- [ ] **Paso 4: Implementar**

`panel/src/lib/lecciones.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';

/** Raiz del repo, dos niveles arriba de panel/src/lib */
const RAIZ = path.resolve(process.cwd(), '..');
const CURSO = path.join(RAIZ, 'Introductorio');

export type Leccion = {
  slug: string;
  titulo: string;
  orden: number;
  rutaMd: string;
};

/**
 * Cada unidad del curso tiene README.json (metadatos) y README.md (contenido).
 * El slug sale del permalink: "/CSS/" -> "CSS".
 */
export function listarLecciones(): Leccion[] {
  if (!fs.existsSync(CURSO)) return [];

  const lecciones: Leccion[] = [];

  for (const carpeta of fs.readdirSync(CURSO)) {
    const rutaJson = path.join(CURSO, carpeta, 'README.json');
    const rutaMd = path.join(CURSO, carpeta, 'README.md');
    if (!fs.existsSync(rutaJson) || !fs.existsSync(rutaMd)) continue;

    const meta = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
    if (!meta.permalink || !meta.lessonTitle) continue;

    lecciones.push({
      slug: meta.permalink.replace(/^\/|\/$/g, ''),
      titulo: meta.lessonTitle,
      orden: meta.eleventyNavigation?.order ?? 999,
      rutaMd,
    });
  }

  return lecciones.sort((a, b) => a.orden - b.orden);
}

export function leerLeccion(
  slug: string,
): { leccion: Leccion; markdown: string } | null {
  const leccion = listarLecciones().find((l) => l.slug === slug);
  if (!leccion) return null;
  return { leccion, markdown: fs.readFileSync(leccion.rutaMd, 'utf8') };
}
```

- [ ] **Paso 5: Ejecutar y ver que pasa**

```bash
cd panel && npx jest src/lib/lecciones.test.ts
```

Esperado: PASS, 4 tests.

- [ ] **Paso 6: Commit**

```bash
git add panel/src/lib/lecciones.ts panel/src/lib/lecciones.test.ts panel/jest.config.js panel/package.json
git commit -m "Agregar lector de lecciones desde el markdown del curso"
```

---

### Tarea 3: Páginas de lecciones

**Archivos:**
- Modificar: `panel/src/app/page.tsx`
- Crear: `panel/src/app/leccion/[slug]/page.tsx`
- Modificar: `panel/src/app/layout.tsx`

**Interfaces:**
- Consume: `listarLecciones()`, `leerLeccion()` de la Tarea 2.

- [ ] **Paso 1: Instalar el renderizador de markdown**

```bash
cd panel && npm install react-markdown remark-gfm
```

- [ ] **Paso 2: Portada con el índice**

`panel/src/app/page.tsx`:

```tsx
import Link from 'next/link';
import { listarLecciones } from '@/lib/lecciones';

export default function Portada() {
  const lecciones = listarLecciones();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Curso Introductorio</h1>
      <p>Fundamentos de JavaScript, HTML y CSS.</p>

      <h2>Lecciones</h2>
      <ol>
        {lecciones.map((l) => (
          <li key={l.slug} style={{ margin: '0.5rem 0' }}>
            <Link href={`/leccion/${l.slug}`}>{l.titulo}</Link>
          </li>
        ))}
      </ol>

      <p style={{ marginTop: '2rem' }}>
        <Link href="/avance">Ver avance de los alumnos →</Link>
      </p>
    </main>
  );
}
```

- [ ] **Paso 3: Página de una lección**

`panel/src/app/leccion/[slug]/page.tsx`. **Ojo: `params` es una promesa en
Next 16.**

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { leerLeccion, listarLecciones } from '@/lib/lecciones';

export function generateStaticParams() {
  return listarLecciones().map((l) => ({ slug: l.slug }));
}

export default async function PaginaLeccion(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const datos = leerLeccion(slug);
  if (!datos) notFound();

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver al índice</Link>
      <h1>{datos.leccion.titulo}</h1>
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
cd panel && npm run dev
```

Abrir `http://localhost:3000`. Esperado: índice con 13 lecciones; al hacer
clic en "CSS" se ve el contenido renderizado.

- [ ] **Paso 5: Verificar el build de producción**

```bash
cd panel && npm run build
```

Esperado: compila sin errores de tipos.

- [ ] **Paso 6: Commit**

```bash
git add panel/src/app
git commit -m "Agregar portada e indice de lecciones al panel"
```

**🎉 Fin de la Fase 1.** Ya tienes un sitio propio con las lecciones.

---

## FASE 2 — Avance de alumnos

### Tarea 4: Workflow de GitHub Actions para los alumnos

**Archivos:**
- Crear: `Introductorio/.github/workflows/tests.yml`
- Crear: `panel/datos/alumnos.json`

**Interfaces:**
- Produce: cada repo de alumno publica `.resultados/ultimo.json` con la salida
  de `jest --json` tras cada push.

- [ ] **Paso 1: Crear el workflow**

`Introductorio/.github/workflows/tests.yml`:

```yaml
name: Corregir ejercicios

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: npm

      - run: npm install

      # continue-on-error: los tests van a fallar mientras el alumno
      # no resuelva los ejercicios. Eso es normal, no es un fallo del workflow.
      - name: Ejecutar tests
        continue-on-error: true
        run: npx jest --json --outputFile=resultados.json

      - name: Publicar resultados
        run: |
          mkdir -p .resultados
          mv resultados.json .resultados/ultimo.json
          git config user.name "github-actions"
          git config user.email "actions@github.com"
          git add .resultados/ultimo.json
          git diff --staged --quiet || git commit -m "Resultados de tests [skip ci]"
          git push
```

- [ ] **Paso 2: Registrar a los alumnos**

`panel/datos/alumnos.json`:

```json
[
  { "usuario": "usuario-github-del-hijo", "nombre": "Nombre del hijo" },
  { "usuario": "usuario-github-amigo1", "nombre": "Nombre amigo 1" }
]
```

- [ ] **Paso 3: Probar el workflow**

Hacer push del workflow y verificar en la pestaña Actions de GitHub que corre
y genera `.resultados/ultimo.json`.

Esperado: el workflow termina en verde aunque los tests fallen, y aparece el
archivo en el repo.

- [ ] **Paso 4: Commit**

```bash
git add Introductorio/.github panel/datos/alumnos.json
git commit -m "Agregar workflow de correccion automatica y registro de alumnos"
```

---

### Tarea 5: Lector de resultados desde GitHub

**Archivos:**
- Crear: `panel/src/lib/alumnos.ts`
- Crear: `panel/src/lib/github.ts`
- Test: `panel/src/lib/github.test.ts`

**Interfaces:**
- Produce:
  - `type Alumno = { usuario: string; nombre: string }`
  - `listarAlumnos(): Alumno[]`
  - `type Resultado = { total: number; pasados: number; fallados: number; porSuite: SuiteResumen[] }`
  - `type SuiteResumen = { nombre: string; total: number; pasados: number }`
  - `resumirJest(json: unknown): Resultado` — pura, testeable sin red
  - `traerResultados(usuario: string, repo: string): Promise<Resultado | null>`

- [ ] **Paso 1: Escribir el test de la función pura**

`panel/src/lib/github.test.ts`:

```typescript
import { resumirJest } from './github';

const salidaJest = {
  numTotalTests: 35,
  numPassedTests: 12,
  numFailedTests: 23,
  testResults: [
    {
      name: '/repo/02-JS-I/homework/tests/JSI.test.js',
      assertionResults: [
        { title: 'Deberia ser un string', status: 'passed' },
        { title: 'Deberia ser un numero', status: 'failed' },
      ],
    },
  ],
};

describe('resumirJest', () => {
  it('extrae los totales de la salida de Jest', () => {
    const r = resumirJest(salidaJest);
    expect(r.total).toBe(35);
    expect(r.pasados).toBe(12);
    expect(r.fallados).toBe(23);
  });

  it('resume cada suite con su nombre de archivo', () => {
    const r = resumirJest(salidaJest);
    expect(r.porSuite).toHaveLength(1);
    expect(r.porSuite[0].nombre).toBe('JSI.test.js');
    expect(r.porSuite[0].total).toBe(2);
    expect(r.porSuite[0].pasados).toBe(1);
  });

  it('devuelve ceros si el JSON no tiene la forma esperada', () => {
    const r = resumirJest({});
    expect(r.total).toBe(0);
    expect(r.porSuite).toEqual([]);
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd panel && npx jest src/lib/github.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 3: Implementar**

`panel/src/lib/github.ts`:

```typescript
export type SuiteResumen = { nombre: string; total: number; pasados: number };

export type Resultado = {
  total: number;
  pasados: number;
  fallados: number;
  porSuite: SuiteResumen[];
};

const VACIO: Resultado = { total: 0, pasados: 0, fallados: 0, porSuite: [] };

/** Convierte la salida de `jest --json` en el resumen que muestra el panel. */
export function resumirJest(json: unknown): Resultado {
  if (!json || typeof json !== 'object') return VACIO;
  const j = json as Record<string, any>;
  if (typeof j.numTotalTests !== 'number') return VACIO;

  const porSuite: SuiteResumen[] = (j.testResults ?? []).map((suite: any) => {
    const asserts = suite.assertionResults ?? [];
    return {
      nombre: String(suite.name ?? '').split('/').pop() ?? 'desconocido',
      total: asserts.length,
      pasados: asserts.filter((a: any) => a.status === 'passed').length,
    };
  });

  return {
    total: j.numTotalTests,
    pasados: j.numPassedTests ?? 0,
    fallados: j.numFailedTests ?? 0,
    porSuite,
  };
}

/**
 * Lee .resultados/ultimo.json del repo del alumno.
 * Devuelve null si el alumno todavia no hizo push o el archivo no existe.
 */
export async function traerResultados(
  usuario: string,
  repo: string,
): Promise<Resultado | null> {
  const url = `https://api.github.com/repos/${usuario}/${repo}/contents/.resultados/ultimo.json`;
  const cabeceras: Record<string, string> = {
    Accept: 'application/vnd.github.raw+json',
  };
  if (process.env.GITHUB_TOKEN) {
    cabeceras.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers: cabeceras, next: { revalidate: 300 } });
  if (!res.ok) return null;

  try {
    return resumirJest(await res.json());
  } catch {
    return null;
  }
}
```

`panel/src/lib/alumnos.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';

export type Alumno = { usuario: string; nombre: string };

export function listarAlumnos(): Alumno[] {
  const ruta = path.join(process.cwd(), 'datos', 'alumnos.json');
  if (!fs.existsSync(ruta)) return [];
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}
```

- [ ] **Paso 4: Ejecutar y ver que pasa**

```bash
cd panel && npx jest src/lib/github.test.ts
```

Esperado: PASS, 3 tests.

- [ ] **Paso 5: Commit**

```bash
git add panel/src/lib/github.ts panel/src/lib/github.test.ts panel/src/lib/alumnos.ts
git commit -m "Agregar lectura de resultados de Jest desde GitHub"
```

---

### Tarea 6: Tabla de avance

**Archivos:**
- Crear: `panel/src/app/avance/page.tsx`

**Interfaces:**
- Consume: `listarAlumnos()`, `traerResultados()`.

- [ ] **Paso 1: Crear la página**

`panel/src/app/avance/page.tsx`:

```tsx
import Link from 'next/link';
import { listarAlumnos } from '@/lib/alumnos';
import { traerResultados } from '@/lib/github';

export const revalidate = 300; // refresca cada 5 minutos

export default async function Avance() {
  const alumnos = listarAlumnos();

  const filas = await Promise.all(
    alumnos.map(async (a) => ({
      ...a,
      resultado: await traerResultados(a.usuario, 'Introductorio'),
    })),
  );

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver</Link>
      <h1>Avance de los alumnos</h1>

      {alumnos.length === 0 && (
        <p>No hay alumnos registrados. Agregalos en <code>datos/alumnos.json</code>.</p>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #ccc' }}>
            <th>Alumno</th>
            <th>Tests que pasa</th>
            <th>Progreso</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((f) => {
            const pct = f.resultado?.total
              ? Math.round((f.resultado.pasados / f.resultado.total) * 100)
              : 0;
            return (
              <tr key={f.usuario} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem 0' }}>
                  <Link href={`/alumno/${f.usuario}`}>{f.nombre}</Link>
                </td>
                <td>
                  {f.resultado
                    ? `${f.resultado.pasados} / ${f.resultado.total}`
                    : 'sin entregas'}
                </td>
                <td>{f.resultado ? `${pct}%` : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
```

- [ ] **Paso 2: Verificar**

```bash
cd panel && npm run dev
```

Abrir `http://localhost:3000/avance`. Esperado: tabla con los alumnos. Los que
no hayan hecho push muestran "sin entregas".

- [ ] **Paso 3: Commit**

```bash
git add panel/src/app/avance
git commit -m "Agregar tabla de avance de alumnos"
```

**🎉 Fin de la Fase 2.** Ya ves quién va por dónde.

---

## FASE 3 — Exámenes

### Tarea 7: Base de datos y modelo de examen

**Archivos:**
- Crear: `panel/src/lib/db.ts`
- Crear: `panel/contenido/examenes/js-basico.json`
- Test: `panel/src/lib/db.test.ts`

**Interfaces:**
- Produce:
  - `guardarEntrega(examenId: string, usuario: string, respuestas: number[], nota: number): void`
  - `traerEntrega(examenId: string, usuario: string): Entrega | null`
  - `type Entrega = { examenId: string; usuario: string; respuestas: number[]; nota: number; fecha: string }`

- [ ] **Paso 1: Instalar SQLite**

```bash
cd panel && npm install better-sqlite3 && npm install -D @types/better-sqlite3
```

- [ ] **Paso 2: Escribir el test**

`panel/src/lib/db.test.ts`:

```typescript
import { guardarEntrega, traerEntrega } from './db';

describe('entregas de examen', () => {
  it('guarda y recupera una entrega', () => {
    guardarEntrega('js-basico', 'alumno-prueba', [0, 2, 1], 67);
    const e = traerEntrega('js-basico', 'alumno-prueba');
    expect(e).not.toBeNull();
    expect(e!.nota).toBe(67);
    expect(e!.respuestas).toEqual([0, 2, 1]);
  });

  it('devuelve null si no hay entrega', () => {
    expect(traerEntrega('js-basico', 'nadie')).toBeNull();
  });

  it('sobrescribe si el alumno vuelve a entregar', () => {
    guardarEntrega('js-basico', 'repite', [0], 10);
    guardarEntrega('js-basico', 'repite', [1], 90);
    expect(traerEntrega('js-basico', 'repite')!.nota).toBe(90);
  });
});
```

- [ ] **Paso 3: Ejecutar y ver que falla**

```bash
cd panel && npx jest src/lib/db.test.ts
```

Esperado: FAIL — módulo no encontrado.

- [ ] **Paso 4: Implementar**

`panel/src/lib/db.ts`:

```typescript
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

export type Entrega = {
  examenId: string;
  usuario: string;
  respuestas: number[];
  nota: number;
  fecha: string;
};

const DIR = path.join(process.cwd(), 'datos');
fs.mkdirSync(DIR, { recursive: true });

const db = new Database(path.join(DIR, 'panel.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS entregas (
    examen_id   TEXT NOT NULL,
    usuario     TEXT NOT NULL,
    respuestas  TEXT NOT NULL,
    nota        INTEGER NOT NULL,
    fecha       TEXT NOT NULL,
    PRIMARY KEY (examen_id, usuario)
  );
`);

export function guardarEntrega(
  examenId: string,
  usuario: string,
  respuestas: number[],
  nota: number,
): void {
  db.prepare(
    `INSERT INTO entregas (examen_id, usuario, respuestas, nota, fecha)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(examen_id, usuario) DO UPDATE SET
       respuestas = excluded.respuestas,
       nota       = excluded.nota,
       fecha      = excluded.fecha`,
  ).run(examenId, usuario, JSON.stringify(respuestas), nota, new Date().toISOString());
}

export function traerEntrega(examenId: string, usuario: string): Entrega | null {
  const fila = db
    .prepare('SELECT * FROM entregas WHERE examen_id = ? AND usuario = ?')
    .get(examenId, usuario) as any;

  if (!fila) return null;
  return {
    examenId: fila.examen_id,
    usuario: fila.usuario,
    respuestas: JSON.parse(fila.respuestas),
    nota: fila.nota,
    fecha: fila.fecha,
  };
}
```

- [ ] **Paso 5: Ejecutar y ver que pasa**

```bash
cd panel && npx jest src/lib/db.test.ts
```

Esperado: PASS, 3 tests.

- [ ] **Paso 6: Crear un examen de ejemplo**

`panel/contenido/examenes/js-basico.json`:

```json
{
  "id": "js-basico",
  "titulo": "Examen: JavaScript básico",
  "preguntas": [
    {
      "enunciado": "¿Qué devuelve typeof [] en JavaScript?",
      "opciones": ["'array'", "'object'", "'list'", "undefined"],
      "correcta": 1
    },
    {
      "enunciado": "¿Cuál declara una variable que NO se puede reasignar?",
      "opciones": ["var", "let", "const", "function"],
      "correcta": 2
    },
    {
      "enunciado": "¿Qué imprime console.log(2 + '2')?",
      "opciones": ["4", "'22'", "NaN", "Error"],
      "correcta": 1
    }
  ]
}
```

- [ ] **Paso 7: Commit**

```bash
git add panel/src/lib/db.ts panel/src/lib/db.test.ts panel/contenido panel/package.json
git commit -m "Agregar almacenamiento de entregas y examen de ejemplo"
```

---

### Tarea 8: Carga y corrección de exámenes

**Archivos:**
- Crear: `panel/src/lib/examenes.ts`
- Test: `panel/src/lib/examenes.test.ts`

**Interfaces:**
- Produce:
  - `type Pregunta = { enunciado: string; opciones: string[]; correcta: number }`
  - `type Examen = { id: string; titulo: string; preguntas: Pregunta[] }`
  - `listarExamenes(): Examen[]`
  - `leerExamen(id: string): Examen | null`
  - `corregir(examen: Examen, respuestas: number[]): number` — nota 0–100

- [ ] **Paso 1: Escribir el test**

`panel/src/lib/examenes.test.ts`:

```typescript
import { corregir, leerExamen, type Examen } from './examenes';

const examen: Examen = {
  id: 'prueba',
  titulo: 'Prueba',
  preguntas: [
    { enunciado: 'a', opciones: ['x', 'y'], correcta: 0 },
    { enunciado: 'b', opciones: ['x', 'y'], correcta: 1 },
    { enunciado: 'c', opciones: ['x', 'y'], correcta: 1 },
  ],
};

describe('corregir', () => {
  it('da 100 si todas son correctas', () => {
    expect(corregir(examen, [0, 1, 1])).toBe(100);
  });

  it('da 0 si todas son incorrectas', () => {
    expect(corregir(examen, [1, 0, 0])).toBe(0);
  });

  it('redondea las parciales', () => {
    expect(corregir(examen, [0, 1, 0])).toBe(67);
  });

  it('cuenta como incorrecta la pregunta sin responder', () => {
    expect(corregir(examen, [0])).toBe(33);
  });
});

describe('leerExamen', () => {
  it('carga el examen de ejemplo', () => {
    const e = leerExamen('js-basico');
    expect(e).not.toBeNull();
    expect(e!.preguntas.length).toBe(3);
  });

  it('devuelve null si no existe', () => {
    expect(leerExamen('inventado')).toBeNull();
  });
});
```

- [ ] **Paso 2: Ejecutar y ver que falla**

```bash
cd panel && npx jest src/lib/examenes.test.ts
```

Esperado: FAIL.

- [ ] **Paso 3: Implementar**

`panel/src/lib/examenes.ts`:

```typescript
import fs from 'node:fs';
import path from 'node:path';

export type Pregunta = {
  enunciado: string;
  opciones: string[];
  correcta: number;
};

export type Examen = { id: string; titulo: string; preguntas: Pregunta[] };

const DIR = path.join(process.cwd(), 'contenido', 'examenes');

export function listarExamenes(): Examen[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')));
}

export function leerExamen(id: string): Examen | null {
  const ruta = path.join(DIR, `${id}.json`);
  if (!fs.existsSync(ruta)) return null;
  return JSON.parse(fs.readFileSync(ruta, 'utf8'));
}

/** Nota de 0 a 100. Una pregunta sin responder cuenta como incorrecta. */
export function corregir(examen: Examen, respuestas: number[]): number {
  if (examen.preguntas.length === 0) return 0;
  const aciertos = examen.preguntas.filter(
    (p, i) => respuestas[i] === p.correcta,
  ).length;
  return Math.round((aciertos / examen.preguntas.length) * 100);
}
```

- [ ] **Paso 4: Ejecutar y ver que pasa**

```bash
cd panel && npx jest src/lib/examenes.test.ts
```

Esperado: PASS, 6 tests.

- [ ] **Paso 5: Commit**

```bash
git add panel/src/lib/examenes.ts panel/src/lib/examenes.test.ts
git commit -m "Agregar carga y correccion automatica de examenes"
```

---

### Tarea 9: Página de examen

**Archivos:**
- Crear: `panel/src/app/examen/[id]/page.tsx`
- Crear: `panel/src/app/examen/[id]/acciones.ts`

**Interfaces:**
- Consume: `leerExamen()`, `corregir()`, `guardarEntrega()`, `listarAlumnos()`.

- [ ] **Paso 1: Server Action que corrige y guarda**

`panel/src/app/examen/[id]/acciones.ts`:

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { corregir, leerExamen } from '@/lib/examenes';
import { guardarEntrega } from '@/lib/db';

export async function entregarExamen(formData: FormData) {
  const examenId = String(formData.get('examenId'));
  const usuario = String(formData.get('usuario'));

  const examen = leerExamen(examenId);
  if (!examen || !usuario) return;

  const respuestas = examen.preguntas.map((_, i) => {
    const v = formData.get(`p${i}`);
    return v === null ? -1 : Number(v);
  });

  guardarEntrega(examenId, usuario, respuestas, corregir(examen, respuestas));
  revalidatePath(`/examen/${examenId}`);
}
```

- [ ] **Paso 2: Página del examen**

`panel/src/app/examen/[id]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { leerExamen } from '@/lib/examenes';
import { listarAlumnos } from '@/lib/alumnos';
import { traerEntrega } from '@/lib/db';
import { entregarExamen } from './acciones';

export default async function PaginaExamen(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ alumno?: string }>;
}) {
  const { id } = await props.params;
  const { alumno } = await props.searchParams;

  const examen = leerExamen(id);
  if (!examen) notFound();

  const entrega = alumno ? traerEntrega(id, alumno) : null;

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver</Link>
      <h1>{examen.titulo}</h1>

      {entrega && (
        <p style={{ padding: '1rem', background: '#f0f0f0', borderRadius: 8 }}>
          Ya entregaste este examen. Nota: <strong>{entrega.nota}/100</strong>.
          Podés volver a entregarlo si querés.
        </p>
      )}

      <form action={entregarExamen}>
        <input type="hidden" name="examenId" value={examen.id} />

        <label style={{ display: 'block', margin: '1rem 0' }}>
          ¿Quién sos?{' '}
          <select name="usuario" defaultValue={alumno ?? ''} required>
            <option value="" disabled>
              Elegí tu nombre
            </option>
            {listarAlumnos().map((a) => (
              <option key={a.usuario} value={a.usuario}>
                {a.nombre}
              </option>
            ))}
          </select>
        </label>

        {examen.preguntas.map((p, i) => (
          <fieldset key={i} style={{ margin: '1.5rem 0' }}>
            <legend>
              {i + 1}. {p.enunciado}
            </legend>
            {p.opciones.map((op, j) => (
              <label key={j} style={{ display: 'block', margin: '0.3rem 0' }}>
                <input type="radio" name={`p${i}`} value={j} required /> {op}
              </label>
            ))}
          </fieldset>
        ))}

        <button type="submit">Entregar</button>
      </form>
    </main>
  );
}
```

- [ ] **Paso 3: Verificar**

```bash
cd panel && npm run dev
```

Abrir `http://localhost:3000/examen/js-basico`, responder y entregar.
Esperado: al recargar con `?alumno=<usuario>` aparece la nota.

- [ ] **Paso 4: Commit**

```bash
git add panel/src/app/examen
git commit -m "Agregar pagina de examen con correccion automatica"
```

**🎉 Fin de la Fase 3.** Ya podés tomar exámenes.

---

## FASE 4 — Vista del alumno

### Tarea 10: Página individual

**Archivos:**
- Crear: `panel/src/app/alumno/[usuario]/page.tsx`

**Interfaces:**
- Consume: `listarAlumnos()`, `traerResultados()`, `listarExamenes()`, `traerEntrega()`.

- [ ] **Paso 1: Crear la página**

`panel/src/app/alumno/[usuario]/page.tsx`:

```tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listarAlumnos } from '@/lib/alumnos';
import { traerResultados } from '@/lib/github';
import { listarExamenes } from '@/lib/examenes';
import { traerEntrega } from '@/lib/db';

export const revalidate = 300;

export default async function PaginaAlumno(props: {
  params: Promise<{ usuario: string }>;
}) {
  const { usuario } = await props.params;

  const alumno = listarAlumnos().find((a) => a.usuario === usuario);
  if (!alumno) notFound();

  const resultado = await traerResultados(usuario, 'Introductorio');
  const examenes = listarExamenes();

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver</Link>
      <h1>Hola, {alumno.nombre}</h1>

      <h2>Tus ejercicios</h2>
      {!resultado && (
        <p>
          Todavía no recibimos entregas tuyas. Hacé <code>git push</code> y en
          unos minutos aparecen acá.
        </p>
      )}
      {resultado && (
        <>
          <p>
            Pasás <strong>{resultado.pasados}</strong> de{' '}
            <strong>{resultado.total}</strong> tests.
          </p>
          <ul>
            {resultado.porSuite.map((s) => (
              <li key={s.nombre}>
                {s.nombre}: {s.pasados}/{s.total}{' '}
                {s.pasados === s.total ? '✅' : '⏳'}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Tus exámenes</h2>
      <ul>
        {examenes.map((e) => {
          const entrega = traerEntrega(e.id, usuario);
          return (
            <li key={e.id}>
              <Link href={`/examen/${e.id}?alumno=${usuario}`}>{e.titulo}</Link>{' '}
              {entrega ? `— nota ${entrega.nota}/100` : '— sin entregar'}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
```

- [ ] **Paso 2: Verificar**

Abrir `http://localhost:3000/alumno/<usuario>`. Esperado: avance de tests y
lista de exámenes con su nota.

- [ ] **Paso 3: Ejecutar toda la batería de tests**

```bash
cd panel && npx jest
```

Esperado: PASS en los 4 archivos de test (lecciones, github, db, examenes).

- [ ] **Paso 4: Verificar el build**

```bash
cd panel && npm run build
```

Esperado: compila sin errores.

- [ ] **Paso 5: Commit**

```bash
git add panel/src/app/alumno
git commit -m "Agregar vista individual del alumno"
```

**🎉 Fin de la Fase 4.**

---

## Puesta en marcha

1. Crear un repo plantilla con el contenido de `Introductorio/` (sin soluciones)
   y el workflow de la Tarea 4.
2. Cada alumno lo clona o hace fork, y trabaja en el suyo.
3. Registrar sus usuarios en `panel/datos/alumnos.json`.
4. Correr el panel: `cd panel && npm run dev`.

**Para que lo vean desde afuera:** desplegar en Vercel. Ojo — SQLite no
persiste en Vercel (sistema de archivos efímero). Si se despliega, hay que
cambiar `db.ts` por Postgres o Turso. Mientras corra en la máquina de Julián,
SQLite basta.

---

## Trabajo futuro (fuera de este plan)

- Autenticación con GitHub OAuth, si hace falta que cada uno vea solo lo suyo.
- Exámenes con preguntas de código, no solo opción múltiple.
- Panel de una sola pantalla con el avance de todos los módulos, no solo
  `Introductorio`.
- Migrar el sitio de Eleventy al panel y jubilar Eleventy (elimina la
  dependencia de los paquetes del CDN externo — ver `docs/restricciones.md` §4).
