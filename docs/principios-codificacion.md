# Principios de codificación

Aplican al **código nuevo** (zona nueva). La zona archivo se preserva tal
cual; ver `restricciones.md` §2.

---

## 0. El principio que gobierna a los demás

Este repositorio es material de estudio. El código de la zona nueva se lee
más veces de las que se ejecuta, y quien lo lee está aprendiendo.

> **Optimizar para el lector que no conoce el contexto.**

Cuando haya conflicto entre "elegante" y "evidente", gana evidente. Un
`reduce` anidado que ahorra cuatro líneas pero exige releerlo tres veces es
una mala decisión aquí, aunque sea buena en un producto.

---

## 1. Claridad

**Nombres que dicen la intención, no el tipo.**

```js
// ❌
const arr = users.filter(u => u.a > 18)
const data = await fetch(url)

// ✅
const adultos = usuarios.filter(usuario => usuario.edad > 18)
const respuestaPerfil = await fetch(url)
```

**Una función, una responsabilidad.** Si al describirla usas "y", divídela.

**Anidamiento máximo de 3 niveles.** Más allá, extrae función o invierte la
condición con salida temprana:

```js
// ❌
function procesar(pedido) {
  if (pedido) {
    if (pedido.items.length > 0) {
      if (pedido.pagado) { /* ... */ }
    }
  }
}

// ✅
function procesar(pedido) {
  if (!pedido) return
  if (pedido.items.length === 0) return
  if (!pedido.pagado) return
  // ...
}
```

**Comentar el porqué, no el qué.** El código dice qué hace; el comentario
explica por qué se eligió así.

```js
// ❌ Incrementa el contador
contador++

// ✅ El índice arranca en 1 porque la API pagina desde 1, no desde 0
let pagina = 1
```

---

## 2. Errores

**Fallar rápido y con contexto.** Un error debe decir qué se esperaba, qué
llegó y dónde.

```js
// ❌
if (!usuario) throw new Error('Error')

// ✅
if (!usuario) {
  throw new Error(`Usuario ${id} no encontrado en la base de datos`)
}
```

**Nunca silenciar.** Un `catch` vacío convierte un fallo en un bug
invisible. Si de verdad se puede ignorar, deja escrito por qué:

```js
// ❌
try { await notificar(usuario) } catch (e) {}

// ✅
try {
  await notificar(usuario)
} catch (error) {
  // La notificación no es crítica: el pedido ya se guardó.
  // Se registra pero no se propaga.
  console.error('Fallo al notificar:', error.message)
}
```

**No inventar valores por defecto para ocultar un fallo.** Devolver `[]`
cuando la consulta falló hace que el llamador crea que no hay datos, en
lugar de saber que algo se rompió.

Skill: `error-handling-patterns`.

---

## 3. Tests

**El test describe comportamiento, no implementación.**

```js
// ❌ describe cómo está hecho
it('llama a filter y luego a map', ...)

// ✅ describe qué garantiza
it('devuelve solo los usuarios mayores de edad, ordenados por nombre', ...)
```

**Cubrir el caso límite, no solo el feliz.** Entrada vacía, nulos, valores
en la frontera, entrada malformada.

**Un test que nunca falló no prueba nada.** Al escribirlo, verifica que
falla antes de implementar (rojo → verde).

**Nunca ajustar el test para que pase.** Ver `restricciones.md` §3.

Skills: `test-driven-development`, `testing-patterns`,
`javascript-testing-patterns`.

---

## 4. Diseño

**No abstraer antes de tiempo.** Tres repeticiones antes de extraer. Una
abstracción prematura basada en un caso es casi siempre la abstracción
equivocada, y cuesta más deshacerla que haber duplicado.

**Dependencias hacia adentro.** La lógica de negocio no debe saber de HTTP,
del ORM ni del framework. Eso permite probarla sin levantar nada.

**Funciones puras por defecto.** Aísla los efectos (I/O, fechas,
aleatoriedad, red) en los bordes. Lo puro se prueba sin mocks.

**Estado mínimo.** Cada pieza de estado mutable es una fuente de bugs.
Antes de agregar una, pregunta si se puede derivar de lo que ya existe.

Skills: `clean-code`, `solid-principles`, `backend-architect`.

---

## 5. React y Next.js 16

**Server Component por defecto.** `'use client'` solo cuando haga falta
estado, efectos o manejadores de eventos. Si un componente cliente es
grande, divídelo: padre servidor + hijo cliente pequeño.

**Las APIs de request son asíncronas.** `params`, `searchParams`,
`cookies()`, `headers()` y `draftMode()` devuelven promesas — ver
`restricciones.md` §5 con el ejemplo.

**El estado del servidor no va en el store del cliente.** Datos que vienen
del servidor se obtienen en el servidor. Redux/Zustand son para estado de
interfaz.

**Listas con clave estable.** El índice del array como `key` rompe el
reconciliador cuando la lista se reordena o filtra.

Skills: `nextjs-best-practices`, `nextjs-app-router-patterns`,
`react-best-practices`, `react-state-management`.

---

## 6. Base de datos

**Migraciones versionadas y reversibles.** Nunca modificar el esquema a
mano fuera de una migración.

**Índices para lo que se consulta.** Toda columna en `WHERE`, `JOIN` u
`ORDER BY` frecuente es candidata.

**Cuidado con el N+1.** Consultar dentro de un bucle es el problema de
rendimiento más común. Se resuelve con `JOIN` o carga anticipada.

**Consultas parametrizadas siempre.** Concatenar entrada de usuario en SQL
es inyección. Sin excepciones.

Skills: `database-design`, `postgres-best-practices`,
`sql-optimization-patterns`.

---

## 7. Seguridad

- Validar en el servidor. La validación en cliente es comodidad, no defensa.
- Nunca versionar secretos. Ver la alerta activa en `restricciones.md` §6.
- No registrar datos sensibles en logs (contraseñas, tokens, PII).
- Autorizar cada endpoint. Autenticado ≠ autorizado.

Skill: `security-review`.

---

## 8. Git

- **Commits atómicos.** Un cambio conceptual por commit.
- **Mensaje en imperativo** que explique el porqué: `Corregir cálculo de
  descuento en pedidos con cupón` supera a `fix bug`.
- **No commitear código comentado.** El historial ya lo guarda.
- **Revisar antes de commitear.** `git diff --cached`.

Skill: `git-workflow`.

---

## 9. Antes de dar algo por terminado

1. ¿Ejecuté lo que modifiqué?
2. ¿Pasan los tests? ¿Los ejecuté de verdad o lo asumí?
3. ¿Probé el caso límite, no solo el feliz?
4. ¿Un lector sin contexto entendería esto?
5. ¿Dejé código muerto, `console.log` o TODO sin registrar?

Skill: `superpowers:verification-before-completion`.

> Afirmar que algo funciona sin haberlo ejecutado es el fallo más caro,
> porque traslada el costo de descubrirlo a quien confía en la afirmación.
