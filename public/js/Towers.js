/**
 * Towers class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
function Towers(mapdata) {

  console.log('Towers constructor');
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  this.container = new createjs.Container();
  this.container.name = 'Towers Container';
  game.stage.addChild(this.container);
  this.towerlist = Array();
};

Towers.prototype.addTower = function(towerdata) {

  var tempTower = new Tower(towerdata);
  tempTower.render();
  this.towerlist.push(tempTower);
};

Towers.prototype.render = function () {

  this.container.removeAllChildren();
  for (var i = 0; i < this.towerlist.length; i++) {
    this.towerlist[i].render();
  }
};

Towers.prototype.update = function (elapsedticks) {

  for (var i = 0; i < this.towerlist.length; i++) {
    this.towerlist[i].update(elapsedticks);
  }
};

/**
 * Tower class
 *
 * @author edzillion
 */
towerprot = Tower.prototype = new createjs.Container();

/**
 * @constructor
 */
function Tower(towerdata) {

  this.initialize(towerdata);
}

towerprot.Container_initialize = towerprot.initialize; //unique to avoid overiding base class

towerprot.initialize = function(towerdata) {

  this.Container_initialize();

  this.towerspritesheet = game.level.graphics.spritesheets.towers;

  this.pos = game.level.map.convertGridToMapPoint(towerdata.point);
  this.gridpoint = towerdata.point;

  this.type = towerdata.type;
  this.range = towerdata.range;
  this.rof = towerdata.rof; //seconds elapsed
  this.roftimer = towerdata.rof;
  this.damage = towerdata.damage;
  this.effect = towerdata.effect;
  this.currenttarget = null;
  this.levelxp = towerdata.levelxp;
  this.readytolevel = false;
  this.currentlevel = 0;
  this.xp = 0;
  this.killcount = 0;
  this.spritesheetframe = towerdata.spritesheetframe;
  this.onClick = this.clickTower;

  this.sprite = new createjs.Bitmap();
  this.rangecircle = new createjs.Shape();
  this.bullet = new Bullet(towerdata,this.pos);
  this.mydialog = new createjs.Container();
  this.mybullets = new createjs.Container();
  game.level.bulletcontainer.addChild(this.mybullets);
  this.activebullets = Array();
};

towerprot.render = function() {

  //first draw the range base
  this.rangecircle = new createjs.Shape();
  var rangecw = this.range*2;
  var rangech = game.level.map.convertYToMapPerspective(this.range*2);
  this.rangecircle.graphics.beginFill("black"). drawEllipse(-rangecw/2, -rangech/2, rangecw, rangech).endFill();
  this.rangecircle.x = this.pos.x;
  this.rangecircle.y = this.pos.y;
  this.rangecircle.alpha = .5;
  this.rangecircle.visible = false;
  this.addChild(this.rangecircle);

  //draw the tower
  var img = createjs.SpriteSheetUtils.extractFrame(this.towerspritesheet,this.spritesheetframe);//this.towerlist[i].spritenum);
  this.sprite = new createjs.Bitmap(img);
  this.sprite.x = this.pos.x;
  this.sprite.y = this.pos.y;
  this.sprite.regX = 32;
  this.sprite.regY = 135;
  this.addChild(this.sprite);

  // then my dialog gfx
  var dialog = this.mydialog;
  
  var img  = new Image();
  img.src = './assets/img/dialog.png'
  img.onload = function() {
    var bmp = new createjs.Bitmap(this);
    bmp.x = game.UI.DIALOG_OFFSET.x;
    bmp.y = game.UI.DIALOG_OFFSET.y;
    dialog.addChild(bmp);
  };
  
  var img = new Image();
  img.src = './assets/img/xpbarl.png'
  img.onload = function() {
    var bmp = new createjs.Bitmap(this);
    bmp.x = game.UI.DIALOG_OFFSET.x + 42;
    bmp.y = game.UI.DIALOG_OFFSET.y + 69;
    bmp.visible = false;  
    dialog.xpbarl = bmp;
    dialog.addChild(bmp);
  };

  var img = new Image();
  img.src = './assets/img/xpbarm.png'
  img.onload = function() {
    var bmp = new createjs.Bitmap(this);
    bmp.x = game.UI.DIALOG_OFFSET.x + 42;
    bmp.y = game.UI.DIALOG_OFFSET.y + 69;
    bmp.visible = false;
    dialog.xpbarm = bmp;
    dialog.addChild(bmp);
  };

  var img = new Image();
  img.src = './assets/img/xpbarr.png'
  img.onload = function() {
    var bmp = new createjs.Bitmap(this);
    bmp.x = game.UI.DIALOG_OFFSET.x + 42;
    bmp.y = game.UI.DIALOG_OFFSET.y + 69;
    bmp.visible = false;
    dialog.xpbarr = bmp;
    dialog.addChild(bmp);
  };

  dialog.x = this.pos.x;
  dialog.y = this.pos.y;
  dialog.visible = false;
  this.addChild(this.mydialog);
  game.level.towers.container.addChild(this);
};

towerprot.update = function (elapsedticks) {

  this.roftimer += elapsedticks;
  if (game.level.creeps.activecreeps.length > 0)
    if (this.roftimer > this.rof) 
      if(!this.checkTarget(this.currenttarget))
        if(this.target()) 
          this.shoot(this.currenttarget);

  this.updateBullets(elapsedticks);
};

towerprot.updateBullets = function (elapsedticks) {

  for (var i = 0; i < this.activebullets.length; i++) {
    var currbullet = this.activebullets[i];
    var newpos = currbullet.follow.Move(elapsedticks);
    if (!newpos) {
      // damage the target
      this.hit(currbullet);
      //remove bullet
      this.fadeBullet(currbullet);
    }
    else {
     // currbullet.scaleX = 2 - newpos.ratio;
     //currbullet.scaleY = 2 - newpos.ratio;
      //currbullet.regX = 32 - newpos.ratio*16;
      //currbullet.regY = 32 - newpos.ratio*16;
      currbullet.x = newpos.x;
      currbullet.y = newpos.y;
    }
  }
};

towerprot.checkTarget = function (target) {

  if ($.inArray(target, game.level.creeps.activecreeps) == -1)
    return false;

  var dist = Math.floor(this.pos.distance(target.getPos()));
  if (dist > this.range){ //we do have a target but it's gone out of range. 
    return false;
  }
  else {
    var hitpos = intercept(this.pos, this.currenttarget, this.bullet.speed); // this problem stems from the fact that the follow and intercept code is at diff scales: fixthis 
    if (!hitpos)
      return false; //not really sure why hitpos is retuning null here: fixthis
    var disttohit = Math.floor(this.pos.distance(hitpos));
    if (disttohit < this.range) //we do have a target but it's gone out of range. 
      return true;
  }
};


towerprot.target = function () {

  this.currenttarget = null;
  for (var i=0; i<game.level.creeps.activecreeps.length; i++) {
    var creep = game.level.creeps.activecreeps[i];
    var creeppoint = new Point(creep.x,creep.y);

    var distance = Math.floor(creeppoint.distance(this.pos));
    if (distance < this.range) {
      var hitpos = intercept(this.pos, creep, this.bullet.speed); // this problem stems from the fact that the follow and intercept code is at diff scales: fixthis  
      if (!hitpos)
        break; //not really sure why hitpos is retuning null here: fixthis
      var disttohit = Math.floor(this.pos.distance(hitpos));
      if (disttohit < this.range) {
        this.currenttarget = creep;
        return true;
      }
    }
  }
  return false;
};

towerprot.addXP = function (amount) {

  if (!this.readytolevel) {
    this.xp += amount;
    if (this.xp >= this.levelxp) {
      this.readytolevel = true;
      this.xp = this.levelxp;
    }
  }
};

towerprot.shoot = function (elapsedticks) {

  this.roftimer = 0;

  //var bullet = this.bullet.clone(true);

  //because cloning doesn't copy everything. why? fixthis
  //bullet.speed = this.bullet.speed;

  var hitpos = intercept(this.bullet, this.currenttarget, this.bullet.speed*10); // this problem stems from the fact that the follow and intercept code is at diff scales: fixthis
  this.bullet.follow = new Path(this.bullet, hitpos, this.bullet.speed);
  this.bullet.fadetime = 1000;
  this.bullet.target = this.currenttarget;

  /*  bmp.scaleX = 2;
  bmp.scaleY = 2;*/
  this.bullet.anim.gotoAndPlay(this.bullet.shoot);

  this.mybullets.addChild(this.bullet);
  this.activebullets.push(this.bullet);
  game.stage.update();    
};

towerprot.hit = function (currbullet) {

  switch(this.type) {
    case 'water': {
      if (currbullet.target.hit(this.damage)) {
        //true means we have killed the target      
        this.addXP(currbullet.target.xp);
        this.killcount++;
        this.currenttarget = null;
      }       
      //false means the creep is still alive. if so, then do effect
      else
        currbullet.target.affect(this,this.effect.amount,this.effect.times);
    }
    break;
    case 'melee': {
      if (currbullet.target.hit(this.damage)) { 
        this.addXP(currbullet.target.xp);
        this.killcount++;
        this.currenttarget = null;
      }
    }
    break;
    case 'magic': {

      //critical code
     /* var dmg = this.damage;
      if (Math.random()*100 <= this.effect.amount) {
        dmg *=2;
        console.log('crit!',dmg);
      }*/

      var creepstokill = Array();
      for (var i=0; i<game.level.creeps.activecreeps.length; i++) {
        var creep = game.level.creeps.activecreeps[i];
        var localcoords = currbullet.globalToLocal(creep.x,creep.y);
        var hit = currbullet.hitTest(localcoords.x,localcoords.y);

        if (hit) {
          if(creep.hit(this.damage)) {
            this.addXP(currbullet.target.xp);
            this.killcount++;
            if (creep == currbullet.target)     
              this.currenttarget = null;
          }
          else  //dude survived, apply effect then 
            creep.affect(this, this.effect.amount, this.effect.times);
        }
      }
    }
    break;
  }
  currbullet.target = null;
};

towerprot.fadeBullet = function () {

  var bullet = this.activebullets.shift();
  if (bullet.splash)
    bullet.splash.visible = true;
  var mybullets = this.mybullets;
  var interval = setInterval(function(){
      bullet.alpha-=.1;
  },bullet.fade/10); // fade by 10% every 100ms
  setTimeout(function(){
    mybullets.removeChild(bullet);
    bullet.reset();  
    clearInterval(interval);
  }, bullet.fade);
};

towerprot.clickTower = function(event) {
  
  if (this.mydialog.visible) {
    this.mydialog.visible = false;
    this.rangecircle.visible = false;
    return;
  }
  this.rangecircle.visible = true;
  game.level.UI.overlay.removeChildAt(0);

  var towername = new createjs.Text(this.type+' tower', '18px Helvetica', "#333");
  towername.x = game.UI.DIALOG_OFFSET.x + 22;
  towername.y = game.UI.DIALOG_OFFSET.y + 10; 
  var stats = new createjs.Text('kills:\t'+this.killcount+'\n'+'level:\t'+this.currentlevel, "15px Helvetica", "#333");
  stats.x = game.UI.DIALOG_OFFSET.x + 22;
  stats.y = game.UI.DIALOG_OFFSET.y + 32;
  var xp = new createjs.Text('XP', '15px Helvetica', "#333");
  xp.x = game.UI.DIALOG_OFFSET.x + 22;
  xp.y = game.UI.DIALOG_OFFSET.y + 70;
  var xpbarscale = Math.round((this.xp/this.levelxp)* 107); //amount of pixels in the whole bar

  if (xpbarscale > 4) {
    this.mydialog.xpbarl.visible = true;
    var barcounter = 4;
    for (barcounter;barcounter<xpbarscale-4; barcounter++) {
      var barblock = this.mydialog.xpbarm.clone();
      barblock.x += barcounter;
      this.mydialog.addChild(barblock);
    }
    this.mydialog.xpbarr.x += barcounter;
    this.mydialog.xpbarr.visible = true;
  }
    
  this.mydialog.addChild(towername);
  this.mydialog.addChild(stats);
  this.mydialog.addChild(xp);
  
  this.mydialog.visible = true;
};