import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { leerUnidad, listarUnidades } from '@/lib/lecciones';
import { tiempoDeLectura } from '@/lib/tiempo-lectura';
import { Cabecera } from '@/components/Cabecera';
import { NavLecciones } from '@/components/NavLecciones';
import { BarraProgreso } from '@/components/BarraProgreso';

export function generateStaticParams() {
  return listarUnidades().map((u) => ({ id: u.id }));
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const datos = leerUnidad(id);
  return {
    title: datos ? `${datos.unidad.titulo} — Curso Full Stack` : 'Lección',
  };
}

export default async function PaginaUnidad(props: {
  params: Promise<{ id: string }>;
}) {
  // En Next 16 params es una promesa: hay que esperarla.
  const { id } = await props.params;
  const datos = leerUnidad(id);
  if (!datos) notFound();

  const { unidad, markdown } = datos;
  const hermanas = listarUnidades().filter((u) => u.modulo === unidad.modulo);
  const cuerpo = sinTituloInicial(markdown);

  return (
    <>
      <BarraProgreso />
      <Cabecera
        titulo={unidad.titulo}
        subtitulo={unidad.modulo.replace(/_/g, ' ')}
        tiempoLectura={tiempoDeLectura(cuerpo)}
      />
      <NavLecciones unidades={hermanas} activa={unidad.id} />

      <main className="contenedor">
        {/* La clase `lesson` es la del CSS original del curso */}
        <article className="lesson">
          <h1>{unidad.titulo}</h1>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // El material trae HTML real en 29 lecciones: divs, imagenes y
            // videos. Sin rehype-raw se mostraria como texto plano. Es
            // seguro porque el markdown es nuestro, no entrada de usuario.
            rehypePlugins={[rehypeRaw, [rehypeHighlight, { detect: true }]]}
          >
            {cuerpo}
          </ReactMarkdown>
        </article>
      </main>
    </>
  );
}

/**
 * Casi todos los README.md abren con su propio "# Titulo", que repetiria el
 * encabezado que ya pone la pagina. Se quita solo ese primero.
 */
function sinTituloInicial(markdown: string): string {
  return markdown.replace(/^\s*#\s+.*\r?\n/, '');
}
