var WaveModel = require('./WaveModel');

function LevelModel(leveldata) {

  this.name = leveldata.name;
  this.startinggold = leveldata.startinggold;
  this.startinglives = leveldata.startinglives;
  this.gridwidth = leveldata.gridwidth;
  this.gridheight = leveldata.gridheight;
  this.tilewidth = leveldata.tilewidth;
  this.tileheight = leveldata.tileheight;
  this.terraintiles = leveldata.terraintiles;
  this.towersused = leveldata.towersused;
  this.tilesused = leveldata.tilesused;
  this.decordata = leveldata.decordata;

  this.waves = Array();

  if (leveldata.wavedata != null) {
    this.numwaves = leveldata.wavedata.numwaves;
    var healthcounter = 1;
    var speedcounter = 1;
    for (var i=0;i<this.numwaves;i++) {
      healthcounter = i+1*i+1;
      var tempcreepdata = {
        name: 'wizard',
        sprite: 'green_wizard',
        health: healthcounter,
        defense: 1,
        speed: speedcounter,
        xp: Math.round(healthcounter/10)+1,
        gold: i+1,
        score: Math.round(healthcounter/10)+i+1
      };
      speedcounter += .1;
      var data = {
        creepdata: tempcreepdata,
        numcreeps: 10 + i,              
        timing: leveldata.wavedata.timing,
        waypoints: leveldata.wavedata.waypoints
      }
      this.waves[i] = new WaveModel(data);
    }
  }
  else
    this.waves = null;  
};

module.exports = LevelModel;