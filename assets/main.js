// We start by initializing Phaser
// Parameters: width of the game, height of the game, how to render the game, the HTML div that will contain the game
var game = new Phaser.Game(400, 490, Phaser.AUTO, 'game_div');

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


var main_state = {

    preload: function() {
	    this.game.stage.backgroundColor = '#000000';

	    this.game.load.image('mario', 'assets/mario.png');

	    this.game.load.audio('jump', 'assets/spaceJump.wav');   

	    this.game.load.audio('bg', 'assets/backgroundMusic.mp3');   

		this.game.load.image('star', 'assets/star1.png'); 
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

	    this.bg_sound = this.game.add.audio('bg');  

	    this.bg_sound.play();

		this.stars = game.add.group();  
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

    	if (this.mario.inWorld == false && this.mario.alive == true)
       		this.restart_game();

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

	    this.game.state.start('main');

		this.game.time.events.remove(this.timer);  	    
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
				x: 200 - ((text.width + 40) / 2),
				y: 245 - ((text.height + 40) / 2)
			}, 150, Phaser.Easing.Quadratic.Out, true);

		otherText.game.add.tween(otherText).to({
				alpha: 0
			}, 50, Phaser.Easing.Linear.None, true);

		var space_key = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		space_key.onDown.add(this.restart_game, this); 
	}	
}

// And finally we tell Phaser to add and start our 'main' state
game.state.add('main', main_state);  
game.state.start('main');  