var cors = require('cors');
var fs = require('fs');
var http      = require('http');
var https     = require('https');
var express   = require('express');
var sleep = require('sleep');
var passport = require('passport');
var Strategy = require('passport-http-bearer').Strategy;
var db = require('./db');
var ip = require('ip');




var Gpio   = require('pigpio').Gpio;


// Configure the Bearer strategy for use by Passport.
passport.use(new Strategy(
  function(token, cb) {
    db.users.findByToken(token, function(err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      return cb(null, user);
    });
  }));



var app = express();
// Configure Express application.
app.use(cors());
app.use(express.static(__dirname));
// for use in passport
app.use(require('morgan')('combined'));


// get the ip address of this server
var myip = ip.address() // my ip address
console.log(myip);

var pwdMin=500
var pwdMax=2000

var Lprop =  new Gpio(2,{mode: Gpio.OUTPUT})
var Rprop =  new Gpio(3,{mode: Gpio.OUTPUT})

Lprop.servoWrite(pwdMax)
Rprop.servoWrite(pwdMax)
sleep.sleep(1)

Lprop.servoWrite(pwdMin)
Rprop.servoWrite(pwdMin)
sleep.sleep(1)



// Duration of rotation for each step
var milliseconds_per_step = 500;
var currentPos = 1;

// move rover N steps forward
app.get('/forward/:steps', function (req, res) {

  var steps = Number(req.params.steps);
  currentPos = currentPos + steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_forward(steps);
});


// move rover N steps backward
app.get('/backward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  currentPos = currentPos - steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_backward(steps);

});


// move rover N steps backward
app.get('/leftward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  currentPos = currentPos - steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_leftward(steps);

});

// move rover N steps backward
app.get('/rightward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  currentPos = currentPos - steps;
  res.send(String(currentPos));
  console.log('Forward ' + steps + ' steps' + '. Final position = ' + currentPos);
  move_rightward(steps);

});


// reset rover state
app.get('/reset', function (req, res) {
  currentPos = 1;
  res.send(String(currentPos));
  console.log('Reset bot to 1 and stopping');
  stop()
});

// reset rover state
app.get('/stop', function (req, res) {
  currentPos = 1;
  res.send(String(currentPos));
  console.log('Stopping ...');
  stop()
});


function move_forward(steps) {
  console.log('Started moving forward...');

  // start forward movement
  Lprop.servoWrite(steps)
  Rprop.servoWrite(steps)

  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}


function move_backward(steps) {
  console.log('Started moving backward...');

  // start backward movement
    Lprop.servoWrite(0)
    Rprop.servoWrite(0)


  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}

function move_leftward(steps) {
  console.log('Started moving left...');

  // start backward movement
    Lprop.servoWrite(0)
    Rprop.servoWrite(steps)


  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}

function move_rightward(steps) {
  console.log('Started moving right...');

  // start backward movement
    Lprop.servoWrite(steps)
    Rprop.servoWrite(0)


  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, milliseconds_per_step * steps);
}



function stop() {
  Lprop.servoWrite(0)
  Rprop.servoWrite(0)
}


process.on('SIGHUP', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGCONT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  pigpio.terminate();
  console.log('CroftEd must exit, performed cleanup.');
  process.exit(0);
}



// ------------------------------------------------------------------------
// Start Express App Server
//
var httpServer = http.createServer(app);
httpServer.listen(3000);

//var httpsServer = https.createServer(credentials, app);
//httpsServer.listen(3001);


console.log('CrofEd is up and running on port 3000');