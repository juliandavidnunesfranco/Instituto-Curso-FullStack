// No cambies los nombres de las funciones.

function deObjetoAmatriz(objeto){
  // Escribe una función que convierta un objeto en una matriz, donde cada elemento representa 
  // un par clave-valor en forma de matriz.
  //Ejemplo: 
  /*objeto({
      D: 1,
      B: 2,
      C: 3
    }) ➞ [["D", 1], ["B", 2], ["C", 3]]*/
  //Escribe tu código aquí
      var arr = Object.entries((objeto))
      return arr;

}


function numberOfCharacters(string) {
  //La función recibe un string. Recorre el srting y devuelve el caracter con el número de veces que aparece 
  //en formato par clave-valor.
  //Ej: Recibe ---> "adsjfdsfsfjsdjfhacabcsbajda" || Devuelve ---> { a: 5, b: 2, c: 2, d: 4, f: 4, h:1, j: 4, s: 5 } 
  //Escribe tu código aquí

    var cuentas = {};
    for (i = 0; i < string.length; i++ ) {
      if(cuentas.hasOwnProperty(string[i])){
        cuentas[string[i]] += 1;
      } else {
        cuentas[string[i]] = 1;
      }

    }
      return cuentas;
}




function capToFront(s) {
  //Realiza una función que reciba como parámetro un string y mueva todas las letras mayúsculas
  //al principio de la palabra.
  //Ejemplo: soyCURSO -> CURSOsoy
  //Escribe tu código aquí
    var cap = "";
    var norm = "";
    for (var i = 0; i < s.length; i++){
      if(s[i] === s[i].toUpperCase()){
        cap += s[i];
      } else{
        norm +=  s[i];
      }
    }
    return cap + norm;
}


function asAmirror(str) {
  //La función recibe una frase. 
  //Escribe una función que tome la frase recibida y la devuelva de modo tal que se pueda leer de izquierda a derecha 
  //pero con cada una de sus palabras invertidas, como si fuera un espejo.
  //Ej: Recibe ---> "The Final Challenge is close!" || Devuelve ---> "ehT laniF egnellahC si !esolc"
  //Escribe tu código aquí
    var separada = str.split(" ");
    var result = [];
    for (var i = 0; i < separada.length; i++){
      result.push(separada[i].split("").reverse().join(""));
    }
    return result.join(' ');
} 


function capicua(numero){
  //Escribe una función, la cual recibe un número y determina si es o no capicúa.
  //La misma debe retornar: "Es capicua" si el número se número que se lee igual de 
  //izquierda a derecha que de derecha a izquierda. Caso contrario retorna "No es capicua"
  //Escribe tu código aquí
   numeroInvert = Number(numero.toString().split('').reverse().join(''));
    if (numero === numeroInvert){
      return "Es capicua";
    }else {
      return "No es capicua";
    }

}


function deleteAbc(cadena){
  //Define una función que elimine las letras "a", "b" y "c" de la cadena dada 
  //y devuelva la versión modificada o la misma cadena, en caso de contener dichas letras.
  //Escribe tu código aquí
  
    cadenasinabc = '';

  for(let i = 0; i < cadena.length; i++){
    if (cadena[i] === "a" || cadena[i] === "b" || cadena[i] === "c"){
      cadena[i];
  } else {
      cadenasinabc = cadenasinabc + cadena[i];
  }
  }
  return cadenasinabc;
}


function sortArray(arr) {
  //La función recibe una matriz de strings. Ordena la matriz en orden creciente de longitudes de cadena
  //Ej: Recibe ---> ["You", "are", "beautiful", "looking"] || Devuelve ---> [“You", "are", "looking", "beautiful"]
  //Escribe tu código aquí
     return arr.sort((a, b) => a.length - b.length);
}




function buscoInterseccion(arreglo1, arreglo2){
  //Existen dos arrays, cada uno con 5 números. A partir de ello, escribir una función que permita 
  //retornar un nuevo array con la intersección de ambos elementos. (Ej: [4,2,3] unión [1,3,4] = [3,4].
  //Si no tienen elementos en común, retornar un arreglo vacío.
  //Aclaración: los arreglos no necesariamente tienen la misma longitud
  //Escribe tu código aquí  
        var repetidos =[];
          for (var i =0; i < arreglo1.length; i++){
            for (var j =0; j < arreglo2.length; j++){
        if(arreglo1[i] === arreglo2[j]){
     repetidos.push(arreglo1[i])}}
  }
  return repetidos;
}



// No modificar nada debajo de esta línea
// --------------------------------

module.exports = {
   deObjetoAmatriz,
   numberOfCharacters,
   capToFront,
   asAmirror,
   capicua,
   deleteAbc,
   sortArray,
   buscoInterseccion,
};

