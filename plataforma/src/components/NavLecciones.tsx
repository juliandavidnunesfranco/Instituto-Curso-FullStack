import Link from 'next/link';
import type { Unidad } from '@/lib/lecciones';

/**
 * Navegacion horizontal entre las lecciones del mismo modulo, con la actual
 * subrayada. Replica el comportamiento del topnav de Eleventy.
 */
export function NavLecciones({
  unidades,
  activa,
}: {
  unidades: Unidad[];
  activa?: string;
}) {
  if (unidades.length === 0) return null;

  return (
    <nav className="topnav" aria-label="Lecciones del módulo">
      <ul>
        {unidades.map((u) => (
          <li key={u.id}>
            <Link
              href={`/unidad/${u.id}`}
              className={u.id === activa ? 'activo' : undefined}
              aria-current={u.id === activa ? 'page' : undefined}
            >
              {u.titulo}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
