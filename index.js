var express  = require('express'), http = require('http');
var bodyParser = require('body-parser')
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

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

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
require('./controller/routes.js')(app, client);


// Socket.io ======================================================================
io.on('connection', function (socket) {
  console.log("Connecting sockets...");
  io.sockets.emit('comm', "Server On.");
  
  setInterval(function(){
   var data = [];

   // Humidity
   data.push(getRandomInt(0.2,1.7));

   // Temp
   data.push(getRandomInt(100,120));
   
    io.sockets.emit('setData', data);
  },1000);

});

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 0.1)) + min;
}

console.log('Drone Data Collector System on port 8080');