import Link from 'next/link';
import { listarUnidades } from '@/lib/lecciones';

export const metadata = { title: 'Curso de Desarrollo Web Full Stack' };

export default function Portada() {
  const unidades = listarUnidades();
  const modulos = [...new Set(unidades.map((u) => u.modulo))];

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.2rem 4rem' }}>
      <h1>Desarrollo Web Full Stack</h1>
      <p style={{ color: 'var(--texto-suave)', marginTop: '-0.4rem' }}>
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
                  <Link href={`/unidad/${u.id}`}>
                    {u.titulo}
                    {u.tieneHomework && (
                      <span
                        title="Tiene ejercicios"
                        style={{ marginLeft: '0.4rem' }}
                      >
                        📝
                      </span>
                    )}
                  </Link>
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
