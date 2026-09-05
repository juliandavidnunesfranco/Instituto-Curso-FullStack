# Plataforma del curso

Aplicación en Next.js 16 que sirve el curso de Desarrollo Web Full Stack.

Vive dentro del repositorio `Instituto` y lee el material de los módulos que
están un nivel más arriba (`Introductorio/`, `Modulo_Uno/` … `Modulo_Cuatro/`).

---

## Cómo se sirven las lecciones

Las lecciones **no** están reescritas en React: las genera el propio Eleventy
de cada módulo, igual que el sitio que ya existía. Reimplementar su aspecto
obligaba a perseguirlo indefinidamente; ejecutarlo produce el original.

```
scripts/construir-lecciones.mjs
        ↓  ejecuta Eleventy en los 5 módulos
public/lecciones/<modulo>/<Leccion>/index.html
        ↓  Next las sirve como archivos estáticos
/lecciones/introductorio/JavaScript_I/
```

Cada módulo se construye con su propio `pathPrefix`, para que Eleventy
reescriba los enlaces internos y los cinco convivan sin pisarse — `/CSS/`
existe en Introductorio y en Modulo_Dos.

El script hace además dos retoques que Eleventy no cubre:

1. **Prefija las rutas absolutas que quedan sueltas.** El `pathPrefix` solo
   afecta a lo que pasa por el filtro `url`. El plugin
   `eleventy-navigation-bootstrap` genera la barra superior sin aplicarlo, y
   las imágenes del material usan rutas escritas a mano.
2. **Envuelve el logo en un enlace al índice**, para poder volver desde
   cualquier lección.

---

## El HTML generado se versiona

`public/lecciones/` **entra en git a propósito**. Así Vercel solo sirve
archivos: no necesita ejecutar Eleventy ni instalar los paquetes `henry-*`,
que se descargan de un CDN externo y podrían dejar de estar disponibles.

El precio es que regenerar produce diffs grandes. Es deliberado.

**Consecuencia práctica:** `npm run build` es solo `next build`, que es lo
que ejecuta Vercel. Regenerar las lecciones es un paso manual.

---

## Comandos

| Comando | Qué hace | Cuándo |
| --- | --- | --- |
| `npm run dev` | Servidor de desarrollo | A diario |
| `npm run lecciones` | Regenera las lecciones con Eleventy | **Al cambiar el material** |
| `npm run build` | Solo `next build`. Es lo que corre Vercel | Automático |
| `npm run build:todo` | Lecciones + build. Para comprobar en local | Antes de desplegar |
| `npx jest` | Tests | Antes de commitear |

### Al modificar una lección

```bash
# 1. editar el README.md del módulo correspondiente
npm run lecciones     # 2. regenerar
npx jest              # 3. comprobar
# 4. commitear los .md Y el HTML generado
```

Si se olvida el paso 2, el sitio desplegado seguirá mostrando la versión
anterior: Vercel no regenera nada.

---

## Estructura

```
plataforma/
├── scripts/construir-lecciones.mjs   Eleventy → public/lecciones/
├── public/lecciones/                 HTML generado (versionado)
├── src/
│   ├── app/                          portada y, más adelante, la app
│   ├── lib/lecciones.ts              lee los README.json del material
│   └── estilos/plataforma/           estilos propios de la app
└── next.config.ts                    reescrituras y trailingSlash
```

`trailingSlash` está activo porque Eleventy genera URLs de directorio con
barra final y dentro de las lecciones hay enlaces relativos. Sin ella, Next
redirige `/Git/` a `/Git` y esos enlaces resuelven un nivel más arriba.

---

## Pendiente

- Los 39 enlaces `./homework` apuntan a una carpeta que Eleventy no publica.
  Su destino natural es la descarga de la plataforma (Fase 3 del plan).
- Las páginas cargan la tipografía Avenir desde un S3 externo, que es el
  comportamiento original del material.
- Dos imágenes que el material referencia pero nunca incluyó:
  `09-React-Routing/EjemploNavBar.png` y `Modulo_Tres/assets/imagen.jpg`.

El plan completo está en
[`docs/superpowers/plans/2026-09-05-plataforma-curso.md`](../docs/superpowers/plans/2026-09-05-plataforma-curso.md).
