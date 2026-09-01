
# Homework JavaScript Avanzado I

## Scope & Hoisting

Determiná que será impreso en la consola, sin ejecutar el código.

> Investiga cuál es la diferencia entre declarar una variable con `var` y directamente asignarle un valor.

```javascript
x = 1;
var a = 5;
var b = 10;
var c = function(a, b, c) {
  var x = 10;
  console.log(x);//10
  console.log(a);//8
   var f = function(a, b, c) {
    b = a;
    console.log(b);//8
    b = c;
    var x = 5;
  }
  f(a,b,c);
  console.log(b);//9
}
c(8,9,10);
console.log(b);//10
console.log(x);//1
```

```javascript
console.log(bar);// undefined 
console.log(baz);//undefined
foo();// 'Hola'
function foo() { console.log('Hola!'); }
var bar = 1;
baz = 2;
```

```javascript
var instructor = "Tony";
if(true) {
    var instructor = "Franco";
}
console.log(instructor);// 'Franco'
```

```javascript
var instructor = "Tony";
console.log(instructor);// 'Tony'
(function() {
   if(true) {
      var instructor = "Franco";
      console.log(instructor); // 'Franco'
   }
})();
console.log(instructor);// 'Tony'
```

```javascript
var instructor = "Tony";
let pm = "Franco";
if (true) {
    var instructor = "The Flash";
    let pm = "Reverse Flash";
    console.log(instructor);//"The Flash"
    console.log(pm);//"Reverse Flash"
}
console.log(instructor);//"The Flash"
console.log(pm);//"Franco"... no cambio porque esta declarda con let
```
### Coerción de Datos

¿Cuál crees que será el resultado de la ejecución de estas operaciones?:

```javascript
6 / "3" // 2 los string se pasan a tipo numero
"2" * "3" // 6 los string se pasan a tipo numero
4 + 5 + "px" //  "9px" los numero se ejecutan y se concatenan con el string quedando en ultimas como string
"$" + 4 + 5 // En esta ocacion solo se unen todos como string por la orden de la ejecucion primero es un string
"4" - 2 // 2 Aqui se convierte un string a numero y se realiza la operacion 
"4px" - 2 // NaN,  el sistema no reconoce el string como numero y devuelve NaN 
7 / 0 //  Infinity
{}[0] // object vacio y un array vacio solo devuelve el array vacio
parseInt("09")// esta funcion convierte el string en numero devoviendo 9
5 && 2// true || true devuelve 2
2 && 5// true || true devuelve 5
5 || 0// true || false devuelve 5
0 || 5// false || true devuelve 5
[3]+[3]-[10] // los arrays los toma como string y los concatena devolviendo 23
3>2>1 // ... false
[] == ![] // el primer array es tomado como un numero y el segundo es una declaracion de tipo boleano // 1 == true // true == true
```

> Si te quedó alguna duda repasá con [este artículo](http://javascript.info/tutorial/object-conversion).


### Hoisting

¿Cuál es el output o salida en consola luego de ejecutar este código? Explicar por qué:

```javascript
function test() {
   console.log(a);// undefindes porque el hoisting sube solo la declaración de a mas no su valor
   console.log(foo());//2 porque la funcion si sube junto a su return

   var a = 1;
   function foo() {
      return 2;
   }
}

test();
```

Y el de este código? :

```javascript
var snack = 'Meow Mix';

function getFood(food) {
    if (food) {
        var snack = 'Friskies';
        return snack;
    }
    return snack;
}

getFood(false);
```


### This

¿Cuál es el output o salida en consola luego de ejecutar esté código? Explicar por qué:

```javascript
var fullname = 'Juan Perez';
var obj = {
   fullname: 'Natalia Nerea',
   prop: {
      fullname: 'Aurelio De Rosa',
      getFullname: function() {
         return this.fullname; // 'Aurelio De Rosa'
      }
   }
};

console.log(obj.prop.getFullname());//  'Aurelio De Rosa'

var test = obj.prop.getFullname;

console.log(test());//'Juan Perez'
```

### Event loop

Considerando el siguiente código, ¿Cuál sería el orden en el que se muestra por consola? ¿Por qué?

```javascript
function printing() {
   console.log(1);// primero
   setTimeout(function() { console.log(2); }, 1000);//cuarto
   setTimeout(function() { console.log(3); }, 0); //tercero
   console.log(4);// segundo
}

printing();
```
