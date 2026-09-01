var fs = require('fs');
var request = require('request');

module.exports = {
    pwd: function(args, done) {done(process.cwd())},
    date: function(args, done) {done(Date())},
    ls: function(args, done){
        fs.readdir('.', function(err, files) {
            if (err) throw err;
            var out = ''
            files.forEach(function(file) {
              //process.stdout.write(file.toString() + "\n");
              out = out + file + '\n'
            })
                done(out);
            //process.stdout.write("prompt > ");
          });
    },

    echo: function(args, done){
        //process.stdout.write(args.join(' '));
        done(args.join(' '))
    },

    cat: function(file, done){
        fs.readFile(file[0], 'utf8', function(err, data){
            if(err) throw err;
            //process.stdout.write(data);
            //process.stdout.write("\nprompt > ");       
            done(data);
        })
    },

    head: function(file, done){
        fs.readFile(file[0], 'utf8', function(err, data){
            if(err) throw err;
            const lines = data.split('\n').slice(0, 10).join('\n');
            //process.stdout.write(lines);
           // process.stdout.write("\nprompt > ");       
           done(lines);
        })
    },
    
    tail: function(file, done){
        fs.readFile(file[0], 'utf8', function(err, data){
            if(err) throw err;
            const lines = data.split('\n').slice(-10).join('\n');
            //process.stdout.write(lines);
            //process.stdout.write("\nprompt > ");       
            done(data);
        })
    },
    curl: function(url, done){
            request(url[0], function(err,response, body){
                if(err) throw err;
                //process.stdout.write(body);
              //  process.stdout.write("\nprompt > ");       
                    done(body);
            })
    }
    


}