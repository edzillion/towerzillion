/**
 * Creeps class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
 function Creeps() {

  this.spritesheets = game.graphics.spritesheets.creeps;
  this.container = new createjs.Container();
  this.container.name = 'Creep Container';
  this.creeplist = Array();
  this.activecreeps = Array();
  this.creepindex = 0;
  this.wavetimer = 0;
  this.currentwave = 'currentwave';

  game.stage.addChild(this.container);
}

Creeps.prototype.startWave = function (wave) {

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
    }
  }
  else if (this.activecreeps.length == 0 && game.level.state == 'wave')
    game.level.state = 'betweenwaves';
  
  // move all active creeps
  for (var i=0; i<this.activecreeps.length; i++) {
    var creep = this.activecreeps[i];
    var endpoint = creep.path.Move(elapsedticks,creep.speed/60);

    if(creep.direction != endpoint.degrees) {
     if (endpoint.degrees > 45 && endpoint.degrees <= 135) {
        creep.anim.gotoAndPlay(creep.filters[creep.filters.length-1].colour+'up');
        creep.baseanim = 'up';
      }
      else if (endpoint.degrees > 135 && endpoint.degrees <= 225) {
        creep.anim.gotoAndPlay(creep.filters[creep.filters.length-1].colour+'right');
        creep.baseanim = 'right';
      }
      else if (endpoint.degrees > 225 && endpoint.degrees <= 315) {
        creep.anim.gotoAndPlay(creep.filters[creep.filters.length-1].colour+'down');
        creep.baseanim = 'down';
      }
      else {
        creep.anim.gotoAndPlay(creep.filters[creep.filters.length-1].colour+'left');
        creep.baseanim = 'left';
      }
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
    creep.updateHealthBar();
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
 var creepprot = Creep.prototype = new createjs.Container();

/**
 * @constructor
 */
 function Creep(creepdata,i) {

  this.initialize(creepdata,i);
}

creepprot.Container_initialize = creepprot.initialize; //unique to avoid overiding base class

creepprot.initialize = function(creepdata,i) {

  this.Container_initialize();

  this.name = creepdata.name+(i);
  this.health = creepdata.health+3;
  this.maxhealth = creepdata.health+3;
  this.waypoint = 0;
  this.speed = creepdata.speed;
  this.xp = creepdata.xp;
  this.gold = creepdata.gold;
  this.score = creepdata.score;
  this.direction = null;
  this.anim = null;
  this.hitanim = null;
  this.filters = Array();
  this.filters.push({colour:'', time:Infinity});
  this.effectlayer = new createjs.Container();
  this.baseanim = null;
  this.dmgmodifier = 0;



  for (var i = 0; i < game.graphics.spritesheets.creeps.length; i++) {
    if (creepdata.sprite == game.graphics.spritesheets.creeps[i].name) {
      this.anim = new createjs.BitmapAnimation(game.graphics.spritesheets.creeps[i]) 
      

      //this.spriteSheet = game.level.graphics.spritesheets.creeps[i];
    }
  }

  this.sizeX = this.anim.spriteSheet._frameWidth;
  this.sizeY = this.anim.spriteSheet._frameHeight;
  this.addChild(this.anim);
  //this.anim.regX = 16;
  //this.anim.regY = 16;

  this.waypoints = Array();
  for (var i = 0; i < creepdata.waypoints.length; i++) {
    this.waypoints[i] = game.level.map.convertGridToMapPoint(creepdata.waypoints[i]);
  }

  this.path = new Path(this.waypoints[this.waypoint], this.waypoints, this.speed/60);
  this.x = this.waypoints[this.waypoint].x;
  this.y = this.waypoints[this.waypoint].y;


  this.healthbar = new createjs.Container();
  this.healthbar.barbg = new createjs.Shape();
  this.healthbar.barbg.graphics.beginFill("rgba(20,70,0,1)").rect(-10, -18, this.sizeX, 4); //this should be a ratio of the size of the sprite: fixthis
  this.healthbar.barbg.graphics.beginFill("rgba(255,0,0,1)").rect(-9, -17, this.sizeX-2, 2);
  this.healthbar.fgbar = new createjs.Shape();
  this.healthbar.fgbar.graphics.beginFill("rgba(85,255,0,1)").rect(-9, -17, this.sizeX-2, 2); 
  this.healthbar.addChild(this.healthbar.barbg);
  this.healthbar.addChild(this.healthbar.fgbar);

  this.addChild(this.healthbar);

  //fire
  var img  = new Image();
  img.src = './assets/img/fireparticle.png';
  var creepref = this;
  img.onload = function() {

    var numprtcls = Math.round((creepref.sizeX*.9)/(this.width-2)); //10% padding on the image, 2px on fite particle
    var startpt = -(creepref.sizeX/2)+(creepref.sizeX/10)+this.width/2;
    var addprtcl = Math.random();
    if (addprtcl > .75) { //25% chance to draw an extra particle
      numprtcls++;
      startpt-=this.width/2;
    }
    
    var scalearray = Array();
    for (var i = 0; i < numprtcls; i++) {
      scalearray.push(.5 + (Math.random()/2));
    }

    //a bar at the edge should never have be taller than its neighbor
    if(scalearray[0] > scalearray[1]) {
      var temp = scalearray[1];
      scalearray[1] = scalearray[0];
      scalearray[0] = temp;
    }
    if(scalearray[scalearray.length-1] > scalearray[scalearray.length-2]) {
      var temp = scalearray[scalearray.length-2];
      scalearray[scalearray.length-2] = scalearray[scalearray.length-1];
      scalearray[scalearray.length-1] = temp;
    }

    for (var i = 0; i < numprtcls; i++) { //these numbers are padding
      creepref.fire = new createjs.Bitmap(this);
      creepref.fire.scaleY = scalearray[i];
      creepref.fire.regX = creepref.fire.image.width/2;
      creepref.fire.regY = creepref.fire.image.height;
      creepref.fire.x = startpt + ((creepref.fire.image.width-2) * i);
      creepref.fire.y = (creepref.sizeY/2)-2;
      creepref.effectlayer.addChild(creepref.fire);
    };
  };
  this.effectlayer.visible = false;
  this.addChild(this.effectlayer);
  game.level.creeps.container.addChild(this);
  //game.level.UI.addChild(this.healthbar.container);
}

creepprot.affect = function (tower, amount, time) {

  var thiscreep = this;
  var attackingtower = tower;
  switch (attackingtower.type) {
    case 'water' : {
      this.changeFilter('blue', time*1000);
      var slowamount = (this.speed / 100)*amount;
      thiscreep.speed -= slowamount;
      setTimeout(function(){
        thiscreep.speed+=slowamount;
      }, time*1000);      
    }
    break;
    case 'melee' : {

    }
    break;
    case 'magic' : {
      this.effectlayer.visible = true;
      var interval = setInterval( function(){
        if (thiscreep.hit(amount)) {            
          attackingtower.addXP(thiscreep.xp);
          attackingtower.killcount++;
          clearInterval();
           thiscreep.effectlayer.visible = false;
        }
      },1000);
      setTimeout(function(){
        clearInterval(interval);
        thiscreep.effectlayer.visible = false;
      }, 
      time*1000);     
    }
    break;
    case 'poison' : {
      this.changeFilter('green', time*1000);
      this.dmgmodifier = amount;
      setTimeout(function(){
        thiscreep.dmgmodifier = 0;
      }, time*1000);      
    }
    break;
  }
}

creepprot.getPos = function () {

  return new Point(this.x,this.y);
}

creepprot.hit = function (dmg) {

  this.changeFilter('red',200);

  this.health -= dmg + Math.round(dmg*this.dmgmodifier);

  var newscale = this.health/this.maxhealth
  this.healthbar.fgbar.scaleX = newscale;

  if (this.health <= 0) {
      game.player.addGold(this.gold);
      game.player.addScore(this.score);
      game.level.creeps.kill(this);
      return true;
  }
  return false;
}

creepprot.changeFilter = function (colour, time) {
 
  this.filters.push({colour: colour, time: game.date.getTime()+time});
  this.filters.sort( function(a, b) {
      return  b.time - a.time
  });
  var topanim = this.filters[this.filters.length-1].colour+this.baseanim; 
  if (topanim != this.anim.currentAnimation)
    this.anim.gotoAndPlay(topanim);
  
  var creepref = this;
  setTimeout(function(){
    var debug = creepref.filters.pop();
    var blah = creepref.filters[creepref.filters.length-1].colour+creepref.baseanim;
    creepref.anim.gotoAndPlay(blah);
  }, time);

}

creepprot.updateHealthBar = function () {
  

  //this.healthbar.x = this.x; //- (this.sizeX-2)/2;
  //this.healthbar.y = this.y;// - this.sizeY/2;
}