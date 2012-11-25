$(function() {
  //var game;
  
  /**
   * Initialises client-side functionality
   */
  function init() {
    // WebSockets supported
    if ("WebSocket" in window) {
      console.log('create game');
      var canvas = $('#Canvas');
      game = new Game(canvas);
      game.initGame();
      //itListeners();
    // WebSockets not supported
    } else {
      console.log("websockets not supported")
    };
  };
  
  /**
   * Initialises environmental event listeners
   */ 
  function initListeners() {
    $(window).bind("resize", {self: game}, game.resizeCanvas)
    // Horrible passing of game object due to event closure
    .bind("keydown", {self: game}, game.keyDown)
    .bind("keyup", {self: game}, game.keyUp);
  };

  // Initialise client-side functionality
  init();
});