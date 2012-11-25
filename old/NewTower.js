


	var p = NewTower.prototype = new createjs.Container();
	//

	function NewTower(towerdata,spritesheets) {
	  this.initialize(towerdata,spritesheets);
	}



	//public properties, const
	p.SPRITESHEETS_ARRAY;
	p.POINT;

	// public properties, var
	p.type;
	
	p.range;
	p.rof;
	p.roftimer;
	p.damage;
	p.splashrad;
	p.effect;
	p.currenttarget;
	p.levels;
	p.currentlevel;
	p.xp;
	p.killcount;
	p.mydialog;

	p.Container_initialize = p.initialize; //unique to avoid overiding base class
	


	

	p.initialize = function(towerdata,spritesheets) {

		this.Container_initialize();

		this.SPRITESHEETS_ARRAY = spritesheets;

		this.POINT = game.level.map.convertGridToMapPoint(towerdata.point);
		this.gridpoint = towerdata.point;


		this.type = towerdata.type;
		this.range = towerdata.range;
		this.rof = towerdata.rof; //seconds elapsed
		this.roftimer = towerdata.rof;
		this.damage = towerdata.damage;
		this.bulletspeed = towerdata.bulletspeed;
		this.splashrad = towerdata.splashrad;
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
		this.bulletbmp = new createjs.Bitmap();
		this.bulletcontainer = game.level.bulletcontainer;
		this.mybullets = new createjs.Container();
		this.mydialog = new createjs.Container();
		this.bulletcontainer.addChild(this.mybullets);
		this.activebullets = Array();
	}

	

	// public methods:

	p.render = function() {

		//first draw the range base
		this.rangecircle = new createjs.Shape();
		var rangecw = this.range*2;
		var rangech = game.level.map.convertYToMapPerspective(this.range*2);
		this.rangecircle.graphics.beginFill("black"). drawEllipse(-rangecw/2, -rangech/2, rangecw, rangech).endFill();
		this.rangecircle.x = this.POINT.x;
		this.rangecircle.y = this.POINT.y;
		this.rangecircle.alpha = .5;
		this.rangecircle.visible = false;
		this.addChild(this.rangecircle);



		//draw the tower
		var img = createjs.SpriteSheetUtils.extractFrame(this.SPRITESHEETS_ARRAY[0],this.spritesheetframe);//this.towerlist[i].spritenum);
		this.sprite = new createjs.Bitmap(img);
		this.sprite.x = this.POINT.x;
		this.sprite.y = this.POINT.y;
		this.sprite.regX = 32;
		this.sprite.regY = 135;
		this.addChild(this.sprite);

		//draw the bullet
		switch (this.type) {
			case 'melee': {	
				var img = createjs.SpriteSheetUtils.extractFrame(this.SPRITESHEETS_ARRAY[1], 0);//this.towerlist[i].spritenum);
				this.bulletbmp = new createjs.Bitmap(img);

			}
			break;
			case 'water': {
				var img = createjs.SpriteSheetUtils.extractFrame(this.SPRITESHEETS_ARRAY[1], 0);//this.towerlist[i].spritenum);
				this.bulletbmp = new createjs.Bitmap(img);
				this.bulletbmp.regX = 2; //hardcoded: fixthis
				this.bulletbmp.regY = 0; //hardcoded: fixthis
			}
			break;
			case 'magic': {	
			}
			break;
		}	

		// then my dialog sprite
		var dialog = this.mydialog;
		
 		var img  = new Image();
		img.src = './assets/img/dialog.png'
		

		img.onload = function() {
			var bmp = new createjs.Bitmap(this);
			bmp.x = game.UI.DIALOG_OFFSET.x;
			bmp.y = game.UI.DIALOG_OFFSET.y;
			dialog.addChild(bmp);
		}
		//dialog.x = this.POINT.x - 82; //hardcoded: fixthis (half the dialog width)
		//dialog.y = this.POINT.y - 108 - 27; // height of dialog - 27
		
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


		dialog.x = this.POINT.x;
		dialog.y = this.POINT.y;

		dialog.visible = false;
		this.addChild(this.mydialog);
		game.level.towers.container.addChild(this);
	};

	p.update = function (elapsedticks) {
		//var firefrompoint = this.convertToMapPoint(tower);
		if(game.level.creeps.activecreeps.length > 0)
		{
			
			//is the current target still in range?
			if (this.currenttarget) {
				var dist = Math.floor(this.POINT.distance(this.currenttarget.getPos()));
				if (dist > this.range) //we do have a target but it's gone out of range. 
					this.currenttarget = null;
			}
			if(!this.currenttarget) {
				for (var i=0; i<game.level.creeps.activecreeps.length; i++) {
					var creep = game.level.creeps.activecreeps[i];
					var creeppoint = new Point(creep.anim.x,creep.anim.y);
					var distance = Math.floor(creeppoint.distance(this.POINT));
					if (distance < this.range) 
						this.target(creep);
				}
			}
		}
		else
			this.currenttarget = null;

		this.roftimer += elapsedticks;
		if (this.currenttarget)
			if (this.roftimer > this.rof)
				this.shoot(elapsedticks);

		this.updateBullets(elapsedticks);
	};

	p.updateBullets = function (elapsedticks) {
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
				currbullet.x = newpos.x;
				currbullet.y = newpos.y;
			}
		}
	};


	p.target = function (creep) {
		this.currenttarget = creep;
	};	

	p.addXP = function (amount) {
		if (!this.readytolevel) {
			this.xp += amount;
			if (this.xp >= this.levelxp) {
				this.readytolevel = true;
				this.xp = this.levelxp;
			}
		}
	}

	p.shoot = function (elapsedticks) {
		this.roftimer = 0;
		var bullet = new createjs.Container();

		switch(this.type) {
			case 'water': {

				bullet.addChild(this.bulletbmp.clone());
				bullet.x = this.POINT.x;
				bullet.y = this.POINT.y;
				var nextturntarget = new Point();
				nextturntarget.x = this.currenttarget.anim.x + this.currenttarget.anim.vx *2; //total kludge, why *2? fixthis
				nextturntarget.y = this.currenttarget.anim.y + this.currenttarget.anim.vy *2;
				nextturntarget.vx = this.currenttarget.anim.vx;
				nextturntarget.vy = this.currenttarget.anim.vy;

				var hitpos = intercept(this.POINT, nextturntarget, this.bulletspeed); //100 is bullet speed
				bullet.follow = new Follow(hitpos, this.POINT, this.bulletspeed);

				var d = this.POINT.degreesTo(hitpos)-90;
				if ( d >= 360 )
					d -= 360;
				if( d < 0 )
					d += 360;
				bullet.rotation = d;
				bullet.fadetime = 0;
			}
			break;
			case 'magic': {
				bullet.x = this.POINT.x;
				bullet.y = this.POINT.y;
				var localcoords = bullet.globalToLocal(this.currenttarget.anim.x,this.currenttarget.anim.y);

				var lightning = new createjs.Shape();
				lightning.graphics.setStrokeStyle(3).beginStroke("white").moveTo(0,0).lineTo(localcoords.x,localcoords.y).endStroke();
				bullet.addChild(lightning);

				bullet.follow = new Follow(this.POINT,this.currenttarget.anim,this.bulletspeed);
				bullet.fadetime = 500; //ms
			}
			break;
			case 'melee': {
				var fire = new createjs.Shape();
				fire.graphics.beginFill("red").drawCircle(0, 0, this.splashrad).endFill();
				bullet.addChild(fire);
				bullet.x = this.POINT.x;
				bullet.y = this.POINT.y;
				var hitpos = intercept(this.POINT, this.currenttarget.anim, this.bulletspeed);
				bullet.follow = new Follow(this.POINT, hitpos, this.bulletspeed);
				bullet.fadetime = 800;

			}	
			break;
		}
		bullet.target = this.currenttarget;
		this.mybullets.addChild(bullet);
		this.activebullets.push(bullet);
		game.stage.update();	 	
	}

	p.hit = function (currbullet) {
		if ($.inArray(this.currenttarget, game.level.creeps.activecreeps) == -1) {
			this.currenttarget = null;
			currbullet.target = null;
			return;
		}
		
		var targ = currbullet.target;

		switch(this.type) {
			case 'water': {
				if (currbullet.target.hit(this.damage)) {
					//true means we have killed the target			
					this.addXP(currbullet.target.xp);
					game.player.addGold(currbullet.target.gold);
					game.player.addScore(currbullet.target.score);
					game.level.creeps.kill(currbullet.target);
					this.killcount++;
					this.currenttarget = null;
				}				
				//false means the creep is still alive. if so, then do effect
				else
					currbullet.target.affect(this,this.effect.amount,this.effect.times);
			}
			break;
			case 'melee': {
				var creepstokill = Array();
				for (var i=0; i<game.level.creeps.activecreeps.length; i++) {
					var creep = game.level.creeps.activecreeps[i];
					var localcoords = currbullet.globalToLocal(creep.anim.x,creep.anim.y);
					var hit = currbullet.hitTest(localcoords.x,localcoords.y);

					if (hit) {
						if(creep.hit(this.damage)) {
						 	this.addXP(currbullet.target.xp);
						 	game.player.addGold(currbullet.target.gold);
						 	game.player.addScore(currbullet.target.score);
						 	this.killcount++;
						 	creepstokill.push(creep);
						 	if (creep == currbullet.target)	 		
						 		this.currenttarget = null;
						}
						else  //dude survived, apply effect then 
							creep.affect(this, this.effect.amount, this.effect.times);
						
					}
				}
				if (creepstokill){
					for (var i = 0; i < creepstokill.length; i++) {
						game.level.creeps.kill(creepstokill[i]);
					}
				}
			}
			break;
			case 'magic': {
				var dmg = this.damage;
				if (Math.random()*100 <= this.effect.amount) {
					dmg *=2;
					console.log('crit!',dmg);
				}

				if (currbullet.target.hit(dmg)) {	
					this.addXP(currbullet.target.xp);
					game.player.addGold(currbullet.target.gold);
					game.player.addScore(currbullet.target.score);
					game.level.creeps.kill(currbullet.target);
					this.killcount++;
					this.currenttarget = null;
				}
			}
			break;
		}
		currbullet.target = null;
	}

	p.fadeBullet = function () {
		var bullet = this.activebullets.shift();
		var mybullets = this.mybullets;
		if (bullet.fadetime) {
			bullet.alpha-=.7;
			var interval = setInterval(function(){
				bullet.alpha-=.5;
			},bullet.fadetime/14); // fade by 10% every 100ms
			setTimeout(function(){
				mybullets.removeChild(bullet);	
				clearInterval(interval);
			}, bullet.fadetime);
		}
		else
			this.mybullets.removeChild(bullet);
	}

	
	p.clickTower = function(event) {
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

	p.handleTowerMouseOver = function (event) {
	console.log(event);
	};