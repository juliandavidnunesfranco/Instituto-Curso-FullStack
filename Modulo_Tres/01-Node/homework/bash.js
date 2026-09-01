/* // Output un prompt
process.stdout.write('prompt > ');
// El evento stdin 'data' se dispara cuando el user escribe una línea
process.stdin.on('data', function (data) {
  var cmd = data.toString().trim(); // remueve la nueva línea
  process.stdout.write('You typed: ' + cmd);
  process.stdout.write('\nprompt > ');
});
 */
const commands = require('./commands');

const done = function(output){
    process.stdout.write(output);
    process.stdout.write('\nprompt > ');

}

// Output un prompt
process.stdout.write('prompt > ');
// El evento stdin 'data' se dispara cuando el user escribe una línea
process.stdin.on('data', function(data) {
    var args = data.toString().trim().split(' ')
    var cmd = args.shift()
  if(commands.hasOwnProperty(cmd)){
    commands[cmd](args, done);
  }else{
    process.stdout.write('command not found');
  }
  
  /* if(cmd === 'date') {
    process.stdout.write(Date());  
  }
  if(cmd === 'pwd') {
            process.stdout.write(process.cwd());
    } */
  //process.stdout.write('\nprompt > ');
});
