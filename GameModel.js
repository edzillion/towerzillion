var LevelModel = require('./LevelModel');
var Point = require('./Point');

// Constructor
function GameModel(gamedata) {

  if (gamedata != null)
    this.currentlevel = new LevelModel(gamedata.leveldata);
  else
    this.currentlevel = null;   
  
  this.players = [];
};

// class methods
GameModel.prototype.setMap = function(map) {

  this.map = map;
};

GameModel.prototype.getMap = function(map) {

  return this.map;
};

GameModel.prototype.loadLevel = function(lvldata) {

  this.currentlevel = new LevelModel(lvldata);
};

GameModel.prototype.saveLevel = function() {

  var objectToBeSaved;
    return objectToBeSaved; //?? 
};

GameModel.prototype.getNextWave = function() {
  return this.waves[++currentwave];
};

// export the class
module.exports = GameModel;