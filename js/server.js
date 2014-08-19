var express = require('express'),
    app = express(),
    port = process.argv.length > 2 && process.argv[2] || 8080;

// express 3- used to have a configure method: app.configure('development', function() { app.use()... });
// should be replaced by something like if (app.get('env') === 'development') { app.use()...} in express 4+
// app.configure(function(){
// });

app.use('/', express.static(__dirname));

//  app.get('/', function(req, res){
//      res.sendfile('index.htm');
// });

// app.use(function(req, res, next) {
// 	res.status(404);
//
//     res.sendfile('static/404.html');
// });

console.log('Listening to port:', port);

app.listen(port)
