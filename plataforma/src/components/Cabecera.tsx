import Link from 'next/link';

/**
 * Cabecera azul con el logo blanco de la universidad, igual que el sitio de
 * Eleventy. El logo esta pensado para fondo oscuro: sobre blanco no se ve.
 */
export function Cabecera({
  titulo,
  subtitulo,
}: {
  titulo: string;
  subtitulo?: string;
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
      </div>
    </header>
  );
}
