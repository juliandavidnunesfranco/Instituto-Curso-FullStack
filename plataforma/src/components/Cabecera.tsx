import Link from 'next/link';

/**
 * Cabecera azul con el logo de la universidad, la barra de progreso encima
 * y el tiempo de lectura a la derecha. Equivale al headerContainer del
 * sitio de Eleventy.
 *
 * El logo es blanco: la cabecera se mantiene azul en cualquier tema porque
 * sobre fondo claro no se veria.
 */
export function Cabecera({
  titulo,
  subtitulo,
  tiempoLectura,
}: {
  titulo: string;
  subtitulo?: string;
  tiempoLectura?: string;
}) {
  return (
    <header className="cabecera">
      <div className="cabecera-contenido">
        <Link href="/" aria-label="Ir al índice del curso">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="logo" />
        </Link>

        <div className="cabecera-titulos">
          <span className="cabecera-titulo">{titulo}</span>
          {subtitulo && (
            <>
              <span className="cabecera-sep">|</span>
              <span className="cabecera-subtitulo">{subtitulo}</span>
            </>
          )}
        </div>

        {tiempoLectura && (
          <span className="cabecera-tiempo">
            Tiempo de lectura {tiempoLectura}
          </span>
        )}
      </div>
    </header>
  );
}
