var express  = require('express'), http = require('http');
var pg = require('pg');

var moment = require('moment');
var morgan = require('morgan');


//* set up our express application *//
var app = express();
var server = http.createServer(app);
server.listen(8080);

var io = require('socket.io').listen(server);

// log every request to the console
app.use(morgan('dev'));

// route public files
app.use(express.static('public'));

// set up ejs for templating
app.set('view engine', 'ejs');

// database ======================================================================
var connectionString = "postgres://postgres:Ch0pper04@localhost/prolec_db";

var client = new pg.Client(connectionString);
client.connect(function(err) {
  if(err) {
    return console.error('Could not connect to postgres', err);
  }
  client.query('SELECT id AS "indxs" FROM tblTest', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }

    if (result.rows.length > 0) {
    	console.log(result.rows[0].indx);
    }

    // client.end();
  });
});


// routes ======================================================================
// load our routes
require('./controller/routes.js')(app);


// Socket.io ======================================================================
io.on('connection', function (socket) {
  console.log("Connecting sockets...");
  io.sockets.emit('comm', "Server On.");
  // setInterval(function(){
  //  var data = [];

  //  for (var i = 0; i < 7; i++) {
  //    data.push(getRandomInt(0,60));
  //  }

  //   io.sockets.emit('setData', data);
  // },5000);

});

console.log('Drone Data Collector System on port 8080');