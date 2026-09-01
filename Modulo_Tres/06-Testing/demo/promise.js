function promisifiedFunction(flag) {
  return new Promise((resolve, reject) => {
    // Simulate async code
    setTimeout(() => {
      flag ? resolve('Promesa OK') : reject('Rejected Promise');
    }, 1000);
  });
}

// promisifiedFunction()
//   .then(data => console.log(data));

module.exports = promisifiedFunction;