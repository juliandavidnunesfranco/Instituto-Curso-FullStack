import fs from 'node:fs';
import path from 'node:path';

/** Raiz del repositorio: un nivel arriba de plataforma/ */
const RAIZ = path.resolve(process.cwd(), '..');

/** Solo estas carpetas tienen lecciones. Los Extras_* son datasets. */
const MODULOS = [
  'Introductorio',
  'Modulo_Uno',
  'Modulo_Dos',
  'Modulo_Tres',
  'Modulo_Cuatro',
];

export type Unidad = {
  id: string;
  modulo: string;
  titulo: string;
  orden: number;
  rutaMd: string;
  tieneHomework: boolean;
  manual: boolean;
};

/**
 * Una unidad es una carpeta con README.json + README.md.
 * El id es el nombre de la carpeta: unico y estable, a diferencia del
 * permalink, que solo sirve para mostrar en el sitio de Eleventy.
 */
export function listarUnidades(): Unidad[] {
  const unidades: Unidad[] = [];

  for (const modulo of MODULOS) {
    // turbopackIgnore: estas rutas se resuelven en tiempo de compilacion.
    // Las paginas que llaman aqui se prerenderizan (SSG), asi que en
    // produccion nadie lee el disco. Sin este marcador, el analisis
    // estatico rastrea el repositorio entero -328 MB- hacia el bundle
    // serverless y el despliegue puede exceder el limite de Vercel.
    const dirModulo = path.join(/* turbopackIgnore: true */ RAIZ, modulo);
    if (!fs.existsSync(dirModulo)) continue;

    for (const carpeta of fs.readdirSync(
      /* turbopackIgnore: true */ dirModulo,
    )) {
      const rutaJson = path.join(dirModulo, carpeta, 'README.json');
      const rutaMd = path.join(dirModulo, carpeta, 'README.md');
      if (!fs.existsSync(rutaJson) || !fs.existsSync(rutaMd)) continue;

      let meta: Record<string, unknown>;
      try {
        meta = JSON.parse(fs.readFileSync(rutaJson, 'utf8'));
      } catch {
        continue; // un README.json roto no debe tumbar el sitio entero
      }
      const nav = meta.eleventyNavigation as
        | { order?: number; key?: string }
        | undefined;

      // El material no es uniforme: la mayoria usa lessonTitle, pero
      // Modulo_Tres/06-Testing trae "title". Se aceptan ambos antes de
      // recurrir a la clave de navegacion.
      const titulo =
        (typeof meta.lessonTitle === 'string' && meta.lessonTitle) ||
        (typeof meta.title === 'string' && meta.title) ||
        (typeof nav?.key === 'string' && nav.key) ||
        null;

      // Sin titulo no es una leccion: son los indices de modulo, que usan
      // layout "intro" y no deben aparecer en el listado.
      if (!titulo) continue;

      const dirHomework = path.join(dirModulo, carpeta, 'homework');

      unidades.push({
        id: carpeta,
        modulo,
        titulo,
        orden: typeof nav?.order === 'number' ? nav.order : 999,
        rutaMd,
        tieneHomework: fs.existsSync(dirHomework),
        manual: meta.manual === true,
      });
    }
  }

  return unidades.sort(
    (a, b) =>
      MODULOS.indexOf(a.modulo) - MODULOS.indexOf(b.modulo) || a.orden - b.orden,
  );
}

export function leerUnidad(
  id: string,
): { unidad: Unidad; markdown: string } | null {
  const unidad = listarUnidades().find((u) => u.id === id);
  if (!unidad) return null;
  return { unidad, markdown: fs.readFileSync(unidad.rutaMd, 'utf8') };
}
