// We start by initializing Phaser
// Parameters: width of the game, height of the game, how to render the game, the HTML div that will contain the game

BasicGame.Game = function (game) {

	//	When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    this.game;		//	a reference to the currently running game
    this.add;		//	used to add sprites, text, groups, etc
    this.camera;	//	a reference to the game camera
    this.cache;		//	the game cache
    this.input;		//	the global input manager (you can access this.input.keyboard, this.input.mouse, as well from it)
    this.load;		//	for preloading assets
    this.math;		//	lots of useful common math operations
    this.sound;		//	the sound manager - add a sound, play one, set-up markers, etc
    this.stage;		//	the game stage
    this.time;		//	the clock
    this.tweens;	//	the tween manager
    this.world;		//	the game world
    this.particles;	//	the particle manager
    this.physics;	//	the physics manager
    this.rnd;		//	the repeatable random number generator

    //	You can use any of these from any function within this State.
    //	But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.

};


var giveGravity = function (sprite) {
	sprite.body.gravity.y = 400;
};

var goAway = function (sprite) {
	sprite.game.add.tween(sprite).to({
			alpha: 0,
			height: 0,
			width: 0,
			x: sprite.x + 30,
			y: sprite.y + 30
		}, 200, Phaser.Easing.Quadratic.In, true);
};

var die = function (sprite) {
	this.alive = false;
	sprite.body.velocity.x = -200;
	sprite.game.add.tween(sprite)
		.to({
			angle: 90,
			x: 400
		}, 1000, Phaser.Easing.Quadratic.In, true);
};

var flyIn = function (sprite) {
	sprite.flyingIn = sprite.game.add.tween(sprite).to({
			y: 250
		}, 1000, Phaser.Easing.Quadratic.Out, true);

	sprite.flyingIn.onComplete.add(giveGravity.bind(this, sprite));

	sprite.game.add.tween(sprite).to({
			x: 100,
			angle: 0
		}, 1000, Phaser.Easing.Quadratic.Out, true);
};


BasicGame.Game.prototype = {

    preload: function() {
	    this.game.stage.backgroundColor = '#000000';


		//game.load.atlasJSONHash('pipe', 'assets/tinyStars.png', 'assets/tinyStars.json');
    },

    create: function() { 

	    this.noscore = false;
	    this.alive = true;

	    this.mario = this.game.add.sprite(100, 245, 'mario');
		flyIn(this.mario);
		this.mario.body.bounce.setTo(1, 1);
	    this.mario.anchor.setTo(-0.2, 0.5);  

	    var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	    space_key.onDown.add(this.jump, this); 

	    this.jump_sound = this.game.add.audio('jump');  

	    this.death_sound = this.game.add.audio('death');

	    this.miniDeath_sound = this.game.add.audio('miniDeath');

	    this.bg_sound = this.game.add.audio('bg');  

	    this.death_sound.stop();
	    this.bg_sound.stop();
	    
	    if (!this.bg_sound.isPlaying) {
	    	this.bg_sound.play();
	    }

		this.stars = this.game.add.group();  
		this.stars.createMultiple(20, 'star');	
 
		//var frameNames = Phaser.Animation.generateFrameNames('star', 0, 3, '', 2);

		//this.pipes.callAll('animations.add', 'animations', 'shine',['star00','star01','star02','star03'], 10, true, false);
		//this.pipes.callAll('play', 'shine');

		if (window.localStorage.getItem('flappyMario') != undefined && window.localStorage.getItem('flappyMario') != 0) {
			this.highScore = window.localStorage.getItem('flappyMario');  
		} else {
			this.highScore = 0;
			window.localStorage.setItem('flappyMario', 0);
		}	

		this.timer = this.game.time.events.loop(1500, this.addRowOfStars, this);		

		this.score = 0;  
		var style = { font: "30px Arial", fill: "#ffffff" };  
		this.label_score = this.game.add.text(20, 20, "0", style);  

		var highScoreStyle = { font: "30px Arial", fill: "#ffffff" };  

		this.labelHighScore = this.game.add.text(350, 20, this.highScore, highScoreStyle);

		this.currentStar = null;
		this.nextStar = null;

    },

    update: function() {

    	if (this.mario.inWorld == false && this.mario.alive == true) {
    		this.hitStar();
       	}

       	this.checkStars();

       	if (this.mario.y <= 10) {
       		this.mario.body.velocity.y = 0;
       		this.mario.body.y = 11;
       	}

		this.game.physics.overlap(this.mario, this.stars, this.hitStar, null, this);     
		
		if (this.mario.angle < 20)  
    	this.mario.angle += 1;     	
    },


	checkStars: function () {
		if (this.currentStar == null) {
			this.currentStar = this.nextStar;
		}
		if (this.currentStar != null && this.currentStar.x < 100) {
			this.addToScore();
			this.currentStar = this.nextStar;
		}
	},

	// Make the bird jump 
	jump: function() {  

		if (this.mario.alive == false)  
		    return; 		
	    this.mario.body.velocity.y = -250;

	    this.jump_sound.play();  

		// create an animation on mario
		var animation = this.game.add.tween(this.mario);

		// Set the animation to change the angle of the sprite to -20° in 100 milliseconds
		animation.to({angle: -20}, 100);

		// And start the animation
		animation.start();  	    
	},

	// Restart the game
	restart_game: function() {  
	    // Start the 'main' state, which restarts the game
	    window.localStorage.setItem('flappyMario', this.highScore);

	    this.bg_sound.stop(); 

		this.game.time.events.remove(this.timer); 

		this.bg_sound.stop();   

		this.game.state.start('Game');
	},    

	hitStar: function() {  
		this.mario.alive = false;
		this.noscore = true;
		this.showFinalScore();
		die(this.mario);
		this.stars.forEach(goAway);
		this.game.input.onDown.removeAll();
	},

	addOneStar: function(x, y) {  
	    // Get the first dead star of our group
	    var star = this.stars.getFirstDead();

	    // Set the new position of the star
	    star.reset(x, y);

	    // Add velocity to the star to make it move left
	    star.body.velocity.x = -200; 

	    // Kill the star when it's no longer visible 
	    star.outOfBoundsKill = true;

	    return star;
	},	

	addRowOfStars: function() {  
	    var hole = Math.floor(Math.random()*5)+1;

	    for (var i = 0; i < 8; i++)
	        if (i != hole && i != hole +1) 
	            this.nextStar = this.addOneStar(400, i*60+10);   
	        
	},	

	addToScore: function () {
		if (this.noscore === false) {
			this.label_score.content = ++this.score;

			if (this.score == this.highScore) {
				this.labelHighScore.moveScore = this.game.add.tween(this.labelHighScore).to({ x: 20 }, 300, Phaser.Easing.Sinusoidal.In, true);
			}

			if (this.score >= this.highScore) {
				this.labelHighScore.content = this.highScore = this.score;
			}
		}
	},	

	showFinalScore: function () {
		this.game.time.events.remove(this.timer);  
		this.bg_sound.stop();
		if (!this.death_sound.isPlaying){
			this.death_sound.play();
		}

		var text = this.score >= this.highScore ? this.labelHighScore : this.label_score;
		var otherText = text === this.label_score ? this.labelHighScore : this.label_score;

		if (text.moveScore) {
			text.moveScore.stop();
		}

		var style = text.style;
		style.font = '80px Arial';
		text.setStyle(style);
		this.mario.alive=false;
		text.game.add.tween(text).to({
				x: 200 - ((text.width + 10) / 2),
				y: 245 - ((text.height + 40) / 2)
			}, 150, Phaser.Easing.Quadratic.Out, true);

		otherText.game.add.tween(otherText).to({
				alpha: 0
			}, 50, Phaser.Easing.Linear.None, true);

		var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		space_key.onDown.add(this.restart_game, this); 
	}	
}
