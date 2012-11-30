  /**
* User Interface
*
* @author edzillion
*/

/**
* @constructor
*/
var UI = function() {

  this.$page = $('#page');
  this.$rpanel = $('#rpanel');
  this.$bpanel = $('#bpanel');
  this.$actionpanel = $('#actionpanel');
  this.$nextwavebutton = $('#nextwavebutton');
  this.$statustext = $('#statustext');
  this.$wavetext = $('#wavetext');
  this.$livestext = $('#livestext');
  this.$goldtext = $('#goldtext');
  this.$scoretext = $('#scoretext');
  this.$towerframe = $('#towerframe');
  this.$laserbutton = $('#laserbutton');
  this.$firebutton = $('#firebutton');
  this.$icebutton = $('#icebutton');
  this.$nextwavebutton = $('#nextwave');
  this.$attachedtocursor = null;
  this.towerspritesheet = null;
  this.towerlist = Array();
  this.towercounter = 0;
  this.tilelist = null;
  this.DIALOG_OFFSET = new Point(-82,-127);

}

UI.prototype.setSpritesheet = function() {

  this.towerspritesheet = game.graphics.spritesheets.towers;
}

UI.prototype.initListeners = function() {

  $('.towerbuttonholder').on({
    click: function() {
      if (game.player.attemptPurchase(this.id)){
        game.UI.currentaction = {action:'build', type:this.id};
        game.UI.renderCursor();
      }
    },
    mouseenter: function() {
      //$(this).siblings('.towerbuttonrollover').css('background-position:-64px 0px');
      //$('.towerbuttonrollover').css('background-position:-64px 0px');
      $(this).children('.towerbuttonrollover').css('background-position','-64px 0px');
    },
    mouseleave: function() {
      $(this).children('.towerbuttonrollover').css('background-position','0px 0px');
      }
  });

  $('#nextwavebutton').on({
    click: function() {
      if (game.level.state == 'betweenwaves')
        game.level.state = 'wavestart';
    },
    mouseenter: function() {
      if (game.level.state == 'betweenwaves')
        $('#nextwavebutton').css("background-color","black");
    },
    mouseleave: function() {
      $('#nextwavebutton').css("background-color","");
  }});
}

UI.prototype.render = function() {

  for (var i = 0; i < game.level.mapdata.towersused.length; i++) {
      
    var towertype = game.level.mapdata.towersused[i];
    var cssoffset = '-'+(game.manifest.gamedata.towers[towertype][1].spritesheetframe*64-1)+'px';
    var section = document.createElement('div');
    $(section).addClass('towerbuttonsection');
    var button = document.createElement('div');
    $(button).addClass('towerbuttonholder');
    $(button).attr('id',towertype);

    $('<div/>', {
      id: towertype,
      class: 'towerbutton'
    }).appendTo(button);

    $('<div/>', {
      id: towertype,
      class: 'towerimage',
      css: {
        'background-position-x': cssoffset,
        'background-position-y': '-62px'
      }
    }).appendTo(button);

    $('<div/>', {
      id: towertype,
      class: 'towerbuttonrollover'
    }).appendTo(button);

    $(button).appendTo(section);    

    var price = document.createElement('div');
    $(price).addClass('towerpriceholder');
    $(price).attr('id',towertype);

    $('<div/>', {
      id: towertype,
      class: 'towerprice'
    }).appendTo(price);

    $('<div/>', {
      id: towertype,
      class: 'towerpriceimage'
    }).append( $('<div/>', {
        id: towertype,
        class: 'towerpricetext',
        html: game.manifest.gamedata.towers[towertype][0].cost
      })).appendTo(price);

    $(price).appendTo(section);
    $(section).appendTo(this.$rpanel);  
  }

  //build bpanel
  for (var i = 0; i < 13; i++) {
    $('<div/>', {
      class: 'bottompanelsection'
    }).appendTo(this.$bpanel);
  }

  this.renderActionPanel();
  this.initListeners();
};

UI.prototype.renderActionPanel = function () {

  this.$actionpanel.find('#actiontitle').text(game.level.name);
  this.$actionpanel.find('#wavenum').text('WAVE: '+game.level.wavecount+1);
  this.$actionpanel.find('#nextwave').text('NEXT: '+game.level.waves[game.level.wavecount+1].numcreeps+' '+game.level.waves[game.level.wavecount+1].creeps[0].name);
  this.$actionpanel.find('#gold').text('GOLD: '+game.player.gold);
  this.$actionpanel.find('#lives').text('LIVES: '+game.player.lives);
  this.$actionpanel.find('#score').text('SCORE: '+game.player.score);
};

UI.prototype.renderCursor = function () {

  switch(this.currentaction.action) {
    case 'build': {
      //switch(this.currentaction.type) {
      var tower = game.manifest.gamedata.towers[this.currentaction.type][0];
      var img = createjs.SpriteSheetUtils.extractFrame(this.towerspritesheet, tower.spritesheetframe);
      
      var rangecircle = new createjs.Shape();
      var rangecw = tower.range*2;
      var rangech = game.level.map.convertYToMapPerspective(tower.range*2);
      rangecircle.graphics.beginFill("black"). drawEllipse(-rangecw/2, -rangech/2, rangecw, rangech).endFill();
      game.level.UI.cursor.addChild(rangecircle);
      game.level.UI.cursor.rangecircle = rangecircle;

      img.onload = function() {
        var towerbmp = new createjs.Bitmap(this);
        towerbmp.x -= tower.regx;
        towerbmp.y -= tower.regy;
        towerbmp.cache(0, 0, this.width, this.height);
        game.level.UI.cursor.addChild(towerbmp);
        game.level.UI.cursor.towerbmp = towerbmp;
      }
  
      game.level.UI.cursor.visible = false;
      game.stage.onMouseMove = this.cursorHandler;
      game.stage.onClick = this.cursorClickHandler;
    }
  }
};

UI.prototype.cursorHandler = function (event) {

  //snaptogrid
  if (event.stageX < game.level.map.mapoffset.x || event.stageY < game.level.map.mapoffset.y)
    return;

  if(!game.level.UI.cursor.visible)
    game.level.UI.cursor.visible = true;

  var gridx = Math.floor((event.stageX-game.level.map.mapoffset.x) / game.level.map.tilewidth);
  var gridy = Math.floor((event.stageY-game.level.map.mapoffset.y) / game.level.map.tileheight);
  var snapx = gridx*game.level.map.tilewidth+game.level.map.tileoffset.x+game.level.map.mapoffset.x;
  var snapy = gridy*game.level.map.tileheight+game.level.map.tileoffset.y+game.level.map.mapoffset.y;

  if (!game.UI.checkTile(gridx,gridy)){
    game.level.UI.cursor.rangecircle.visible = false;
    var redFilter = new createjs.ColorFilter(1,0,0,1);
    game.level.UI.cursor.towerbmp.filters = [redFilter];
    game.level.UI.cursor.towerbmp.updateCache();
  }
  else {
    game.level.UI.cursor.rangecircle.visible = true;
    if (game.level.UI.cursor.towerbmp.hasOwnProperty('filters'))
      game.level.UI.cursor.towerbmp.filters = null;
    game.level.UI.cursor.towerbmp.updateCache();
  }

  game.level.UI.cursor.x = snapx;
  game.level.UI.cursor.y = snapy;
};

UI.prototype.cursorClickHandler = function (event) {

  //we add towers by grid ref
  if (game.UI.currentaction.action != 'build')
    console.log('error: currentaction is not build!');
  else {
    var gridx = Math.floor((event.stageX-game.level.map.mapoffset.x) / game.level.map.tilewidth);
    var gridy = Math.floor((event.stageY-game.level.map.mapoffset.y) / game.level.map.tileheight);
    
    if (game.UI.checkTile(gridx,gridy)) {
      var towertocreate = game.manifest.gamedata.towers[game.UI.currentaction.type][0];
      towertocreate.point = new Point(gridx,gridy);
      game.UI.tilelist[gridx+gridy*10] = 0;
      game.level.towers.addTower(towertocreate);
    }
  }

  game.stage.onMouseMove = null;
  game.stage.onClick = null;
  game.level.UI.cursor.removeAllChildren();
};

UI.prototype.checkTile = function (gridx, gridy) {

  //first time: set up our tilelist of tiles you can build on
  if(this.tilelist == null) {
    this.tilelist = Array();
    for (var i = 0; i < game.level.map.terraintiles.length; i++) {
      if (game.level.map.terraintiles[i] == 1 || game.level.map.terraintiles[i] == 5 || game.level.map.terraintiles[i] == 6)
        this.tilelist[i] = 1;
      else
        this.tilelist[i] = 0;
    }
  }
  var arrindex = gridx + gridy * 10;
  return  this.tilelist[arrindex];
};

UI.prototype.setRolloverListener = function (tower) {

  this.towerlist.push(tower);
  this.towerlist[this.towercounter].onMouseMove = game.UI.rolloverTower;
  this.towercounter++;
};

UI.prototype.rolloverTower = function (event) {

  console.log('perhaps not here?');
};

UI.prototype.handleTowerMouseOver = function (event) {
  
  console.log(event);
};