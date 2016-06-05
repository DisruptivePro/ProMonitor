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
   var temp = getRandomInt(100,120);

    // SQL Query > Select Data
    var query = client.query("SELECT *, cast(created_at as time) AS time FROM tblchar ORDER BY id DESC LIMIT 15");

    // Stream results back one row at a time
    query.on('row', function(row) {
      data.push(row);
    });

    query.on('end', function() {
          // console.log(results);
          dataset = {
            labels: [],
            temp: [],
            labels2: [],
            humidity: [],
            labels3: [],
            pressure: [],
            labels4: [],
            co: [],

            // status: status,
            // mode: mode,
            // batt: batt,
            // lat: lat,
            // long: long,
            // alt: alt,
            // speed: speed
          }

          var l = [], t = [];
          var l2 = [], h = [];
          var l3 = [], p = [];
          var l4 = [], c = [];

          for (var i = data.length - 1; i >= 0; i--) {
            json = data[i];

            tiempo = json.time.split(':');
            tiempo = tiempo[0] + ':' + tiempo[1];

            l.push(tiempo);
            t.push(parseFloat(json.temp).toFixed(2));

            l2.push(tiempo);
            h.push(parseFloat(json.humidity).toFixed(2));

            l3.push(json.temp + 'C');
            // hPa
            p.push(parseFloat(json.pressure/100).toFixed(2));

          }

          dataset.labels = l;
          dataset.temp = t;

          dataset.labels2 = l2;
          dataset.humidity = h;

          dataset.labels3 = l3;
          dataset.pressure = p

          io.sockets.emit('setChartData', dataset);
          // client.end();
      });
   
  },1000);

});


var serialport = require("serialport");

var SerialPort = serialport.SerialPort;

var serialPort = new SerialPort("/dev/tty.usbmodem1431", {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
}, false);


serialPort.open(function (error) {
  if ( !error ) {
    console.log('Port open.');
    
    serialPort.on('data', function(data) {
      console.log('data: ' + data.toString());
      data = data.toString();
      data = data.replace('[', '');
      data = data.replace(']', '');
      data = data.split(',');
      console.log(data.length)

      var results = [];

      results.push(data[0]);
      results.push(getRandomInt(0.2, 1.7));

      // SQL Query > Insert Data
    client.query("INSERT INTO tblchar(temp, humidity, pressure, created_at, updated_at) values($1, $2, $3, NOW(), NOW())", [data[0], data[1], 0]);
    console.log('Data inserted!');

      // io.sockets.emit('setData', results);

      serialPort.flush();
    });

    serialPort.write("ok:ok\n", function(err, results) {
      if (err) {
        console.log('err ' + err);
      }
      // console.log('results ' + results);
    });

  }
});


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 0.1)) + min;
}

console.log('Drone Data Collector System on port 8080');