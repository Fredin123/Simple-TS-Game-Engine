var express = require('express')
var path = require('path')
var app = express()
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static(path.join(__dirname, '../') + 'dist/'))

app.get('/', function (req, res) {
  //console.log("Try get: ",path.join(__dirname, '../') + 'dist/');
  res.sendFile(path.join(__dirname, '../') + 'dist');
});

http.listen(3000, function() {
  var host = http.address().address
  var port = http.address().port
  console.log('App listening at http://%s:%s', host, port)
});
