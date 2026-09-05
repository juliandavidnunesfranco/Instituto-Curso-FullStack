#!/usr/bin/env node
/**
 * Construye las lecciones con el propio Eleventy de cada modulo.
 *
 * Por que Eleventy y no una reimplementacion: el sitio de lecciones ya
 * existe y funciona. Rehacerlo en React obliga a perseguir su aspecto
 * indefinidamente; ejecutarlo produce exactamente el original.
 *
 * Cada modulo se construye con su propio pathPrefix para que Eleventy
 * reescriba los enlaces internos y los cinco puedan convivir bajo
 * public/lecciones/ sin pisarse. Sin esto, /CSS/ colisiona: existe tanto
 * en Introductorio como en Modulo_Dos.
 *
 * Uso:  node scripts/construir-lecciones.mjs
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const PLATAFORMA = path.resolve(AQUI, '..');
const RAIZ = path.resolve(PLATAFORMA, '..');
const SALIDA = path.join(PLATAFORMA, 'public', 'lecciones');

/** modulo en disco -> segmento de URL */
const MODULOS = {
  Introductorio: 'introductorio',
  Modulo_Uno: 'modulo-uno',
  Modulo_Dos: 'modulo-dos',
  Modulo_Tres: 'modulo-tres',
  Modulo_Cuatro: 'modulo-cuatro',
};

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function construir(modulo, segmento) {
  const dir = path.join(RAIZ, modulo);
  if (!fs.existsSync(path.join(dir, '.eleventy.js'))) {
    log(`  ⚠️  ${modulo}: sin .eleventy.js, se omite`);
    return false;
  }

  // Eleventy y sus plugins viven en el node_modules de cada modulo.
  if (!fs.existsSync(path.join(dir, 'node_modules'))) {
    log(`  → ${modulo}: instalando dependencias...`);
    execFileSync('npm', ['install', '--no-audit', '--no-fund'], {
      cwd: dir,
      stdio: 'inherit',
    });
  }

  const destino = path.join(SALIDA, segmento);
  fs.rmSync(destino, { recursive: true, force: true });

  execFileSync(
    'npx',
    [
      '@11ty/eleventy',
      `--output=${destino}`,
      `--pathprefix=/lecciones/${segmento}`,
    ],
    { cwd: dir, stdio: ['ignore', 'pipe', 'inherit'] },
  );

  const corregidos = corregirRutas(destino, `/lecciones/${segmento}`);
  const paginas = contarHtml(destino);
  log(
    `  ✅ ${modulo} → /lecciones/${segmento}  (${paginas} páginas, ` +
      `${corregidos} rutas corregidas)`,
  );
  return true;
}

/**
 * Anade el prefijo del modulo a las rutas absolutas que Eleventy dejo sin
 * reescribir.
 *
 * El pathPrefix cubre lo que pasa por el filtro `url`, pero no lo demas:
 * el plugin eleventy-navigation-bootstrap genera la barra superior con
 * rutas como /JavaScript_V/, y las imagenes del material apuntan a
 * /_src/assets/... Sin este paso ambas dan 404 al servirse bajo
 * /lecciones/<modulo>/.
 *
 * Devuelve cuantas rutas se corrigieron, para que el build lo informe: si
 * alguna vez baja a cero, o el plugin se arreglo o algo se rompio.
 */
function corregirRutas(dir, prefijo) {
  let total = 0;

  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const ruta = path.join(dir, entrada.name);

    if (entrada.isDirectory()) {
      total += corregirRutas(ruta, prefijo);
      continue;
    }
    if (!entrada.name.endsWith('.html')) continue;

    const original = fs.readFileSync(ruta, 'utf8');

    // Solo href/src/action que empiecen por una unica barra y no lleven ya
    // el prefijo. Se excluye // para no tocar URLs relativas al protocolo.
    const corregido = original.replace(
      /(href|src|action)="\/(?!\/|lecciones\/)([^"]*)"/g,
      (_, attr, resto) => {
        total += 1;
        return `${attr}="${prefijo}/${resto}"`;
      },
    );

    if (corregido !== original) fs.writeFileSync(ruta, corregido);
  }

  return total;
}

function contarHtml(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) n += contarHtml(p);
    else if (e.name.endsWith('.html')) n += 1;
  }
  return n;
}

log('Construyendo las lecciones con Eleventy...\n');
fs.mkdirSync(SALIDA, { recursive: true });

let ok = 0;
for (const [modulo, segmento] of Object.entries(MODULOS)) {
  if (construir(modulo, segmento)) ok += 1;
}

const total = contarHtml(SALIDA);
log(`\n${ok}/${Object.keys(MODULOS).length} módulos, ${total} páginas en public/lecciones/`);

if (ok === 0) {
  log('\nNingún módulo se construyó. La app no tendría contenido.');
  process.exit(1);
}
