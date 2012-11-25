/**
 * Player controller
 *
 * @author edzillion
 */

/**
* @constructor
*/
var Player = function() {

  //get saved player from db here?
  this.score = 0;
  this.gold = 0;
  this.lives = 10;
};

Player.prototype.addGold = function (gold) {

  this.gold += gold;
  game.UI.renderActionPanel();
};

Player.prototype.addScore = function (score) {

  this.score += score;
  game.UI.renderActionPanel();
};

Player.prototype.setLives = function (lives) {

  this.lives += lives;
  game.UI.renderActionPanel();
};

Player.prototype.attemptPurchase = function (towertype) {
  if (this.gold >= game.manifest.gamedata.towers[towertype][0].cost){ //always build first of type
    this.gold -= game.manifest.gamedata.towers[towertype][0].cost;
    game.UI.renderActionPanel();
    return true;
  }
  return false;
};