/**
 * Level class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
 function Level() {

  this.lives = 10;
  this.mapdata = null;
  this.wavecount = 0;
  this.graphics = {
    spritesheets: {
      towers: null,
      bullets: null,
      creeps: Array(),
      terrain: null
    }
  };
  this.graphicsdata = Array();

  this.UI = new createjs.Container();
  this.UI.name = 'UI Container';
  this.UI.overlay = new createjs.Container();
  this.UI.overlay.name = 'UI Overlay Container';
  this.UI.addChild(this.UI.overlay);
  this.UI.cursor = new createjs.Container();
  this.UI.cursor.name = 'UI Cursor Container';
  this.UI.cursor.alpha = .5;
  this.UI.addChild(this.UI.cursor);
  this.bulletcontainer = new createjs.Container;
  this.bulletcontainer.name = 'bullet container';
  this.countdown = 0;
  this.state = 'loading';
}

Level.prototype.initialise = function () {

  var dfr = new $.Deferred();
  
  var preloaddata = $.when(
    this.loadLevelData()
  );

  preloaddata.done( function(){
    var preloadgfx = $.when(
      game.level.preloadGraphics()
    );
    preloadgfx.done( function () {
      game.level.createLevel();   
      dfr.resolve();
    });
  });

  return dfr.promise();
};

Level.prototype.loadLevelData = function (levelnum){
  
  var dfr = new $.Deferred();

  game.socket.emit('loadgame', {level:levelnum});
  game.socket.on('loadgame', function (gamedata) {
    game.level.collectData(gamedata[1].currentlevel);
    dfr.resolve();
  });
  return dfr.promise();
};

Level.prototype.preloadGraphics = function() {
    
  var dfr = new $.Deferred();

  var remaining = this.graphicsdata.length;
  for (var i = 0; i < this.graphicsdata.length; i++) {
    var img = new Image();
    img.src = this.graphicsdata[i].src;
    img.data = this.graphicsdata[i];
    img.onload = function() {

      var anims = this.data.animations;
      var imgArray = Array();
      imgArray.push(this);
      if (this.data.type == 'creeps') {
        var redfilter = new createjs.ColorFilter(1,0,0,1);
        var greenfilter = new createjs.ColorFilter(0,1,0,1);
        var bluefilter = new createjs.ColorFilter(0,0,1,1);
        var rbmp = new createjs.Bitmap(this);
        var gbmp = new createjs.Bitmap(this);
        var bbmp = new createjs.Bitmap(this);
        rbmp.filters = [redfilter];
        gbmp.filters = [greenfilter];
        bbmp.filters = [bluefilter];
        rbmp.cache(0, 0, this.width, this.height);
        gbmp.cache(0, 0, this.width, this.height);
        bbmp.cache(0, 0, this.width, this.height);
        var rresult = rbmp.cacheCanvas;
        rresult.name = 'red';
        imgArray.push(rresult);
        var gresult = gbmp.cacheCanvas;
        gresult.name = 'green';
        imgArray.push(gresult);     
        var bresult = bbmp.cacheCanvas;
        bresult.name = 'blue';
        imgArray.push(bresult);

        //make filtered animations
        for (var anim in this.data.animations) {
          // i = 1 because we should leave the basic animations alone
          for (var i = 1; i < imgArray.length; i++) {
            var animname = imgArray[i].name+anim;
            var animdata = Array();
            var animdata = this.data.animations[anim].slice();
            animdata[0] += this.data.frames * i; //offset to point anims to filtered spritesheets
            animdata[1] += this.data.frames * i;
            animdata[2] = animname;
            anims[animname] = animdata;
          }; 
        }
      }
      
      var spritesheet = new createjs.SpriteSheet({
        images: imgArray,
        frames: {width:this.data.framewidth, height:this.data.frameheight, regX:this.data.regx, regY:this.data.regy},
        animations: anims
      });
      spritesheet.name = this.data.name;
      spritesheet.type = this.data.type;


      //there are multiple creeps per level
      if (this.data.type == 'creeps')                
        game.level.graphics.spritesheets.creeps.push(spritesheet);
      else
        game.level.graphics.spritesheets[spritesheet.type] = spritesheet;

      --remaining;
      if (remaining <= 0) {
        dfr.resolve();
      }
    }
  }
  return dfr.promise();
};

Level.prototype.collectData = function (mapdata) {
  
  this.mapdata = mapdata;
  this.waves = mapdata.waves;
  
  // go through the mapdata and load the relevant spritesheets
  // 1. the selected towers for this level
  for (var i=0; i<this.mapdata.towersused.length; i++) {
    for (var j=0; j<game.manifest.gamedata.towers[this.mapdata.towersused[i]].length; j++) { //get each of each type of tower
      var towerss = game.manifest.gamedata.towers[this.mapdata.towersused[i]][j].spritesheet;
      for (var k = 0; k < game.manifest.towers.length; k++) {
        if (game.manifest.towers[k].name == towerss)
          if ($.inArray(game.manifest.towers[k],this.graphicsdata) == -1)
            this.graphicsdata.push(game.manifest.towers[k]);
      }       
      var bulletss = 'basic';// fixthis: game.manifest.gamedata.towers[this.mapdata.towersused[i]][j].bulletsprite;
      if ($.inArray(game.manifest.bullets[bulletss], this.graphicsdata) == -1)
        this.graphicsdata.push(game.manifest.bullets[bulletss]);
    }
  }

  // 2. the tiles
  for (var i=0; i<this.mapdata.tilesused.length; i++) {
    for (var j=0; j<game.manifest.terrain.length; j++) { //get each of each type of tower
      if (game.manifest.terrain[j].name == this.mapdata.tilesused[i]){
        var tileset = game.manifest.terrain[j];
        if ($.inArray(tileset,this.graphicsdata) == -1)
          this.graphicsdata.push(tileset);
      }
    }
  }

  // 3. the bullets fixthis: bullets should be determined by which towers are included
  for (var i=0; i<game.manifest.bullets.length; i++) { //get each of each type of tower
    var bullet = game.manifest.bullets[i];
    if ($.inArray(bullet,this.graphicsdata) == -1)
      this.graphicsdata.push(bullet);
  }  

  // 4. creeps
  for (var i=0; i<this.waves.length; i++) {
    for (var j=0; j<this.waves[i].creeps.length; j++) {
      for (var k=0; k<game.manifest.creeps.length; k++) {
        if (this.waves[i].creeps[j].name == game.manifest.creeps[k].name) {
          var creep = game.manifest.creeps[k];
          if ($.inArray(creep,this.graphicsdata) == -1)
            this.graphicsdata.push(creep);
        }
      }
    }
  }   
};  

Level.prototype.createLevel = function () {

  game.player.gold = this.mapdata.startinggold;
  game.player.lives = this.mapdata.startinglives;
  this.name = this.mapdata.name;

  game.UI.setSpritesheet(); //load spritsheets before creating UI?: fixthis
  this.map = new Map(this.mapdata);
  this.towers = new Towers(this.mapdata);
  this.creeps = new Creeps();
};

Level.prototype.render = function (){

  game.stage.addChild(this.UI);
  game.stage.addChild(this.bulletcontainer);
  this.map.render();
  this.towers.render();
};

Level.prototype.update = function (elapsedseconds) {
  
  if (this.lives <= 0) {
    this.state = 'game over';
    game.over();
  }
  if (this.state == 'wavestart') {
    this.creeps.startWave(this.waves[this.wavecount]);
    this.wavecount++;
    this.state = 'wave';
  }
  
  this.creeps.update(elapsedseconds);
  this.towers.update(elapsedseconds);
};