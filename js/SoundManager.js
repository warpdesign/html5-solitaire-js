// sound IDS
var SND_SHUFFLE = 0,
	SND_FLICK_CARD = 1,
	SND_CLICK_CARD = 2,
	SND_DECK = 3,
	SND_BLANK = 6,
	SND_SPLASH = 5,
	SND_YOU_WIN = 4,
	SND_GAME = 7,
	SND_MENU = 8,
	SND_FLIP_CARD = 9;

// SoundManager
var SoundManager = 
{
	soundList: [
		{ src: 'audio/shuffleCards.mp3', loop: false, elt: null },
		{ src: 'audio/flickCard.mp3', loop: false, elt: null },
		{ src: 'audio/clickCard.mp3', loop: false, elt: null },
		{ src: 'audio/deck.mp3', loop: false, elt: null },
		{ src: 'audio/wellDone.mp3', loop: false, elt: null }
	],

	soundActive: true,	

	init: function()
	{
		// preload all sounds for now: this isn't maybe the better one but this will avoid any lag
		// and since we're using very little sounds this shouldn't be that of a problem...
		// Console.log('initializing SoundManager: loading sounds...');
		// for some weird reason Audio doesn't seem to be defined on Safari 5.x / Windows version
		if (typeof Audio === 'undefined')
		{
			this.soundActive = false;
			return;
		}

		for (var i = 0; i < this.soundList.length; i++)
		{
			audioElt = new Audio();
			//audioElt.preload = 'preload';					// set preload attribute to prevent lag on first play
			audioElt.src = this.soundList[i].src;
			audioElt.load();
			this.soundList[i].elt = audioElt;
		}
	},

	isSoundReady: function(soundId)
	{
		return (soundId < this.soundList.length && (this.soundList[soundId].elt !== null));
	},

	playSound: function(soundId)
	{
		// check sound exists and has been created
		if (this.isSoundReady(soundId) && game.gameOptions.sound === true)
		{
			this.soundList[soundId].elt.play();
		}
	},

	pauseSound: function(soundId)
	{
		// check sound exists and has been created
		if (this.isSoundReady(soundId))
		{
			this.soundList[soundId].elt.pause();
		}
	}
};