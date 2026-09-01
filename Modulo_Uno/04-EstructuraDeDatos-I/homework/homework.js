'use strict'

/*
Definir las funciones recursivas nFactorial y nFibonacci.

nFactorial(n) debe retornar el factorial de n sabiendo que, siendo n un número natural, su factorial (representado como n!) es el producto de n por todos los números naturales menores que él y mayores a 0. Ejemplo: 5! = 5 * 4 * 3 * 2 * 1

nFibonacci(n) debe retornar el enésimo número de la secuencia de Fibonacci, tomando al 0 y al 1, respectivamente, como primer y segundo elementos de la misma, y sabiendo que cualquier elemento que se agregue a esta secuencia será el resultado de la suma del último elemento y el anterior.
Ejemplo: nFibonacci(7) retornará 13, ya que 13 es el dígito que está en la posición 7 de la secuencia.

Secuencia:  0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ... 


Como ejercicio adicional y completamente opcional, al terminar de resolver este problema pueden intentar definir funciones que logren los mismos resultados pero de manera iterativa.
*/

function nFactorial(n) {
  if(n == 0 || n == 1){
     return 1
    }else if (n < 0){
      return ;
    } 
    var solucion =  n * nFactorial(n - 1);
      return solucion;
}

function nFibonacci(n) {
  
    if(n < 2){
      return n;
    }else{    
    return nFibonacci(n-1) + nFibonacci(n-2);
    }
    
      /*if(n === 0 ) return 0;
      if(n === 1 ) return 1;
      return nFibonacci(n-1) + nFibonacci(n-2);*/

    /* const fib=[0, 1]
    for(let i = 2; i <= n; i++)
    fib[i] = fib[i -2] + fib[i - 1]
    return fib[n]
     */

}

/*
Implementar la clase Queue, sabiendo que es una estructura de tipo FIFO, donde el primer elemento que ingresa es el primero que se quita. Definir los siguientes métodos:
  - enqueue: agrega un valor respetando el orden.
  - dequeue: remueve un valor respetando el orden. Retorna undefined cuando la queue está vacía.
  - size: retorna el tamaño (cantidad de elementos) de la queue.

Pueden utilizar class o función constructora.
*/
/*
  function Queue(){
    this.queue = [];
      this.enqueue = function(elemento){
        return this.queue.push(elemento);
      }
      this.dequeue = function(){
        return this.queue.shift();
      }

      this.size = function(){
        return this.queue.length;
      }

  }*/



  class Queue {
    constructor(){
      this.queue = [];
      
    }
    enqueue(elemento){
      this.queue.push(elemento);
     }
     dequeue(){
        return this.queue.shift();
      }
 
     size(){ 
        
       return this.queue.length;
     }


    
  }

 /* class Node {
    constructor(value){
      this.value = value
      this.next = null
    }   
  }

  class Queue {
  constructor() {
    this.first = null;
    this.last = null;
    this.size = 0;
  }
  enqueue(val) {
    const newNode = new Node(val);
    if (this.first) {
      this.first = newNode;
      this.last = newNode;
    } else {
      this.last.next = newNode;
      this.last = newNode;
    }
    return ++this.size;
  }
  dequeue() {
    if (this.first)
      return undefined;

    const temp = this.first;
    if (this.first === this.last) {
      this.last = null;
    }
    this.first = this.first.next;
    this.size--;
    return temp.value;
  }
}



Queue.prototype.size = function(){
  return this.size
}*/

//const newQueue = new Queue();
//newQueue.enqueue();










// No modifiquen nada debajo de esta linea
// --------------------------------

module.exports = {
  Queue,
  nFactorial,
  nFibonacci
};
