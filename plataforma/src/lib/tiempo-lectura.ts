import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

/**
 * Tiempo estimado de lectura.
 *
 * Replica henry-reading-time, el plugin que usa el sitio de Eleventy, para
 * que la cifra coincida con la que el alumno ya ve alli. La clave es contar
 * sobre el HTML renderizado, no sobre el markdown: las vallas de codigo y
 * las marcas de encabezado inflarian el total en un par de minutos.
 */
export function tiempoDeLectura(markdown: string, velocidad = 100): string {
  if (!markdown) return '0 min';

  const html = String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeStringify, { allowDangerousHtml: true })
      .processSync(markdown),
  );

  return `${Math.ceil(contarPalabras(html) / velocidad)} min`;
}

/** Quita las etiquetas y cuenta palabras, igual que el plugin original. */
function contarPalabras(html: string): number {
  const texto = html.replace(/<([^>]+)>/gi, '');
  const palabras = texto.match(/[Ѐ-ӿ]+|\S+\s*/g);
  return palabras !== null ? palabras.length : 0;
}
