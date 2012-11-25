/**
 * Creeps class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
 function Creeps() {

  this.spritesheets = game.level.graphics.spritesheets.creeps;
  this.container = new createjs.Container();
  this.container.name = 'Creep Container';
  this.creeplist = Array();
  this.activecreeps = Array();
  this.creepindex = 0;
  this.wavetimer = 0;
  this.currentwave = 'currentwave';

  game.stage.addChild(this.container);
}

Creeps.prototype.startWave = function (wave){

  this.currentwave = wave;
  var nextcreeps = wave.creeps;
  var creepamount = nextcreeps.length;
  for (var i=0; i<creepamount; i++) {
    this.addCreep(nextcreeps[i]);
  }
};

Creeps.prototype.addCreep = function(creepdata) {

  var tempCreep = new Creep(creepdata, ++this.creepindex);
  this.creeplist.push(tempCreep);
};

Creeps.prototype.update = function (elapsedticks) {

    // do we have creeps yet to enter?
    if (this.creeplist.length > 0) {
      this.wavetimer += elapsedticks;
      if (this.wavetimer > this.currentwave.timing) {
        this.wavetimer = 0;
        this.activecreeps.push(this.creeplist.shift());
        this.creepindex++;
      }
    }
    else if (this.activecreeps.length == 0 && game.level.state == 'wave')
      game.level.state = 'betweenwaves';
    
    // move all active creeps
    for (var i=0; i<this.activecreeps.length; i++) {
      var creep = this.activecreeps[i];
      var endpoint = creep.follow.Move(elapsedticks,creep.speed/60);

      if(creep.direction != endpoint.degrees) {
        if (endpoint.degrees > 45 && endpoint.degrees <= 135)
          creep.gotoAndPlay('up');
        else if (endpoint.degrees > 135 && endpoint.degrees <= 225)
          creep.gotoAndPlay('right');
        else if (endpoint.degrees > 225 && endpoint.degrees <= 315)
          creep.gotoAndPlay('down');
        else
          creep.gotoAndPlay('left');

        creep.direction = endpoint.degrees;
      }

      if (endpoint) {
        creep.vx = endpoint.x - creep.x;
        creep.vy = endpoint.y - creep.y;
        creep.x = endpoint.x;
        creep.y = endpoint.y;
      }
      else {
        //reached end! fixthis
        game.level.lives--;
        game.UI.$livestext.text(game.level.lives.toString()); 
        this.kill(creep);
      }
      creep.healthbar.update();
    }
  };

Creeps.prototype.kill = function (creeptokill) {

  var arrindex = $.inArray(creeptokill, this.activecreeps);
  if (arrindex != -1){
    this.activecreeps.splice(arrindex,1);
    game.level.UI.removeChild(creeptokill.healthbar.container);
    this.fadeCreep(creeptokill);
  }
  else
    console.log('error:'+creeptokill.name+' is not in activecreeps!');
};

Creeps.prototype.fadeCreep = function (creeptokill) {

  var creep = creeptokill;
  var interval = setInterval(function(){
      creep.alpha-=.1;
  },100); // fade by 10% every 100ms
  setTimeout(function(){
      game.level.creeps.container.removeChild(creep);
      clearInterval(interval);
  },1000);   
};

/**
 * Creep class
 *
 * @author edzillion
 */
 var p = Creep.prototype = new createjs.BitmapAnimation();

/**
 * @constructor
 */
 function Creep(creepdata,i) {

  this.initialize(creepdata,i);
}

p.initialize = function(creepdata,i) {

  this.name = creepdata.name+(i+1);
  this.health = creepdata.health;
  this.waypoint = 0;
  this.speed = creepdata.speed;
  this.xp = creepdata.xp;
  this.gold = creepdata.gold;
  this.score = creepdata.score;
  this.direction = null;

  for (var i = 0; i < game.level.graphics.spritesheets.creeps.length; i++) {
    if (creepdata.name == game.level.graphics.spritesheets.creeps[i].name)
      this.spriteSheet = game.level.graphics.spritesheets.creeps[i];
  }

  this.waypoints = Array();
  for (var i = 0; i < creepdata.waypoints.length; i++) {
    this.waypoints[i] = game.level.map.convertGridToMapPoint(creepdata.waypoints[i]);
  }

  this.follow = new Path(this.waypoints[this.waypoint], this.waypoints, this.speed/60);
  this.x = this.waypoints[this.waypoint].x;
  this.y = this.waypoints[this.waypoint].y;
  this.sizeX = this.spriteSheet._frameWidth;
  this.sizeY = this.spriteSheet._frameHeight;
  this.healthbar = new HealthBar(this);

  game.level.creeps.container.addChild(this);
  game.level.UI.addChild(this.healthbar.container);
}

p.affect = function (tower, amount, time) {

  var thiscreep = this;
  var attackingtower = tower;
  switch (attackingtower.type) {
    case 'water' : {
      var slowamount = (this.speed / 100)*amount;
      thiscreep.speed -= slowamount;
      setTimeout(function(){
        thiscreep.speed+=slowamount;
      }, time*1000);      
    }
    break;
    case 'melee' : {
      var interval = setInterval( function(){
        if (thiscreep.hit(amount)) {            
          attackingtower.addXP(thiscreep.xp);
          game.level.creeps.kill(thiscreep);
          attackingtower.killcount++;
          clearInterval();
        }
      },1000);
      setTimeout(function(){
        clearInterval(interval)
      }, 
      time*1000);     
    }
    break;
  }
}

p.getPos = function () {

  return new Point(this.x,this.y);
}

p.hit = function (dmg) {

  this.health -= dmg;
  if (this.health <= 0) {
      game.player.addGold(this.gold);
      game.player.addScore(this.score);
      game.level.creeps.kill(this);
      return true;
  }
  return false;
}

function HealthBar(creepref) {

  this.creep = creepref;
  this.container = new createjs.Container();
  this.maxhealth = creepref.health;
  this.barbg = new createjs.Shape();
  this.barbg.graphics.beginFill("rgba(20,70,0,1)").rect(0, 0, this.creep.sizeX, 4);
  this.barbg.graphics.beginFill("rgba(255,0,0,1)").rect(1, 1, this.creep.sizeX-2, 2);
  this.fgbar = new createjs.Shape();
  this.fgbar.graphics.beginFill("rgba(85,255,0,1)").rect(1, 1, this.creep.sizeX-2, 2);
  
  this.container.addChild(this.barbg);
  this.container.addChild(this.fgbar);
}

HealthBar.prototype.update = function () {
  
  var newscale = this.creep.health/this.maxhealth
  this.fgbar.scaleX = newscale;
  this.container.x = this.creep.x - (this.creep.sizeX-2)/2;
  this.container.y = this.creep.y - this.creep.sizeY/2;
}