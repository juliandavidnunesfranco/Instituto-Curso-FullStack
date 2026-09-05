import Link from 'next/link';
import { listarUnidades } from '@/lib/lecciones';

export default function Portada() {
  const unidades = listarUnidades();
  const modulos = [...new Set(unidades.map((u) => u.modulo))];

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1>Curso de Desarrollo Web Full Stack</h1>
      <p style={{ color: '#555' }}>
        {unidades.length} lecciones en {modulos.length} módulos.
      </p>

      {modulos.map((modulo) => (
        <section key={modulo}>
          <h2>{modulo.replace(/_/g, ' ')}</h2>
          <ol>
            {unidades
              .filter((u) => u.modulo === modulo)
              .map((u) => (
                <li key={`${u.modulo}/${u.id}`} style={{ margin: '0.4rem 0' }}>
                  <Link href={`/unidad/${u.id}`}>{u.titulo}</Link>
                  {u.tieneHomework && ' 📝'}
                </li>
              ))}
          </ol>
        </section>
      ))}
    </main>
  );
}
