
BasicGame.Preloader = function (game) {

	this.background = null;
	this.preloadBar = null;

	this.ready = false;

};

BasicGame.Preloader.prototype = {

	preload: function () {

		//	These are the assets we loaded in Boot.js
		//	A nice sparkly background and a loading progress bar

		this.load.image('preloaderBackground', 'assets/logo.png');

	    this.game.load.image('mario', 'assets/mario.png');

	    this.game.load.audio('jump', 'assets/spaceJump.wav');   

	    this.game.load.audio('bg', 'assets/backgroundMusic.mp3');   

	    this.game.load.audio('death', 'assets/death.wav');   

	    this.game.load.audio('miniDeath', 'assets/miniDeath.wav');   

		this.game.load.image('star', 'assets/star1.png'); 


	},

	create: function () {

		this.logo = this.game.add.sprite(40, 100, 'preloaderBackground');

	},

	update: function () {

		//	You don't actually need to do this, but I find it gives a much smoother game experience.
		//	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
		//	You can jump right into the menu if you want and still play the music, but you'll have a few
		//	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
		//	it's best to wait for it to decode here first, then carry on.
		
		//	If you don't have any music in your game then put the game.state.start line into the create function and delete
		//	the update function completely.
		
		if (this.cache.isSoundDecoded('bg') && this.ready == false)
		{
			this.ready = true;
			this.game.state.start('Game');
		}

	}

};
