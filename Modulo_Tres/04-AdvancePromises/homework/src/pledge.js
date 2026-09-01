'use strict';
/*----------------------------------------------------------------
Promises Workshop: construye la libreria de ES6 promises, pledge.js
----------------------------------------------------------------*/
// // TU CÓDIGO AQUÍ:
function $Promise(executor){
    if (typeof executor !== 'function') throw new TypeError('executor must be a function');
    this._state = 'pending';
    this._handlerGroups = []; // [{successCb: false, errorCb: e2, downStreamPromise}]
    executor(this._internalResolve.bind(this), this._internalReject.bind(this));
};
$Promise.prototype._internalResolve = function(data){
  if(this._state === 'pending'){
    this._state = 'fulfilled';
    this._value = data;
    this._callHandlers();
    
  }
};
$Promise.prototype._internalReject = function(reason){
  if(this._state === 'pending'){
    this._state = 'rejected';
    this._value = reason;
    this._callHandlers();
  }
};
$Promise.prototype.then = function(successCb, errorCb){
  if(typeof successCb !== 'function') successCb = false;
  if(typeof errorCb !== 'function') errorCb = false;

  let downstreamPromise = new $Promise(function(){});

  this._handlerGroups.push({successCb, errorCb, downstreamPromise});

  if(this._state !== 'pending'){
    this._callHandlers();
  }

  return downstreamPromise;
};

$Promise.prototype._callHandlers = function(){
  while(this._handlerGroups.length > 0){
    var handlersActuales = this._handlerGroups.shift(); //{successCb: false, errorCb: e1, downstreamPromise: new $Promise}
    if(this._state === 'fulfilled'){
      //andlersActuales.successCb && handlersActuales.successCb(this._value);
      if(!handlersActuales.successCb){
        handlersActuales.downstreamPromise._internalResolve(this._value);
      } else {
        try {
          const result = handlersActuales.successCb(this._value);
          if(result instanceof $Promise){ //promesa
            result.then(data => handlersActuales.downstreamPromise._internalResolve(data),
            err => handlersActuales.downstreamPromise._internalReject(err));
          } else {
            handlersActuales.downstreamPromise._internalResolve(result);
          }
        } catch (error) {
          handlersActuales.downstreamPromise._internalReject(error);
        }
      }
    } else {
      //handlersActuales.errorCb && handlersActuales.errorCb(this._value);
      if(!handlersActuales.errorCb){
        handlersActuales.downstreamPromise._internalReject(this._value);
      } else {
        try {
          const result = handlersActuales.errorCb(this._value);
          if(result instanceof $Promise){
            result.then(data => handlersActuales.downstreamPromise._internalResolve(data),
            err => handlersActuales.downstreamPromise._internalReject(err));
          } else {
            handlersActuales.downstreamPromise._internalResolve(result);
          }
        } catch (error) {
          handlersActuales.downstreamPromise._internalReject(error);
        }
      }
    }
  }
};

$Promise.prototype.catch = function(errorCb){
  return this.then(null, errorCb);
}

module.exports = $Promise;
/*-------------------------------------------------------
El spec fue diseñado para funcionar con Test'Em, por lo tanto no necesitamos
realmente usar module.exports. Pero aquí está para referencia:

module.exports = $Promise;

Entonces en proyectos Node podemos esribir cosas como estas:

var Promise = require('pledge');
…
var promise = new Promise(function (resolve, reject) { … });
--------------------------------------------------------*/
