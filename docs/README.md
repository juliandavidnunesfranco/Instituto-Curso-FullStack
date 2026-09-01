# docs/

Documentación de trabajo del repositorio. Define cómo se codifica aquí,
qué límites hay y cómo se dirige a los agentes.

El punto de entrada es [`../CLAUDE.md`](../CLAUDE.md), que se carga en cada
sesión. Estos documentos se consultan **bajo demanda**, según la tarea.

## Contenido

| Documento | Qué responde |
| --- | --- |
| [`skills.md`](skills.md) | ¿Qué skill cargo antes de escribir esto? |
| [`principios-codificacion.md`](principios-codificacion.md) | ¿Cómo se escribe código aquí? |
| [`restricciones.md`](restricciones.md) | ¿Qué no puedo hacer, y por qué? |
| [`agentes.md`](agentes.md) | ¿Delego esto? ¿A quién y cómo? |

## Orden de lectura sugerido

Para una primera sesión en el repositorio:

1. `../CLAUDE.md` — qué es esto y las cinco reglas que no se rompen
2. `restricciones.md` — los límites, incluida la separación archivo/nueva
3. `principios-codificacion.md` — antes de escribir la primera línea
4. `skills.md` — al empezar una tarea concreta
5. `agentes.md` — solo si vas a delegar

## Mantenimiento

Estos documentos describen el estado real, verificado el **2026-09-01**.
Lo que puede quedar desactualizado:

- **Versiones y rupturas de Next.js 16** (`restricciones.md` §5). Confirmar
  con `context7` antes de escribir código nuevo.
- **Nombres de skills** (`skills.md`). El catálogo local cambia; verificar
  con `ls ~/.claude/skills | grep -i <término>`.
- **Definiciones de agentes** (`agentes.md`). Viven en `~/.claude/agents/`,
  fuera de este repo, y pueden editarse en cualquier momento.

Si algo aquí contradice lo que observas en el repositorio, gana el
repositorio — y conviene corregir el documento.
