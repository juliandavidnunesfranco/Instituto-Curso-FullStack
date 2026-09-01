var _ = require('underscore');
var lodash = require('lodash');

console.log('se ejecuto el codigo de este modulo');

_.each(['estoy', 'usando', 'underscore', 'en el', 'browser'], console.log);

var objeto = {
  curso: true,
  bundeler: 'webpack',
}

// console.log(objeto[0].hola); // va a tirar un error en runtime;

module.exports = objeto;

