import { listarUnidades } from '@/lib/lecciones';

export const metadata = { title: 'Curso de Desarrollo Web Full Stack' };

export default function Portada() {
  const unidades = listarUnidades();
  const modulos = [...new Set(unidades.map((u) => u.modulo))];

  return (
    <main className="contenedor">
      <h1>Desarrollo Web Full Stack</h1>
      <p style={{ color: 'var(--texto-suave)' }}>
        {unidades.length} lecciones en {modulos.length} módulos. El icono 📝
        marca las que tienen ejercicios.
      </p>

      {modulos.map((modulo) => (
        <section key={modulo} className="indice">
          <h2>{modulo.replace(/_/g, ' ')}</h2>
          <ol>
            {unidades
              .filter((u) => u.modulo === modulo)
              .map((u) => (
                <li key={`${u.modulo}/${u.id}`}>
                  {/* Enlace normal, no <Link>: las lecciones las sirve
                      Eleventy como HTML estatico, fuera del router de Next */}
                  <a href={u.url}>
                    {u.titulo}
                    {u.tieneHomework && (
                      <span title="Tiene ejercicios" style={{ marginLeft: '0.4rem' }}>
                        📝
                      </span>
                    )}
                  </a>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
