import { listarUnidades, leerUnidad } from './lecciones';

describe('listarUnidades', () => {
  // 46 = las 51 carpetas con README.json menos los 5 indices de modulo,
  // que usan layout "intro" y no son lecciones.
  it('encuentra las 46 lecciones de los cinco modulos', () => {
    expect(listarUnidades().length).toBe(46);
  });

  it('incluye 06-Testing, cuyo README.json usa "title" en vez de "lessonTitle"', () => {
    const u = listarUnidades().find((x) => x.id === '06-Testing');
    expect(u).toBeDefined();
    expect(u!.titulo).toBe('Testing');
  });

  it('excluye los indices de modulo, que no son lecciones', () => {
    expect(listarUnidades().some((u) => u.id === 'Modulo_Uno')).toBe(false);
  });

  it('usa el nombre de carpeta como identificador, no el permalink', () => {
    const u = listarUnidades().find((x) => x.id === '02-JS-I');
    expect(u).toBeDefined();
    expect(u!.titulo).toBe('JavaScript I');
    expect(u!.modulo).toBe('Introductorio');
  });

  it('marca que 02-JS-I tiene homework', () => {
    const u = listarUnidades().find((x) => x.id === '02-JS-I');
    expect(u!.tieneHomework).toBe(true);
  });

  it('ordena las unidades de un modulo por su campo orden', () => {
    const intro = listarUnidades().filter((u) => u.modulo === 'Introductorio');
    const ordenes = intro.map((u) => u.orden);
    expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b));
  });
});

describe('leerUnidad', () => {
  it('devuelve el markdown de una unidad existente', () => {
    const r = leerUnidad('02-JS-I');
    expect(r).not.toBeNull();
    expect(r!.markdown.length).toBeGreaterThan(100);
  });

  it('devuelve null si la unidad no existe', () => {
    expect(leerUnidad('no-existe')).toBeNull();
  });
});
