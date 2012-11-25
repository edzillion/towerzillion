/**
 * Map class
 *
 * @author edzillion
 */

/**
 * @constructor
 */
function Map(mapdata) {

  console.log('map constructor');
  this.name = mapdata.name;
  this.gridwidth = mapdata.gridwidth;
  this.gridheight =  mapdata.gridheight;
  this.terraintiles = mapdata.terraintiles;
  this.tilewidth = mapdata.tilewidth;
  this.tileheight = mapdata.tileheight;
  this.mapoffset = new Point (0,32);
  this.tileoffset = new Point (this.tilewidth/2, this.tileheight/2);
  this.spritesheet = game.level.graphics.spritesheets.terrain;
  this.container = new createjs.Container();
  this.container.name = 'Map Container';
  game.stage.addChild(this.container);
}


Map.prototype.render = function (){

  for (var x=0;x<this.gridwidth;x++) {
    for (var y=0;y<this.gridheight;y++) {
      var gridcount = x + y * this.gridwidth;
      if (x == this.gridwidth-1) { // if we are drawing the rightmost tiles we need to add the extra pixel.
        var g = this.spritesheet.getFrame(this.terraintiles[gridcount]); //does nothing:fixthis
      }
      
      var img = createjs.SpriteSheetUtils.extractFrame(this.spritesheet, this.terraintiles[gridcount]);  //hardcoded: fixthis   
      var bmp = new createjs.Bitmap(img);
      bmp.x = x*this.tilewidth;
      bmp.y = y*this.tileheight;

      this.container.addChild(bmp);
    }
  }     
};

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