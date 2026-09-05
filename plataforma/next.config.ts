import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Next 16 genera su propio CLAUDE.md y AGENTS.md al arrancar. Aquí
  // competirían con el CLAUDE.md del repositorio, que es el que manda.
  agentRules: false,

  // Las lecciones viven un nivel arriba, fuera del Root Directory que
  // Vercel construye. Hay que ampliar la raíz del rastreo para alcanzarlas.
  outputFileTracingRoot: path.join(__dirname, '..'),

  // `/` y `/unidad/[id]` se prerenderizan en el build (SSG): leen el disco
  // al compilar, no en producción, así que NO necesitan declararse aquí.
  // Incluirlas solo engordaría la función sin motivo.
  //
  // La ruta de descarga sí lee en tiempo de ejecución, porque cada ZIP se
  // arma con el identificador del alumno. Se declarará al crearla (Fase 3).
}

export default config
