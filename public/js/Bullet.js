/**
 * Bullet class
 *
 * @author edzillion
 */
var bulletprot = Bullet.prototype = new createjs.Container();

/**
 * @constructor
 */
function Bullet(tower,pos) {

  this.initialize(tower,pos);
}

bulletprot.Container_initialize = bulletprot.initialize; //unique to avoid overiding base class

bulletprot.initialize = function(tower,pos) {

  this.speed = tower.bulletspeed;
  this.shoot = tower.bulletsprite;
  this.fade = tower.bulletfade;
  this.anim = new createjs.BitmapAnimation(game.level.graphics.spritesheets.bullets);
  this.anim.regX = 16;
  this.anim.regY = 16;

  if (tower.splashrad){
  	this.splashrad = tower.splashrad;
    this.splash = new createjs.Shape();
  	var splashw = this.splashrad*2;
  	var splashh = game.level.map.convertYToMapPerspective(this.splashrad*2);
  	this.splash.graphics.beginFill("red"). drawEllipse(-splashw/2, -splashh/2, splashw, splashh).endFill();
    this.addChild(this.splash);
    this.splash.visible = false;
  }

  this.x = pos.x;
  this.y = pos.y;
  this.origpos = new Point(pos.x,pos.y);
  
  this.addChild(this.anim);
};

bulletprot.reset = function () {
  
    this.alpha=1;
    this.x = this.origpos.x;
    this.y = this.origpos.y;
    this.anim.stop();
    if (this.splash)
    	this.splash.visible = false;
};