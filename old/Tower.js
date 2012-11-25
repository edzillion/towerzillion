var Tower = function(pospoint, range, rof, type) {
	this.pos = new Point(pospoint.x,pospoint.y);
	this.range = range;
	this.rof = rof; //seconds elapsed
	this.roftimer = rof;
	this.type = type;
	this.target = null;
	this.spritenum = null;
}

Tower.prototype.target = function (creep) {
	this.target = creep;
}

Tower.prototype.update = function (elapsedsecs) {
	if (this.target) {
		this.roftimer += elapsedsecs;
		if (this.roftimer > this.rof)
			this.shoot();
		}
	}
}

Tower.prototype.shoot = function () {
	this.roftimer = 0;
	switch(tower.type) {
		case 'cannon':
			var bullet = this.bulletcontainer.getChildAt(0);
			var hitpos = intercept(firefrompoint,creep,50);
			bullet.follow = new Follow(hitpos, firefrompoint,50);

			var d = firefrompoint.degreesTo(creeppoint)-90;
			if ( d >= 360 )
				d -= 360;
			if( d < 0 )
				d += 360;
			console.log('degrees to target '+d);
				bullet.rotation = d;
				this.activebullets.addChild(bullet);
				this.bulletindex++;
			}
						else if (this.activetowers[i].roftimer == 0)
							this.activetowers[i].roftimer = tower.rof;
						else
							--this.activetowers[i].roftimer;
					}
				}
				else if(tower.shot == 'lazer') {
					if (tower.rof == this.activetowers[i].roftimer) {
						--this.activetowers[i].roftimer;
						var lazer = new createjs.Shape();
						lazer.graphics.setStrokeStyle(2).beginStroke("black").moveTo(firefrompoint.x,firefrompoint.y).lineTo(creeppoint.x,creeppoint.y).endStroke();
						this.activelazers.addChild(lazer);
					}
					else if (this.activetowers[i].roftimer == 0)
						this.activetowers[i].roftimer = tower.rof;
					else
						--this.activetowers[i].roftimer;
				}
				this.stage.update();
			}
}
	
Tower.prototype.loadGraphics = function (sprites) {
	switch(tower.type) {
		case 'cannon':
}			if (this.graphics[i].name == 'bullet')
	 		sprites = this.graphics[i];							

Tower.prototype.render = function (stage){
	var sprites;

	for (var i = 0; i < this.graphics.length; i++) {
	 	if (this.graphics[i].name == 'bullet')
	 		sprites = this.graphics[i];
	};
	var img = createjs.SpriteSheetUtils.extractFrame(sprites,0);
	for (var i = 0; i < bulletmax; i++) {
	  	var bulletBmp = new createjs.Bitmap(img);
		this.bulletcontainer.addChild(bulletBmp);
	}; 
	this.stage.addChild(this.activebullets); 
	this.stage.update();
};