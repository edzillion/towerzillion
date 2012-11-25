/**
 * Game controller
 *
 * @author edzillion
 */

/**
* @constructor
*/
var Game = function(canvas) {

  this.socket = new io.connect('http://localhost:8080');
  this.initSocketListeners(); 
  this.level = 'level';
  this.stage = new createjs.Stage(document.getElementById("Canvas"));
  this.ticktimer = 0;
  this.manifest = null;
  this.graphics = null;
  this.player = new Player();
  this.UI = new UI(); 
};

Game.MESSAGE_TYPE_LOAD_LEVEL = 1;
Game.MESSAGE_TYPE_ERROR = 2;
Game.TARGET_FPS = 60;

Game.prototype.initGame = function() {

  this.level = new Level();
  var preload = $.when(
    this.initialise(),
    this.level.initialise()
  );

  preload.done( function(){
    game.level.render();
    game.startGame();
    game.UI.render();
  });
};

/**
 * Initialises socket event listeners
 */
Game.prototype.initSocketListeners = function() {

  // Horrible passing of game object due to event closure
  var self = this;
  
  this.socket.onopen = function() {
    self.onSocketConnect();
  };
  this.socket.onmessage = function(msg) {
    self.onSocketMessage(msg.data);
  };
  this.socket.onclose = function() {
    self.onSocketDisconnect();
  };
};

/**
 * Event handler for socket connection
 */
Game.prototype.onSocketConnect = function() {

  console.log("Socket connected");
};

/**
 * Event handler for socket messages
 */
Game.prototype.onSocketMessage = function(msg) {

  try {
    //var json = jQuery.parseJSON(msg);
    var data = BISON.decode(msg);

    // Player has been authenticated on the server
    //if (this.authenticated) {
        // Only deal with messages using the correct protocol
        if (data.type) {
          switch (data.type) {
            case Game.MESSAGE_TYPE_ERROR:
            console.log(data.e);
            break;
                /*case Game.MESSAGE_TYPE_LOAD_LEVEL:
                    this.currentLevel = data;
                    console.log('level name: '+this.currentLevel.get('name'));
                    break;*/
                    default:
                    console.log("Incoming message:", data);
                  };
        // Invalid message protocol
      } else {}

    // Data is not a valid JSON string
  } catch (e) {
    console.log(e);
  }
};

/**
 * Event handler for socket disconnection
 */
 Game.prototype.onSocketDisconnect = function() {

  console.log("Socket disconnected");
}

Game.prototype.startGame = function (){

  createjs.Ticker.addListener(window);
  createjs.Ticker.useRAF = false;
  createjs.Ticker.setFPS(Game.TARGET_FPS); // Best Framerate targeted (60 FPS)   
  game.level.state = 'betweenwaves';                    
}

function tick (elapsedTime) {   

  var elapsedticks = createjs.Ticker.getTicks(false) / Game.TARGET_FPS; //timer in seconds
  elapsedticks -= game.ticktimer;
  game.level.update(elapsedticks);
  game.ticktimer = elapsedticks;
  game.stage.update();
};

Game.prototype.over = function() {

  createjs.Ticker.setPaused(true);
  game.UI.$statustext = 'GAME OVER';
};

Game.prototype.initialise = function() {
  
  var loadFile = $.when(
    $.getJSON('./data/PreloadManifest.json', function(data) {
      return $.parseJSON(data);
    }));

  loadFile.done(function (manifest) {
    game.manifest = manifest;
  }); 
};