"use strict";

/*
Implementar la clase LinkedList, definiendo los siguientes métodos:
  - add: agrega un nuevo nodo al final de la lista;
  - remove: elimina el último nodo de la lista y retorna su valor (tener en cuenta el caso particular de una lista de un solo nodo y de una lista vacía);
  - search: recibe un parámetro y lo busca dentro de la lista, con una particularidad: el parámetro puede ser un valor o un callback. En el primer caso, buscamos un nodo cuyo valor coincida con lo buscado; en el segundo, buscamos un nodo cuyo valor, al ser pasado como parámetro del callback, retorne true. 
  Ejemplo: 
  search(3) busca un nodo cuyo valor sea 3;
  search(isEven), donde isEven es una función que retorna true cuando recibe por parámetro un número par, busca un nodo cuyo valor sea un número par.
  En caso de que la búsqueda no arroje resultados, search debe retornar null.
*/

function LinkedList() {
  this._length = 0;
  this.head = null;
}

function Node(value) {
  this.value = value;
	this.next = null;
}


//Agruega un nodo al final de la lista.

LinkedList.prototype.add = function(value) {
  let node = new Node(value)
  let current = this.head;
  
  if (!current) {
      this.head = node;
      this._length++;
      return node;
  }
  
  while (current.next != null) {
      current = current.next;
  }
  current.next = node;
  this._length++;
  return node;
};

//Elimina un nodo al final de la lista y retorna su valor .
LinkedList.prototype.remove = function(){
  let current = this.head;
    if(!current) return null;
    // la anterior es si la lista esta vacia
        if(!current.next){
          let ultimo = current.value; // aca definimo una variable para guardar el elemento a eliminar
          this.head = null;    // Aca eliminamos ese unico elemento
          this._length--;     // mermamos el contador
          return ultimo;      //retornamos el valor del elemento eliminado
        }
        // la anterior interaccion es si la lista solo tiene un elemento.

        while(current.next.next != null){   // aca le estamos diciendo que avance saltandose uno y pregunte si es 
              current = current.next;       // diferente de null, hasta que esa condicion se de 
        }                                   // en ese momento se hace current justo un node antes del null 

        let ultimo = current.next.value;    // nuevamente declaramos la variable para guardar el valor a eliminar
        current.next = null;                // eliminamos desde la antepenultima node el ultimo node
        this._length--;                     // mermamos y retornamos el valor eliminado
        return ultimo;                    
 
  /*
  if(this.head==null){
    return null;
  } else {
    var prox= this.head;
        //un solo elemento
    if(prox.next===null){
      this.head = null;
      return prox.value;
    }
    var ant = prox.next; 
    while(prox.next!==null){
        ant = prox;
        prox= prox.next;
    }
    ant.next=null;
    return prox.value;
  }*/

  
}


//recibe un parámetro y lo busca dentro de la lista.
LinkedList.prototype.search = function(value){
  let current = this.head;                                        // current sera la cabeza
  if(!current) return null;                                        // sino tiene cabeza entonces return null
  while(current){                                                   // mientras avance de a uno
    if(current.value === value) return current.value;               // si el valor pasado por argumento es la posicion de current entonces devuelva el valor
    else if (typeof value === 'function'){                        // si el valor pasado es una function realice :
      if(value(current.value) === true){                          // que el resultado de la function se cumpla dentro del nodo que ocupa 
        return current.value;                                     // y retorne el valor 
      }
    }
      current = current.next;                                     // siga avanzando
  }
  return null;                                                    // sino se cumplen los anteriores requerimientos entonces null

  };



/*
Implementar la clase HashTable.

Nuetra tabla hash, internamente, consta de un arreglo de buckets (slots, contenedores, o casilleros; es decir, posiciones posibles para almacenar la información), donde guardaremos datos en formato clave-valor (por ejemplo, {instructora: 'Ani'}).
Para este ejercicio, la tabla debe tener 35 buckets (numBuckets = 35). (Luego de haber pasado todos los tests, a modo de ejercicio adicional, pueden modificar un poco la clase para que reciba la cantidad de buckets por parámetro al momento de ser instanciada.)

La clase debe tener los siguientes métodos:
  - hash: función hasheadora que determina en qué bucket se almacenará un dato. Recibe un input alfabético, suma el código numérico de cada caracter del input (investigar el método charCodeAt de los strings) y calcula el módulo de ese número total por la cantidad de buckets; de esta manera determina la posición de la tabla en la que se almacenará el dato.
  - set: recibe el conjunto clave valor (como dos parámetros distintos), hashea la clave invocando al método hash, y almacena todo el conjunto en el bucket correcto.
  - get: recibe una clave por parámetro, y busca el valor que le corresponde en el bucket correcto de la tabla.
  - hasKey: recibe una clave por parámetro y consulta si ya hay algo almacenado en la tabla con esa clave (retorna un booleano).

Ejemplo: supongamos que quiero guardar {instructora: 'Ani'} en la tabla. Primero puedo chequear, con hasKey, si ya hay algo en la tabla con el nombre 'instructora'; luego, invocando set('instructora', 'Ani'), se almacenará el par clave-valor en un bucket específico (determinado al hashear la clave)
*/

function HashTable() {
  this.buckets = [];
  this.numBuckets = 35;
}


  HashTable.prototype.hash = function(key){
    let suma = 0;
    for (var i =0; i < key.length; i++){
      suma += key.charCodeAt(i);
    }
    return suma % this.numBuckets;
  };

  HashTable.prototype.set = function(key, value){
    if(typeof key !== 'string')  throw new TypeError("Keys must be strings");
    let i = this.hash(key);
    if(this.buckets[i] === undefined){
      this.buckets[i] = {};
    }
    this.buckets[i][key] = value;

  };

  HashTable.prototype.get = function(key){
  let i = this.hash(key);
  return this.buckets[i][key];
  };

  HashTable.prototype.hasKey = function(key){
  let i = this.hash(key);
  return this.buckets[i].hasOwnProperty(key);
  };



// No modifiquen nada debajo de esta linea
// --------------------------------

module.exports = {
  Node,
  LinkedList,
  HashTable,
};
