import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { leerUnidad, listarUnidades } from '@/lib/lecciones';

export function generateStaticParams() {
  return listarUnidades().map((u) => ({ id: u.id }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const datos = leerUnidad(id);
  return { title: datos ? `${datos.unidad.titulo} — Curso Full Stack` : 'Lección' };
}

export default async function PaginaUnidad(props: {
  params: Promise<{ id: string }>;
}) {
  // En Next 16 params es una promesa: hay que esperarla.
  const { id } = await props.params;
  const datos = leerUnidad(id);
  if (!datos) notFound();

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.2rem 4rem' }}>
      <Link href="/" className="volver">
        ← Volver al índice
      </Link>

      <h1>{datos.unidad.titulo}</h1>
      <p style={{ color: 'var(--texto-suave)', marginTop: '-0.4rem' }}>
        {datos.unidad.modulo.replace(/_/g, ' ')}
      </p>

      <article className="leccion">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          // El material trae HTML real: videos de Vimeo, divs e imagenes en
          // 29 de las lecciones. Sin rehype-raw se muestra como texto plano.
          // Es seguro porque el markdown es nuestro, no entrada de usuario.
          rehypePlugins={[rehypeRaw]}
        >
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
