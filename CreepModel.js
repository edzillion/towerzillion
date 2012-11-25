function CreepModel (creepdata) {

  this.name = creepdata.name;
  this.health = creepdata.health;
  this.defense =creepdata.defense;
  this.speed = creepdata.speed;
  this.xp = creepdata.xp;
  this.gold = creepdata.gold;
  this.score = creepdata.score;
  this.waypoints = creepdata.waypoints;
}

module.exports = CreepModel;