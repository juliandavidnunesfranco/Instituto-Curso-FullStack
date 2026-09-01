# Skills — qué cargar antes de escribir código

Hay **5.555 skills** instaladas en `~/.claude/skills/`. Este documento
selecciona las que aplican a este repositorio y las mapea a la tarea que
las dispara.

**Regla operativa:** cargar la skill *antes* de escribir, no después de
que algo falle. Una skill cuesta unos segundos; reescribir código con
patrones obsoletos cuesta una sesión entera.

Todas las rutas son relativas a `~/.claude/skills/`. Se invocan con la
herramienta `Skill` usando el nombre sin ruta.

---

## 1. Por tecnología

### Next.js 16 — trabajo nuevo

| Skill | Para qué |
| --- | --- |
| `nextjs-best-practices` | Server vs Client Components, decisiones de arquitectura |
| `nextjs-app-router-patterns` | Rutas, layouts, route handlers, streaming |
| `next-cache-components` | Caché y revalidación |
| `nextjs-turbopack` | Configuración del bundler |
| `next-upgrade` | Migración entre versiones (usa codemods oficiales) |

**Complementar siempre con `context7`** para la API concreta: las skills
dan principios, `context7` da la firma actual. Next.js cambia rápido y la
v16 introdujo rupturas (ver `restricciones.md`).

### React

| Skill | Para qué |
| --- | --- |
| `react-best-practices` | Base. Cargar primero |
| `react-patterns` | Composición, render props, patrones de componente |
| `react-state-management` | Elegir entre estado local, contexto o store |
| `react-performance` | Memoización, re-renders, code splitting |
| `react-testing` | Testing Library, qué probar y qué no |

> El material de la zona archivo usa **React 17 con componentes de clase y
> Redux clásico**. Estas skills describen React moderno: úsalas para código
> nuevo, no para reescribir el archivo.

### JavaScript y TypeScript

| Skill | Para qué |
| --- | --- |
| `javascript-mastery` | Fundamentos profundos: cierres, prototipos, event loop |
| `modern-javascript-patterns` | ES2015+ idiomático |
| `javascript-testing-patterns` | Estructura de tests en JS |
| `typescript-expert` / `typescript-pro` | Tipado, genéricos, inferencia |

`javascript-mastery` es especialmente útil aquí: buena parte del material
del curso explica justo esos fundamentos, y la skill ayuda a redactar
explicaciones correctas.

### Backend y datos

| Skill | Para qué |
| --- | --- |
| `nodejs-best-practices` | Base de Node |
| `nodejs-backend-patterns` | Estructura de servidores |
| `backend-architect` | Diseño de capas y límites |
| `api-design` / `api-design-principles` | Contratos REST, versionado, errores |
| `database-design` | Modelado, normalización |
| `postgres-best-practices` / `postgresql` | Específico de Postgres |
| `sql-optimization-patterns` | Índices, planes de ejecución, N+1 |

No hay skill de Express. Usa `nodejs-backend-patterns` + `api-design`, y
`context7` para la API de Express.

### Frontend y accesibilidad

| Skill | Para qué |
| --- | --- |
| `frontend-design` | Criterio visual y de composición |
| `tailwind-patterns` | Utilidades, variantes, diseño responsive |
| `accessibility` | Semántica, roles, foco, teclado |
| `wcag-audit-patterns` | Auditar contra WCAG |
| `web-performance-optimization` | Core Web Vitals, carga |

### Infraestructura

| Skill | Para qué |
| --- | --- |
| `docker-patterns` / `docker-expert` | Dockerfiles, compose, multi-stage |
| `git-workflow` | Ramas, commits, resolución de conflictos |

---

## 2. Por tipo de trabajo

Estas aplican sin importar la tecnología. Cargarlas **antes** de las
técnicas: definen el proceso, las técnicas lo ejecutan.

| Skill | Cuándo |
| --- | --- |
| `superpowers:brainstorming` | Antes de diseñar algo nuevo. Explora el problema antes de comprometerse |
| `superpowers:writing-plans` | Trabajo de varios pasos que conviene escribir antes de ejecutar |
| `superpowers:systematic-debugging` | **Cualquier bug.** Antes de tocar el código |
| `superpowers:test-driven-development` | Código nuevo con contrato claro |
| `superpowers:verification-before-completion` | Antes de declarar algo terminado |
| `superpowers:requesting-code-review` | Al pedir revisión a un subagente |
| `superpowers:subagent-driven-development` | Trabajo paralelizable entre agentes |
| `clean-code` | Nombrado, funciones, estructura |
| `solid-principles` | Diseño orientado a objetos |
| `code-review-excellence` | Al revisar código |
| `debugging-strategies` | Complemento táctico de `systematic-debugging` |
| `error-handling-patterns` | Diseño de errores y fallos |
| `security-review` | Auth, entrada de usuario, datos sensibles |
| `documentation` | Escribir documentación técnica |

---

## 3. Orden de carga

Cuando aplican varias, este es el orden:

```
1. Skill de PROCESO      (brainstorming, systematic-debugging, TDD)
        ↓  define el enfoque
2. Skill de TECNOLOGÍA   (nextjs-*, react-*, postgres-*)
        ↓  define el cómo
3. context7              (API exacta de la versión en uso)
        ↓  confirma la firma
4. Escribir código
```

Saltarse el paso 1 es el error más común: se empieza a escribir sin haber
decidido el enfoque, y el resultado se descarta.

---

## 4. Cuándo NO usar una skill

- **Ejercicios de `homework/`.** Son para que Julián los resuelva. Ver la
  regla 1 de `CLAUDE.md`.
- **Zona archivo.** Las skills describen prácticas actuales; el archivo se
  preserva tal cual.
- **Preguntas conceptuales.** Si la pregunta es "¿qué es una promesa?", se
  responde; no hace falta cargar una skill.

---

## 5. Descubrir skills nuevas

El catálogo es grande y cambia. Para encontrar una skill por tema:

```bash
ls ~/.claude/skills | grep -i <término>
head -20 ~/.claude/skills/<nombre>/SKILL.md   # ver de qué trata
```

Si encuentras una que aplique de forma recurrente a este repo, agrégala a
este documento con una línea que diga **cuándo** dispararla — sin esa
línea, la entrada no sirve.
