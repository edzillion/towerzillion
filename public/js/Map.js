  /**
 * Map class
 *
 * @author edzillion
 */
 var mapprot = Map.prototype = new createjs.Container();

/**
 * @constructor
 */
function Map(mapdata) {

  if (typeof mapdata === 'undefined')
    this.initialize(Map.BLANK_MAP);
  else
    this.initialize(mapdata);
}

mapprot.Container_initialize = mapprot.initialize; //unique to avoid overiding base class

//Consts
Map.BLANK_MAP = {
  name: '',
  gridwidth: 10,
  gridheight: 10,
  tilewidth: 64,
  tileheight: 54,
  terraintiles: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  decordata: [],
  mapoffset: new Point (0,32),
  tileoffset: new Point (this.tilewidth/2, this.tileheight/2)
};


mapprot.initialize = function(mapdata) {

  this.Container_initialize();
  console.log('map constructor');
  this.name = mapdata.name;
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  
  this.tilewidth = mapdata.tilewidth;
  this.tileheight = mapdata.tileheight;
  this.mapoffset = new Point (0,32);
  this.tileoffset = new Point (this.tilewidth/2, this.tileheight/2);
  
  this.terraintiles = mapdata.terraintiles;
  this.decordata = mapdata.decordata;
  this.terrain = this.renderTerrain();
  this.decor = this.renderDecor();
  
  this.addChild(this.terrain);
  this.addChild(this.decor);
  game.stage.addChild(this);
};

/*mapprot.setMap = function (mapdata){
  this.name = mapdata.name;
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  this.terraintiles = mapdata.terraintiles;
  this.tilewidth = mapdata.tilewidth;
  this.tileheight = mapdata.tileheight;
  this.mapoffset = new Point (0,32);
  this.tileoffset = new Point (this.tilewidth/2, this.tileheight/2);
};*/

/*Map.prototype.render = function () {

    this.terrain.removeAllChildren();
    for (var y=0;y<this.gridheight;y++) {
      for (var x=0;x<this.gridwidth;x++) {
    
      var gridcount = x + y * this.gridwidth;
      var frame = game.graphics.spritesheets.terrain.getFrame(this.terraintiles[gridcount]);  
      var bmp = new createjs.Bitmap(frame.image);
      bmp.sourceRect = frame.rect;
      bmp.x = x*this.tilewidth;
      bmp.y = y*this.tileheight;
      bmp.frame = this.terraintiles[gridcount];

      this.addChild(bmp);
    }
    this.decor.removeAllChildren();
    for (var i=0; i<game..children.length; i++) {

    }
  }   
};*/

Map.prototype.convertGridToMapPoint = function (gridpoint) {

  var temppoint = new Point(gridpoint.x,gridpoint.y); 
  var mapcoords = temppoint.multiply(new Point(this.tilewidth, this.tileheight)); //convert to map coords
  mapcoords = mapcoords.add(this.tileoffset); //center of tile
  mapcoords = mapcoords.add(this.mapoffset);//32 offset off top of screen;
  return mapcoords;
};

Map.prototype.convertYToMapPerspective = function (y) {
  
  var perspectivey = game.level.map.tileheight / game.level.map.tilewidth;
  return y*perspectivey;  
};

Map.prototype.getDecor = function () {

  var decorarray = Array();
  for (var i = 0; i < this.decor.children.length; i++) {
    var decoritem = this.decor.children[i];
    var saveitem = {spritesheet:decoritem.sheet, spriteframe:decoritem.frame, x:Math.round(decoritem.x), y:Math.round(decoritem.y)};
    decorarray.push(saveitem);
  }
  return decorarray;
};

Map.prototype.getTiles = function () {

  var maparray = Array();
  for (var i = 0; i < this.terrain.children.length; i++) {
    var framenum = this.terrain.children[i].frame;
    maparray.push(framenum);
  }
  return maparray;
};

Map.prototype.renderTerrain = function () {

  var terrain = new createjs.Container();
  for (var y=0;y<this.gridheight;y++) {
    for (var x=0;x<this.gridwidth;x++) {

      var gridcount = x + y * this.gridwidth;
      var frame = game.graphics.spritesheets.terrain.getFrame(this.terraintiles[gridcount]);  
      var bmp = new createjs.Bitmap(frame.image);
      bmp.sourceRect = frame.rect;
      bmp.x = x*this.tilewidth;
      bmp.y = y*this.tileheight;
      bmp.frame = this.terraintiles[gridcount];

      terrain.addChild(bmp);
    }
  }
  return terrain;
};

Map.prototype.renderDecor = function () {

  var decor = new createjs.Container();
  for (var i=0; i<this.decordata.length; i++) {
    var decoritem = this.decordata[i];
    var sheet = {}
    for (var i = 0; i < game.graphics.spritesheets.decor.length; i++) {
      if (game.graphics.spritesheets.decor[i].name == decoritem.spritesheet)
        sheet = game.graphics.spritesheets.decor[i]
    };
    
    var img = createjs.SpriteSheetUtils.extractFrame(sheet, decoritem.spriteframe);
    var bmp = new createjs.Bitmap(img);
    bmp.x = decoritem.x;
    bmp.y = decoritem.y;
    bmp.regX = sheet._frameWidth/2;
    bmp.regY = sheet._frameHeight/2;

    decor.addChild(bmp);
  }
  return decor;
};