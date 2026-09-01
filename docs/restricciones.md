# Restricciones

Límites del repositorio: técnicos, legales y de alcance. Todo lo que
aparece aquí tiene una razón concreta; ninguna es preferencia estética.

---

## 1. Legales — desmarcado del instituto

El material proviene de cursos cuyo instituto original **no autorizó** el
uso de su marca. Se retiraron 616 menciones: logos, títulos, enlaces a su
plataforma (quizzes, admisión, challenge) y scripts que enviaban las
entregas a sus servidores.

**Restricciones derivadas:**

- No reintroducir el nombre, logo ni dominio del instituto.
- No enlazar a sus plataformas de evaluación o admisión.
- No restaurar la telemetría eliminada (`.reporter/`, `submit.js`), que
  hacía `POST` de las entregas a un proxy externo.
- Si se recupera material desde alguna fuente en `PROCEDENCIA.md`, hay que
  desmarcarlo antes de integrarlo.

**Falso positivo importante:** los datasets `Chinook` y `Sakila`
(`Extras_Uno/`, `Extras_Dos/`) contienen 101 apariciones de "Henry" que son
**compositores reales** — Henry Mancini, Henryk Górecki, Henry Lawes. Son
datos legítimos de bases de ejemplo públicas. **No tocarlos:** un
buscar-y-reemplazar sobre ellos corrompe los ejercicios de SQL.

---

## 2. Zona archivo — congelada

Definida en `CLAUDE.md`. Se repite aquí lo que **no** se puede hacer:

- No convertir `var` a `let`/`const`.
- No convertir componentes de clase a funciones con hooks.
- No convertir callbacks a `async/await`.
- No actualizar dependencias de los `homework/`.
- No reformatear ni "limpiar" código didáctico.

Ese código enseña la evolución del lenguaje. Modernizarlo elimina lo que
enseña.

**Excepción única:** correcciones de errores objetivos que impidan que un
ejercicio funcione (un test roto, una ruta inexistente). Se corrigen y se
reporta qué se cambió.

---

## 3. Tests como especificación

En los `homework/`, el archivo de test **es** el enunciado ejecutable.

- Nunca modificar un test para que pase. Se corrige el código.
- Si hay que cambiar un valor de prueba, **ambos lados a la vez**: entrada
  y salida esperada, verificando el resultado.
- Ejecutar antes de afirmar que algo pasa.

> Este repositorio ya tuvo un caso real: un reemplazo textual dejó
> `expect('Mi Curso').toContain('Henry')` — una aserción imposible. El
> dry-run lo detectó. Los ejercicios `capToFront` y `asAmirror` dependen de
> las letras exactas del string (mayúsculas, inversión), así que cambiar la
> entrada obliga a recalcular la salida.

---

## 4. Build de los sitios de lecciones

Los cinco módulos generan un sitio con Eleventy y dependen de dos paquetes
alojados **fuera de npm**, en el CDN del instituto original:

```
henry-reader-bar     https://d31uz8lwfmyn8g.cloudfront.net/Modules/...
henry-reading-time   https://d31uz8lwfmyn8g.cloudfront.net/Modules/...
```

Además, `Modulo_Tres/_src/styles/fonts.css` carga las fuentes Avenir desde
su bucket S3.

**Se conservan deliberadamente.** Quitarlos rompe el build. Son las únicas
26 referencias al instituto que quedan, y son de infraestructura, no de
marca visible.

**Riesgo asumido:** si ese CDN desaparece, el build falla. Si ocurre, las
opciones son sustituir la barra de lectura por una propia o abandonar
Eleventy en favor del stack nuevo.

---

## 5. Stack — qué versión usar

### Trabajo nuevo

| | Versión | Nota |
| --- | --- | --- |
| **Next.js** | **16** | Decisión tomada. No usar 14 ni 15 |
| Node.js | ≥ 20.9.0 | v22.16.0 instalado. **Next 16 no soporta Node 18** |
| TypeScript | ≥ 5.1 | Mínimo exigido por Next 16 |
| React | 19 | 18.2+ también soportado |

**Navegadores mínimos de Next 16:** Chrome 111+, Edge 111+, Firefox 111+,
Safari 16.4+.

### Rupturas de Next.js 16 a tener presentes

Las **APIs de request son asíncronas**. Devuelven promesas y hay que
esperarlas:

```tsx
// ❌ Next 14/15
export default function Page({ params, searchParams }) {
  const { slug } = params
}

// ✅ Next 16
export default async function Page(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [k: string]: string | string[] | undefined }>
}) {
  const { slug } = await props.params
}
```

Aplica igual a `cookies()`, `headers()` y `draftMode()`. Para migrar
código existente, el codemod oficial:

```bash
npx @next/codemod@latest next-async-request-api .
```

Ver `next-upgrade` en `skills.md`, y confirmar siempre la firma actual con
`context7` antes de escribir — estos datos se verificaron el 2026-09-01 y
pueden cambiar.

### Zona archivo — no tocar

Jest 27, React 17, Redux 4, react-router-dom 5, Express 4.17–4.18,
Sequelize 6, Eleventy 0.12–1.0.

---

## 6. Contenido del repositorio

**Ignorado por `.gitignore`** (41 archivos):

| Qué | Por qué |
| --- | --- |
| `*.dump` | Los 4 dumps de `employees` pesan 135 MB. Reobtenibles desde `datacharmer/test_db` |
| `.env` | **Contiene credenciales reales.** Ver abajo |
| `node_modules/`, `dist/`, `build/` | Regenerables |
| `coverage/`, `*.log`, `.vscode/`, `.idea/` | Artefactos locales |

**Alerta de seguridad activa:**
`Extras_Docker/JSMastery_Course_Docker/.env` contiene un `DATABASE_URL`
con contraseña y un `ARCJET_KEY`. Nunca entró al historial de git. Vino en
un clon de un curso de terceros — **conviene rotar esas credenciales** si
son propias.

**Límites de tamaño:** GitHub avisa sobre archivos >50 MB y rechaza >100 MB.
Los dos PDF de 13 MB en `Extras_Docker/` están dentro. No agregar binarios
grandes sin considerar Git LFS.

---

## 7. Alcance

**Este repositorio no es:**

- una aplicación desplegable,
- un producto con usuarios,
- un monorepo de paquetes publicables.

Por tanto **no** aplican: CI/CD de despliegue, versionado semántico,
changelogs, releases ni tooling de publicación. Proponerlos es sobre-
ingeniería para lo que este repositorio hace.

**Lo que sí aplica:** que los tests corran, que el material sea correcto,
que el código nuevo siga los principios de `principios-codificacion.md`.
