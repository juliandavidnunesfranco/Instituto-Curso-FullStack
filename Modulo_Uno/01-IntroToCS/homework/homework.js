'use strict'

function BinarioADecimal(num) {
  // tu codigo aca
   var decimal = num.split('').reverse();
  var arr = [];
  for(let i = 0; i < decimal.length; i++){
    arr.push((2**i)*decimal[i]);
  }
  
  var resp = arr.reduce((acc, elem) => acc + elem);
  return parseInt(resp);

}
// return num.parceIn(num);

/* var decimal = 0;
   for (var i = 0; i < num.length; i++ ){
    decimal = decimal + num[i] * 2 ** (num.length - 1 - i)
   }
    return decimal;

 */



function DecimalABinario(num) {
  // tu codigo aca
  return num.toString(2);
}
/* var binario = "";
  while(num >=1){
    binario = num % 2 + binario;
    num - Math.floor(num / 2);
  }
  return binario;
 */

module.exports = {
  BinarioADecimal,
  DecimalABinario,
}