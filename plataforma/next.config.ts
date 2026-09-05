import path from 'node:path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Next 16 genera su propio CLAUDE.md y AGENTS.md al arrancar. Aquí
  // competirían con el CLAUDE.md del repositorio, que es el que manda.
  agentRules: false,

  // El material del curso vive un nivel arriba, fuera del Root Directory
  // que Vercel construye. Hay que ampliar la raíz del rastreo.
  outputFileTracingRoot: path.join(__dirname, '..'),

  async rewrites() {
    return [
      // Las lecciones las genera Eleventy en public/lecciones/<modulo>/
      // <Leccion>/index.html. Next sirve archivos estáticos pero no
      // resuelve la URL de un directorio a su index.html, así que
      // /lecciones/introductorio/JavaScript_I daría 404.
      //
      // El patrón excluye las rutas que contienen un punto para no tocar
      // los recursos reales —imágenes, css, js— que viven dentro de esas
      // mismas carpetas.
      {
        source: '/lecciones/:ruta((?!.*\\.).*)',
        destination: '/lecciones/:ruta/index.html',
      },
    ]
  },
}

export default config
