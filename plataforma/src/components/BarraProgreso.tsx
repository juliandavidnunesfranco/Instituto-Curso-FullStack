'use client';

import { useEffect, useState } from 'react';

/**
 * Barra de progreso de lectura, fija en la parte superior, y boton para
 * volver arriba. Replica lo que hace henry-reader-bar en el sitio de
 * Eleventy, pero como componente de React.
 *
 * Es un componente de cliente porque depende del scroll de la ventana.
 */
export function BarraProgreso() {
  const [avance, setAvance] = useState(0);
  const [verBoton, setVerBoton] = useState(false);

  useEffect(() => {
    function alDesplazar() {
      const alto = document.documentElement.scrollHeight - window.innerHeight;
      // Una pagina mas corta que la ventana no tiene recorrido que medir.
      setAvance(alto > 0 ? (window.scrollY / alto) * 100 : 0);
      setVerBoton(window.scrollY > 250);
    }

    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    window.addEventListener('resize', alDesplazar);
    return () => {
      window.removeEventListener('scroll', alDesplazar);
      window.removeEventListener('resize', alDesplazar);
    };
  }, []);

  return (
    <>
      <div className="barra-progreso" aria-hidden="true">
        <div className="barra-progreso-relleno" style={{ width: `${avance}%` }} />
      </div>

      <button
        type="button"
        className={`btn-arriba ${verBoton ? 'visible' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Volver arriba"
        tabIndex={verBoton ? 0 : -1}
      >
        <span className="flecha-arriba" />
      </button>
    </>
  );
}
