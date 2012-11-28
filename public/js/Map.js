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

  this.initialize(mapdata);
}

mapprot.Container_initialize = mapprot.initialize; //unique to avoid overiding base class

mapprot.initialize = function(mapdata) {

  this.Container_initialize();
  console.log('map constructor');
  this.name = mapdata.name;
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  this.terraintiles = mapdata.terraintiles;
  this.tilewidth = mapdata.tilewidth;
  this.tileheight = mapdata.tileheight;
  this.mapoffset = new Point (0,32);
  this.tileoffset = new Point (this.tilewidth/2, this.tileheight/2);
  this.spritesheet = game.graphics.spritesheets.terrain;
  game.stage.addChild(this);
};

mapprot.setMap = function (mapdata){
  this.name = mapdata.name;
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  this.terraintiles = mapdata.terraintiles;
  this.tilewidth = mapdata.tilewidth;
  this.tileheight = mapdata.tileheight;
  this.mapoffset = new Point (0,32);
  this.tileoffset = new Point (this.tilewidth/2, this.tileheight/2);
};


Map.prototype.render = function (){
  for (var x=0;x<this.gridwidth;x++) {
    for (var y=0;y<this.gridheight;y++) {
      var gridcount = x + y * this.gridwidth;
      if (x == this.gridwidth-1) { // if we are drawing the rightmost tiles we need to add the extra pixel.
        var g = this.spritesheet.getFrame(this.terraintiles[gridcount]); //does nothing:fixthis
      }
      
      var img = createjs.SpriteSheetUtils.extractFrame(this.spritesheet, this.terraintiles[gridcount]);  
      var bmp = new createjs.Bitmap(img);
      bmp.x = x*this.tilewidth;
      bmp.y = y*this.tileheight;

      this.addChild(bmp);
    }
  }     
};

Map.prototype.renderForLevelBuilder = function () {
    this.removeAllChildren();
    for (var y=0;y<this.gridheight;y++) {
      for (var x=0;x<this.gridwidth;x++) {
    
      var gridcount = x + y * this.gridwidth;
      if (x == this.gridwidth-1) { // if we are drawing the rightmost tiles we need to add the extra pixel.
        var g = this.spritesheet.getFrame(this.terraintiles[gridcount]); //does nothing:fixthis
      }
      
      var frame = this.spritesheet.getFrame(this.terraintiles[gridcount]);  
      
      //debugger;

      var bmp = new createjs.Bitmap(frame.image);
      bmp.sourceRect = frame.rect;

      bmp.x = x*this.tilewidth;
      bmp.y = y*this.tileheight;

      bmp.frame = 0;

      this.addChild(bmp);
    }
  }   
}

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