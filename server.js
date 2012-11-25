require('./public/js/Level.js');
var databaseUrl = "modelproj"; // "username:password@example.com/mydb"
var collections = ["maps"]
var db = require("mongojs").connect(databaseUrl, collections);
var GameModel = require('./GameModel');
var Point = require('./Point');

var waypoints = Array();
waypoints[0] = new Point(-1,1);
waypoints[1] = new Point(8,1);
waypoints[2] = new Point(8,8);
waypoints[3] = new Point(1,8);
waypoints[4] = new Point(1,3);
waypoints[5] = new Point(6,3);
waypoints[6] = new Point(6,6);
waypoints[7] = new Point(3,6);
waypoints[8] = new Point(3,5);
waypoints[9] = new Point(5,4);

gamedata = {
  leveldata: {
    name: 'Level 2: Sprial Time',
    startinggold: 25,
    startinglives: 10,
    gridwidth: 10,
    gridheight: 10,
    tilewidth: 64,
    tileheight: 54,
    terraintiles: [1,1,1,0,1,1,1,1,1,7,3,3,3,3,3,3,3,3,3,1,7,0,1,1,1,0,1,1,3,1,7,3,3,3,3,3,3,7,3,1,1,3,1,1,13,13,3,1,3,1,1,3,1,3,13,13,3,1,3,1,1,3,1,3,3,3,3,1,3,1,1,3,1,7,1,1,1,1,3,7,1,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,7,0],
    towersused: ['water','melee','poison','magic'],
    tilesused: ['64x54'],
    wavedata: {
      numwaves: 10,
      timing: 500,
      waypoints: waypoints
    }
  }
};

var gamemodel = new GameModel(gamedata);

db.maps.save(gamemodel, function(err, saved) {
  if( err || !saved ) console.log("gamemodel not saved: "+err);
  else console.log("gamemodel "+saved+" saved");
});

var io = require('socket.io').listen(8080);

io.sockets.on('connection', function (socket) {
  socket.on('loadgame', function (data) {
    console.log('load level');
    db.maps.find(function(err, docs) {
      socket.emit('loadgame', docs);
    });
  });
});