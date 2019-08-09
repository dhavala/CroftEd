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


var left_speed = 1000
var right_speed = 1050
var forward_left = 1000
var forward_left = 1000

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

var pwdMin=200
var pwdMax=2000


var Lprop =  new Gpio(17,{mode: Gpio.OUTPUT})
var Rprop =  new Gpio(27,{mode: Gpio.OUTPUT})

warmup()

//console.log('Setting the min throttle...');
//Lprop.servoWrite(pwdMin)
//Rprop.servoWrite(pwdMin)
//sleep.sleep(1)

//console.log('Setting the max throttle...');
//Lprop.servoWrite(pwdMax)
//Rprop.servoWrite(pwdMax)
//sleep.sleep(1)



// max duration that the prop can be on
var max_time = 60000;


app.get('/warmup', function (req, res) {
  res.send('warmup ok');
  console.log('Warming up the servos ... ');
  warmup();
});


// move rover N steps forward
app.get('/forward/:steps', function (req, res) {

  var steps = Number(req.params.steps);
  res.send('forward ok');
  console.log('Forward ' + steps + ' steps');
  move_forward(steps);
});


// move rover N steps backward
app.get('/backward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  res.send('backward ok');
  console.log('Backward ' + steps + ' rpm' );
  move_backward(steps);

});


// move rover N steps backward
app.get('/leftward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  res.send('leftward ok');
  console.log('Leftward ' + steps + ' rpm');
  move_leftward(steps);

});

// move rover N steps backward
app.get('/rightward/:steps', function (req, res) {
  var steps = Number(req.params.steps);
  res.send('rightward ok');
  console.log('Right ' + steps + ' rpm' );
  move_rightward(steps);

});


// reset rover state
app.get('/reset', function (req, res) {
  res.send('stopping ok');
  console.log('Stopping  ...');
  stop()
});

// reset rover state
app.get('/stop', function (req, res) {
  res.send('stopping ok');
  console.log('Stopping ...');
  stop()
});


function move_forward(steps) {
  console.log('Started moving forward...');

  // start forward movement
  var actual_steps = steps/2;
  var offset_right = parseInt(actual_steps*0.1);
  Lprop.servoWrite(actual_steps);
  Rprop.servoWrite(actual_steps+offset_right);

  // stop after the number of steps
  setTimeout(function () {
    console.log('Stopped moving...');
    stop();
  }, max_time);
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
  }, max_time);
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
  }, max_time);
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
  }, max_time);
}



function stop() {
  Lprop.servoWrite(0)
  Rprop.servoWrite(0)
}

function warmup() {
  
  console.log('Setting the max throttle...');
  Lprop.servoWrite(pwdMax)
  Rprop.servoWrite(pwdMax)
  sleep.sleep(2)

  console.log('Setting the min throttle...');
  Lprop.servoWrite(pwdMin)
  Rprop.servoWrite(pwdMin)
  sleep.sleep(2)

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