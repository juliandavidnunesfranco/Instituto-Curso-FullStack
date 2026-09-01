"use strict";

/*
 Implementar la clase BinarySearchTree, definiendo los siguientes métodos recursivos:
  - size: retorna la cantidad total de nodos del árbol
  - insert: agrega un nodo en el lugar correspondiente
  - contains: retorna true o false luego de evaluar si cierto valor existe dentro del árbol
  - depthFirstForEach: recorre el árbol siguiendo el orden depth first (DFS) en cualquiera de sus variantes, según se indique por parámetro ("post-order", "pre-order", o "in-order"). Nota: si no se provee ningún parámetro, hará el recorrido "in-order" por defecto.
  - breadthFirstForEach: recorre el árbol siguiendo el orden breadth first (BFS)
​
  El ábrol utilizado para hacer los tests se encuentra representado en la imagen bst.png dentro del directorio homework.
*/

function BinarySearchTree(value) {
  this.value = value;
  this.left = null;
  this.right = null;
};

BinarySearchTree.prototype.size = function(){
  //caso de corte(hoja)
  if(this.left === null && this.right === null){
    return 1;
  }
  //solo hijo izq.
  if(this.left !== null && this.right === null){
    return 1 + this.left.size();
  }
  //solo hijo der.
  if(this.left === null && this.right !== null){
    return 1 + this.right.size();
  }
  //tiene ambos hijos
  if(this.right !== null && this.left !== null){
    return 1 + this.left.size() + this.right.size();
  }
};

BinarySearchTree.prototype.insert = function(valor){
  //si es mayor --> der
  if(valor >= this.value){
    if(this.right !== null){
      this.right.insert(valor);
    } else {
      this.right = new BinarySearchTree(valor);
    }
  }
  //si es menor --> izq
  if(valor < this.value){
    if(this.left !== null){
      this.left.insert(valor);
    } else {
      this.left = new BinarySearchTree(valor);
    }
  }
};

BinarySearchTree.prototype.contains = function(valor){
  //valor nodo root
  if(this.value === valor) return true;

  //mayor que el nodo root
  if(valor > this.value){
    if(this.right === null) {
      return false;
    } else {
      return this.right.contains(valor);
    }
  //menor que el nodo root  
  } else {
    if(this.left === null){
      return false;
    } else {
      return this.left.contains(valor);
    }
  }
};

BinarySearchTree.prototype.depthFirstForEach = function(cb, order){
  if(order === 'in-order' || !order){           //izq-nodo-der
    if(this.left !== null){
      this.left.depthFirstForEach(cb, order)
    };
    cb(this.value);
    if(this.right !== null){
      this.right.depthFirstForEach(cb, order);
    };

  } else if(order === 'pre-order'){             //nodo-izq-der
    cb(this.value);
    if(this.left !== null){
      this.left.depthFirstForEach(cb, order);
    };
    if(this.right !== null){
      this.right.depthFirstForEach(cb, order);
    };

  } else {                                      //izq-der-nodo
      if(this.left !== null){
        this.left.depthFirstForEach(cb, order);
      };
      if(this.right !== null){
        this.right.depthFirstForEach(cb, order);
      };
      cb(this.value);
  }
};

BinarySearchTree.prototype.breadthFirstForEach = function(cb, array){
  if(!array){   //primera vez que llamo la function, no tengo array
    var array = []
  };

  cb(this.value);

  if(this.left !== null){
    array.push(this.left);
  }

  if(this.right !== null){
    array.push(this.right);
  }

  if(array.length > 0){
    array.shift().breadthFirstForEach(cb, array);
  }
};

// No modifiquen nada debajo de esta linea
// --------------------------------

module.exports = {
  BinarySearchTree,
};