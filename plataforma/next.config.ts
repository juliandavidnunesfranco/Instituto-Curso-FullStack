import path from 'node:path'
import type { NextConfig } from 'next'

/**
 * Las lecciones y los homework viven un nivel arriba de esta carpeta, fuera
 * del Root Directory que Vercel construye. Sin declararlos aquí, la función
 * serverless no los incluye: el sitio funcionaría en local y fallaría en
 * producción con ENOENT.
 */
const config: NextConfig = {
  // Next 16 genera su propio CLAUDE.md y AGENTS.md al arrancar. Aquí
  // competirían con el CLAUDE.md del repositorio, que es el que manda.
  agentRules: false,

  outputFileTracingRoot: path.join(__dirname, '..'),
  outputFileTracingIncludes: {
    '/api/homework/[id]': ['../{Introductorio,Modulo_*}/**/homework/**'],
    '/unidad/[id]': ['../{Introductorio,Modulo_*}/**/README.*'],
    '/': ['../{Introductorio,Modulo_*}/**/README.json'],
  },
}

export default config
