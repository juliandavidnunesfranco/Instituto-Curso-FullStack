import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { leerUnidad, listarUnidades } from '@/lib/lecciones';

export function generateStaticParams() {
  return listarUnidades().map((u) => ({ id: u.id }));
}

export default async function PaginaUnidad(props: {
  params: Promise<{ id: string }>;
}) {
  // En Next 16 params es una promesa: hay que esperarla.
  const { id } = await props.params;
  const datos = leerUnidad(id);
  if (!datos) notFound();

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/">← Volver al índice</Link>
      <h1>{datos.unidad.titulo}</h1>
      <article className="leccion">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {sinTituloInicial(datos.markdown)}
        </ReactMarkdown>
      </article>
    </main>
  );
}

/**
 * Casi todos los README.md abren con su propio "# Titulo", que repetiria el
 * encabezado que ya pone la pagina. Se quita solo ese primero; el resto del
 * documento queda intacto.
 */
function sinTituloInicial(markdown: string): string {
  return markdown.replace(/^\s*#\s+.*\r?\n/, '');
}
