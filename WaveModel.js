var CreepModel = require('./CreepModel');

function WaveModel(wavedata) {
  
  this.numcreeps = wavedata.numcreeps;
  wavedata.creepdata.waypoints = wavedata.waypoints;
  this.timing = wavedata.timing;

  this.creeps = Array();
  if (wavedata.creepdata != null){
    for (var i=0;i<this.numcreeps;i++) {
      this.creeps[i] = new CreepModel(wavedata.creepdata);
    }
  }
  else
    this.creeps = null;
}

module.exports = WaveModel;