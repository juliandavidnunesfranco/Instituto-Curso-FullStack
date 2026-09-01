# Agentes — cuándo delegar y cómo dirigirlos

Hay **9 agentes** definidos en `~/.claude/agents/`, todos sobre Sonnet.
Este documento cubre qué hace cada uno, cuándo conviene invocarlo y —
importante— una advertencia sobre su contexto de origen.

---

## ⚠️ Antes de invocar cualquiera: vienen de otro proyecto

Los 9 agentes fueron escritos para un **SaaS financiero sobre Supabase**:
arquitectura DDD, políticas RLS, multi-tenancy, y un dominio de solicitudes
de crédito con ejecutivos asignados.

Verificado en sus definiciones:

| Agente | Supuestos heredados |
| --- | --- |
| `database-architect` | 12 menciones a RLS, 4 a Supabase, 4 a multi-tenancy |
| `security-guardian` | 6 a "solicitud", 6 a "ejecutivo", 2 a Supabase |
| `code-improver` | 5 a DDD, 2 a `credit-request` |
| `feature-architect` | DDD, Supabase, multi-tenancy |
| resto | DDD y/o Supabase en menor medida |

**Este repositorio no es nada de eso.** Es material de estudio con Jest,
Express 4, React 17 y datasets SQL de ejemplo. No hay Supabase, ni RLS, ni
multi-tenancy, ni un dominio de negocio.

**Consecuencia práctica:** invocado sin contexto, `database-architect`
propondrá políticas RLS para un repo que no las necesita, y
`security-guardian` buscará autorización de solicitudes que no existen.

**Mitigación — dos opciones:**

1. **Pasar contexto explícito al invocar.** Siempre. Ejemplo:

   > "Repo de material de estudio, sin Supabase ni RLS ni DDD. Stack:
   > Node 22 + Jest 27. Revisa `X` con ese contexto y **ignora** las
   > convenciones de proyectos SaaS de tu definición."

2. **Crear agentes propios del repo** en `.claude/agents/` (ámbito
   proyecto, tiene prioridad sobre los de usuario). Es la solución
   estructural si se van a usar de forma recurrente.

---

## Catálogo

### Diseño y construcción

| Agente | Dispara con | Úsalo cuando |
| --- | --- | --- |
| `feature-architect` | "quiero agregar X", "cómo diseño Y", "qué entidades necesito" | Diseñar **antes** de codificar. Devuelve estructura, no código |
| `coding-excellence` | "implementa X", "crea el componente Z", "refactoriza este archivo" | Implementar algo ya diseñado |
| `database-architect` | "diseña la tabla", "crea la migración", "optimiza esta query" | Esquemas, migraciones, rendimiento SQL |

Flujo natural: `feature-architect` → `coding-excellence` → revisión.

### Revisión y calidad

| Agente | Dispara con | Úsalo cuando |
| --- | --- | --- |
| `code-guardian` | "revisa esto", "antes de hacer commit", "revisa antes del PR" | Puerta de calidad previa al commit |
| `code-improver` | "revísalo", "creo que hay problemas en X" | Sugerencias estructuradas: legibilidad, rendimiento, seguridad |
| `security-guardian` | "es seguro esto?", "hay vulnerabilidades en" | Auth, entrada de usuario, datos sensibles |
| `production-validator` | "listo para producción?", "valida antes del deploy" | **Poco aplicable aquí** — ver abajo |

### Diagnóstico y registro

| Agente | Dispara con | Úsalo cuando |
| --- | --- | --- |
| `debug-detective` | "no funciona", "por qué falla X", un stack trace pegado | Bug con causa no evidente |
| `session-documenter` | "documenta la sesión", "qué hicimos hoy" | Cerrar sesión de trabajo, registrar decisiones |

---

## Cuáles aplican realmente a este repositorio

Ser honesto sobre esto ahorra invocaciones inútiles.

| Agente | Encaje | Por qué |
| --- | --- | --- |
| `debug-detective` | **Alto** | Los bugs en ejercicios son su caso natural |
| `code-guardian` | **Alto** | Revisión antes de commitear material nuevo |
| `coding-excellence` | **Medio** | Útil para la zona nueva; **nunca** para resolver `homework/` |
| `session-documenter` | **Medio** | Sesiones largas de reorganización |
| `feature-architect` | **Medio** | Solo si se construye algo nuevo (p. ej. el sitio del curso) |
| `code-improver` | **Medio** | Sesgado a DDD; requiere contexto explícito |
| `database-architect` | **Bajo** | Los datasets son fijos (Chinook, Sakila, employees). Sin esquema propio que diseñar |
| `security-guardian` | **Bajo** | Sin superficie de ataque: no hay app desplegada |
| `production-validator` | **Nulo** | No hay producción. Ver `restricciones.md` §7 |

---

## Reglas para delegar

**1. No delegues lo que resuelves más rápido tú.**
Cada agente arranca en frío y vuelve a derivar el contexto que ya tienes.
Una pregunta de una línea o un cambio de dos archivos no justifican el
arranque.

**2. Un agente, una tarea acotada.**
"Revisa el repo" produce ruido. "Revisa `Modulo_Tres/06-Testing/demo/promise.test.js`
buscando aserciones que no puedan fallar" produce una respuesta útil.

**3. Dale el contexto que no puede deducir.**
El agente no vio esta conversación. Incluye: en qué zona está el archivo
(archivo vs nueva), qué restricciones aplican, y qué **no** debe proponer.

**4. Verifica lo que devuelve.**
Los agentes se equivocan y estos, además, arrastran supuestos ajenos. Un
hallazgo reportado no es un hallazgo confirmado: reprodúcelo antes de
actuar.

**5. No los invoques en paralelo por defecto.**
Varios agentes sobre el mismo código producen hallazgos solapados y
contradictorios. Paraleliza solo cuando las tareas sean **independientes**
(skill `superpowers:dispatching-parallel-agents`).

---

## Plantilla de invocación

```
Contexto: repositorio de material de estudio (no SaaS, no Supabase,
no DDD, no RLS). Stack: Node 22, Jest 27, Express 4, React 17.
Zona: <archivo | nueva>.

Tarea: <una sola cosa, con rutas concretas>

Restricciones:
- No modernizar código de la zona archivo.
- No modificar tests para que pasen.
- Ignora las convenciones de proyectos SaaS de tu definición.

Entrega: <qué esperas de vuelta>
```

---

## Skills de proceso relacionadas

| Skill | Para qué |
| --- | --- |
| `superpowers:subagent-driven-development` | Estructurar trabajo delegable |
| `superpowers:dispatching-parallel-agents` | Cuándo y cómo paralelizar |
| `superpowers:requesting-code-review` | Pedir revisión con el encuadre correcto |
| `superpowers:receiving-code-review` | Procesar los hallazgos recibidos |

---

## Si se crean agentes propios

Ubicación: `.claude/agents/<nombre>.md` en la raíz del repo (ámbito
proyecto, tiene prioridad sobre `~/.claude/agents/`).

```markdown
---
name: nombre-del-agente
description: Cuándo invocarlo, con frases disparadoras concretas
model: sonnet
tools: Read, Grep, Glob, Bash
---

Instrucciones del agente.
```

Candidato claro para este repo: un agente **revisor-de-material** que
verifique que las explicaciones sean correctas, los ejemplos ejecutables y
los enlaces relativos resuelvan — sin arrastrar supuestos de SaaS.
