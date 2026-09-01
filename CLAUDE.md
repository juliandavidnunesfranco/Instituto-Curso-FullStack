# Instituto — material de estudio consolidado

Repositorio personal de Julián. Consolida el material de varios cursos de
Desarrollo Web Full Stack en una sola base, con dos propósitos:

1. **Repasar** conceptos de forma recurrente (JavaScript, HTML/CSS, React,
   Node, Express, SQL, Docker).
2. **Construir un curso propio** a partir de ese material, reescrito y
   reorganizado.

No es un producto ni una aplicación desplegable. Es un archivo de estudio
más un espacio de trabajo para material nuevo.

---

## Las dos zonas del repositorio

Esta distinción gobierna casi todas las decisiones. Antes de tocar un
archivo, identifica en qué zona está.

| | **Zona archivo** | **Zona nueva** |
| --- | --- | --- |
| **Qué es** | Material heredado de los cursos originales | Material propio, escrito desde cero |
| **Dónde** | `Introductorio/`, `Modulo_*/`, `Proyecto_Final/`, `Extras*/` | `docs/` y lo que se cree en adelante |
| **Stack** | Jest 27, React 17 + Redux, Express 4, Sequelize 6, Eleventy | Moderno (ver `docs/restricciones.md`) |
| **Regla** | **Se preserva.** No modernizar. | Estándares actuales, sin deuda heredada |

El código antiguo de la zona archivo (`var`, callbacks, componentes de
clase, `function` constructoras) **es intencional**: enseña la progresión
histórica del lenguaje. Convertirlo a sintaxis moderna destruye su valor
didáctico. Si algo ahí parece "mal escrito", asume que ilustra un punto
antes de proponer cambiarlo.

---

## Reglas que no se rompen

1. **No resolver los `homework/`.** Los ejercicios existen para que Julián
   los resuelva. Explica el concepto, señala el test que falla, sugiere una
   dirección — pero no escribas la solución salvo que la pida explícitamente.
2. **No modernizar la zona archivo.** Ver arriba.
3. **Los tests son la especificación.** En los `homework/`, el archivo de
   test define el contrato. Nunca ajustes un test para que pase; ajusta el
   código.
4. **El material está desmarcado.** Se retiraron las menciones al instituto
   original por no tener derecho de uso. No reintroducir marcas, logos ni
   enlaces a sus plataformas. Ver `docs/restricciones.md`.
5. **Nada de secretos en el repo.** Hay un `.env` con credenciales reales en
   `Extras_Docker/JSMastery_Course_Docker/` — está en `.gitignore` y nunca
   entró al historial. Que siga así.

---

## Entorno

- Node.js `v22.16.0`, npm `11.11.0`
- Los tests de los ejercicios corren con Jest: `npm test` desde la carpeta
  del módulo, o `npm test <archivo>` para uno concreto.
- Los sitios de lecciones usan Eleventy y dependen de dos paquetes alojados
  fuera de npm (`henry-reader-bar`, `henry-reading-time`). Se conservan
  deliberadamente: quitarlos rompe el build. Ver `docs/restricciones.md`.
- Los dumps de la base `employees` (~135 MB) están ignorados. Se reobtienen
  con `git clone https://github.com/datacharmer/test_db`.

---

## Documentación de trabajo

Leer bajo demanda, según la tarea:

| Documento | Cuándo consultarlo |
| --- | --- |
| [`docs/skills.md`](docs/skills.md) | Antes de codificar: qué skill local cargar para cada tecnología |
| [`docs/principios-codificacion.md`](docs/principios-codificacion.md) | Al escribir código nuevo |
| [`docs/restricciones.md`](docs/restricciones.md) | Límites técnicos, legales y de alcance |
| [`docs/agentes.md`](docs/agentes.md) | Al delegar trabajo a subagentes |
| [`PROCEDENCIA.md`](PROCEDENCIA.md) | Origen de cada carpeta absorbida |

---

## Cómo se trabaja aquí

**Consulta la skill antes de escribir código.** Hay 5.555 skills instaladas
en `~/.claude/skills/`. Para cada tecnología existe una con las prácticas
actuales; `docs/skills.md` mapea tarea → skill. Cargar la skill primero
evita escribir código con patrones de hace tres versiones.

**Verifica antes de afirmar.** Este repo ya tuvo un caso donde un
buscar-y-reemplazar habría roto tests en silencio (aserciones cuyo valor
esperado dependía del string reemplazado). Ejecuta lo que modificas.

**Prefiere el dry-run.** En cambios masivos, imprime primero qué se
modificaría y revísalo. Este repo tiene 1.669 archivos versionados y el
contenido estuvo sin trackear mucho tiempo.
