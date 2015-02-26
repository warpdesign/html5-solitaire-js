/**** Card Class ****/
// cards color
var BLACK = 1;
var RED = 2;
var ANY = 3;

// cards status
var ST_SELECTED = 3;
var ST_UNSELECTED = 4;

var G_INIT = 1;
var G_RUNNING = 2;
var G_STOPPED = 3;
var G_PAUSED = 4;

// ************* RULES ********************/
// This is the number of cards in each game deck
var RULES = [ 1, 2, 3, 4, 5, 6, 7 ];
// this is the maximum numer of cards
var MAX_CARDS = 7;

// ************ GFX STUFF *******/
// playground positions, different on PRE/PIXI
var DISPLAY_POSITIONS = {
	'hd': {
		/* sprites positions inside the sprites file */
		SPRITE_XSTART: 47,
		XSTART: 100,
		XSPACE: 88,
		CARDBACK: {x: 487, y: 280},
		BACKSY: { heart: 4, diamond: 113, club: 223, spade: 332, misc: 441 },

		MAIN_DECK_Y: 280,
		WASTEPOS: { x: 140, y: 66 },
		ACESPOS: { x: 438, space: 120 },

		VISIBLE_CARD_SPACE: 18,
		HIDDEN_CARD_SPACE: 6,
		PACK_CARD_SPACE: 36
	}
};

var SHUFFLE_TRANSLATION = 800;	// cards movement speed (in ms)
var SWAP_TRANSLATION = 100;
var DBLCLICK_DELAY = 270;		// delay for single click (in ms)
var DECK_PACK = 1;
var DECK_ACE_HEART = 2;
var DECK_ACE_DIAMOND = 3;
var DECK_ACE_CLUB = 4;
var DECK_ACE_SPADE = 5;
var DECK_ACES = 6; // any Ace Deck
var DECK_BOTTOM = 7;
var DECK_WASTE = 8;

/**** Game Class ****/
var NUM_CARDS = 52;

var game = {
	stockPack: new Deck(DECK_PACK),
	wastePack: new Deck(DECK_WASTE),
	aceDecks: [],
	bottomDecks: [],
	score: 0,
	scores: null,
	scorePosition: -1,
	scoreObj: {},
	playAttempts: 0,
	gameStats: {},
	gameOptions: {},
	touchMode: true,			// TODO: merge this option in gameOptions object
	time: { h: 0, m: 0, s: 0}, // minutes/seconds
	selectedCard: null,		   // current selected card
	multiSelect:false,		   // do we have several cards selected ?
	cardPos: null,
	dealType: 3,
	maxDepth:1,

	// Graphics
	statusPanelElt: null,
	optionsPanelElt: null,

	timeElt: null,
	scoreElt: null,
	stackElt: null,
	pauseElt: null,
	scoreEvolElt: null,

	// Cards Selection isn't allowed while a swap is ongoing...
	blockedSelection: false,
	blockedPack: false,

	displayPositions: null,

	// history stuff
	history: [],

	// we shuffle cards on init...
	init: function(gameOptions, gameStats, scores)
	{
		// Get DOM elements references
		this.statusPanelElt = jQuery('#statusPanel');
		this.optionsPanelElt = jQuery('#optionsPanel');
		this.timeElt = jQuery('#statusPanel').find('.time');
		this.scoreElt = jQuery('#statusPanel').find('.score');
		this.stackElt = jQuery('<div class="waste returnedCard visible"/>').appendTo('#playground');
		this.pauseElt = jQuery('#playground #pause');
		this.scoreEvolElt = jQuery('<div class="scoreEvol"/>').appendTo('body');

		this.gameOptions = {
			sound: gameOptions.sound,					// sound enabled ?
			background: gameOptions.background,			// background picture nb
			cardset: gameOptions.cardset,				// cardset picture nb
			theme: gameOptions.theme,
			autoFlip: gameOptions.autoFlip,
			autoPlay: gameOptions.autoPlay,
			dealType: gameOptions.dealType
		};

		this.dealType = gameOptions.dealType;

		this.gameStats = {
			status: gameStats.status,			// Game in progress ?
			date: gameStats.date,				// Date
			gamesTotal: gameStats.gamesTotal,	// games played
			gamesWon: gameStats.gamesWon,
			scoreTotal: gameStats.scoreTotal
		}

		this.scores = scores;

		// get positions for the selected device
		// TODO: check boundaries !!!
		this.displayPositions = DISPLAY_POSITIONS[CM.phoneType];

		/* ShortCuts, should speed up access */
		this.wastePosX = this.displayPositions.WASTEPOS.x,
		this.wastePosY = this.displayPositions.WASTEPOS.y,
		this.acePosX =	this.displayPositions.ACESPOS.x,
		this.acePosY =	this.displayPositions.ACESPOS.y,
		this.aceSpace =	this.displayPositions.ACESPOS.space,
		this.xSpace = this.displayPositions.XSPACE,
		this.backYHeart = this.displayPositions.BACKSY.heart,
		this.backYSpade = this.displayPositions.BACKSY.spade,
		this.backYDiamond = this.displayPositions.BACKSY.diamond,
		this.backYSpade = this.displayPositions.BACKSY.spade,
		this.backYMisc = this.displayPositions.BACKSY.misc,
		this.backsY = this.displayPositions.BACKSY,
		this.xStart = this.displayPositions.XSTART,
		this.visibleCardSpace = this.displayPositions.VISIBLE_CARD_SPACE,
		this.hiddenCardSpace = this.displayPositions.HIDDEN_CARD_SPACE,
		this.mainDeckY = this.displayPositions.MAIN_DECK_Y,
		this.packCardSpace = this.displayPositions.PACK_CARD_SPACE,
		this.spriteXStart = this.displayPositions.SPRITE_XSTART,
		this.cardBackX = this.displayPositions.CARDBACK.x,
		this.cardBackY = this.displayPositions.CARDBACK.y;

		if (CM.phoneType === 'pixi')
			jQuery('body').addClass('pixi');
		else if (CM.phoneType === 'hd')
			jQuery('body').addClass('hd');

		// init TimerManager
		TimerManager.init(jQuery.proxy(this.updateTime, this));
		this.time = {h: 0, m: 0, s: 0};

		// menu listeners
		this.setupListeners();
	},

	shuffle: function()
	{
		// 3 Steps:
		// 1. first shuffle all cards
		var toDo = new Array(NUM_CARDS);
		this.stockPack = new Deck(DECK_PACK);
		this.wastePack = new Deck(DECK_WASTE);
		this.aceDecks = [new Deck(DECK_ACE_HEART), new Deck(DECK_ACE_DIAMOND), new Deck(DECK_ACE_SPADE), new Deck(DECK_ACE_CLUB)];
		this.bottomDecks = [new Deck(DECK_BOTTOM, 0), new Deck(DECK_BOTTOM, 1), new Deck(DECK_BOTTOM, 2), new Deck(DECK_BOTTOM, 3), new Deck(DECK_BOTTOM, 4), new Deck(DECK_BOTTOM, 5), new Deck(DECK_BOTTOM, 6)];

		var bottomDecks = this.bottomDecks,
		stockPack = this.stockPack;

		for (var i = 0, max = bottomDecks.length; i < max; i++)
			bottomDecks[i].setDeckNum(i);

		SoundManager.playSound(SND_SHUFFLE);

		// empty the new array
		// 1 - 13 = spade, 14 - 26 = club, 27 - 39 = diamond, 40-52 heart
		// starting from 1
		for (var i = 0; i < NUM_CARDS; i++)
			toDo[i] = 0;

		for (var i = 0; i < NUM_CARDS; i++)
		{
			var rand = Random(NUM_CARDS),
			card = null;

			// generate an unused card
			while (toDo[rand] === 1)
			{
				rand = Random(NUM_CARDS);
			}
			toDo[rand] = 1;

			cardtype = 'heart';

			if (rand < 14)
				cardtype = 'spade';
			else if (rand < 27)
				cardtype = 'club';
			else if (rand < 40)
				cardtype = 'diamond';

			card = new Card(cardtype, rand);
			EventsManager.addDroppable(card);
			EventsManager.addDraggable(card);
			stockPack.push(card);
		}

		//this.stockPack.debug();
		// 2. Build all decks
		// TODO: change position of all cards !
		var turn = 1;

		while (turn <= MAX_CARDS)
		{
			for (var i = 0; i < RULES.length; i++)
			{
				// We display 1 card per turn per each DECK...
				// RULES tells us the number of cards we should have in the selected deck
				if (turn > RULES[i])
					continue;
				else
				{
					var card = stockPack.pop();
					// this is the last card of the column: this will be the visible one
					if (turn == RULES[i])
					{
						card.setVisible(true);
						card.enableSelection(true);
					}
					// then add the card to the selected deck
					bottomDecks[i].push(card);
				}
			}
			turn++;
		}

		for (var i = 0, max = bottomDecks.length; i < max; i++)
			bottomDecks[i].bindTopListeners(DECK_BOTTOM);

		for (var i = 0, max = this.aceDecks.length; i < max; i++)
			this.aceDecks[i].bindTopListeners(-1);

		// 3. Return the first card of the stockPack (we should implement 3-cards rule in next version)
		/*
		this.stockPack.reverseFirstInvisible();
		this.stockPack.getTop().setPosition(this.displayPositions.WASTEPOS.x + 56, this.displayPositions.WASTEPOS.y);  // , SHUFFLE_TRANSLATION
		this.stockPack.getTop().enableSelection(true);
		*/

		this.playAttempts++;
		this.gameStats.gamesTotal++;
	},

	resumeGame: function(stateObject)
	{
		stateObject = stateObject.value;

		/* test */
		if (this.selectedCard !== null)
			this.toggleSelectedCard(this.selectedCard);

		// properties reinit
		this.selectedCard = null;
		this.multiSelect = 0;

		// jQuery/Graphics reinit
		jQuery('.card').remove();
		jQuery('.pack').remove();

		EventsManager.emptyElements();
		/* /test */

		// TODO: this should be mutualized
		this.stockPack = new Deck(DECK_PACK);
		this.wastePack = new Deck(DECK_WASTE);

		this.aceDecks = [new Deck(DECK_ACE_HEART), new Deck(DECK_ACE_DIAMOND), new Deck(DECK_ACE_SPADE), new Deck(DECK_ACE_CLUB)];
		this.bottomDecks = [new Deck(DECK_BOTTOM, 0), new Deck(DECK_BOTTOM, 1), new Deck(DECK_BOTTOM, 2), new Deck(DECK_BOTTOM, 3), new Deck(DECK_BOTTOM, 4), new Deck(DECK_BOTTOM, 5), new Deck(DECK_BOTTOM, 6)];

		var bottomDecks = this.bottomDecks,
			aceDecks = this.aceDecks;

		// 1. fill-in main deck
		this.stockPack.fillWith(stateObject.pack);
		if (!this.stockPack.length)
			this.stackElt.addClass('empty');

		// fill in waste deck and show cards
		this.wastePack.fillWith(stateObject.wasteDeck).setPossibleSelections().showCards(this.wastePosX + (this.xSpace + 10), this.wastePosY);
		this.setWasteShadow();

		// TODO: check that we have the correct order !!
		aceDecks[0].fillWith(stateObject.heartDeck).setPossibleSelections().showCards(this.acePosX, this.wastePosY);
		aceDecks[1].fillWith(stateObject.diamondDeck).setPossibleSelections().showCards(this.acePosX + (this.aceSpace), this.wastePosY);
		aceDecks[3].fillWith(stateObject.spadeDeck).setPossibleSelections().showCards(this.acePosX + (2 * this.aceSpace), this.wastePosY);
		aceDecks[2].fillWith(stateObject.clubDeck).setPossibleSelections().showCards(this.acePosX + (3 * this.aceSpace), this.wastePosY);

		var size = bottomDecks.length;

		for (var i = 0; i < size; i++)
		{
			bottomDecks[i].fillWith(stateObject.bottomDecks[i]).setPossibleSelections();
		}

		// this.stockPack.debug();

		for (var i = 0; i < size; i++)
			bottomDecks[i].bindTopListeners(DECK_BOTTOM);

		for (var i = 0, max = aceDecks.length; i < max; i++)
			aceDecks[i].bindTopListeners(-1);

		this.time = stateObject.time;

		this.score = stateObject.score;
		this.updateScore();

		this.runGame();
	},

	// display all cards
	initGraphics: function()
	{
		// TODO: place static elements:
		// 1. top menu link
		// 3. Aces
		// 4. Main stack (back card)
		// 5. All bottom stack empty elements
		// => do it statically in CSS/Scene !!!
		var that = this;

		this.showCards();

		//Console.log('[Graphics()] Here we go for some funky graphics stuff !');
		this.statusPanelElt.slideDown();
		this.optionsPanelElt.slideDown();
		this.stackElt.css({left: this.wastePosX + 'px', top: this.wastePosY + 'px'});
},

	showCards: function()
	{
		// TODO: Add aces if any !!!!

		var xSpace = this.xSpace,
			totalSpace = this.xSpace + this.packCardSpace,
			mainDeckY = this.mainDeckY,
			xStart = this.xStart,
			visibleCardSpace = this.visibleCardSpace,
			hiddenCardSpace = this.hiddenCardSpace,
			bottomDecks = this.bottomDecks;

		// for each deck
		for (var i = 0; i < RULES.length; i++)
		{
			var deck = bottomDecks[i];
			var size = deck.length;
			var offset = 0;
			for (var j = 0; j < size; j++)
			{
				var card = deck.getCardAtPos(j);
				card.depth((i * MAX_CARDS) + j + 2);
				card.setPosition(xStart + (i * totalSpace), mainDeckY + offset);
				if (card.isVisible())
				{
					offset += visibleCardSpace;
					card.enableSelection(true);
				}
				else
					offset += hiddenCardSpace;
			}
		}
		/* /test */

		// set maxDepth
		// this.maxDepth = (turn*MAX_CARDS) + i;
		this.maxDepth = (RULES.length * MAX_CARDS) + j;

		this.setWasteShadow();
		// 3. Return the first card of the pack (we should implement 3-cards rule in next version)
		// only reverse last card if we just shuffled, save game will keep the last one
		// TODO: will *crash* if game was saved and there weren't anymore cards on the main pack

		// TODO: We should display cards found in the wastePack (only useful when resuming a state !!)

		// show Aces (if any: loading a previous stage...)
	},

	setupListeners: function()
	{
		var that = this,
			gameStats = this.gameStats;

		// setup buttons: menus,...
		// TODO: we should of course ask for confirmation
		// BottomMenu
		jQuery('#statusPanel .startAgain').bind(EventsManager.EVENT_UP, jQuery.proxy(this.restart, this));

		jQuery('.restoreGame').live(EventsManager.EVENT_UP, function() {
			game.loadState();
			$.gritter.removeAll();
			return false;
		});

		// highscore
		$('#youWon .ok').bind(EventsManager.EVENT_UP, function() {
			if (that.scorePosition > -1 == true)
			{
				that.scoreObj.nick = $('#youWon input').val();

				StateManager.setScore(that.scoreObj, that.scorePosition);
				that.scores[i] = that.scoreObj;
			}
			/*
			else
				console.log('no highscore !');
			*/

			// TODO: send to twitter if needed
			if ($('#tweetScore').hasClass('checked')) {
				window.open(CM.twitterURL + encodeURIComponent('I just did the impossible score of #{score} at SolitaireHD by @warpdesign_ Do you think you can do better ? :) → http://bit.ly/1FYjhbH'.replace('#{score}', that.scoreObj.score)), 'I am a winner, and I don\'t use drugs ;)', 'width=550,height=380,top=' + (screen.height-380)/2 + ',left=' + (screen.width-550)/2);
			}

			WarpKlondikeMain.setScores(that.scores);
			setTimeout(function() { $('#showScores').trigger(EventsManager.EVENT_UP); }, 1000);

			return false;
		});

		// Special packs (ie: main pack, kings, and aces)
		this.stackElt.bind(EventsManager.EVENT_UP, jQuery.proxy(this.nextPackCard, this));

		// window/tab activation events
		jQuery(window).bind('blur', function() { /*Console.log('blur');*/ that.togglePauseGame(true); });
		jQuery(window).bind('focus', function() { /*Console.log('focus');*/ that.togglePauseGame(); });

		$('.undo').click(jQuery.proxy(this.popHistory, this));

		jQuery(window).bind('unload', function() {
			// saves the game state
			that.saveState();

			// saves options with pause mode
			gameStats.status = G_PAUSED; // paused
			gameStats.date = new Date().toUTCString();
			StateManager.setStatus(gameStats);
		});
	},

	restart:function()
	{
		if (this.selectedCard !== null)
			this.toggleSelectedCard(this.selectedCard);

		// properties reinit
		this.selectedCard = null;
		this.multiSelect = 0;

		// TODO: do we reset the score ?
		this.score = 0;
		this.highScore = false;
		this.scoreObj = {};
		this.updateScore();

		// jQuery/Graphics reinit
		jQuery('.card').remove();
		jQuery('.pack').remove();
		this.stackElt.removeClass('empty');
		this.setWasteShadow();
		this.flushHistory();

		EventsManager.emptyElements();

		this.shuffle();

		// don't forget to reset time as well !!
		this.time.h = this.time.m = this.time.s = 0;

		// setTimeout(jQuery.proxy(this.runGame, this), 300);
		this.runGame();
	},

	runGame:function()
	{
		// win condition: all decks.size == 12
		// stop condition: win or end or exit (see events...)

		// init graphics stuff
		this.initGraphics();

		TimerManager.stop();
		TimerManager.start(this.time);

		this.gameStats.status = G_RUNNING;
	},

	pauseGame:function()
	{
		// Stop Timer
		// Stop listeners
		// display pause dialog
		this.gameStats.status = G_PAUSED;
		// Alert ?
	},

	unpauseGame:function()
	{
		this.gameStats.status = G_RUNNING;
	},

	updateTime:function(time)
	{
		this.time = time;
		this.timeElt.html((time.m > 9 ? time.m : ('0' + time.m)) + ':' + (time.s > 9 ? time.s : ('0' + time.s)));
		var aceDecks = this.aceDecks;

		// you won !!
		if ((aceDecks[0].length == 13) && (aceDecks[1].length == 13) && (aceDecks[2].length == 13) && (aceDecks[3].length == 13))
		{
			this.endGameWon();
		}
	},

	flashScore:function(amount)
	{
		var scoreEvolElt = this.scoreEvolElt;

		if (scoreEvolElt.hasClass('shown'))
			scoreEvolElt.removeClass('shown');

		scoreEvolElt.html((amount > 0 ? '+' : '-') + amount);

		setTimeout(function() { scoreEvolElt.addClass('shown'); }, 100);
	},

	// TODO: add member for the scoreEvol DOM element, not having to use querySelector on each change...
	updateScore:function(srcDeckType, destDeckType)
	{
		var scoreEvolElt = this.scoreEvolElt;

		// update score
		if (typeof srcDeckType !== 'undefined')
		{
		if (scoreEvolElt.hasClass('shown'))
			scoreEvolElt.removeClass('shown');

			switch(srcDeckType)
			{
				case DECK_BOTTOM:
					if (destDeckType !== DECK_BOTTOM)
					{
						this.score += 10;
						scoreEvolElt.html('+ 10');
					}
				break;

				case DECK_WASTE:
					if (destDeckType === DECK_BOTTOM)
					{
						this.score += 5;
						scoreEvolElt.html('+ 5');
					}
					else
					{
						this.score += 10;
						scoreEvolElt.html('+ 10');
					}
				break;

				default:
					this.score -= 15;
					scoreEvolElt.html('- 15');
				break;
			}
			setTimeout(function() { scoreEvolElt.addClass('shown'); }, 100);
		}

		this.scoreElt.html(this.score + ' points');
	},

	clickKing:function(deckNum, deckType)
	{
		if (this.selectedCard === null || (deckType !== DECK_BOTTOM && this.multiSelect === true))
			return;

		if (deckType === DECK_BOTTOM)
			selectedDeck = this.bottomDecks[deckNum];
		else
			selectedDeck = this.aceDecks[deckNum];

		// TODO: boundaries check !!
		// TODO: do not swap if target == ace and multiple selection !
		// Console.log('clicked on a king... deck=' + deckNum + ', card=' + this.selectedCard);
		if (selectedDeck.acceptCard(this.selectedCard))
		{
			// Console.log('card accepted: swapping !');
			SoundManager.playSound(SND_FLICK_CARD);

			this.toggleSelectedCard(this.selectedCard);
			// ** this.toggleMovingCard(this.selectedCard);

			this.swapDeck(this.selectedCard, selectedDeck);
			this.selectedCard = null;
		}
	},

	toggleSelectedCard: function(card)
	{
		if (card !== null)
		{
			card.getDeck().toggleSelectionFromCard(card);
		}
	},

	clickCard: function(card)
	{
		if (this.blockedSelection === true) // || this.touchMode === true)
			return;

		var selectedCard = this.selectedCard;

		if (card != null && selectedCard !== card)
		{
			// First unselected previously selected card
			if (this.touchMode === false && selectedCard !== null)	//  && this.touchMode === false
			{
				// 2eme carte selectionnee: on peut l'empiler ?
				// addition possible
				if (card.getDeck().acceptCard(selectedCard))
				{
					SoundManager.playSound(SND_FLICK_CARD);

					this.toggleSelectedCard(selectedCard);

					this.swapDeck(selectedCard, card.getDeck());
					card = null; // no more selection...
				}
				else
				{
					card = selectedCard;
				}
			}
			else
			{
				if (!card.isVisible())
				{
					this.score += 5;
					this.updateScore();
					// reverse it...
					card.setVisible(true);
					// we wouldn't want to select it...
					card = null;

					// Console.log('returning card');
					// Console.log('autoPlay 3');
					this.autoPlay();
				}
				else if (this.touchMode === false)
				{
					// Console.log('selected card !' + card);
					SoundManager.playSound(SND_CLICK_CARD);

					this.toggleSelectedCard(card);

					if (card.getDeck().getTop() === card)
						this.multiSelect = false;
					else
						this.multiSelect = true;
				}
			}
			if (this.touchMode === true && card !== selectedCard && card !== null)
				card.toggleStatus();
		}
		else if (this.touchMode === false)	// DESELECTION
		{
			if (selectedCard)
			{
				SoundManager.playSound(SND_CLICK_CARD);
				selectedCard.setStatus(ST_UNSELECTED);
			}

			card.getDeck().toggleSelectionFromCard(card);

			card = null;
		}

		if (this.touchMode === false)
			this.selectedCard = card;
	},

	// TODO: Ace decks => do not change anything
	// TODO: Pak Deck swap support => pack deck different...
	swapDeck: function(card, destinationDeck, dontAddToHistory)
	{
		var self = this;

		this.blockedSelection = true;

		// first remove the card from the deck
		var sourceDeck = card.getDeck(),
		yoffset = 0,
		pos = {},
		cardsToMove = null;

		// save history
		if (!dontAddToHistory)
			this.pushHistory('move', card, sourceDeck);
		// /save history

		if (destinationDeck.getTop() !== null)
		{
			pos = destinationDeck.getTop().getPosition();
			/*
			console.log('dest' + destinationDeck.getTop(), destinationDeck.getTop().getPosition());
			if (destinationDeck === this.wastePack)
				pos.x += this.visibleCardSpace + 12;
			*/
			yoffset = this.visibleCardSpace;
		}
		else if (dontAddToHistory)
		{
			pos = destinationDeck.topCard.getPosition();
			yoffset = 0;
		}
		else
		{
			// console.log('oops, pad de top !');
			pos = this.cardPos;
			yoffset = 0;
		}

		if (sourceDeck.isTop(card) != true)
		{
			cardsToMove = sourceDeck.popVisibleUpTo(card, false);
		}
		else
		{
			cardsToMove = [sourceDeck.pop()];
		}

		this.maxDepth++;

		// Ace deck
		if (destinationDeck.getDeckType() !== DECK_BOTTOM)
		{
			yoffset = 0;
		}
		else if (dontAddToHistory && destinationDeck.getTop())
		{
			yoffset = this.hiddenCardSpace;
		}

		this.updateScore(sourceDeck.getDeckType(), destinationDeck.getDeckType());

		destinationDeck.push(cardsToMove);
		var visibleCardSpace = this.visibleCardSpace,
			size = cardsToMove.length,
			carToMove = null,
			x = (destinationDeck !== this.wastePack) ? pos.x : (pos.x + this.visibleCardSpace + 12);

		for (var i = 0; i < size; i++)
		{
			cardToMove = cardsToMove[i];
			cardToMove.setPosition(x, pos.y + yoffset);
			cardToMove.depth(this.maxDepth++);
			cardToMove.saveOldPosition(pos.x, pos.y + yoffset);
			yoffset += visibleCardSpace;
		}

		if (sourceDeck.getTop() && sourceDeck.getTop().isVisible() === false && this.gameOptions.autoFlip)
		{
			var lastCard = sourceDeck.reverseFirstInvisible();
			this.pushHistory('toggle', lastCard, null);
			this.score += 5;
			this.updateScore();
		}

		sourceDeck.setPossibleSelections();
		destinationDeck.setPossibleSelections();

		// Console.log('setting king states !');

		// Console.log('card.getDeck()=', card.getDeck().getDeckType());
		if (card.getDeck().getDeckType() > 6)
		{
			setTimeout(jQuery.proxy(this.autoPlay, this), 500);
		}
		else if (card.getDeck().getDeckType() < 6)
		{
			setTimeout(function() { Particles.launchParticles(pos); }, 300);
		}

		setTimeout(function() {
			self.blockedSelection = false;
		}, 350);
	},

	previousPackCard:function(fromPackSize, fromWasteSize)
	{
		console.log('previous card !', fromPackSize, fromWasteSize);
		var i = 0,
		that = this,
		totalXSpace = this.wastePosX + this.xSpace + 10,
		depth = 0,
		selectedCard = this.selectedCard;

		console.log('previousPack Card');

		if (this.blockedPack === true)
			return;

		console.log('TRUE');

		this.blockedPack = true;

		var card = this.wastePack.popMultiple(fromPackSize);

		// 2. Unselect current selected card if it's from the stack
		if (selectedCard !== null && (selectedCard.getDeck() === this.wastePack))
		{
			this.toggleSelectedCard(selectedCard);
			this.selectedCard = selectedCard = null;
		}

		// 3. show the next card from the stack and make it visible/selectable
		if (card !== null)
		{
			// save history
			//** this.pushHistory('pack', card);
			// /save history

			var size = card.length,
				visibleCardSpace = this.visibleCardSpace + 12,
				wastePosX = this.wastePosX,
				wastePosY = this.wastePosY;

			for (i = 0; i < size; i++)
			{
				var nextCard = card[i];
				this.stockPack.push(nextCard);
				nextCard.setVisible(false);
				nextCard.enableSelection(false);
				nextCard.depth(1);
				nextCard.setPosition(totalXSpace + (i * visibleCardSpace), wastePosY, wastePosX, wastePosY);
			}

			// BLOCKED selection until
			this.blockedSelection = true;

			setTimeout(function() { that.wastePack.setCardsVisibility(true, fromWasteSize); that.blockedSelection = false; that.autoPlay(true); }, 400);
		}
		else	// no more cards: we fill in the stock deck with any cards found in waste deck
		{
			// save history: special case, reverse pack...
			// ** this.pushHistory('pack', null);
			// /save history

			this.wastePack.getCardsFromDeck(this.stockPack);
			this.stackElt.addClass('empty');

			// don't forget to return back all cards
			this.wastePack.setCardsVisibility(true, fromWasteSize);
		}

		// 4. update pack image if needed (like empty one !)
		if (this.stockPack.length)
		{
			this.stackElt.removeClass('empty');
		}

		this.setWasteShadow();

		this.blockedPack = false;

		return false;
	},

	nextPackCard: function(event)
	{
		if (event.button && (event.button !== 0) && (event.button !== 1))
			return;

		var i = 0,
		that = this,
		totalXSpace = this.wastePosX + this.xSpace + 10,
		depth = 0,
		selectedCard = this.selectedCard;

		console.log('nextPack Card');

		if (this.blockedPack === true)
			return;

		console.log('TRUE');

		this.blockedPack = true;

		var card = this.stockPack.popMultiple(1);

		// 2. Unselect current selected card if it's from the stack
		if (selectedCard !== null && (selectedCard.getDeck() === this.wastePack))
		{
			this.toggleSelectedCard(selectedCard);
			this.selectedCard = selectedCard = null;
		}

		// 3. show the next card from the stack and make it visible/selectable
		if (card !== null)
		{
			// save history
			this.pushHistory('pack', card, this.wastePack.getVisibleSize());
			// /save history

			depth = this.wastePack.getTop() ? (this.wastePack.getTop().depth()+1) : 2;
			var size = card.length,
				visibleCardSpace = this.visibleCardSpace + 12,
				wastePosX = this.wastePosX,
				wastePosY = this.wastePosY;

			// make all cards of the waste invisible ?
			// this.wastePack.setAllCardsVisibility(false);

			for (i = 0; i < size; i++)
			{
				var nextCard = card[i];
				this.wastePack.push(nextCard);
				nextCard.setVisible(true);
				nextCard.depth(depth + i);
				nextCard.setPosition(wastePosX, wastePosY, totalXSpace + (i * visibleCardSpace), wastePosY);
			}
			// only enable the selection of the last card, if multiple deal
			nextCard.enableSelection(true);

			// BLOCKED selection until
			this.blockedSelection = true;

			setTimeout(function() { that.blockedSelection = false; that.autoPlay(true); }, 400);
		}
		else	// no more cards: we fill in the stock deck with any cards found in waste deck
		{
			// save history: special case, reverse pack...
			console.log(this.wastePack);
			this.pushHistory('pack', null, this.wastePack.getVisibleSize());
			// /save history

			this.stockPack.getCardsFromDeck(this.wastePack);
			this.stackElt.removeClass('empty');

			// don't forget to return back all cards
			this.stockPack.setAllCardsVisibility(false);
		}

		// 4. update pack image if needed (like empty one !)
		if (this.stockPack.length === 0)
		{
			this.stackElt.addClass('empty');
		}

		this.setWasteShadow();

		this.blockedPack = false;

		return false;
	},

	setWasteShadow: function()
	{
		var size = this.stockPack.length;

		if (size >= 18)
			this.stackElt.removeClass('half').removeClass('less').addClass('full');
		else if (size >= 6)
			this.stackElt.removeClass('full').removeClass('less').addClass('half');
		else
		{
			this.stackElt.removeClass('half').removeClass('full').addClass('less');
		}
	},

	pushHistory: function(type, card, destinationDeck)
	{
		console.log('push with deck: ', type, destinationDeck, card);
		this.history.push({ type: type, card: (card !== undefined) ? card : null, destinationDeck: (destinationDeck !== undefined) ? destinationDeck : null });
	},

	popHistory: function()
	{
		if (!this.history.length)
			return;

		var lastMove = this.history.pop();

		// console.log('undoing history move: ' + lastMove.type);

		if (lastMove.type == 'move')
		{
			console.log('undoing history move: ' + lastMove.type);
			this.swapDeck(lastMove.card, lastMove.destinationDeck, true);
		}
		else if (lastMove.type == 'toggle')
		{
			console.log('undoing toggle: ' + lastMove.type);
			if (lastMove.card)
				lastMove.card.setVisible(false);

			if (this.gameOptions.autoFlip)
			{
				this.popHistory();
			}
		}
		else if (lastMove.type == 'pack')
		{
			console.log('undoing pack' + lastMove.card);
			if (lastMove.card)
			{
				console.log('last move');
				/*
				// 2. Unselect current selected card if it's from the stack
				if (selectedCard !== null && (selectedCard.getDeck() === this.wastePack))
				{
					this.toggleSelectedCard(selectedCard);
					this.selectedCard = selectedCard = null;
				}
				this.swapDeck(lastMove.card, this.stockPack, true);
				*/
				this.previousPackCard(lastMove.card.length, lastMove.destinationDeck);
			}
			else
				this.previousPackCard(0, lastMove.destinationDeck);
			/*
			else
			{
				this.wastePack.getCardsFromDeck(this.stockPack);
				this.stackElt.addClass('empty');

				// don't forget to return back all cards
				this.stockPack.setAllCardsVisibility(true);
			}
			*/
		}
		/***
		else
		{
			console.log('unsupported history move: ' + lastMove.type);
		}
		***/

		return false;
	},

	flushHistory: function()
	{
		this.history.splice(0, this.history.length);
	},

	autoPlay: function(wasteOnly)
	{
		if (!this.gameOptions.autoPlay)
			return;

		var   found = false,
		      tempCard = this.wastePack.getTop(),
		      size = this.bottomDecks.length,
		      bottomDecks = this.bottomDecks,
		      i = 0;

		if (wasteOnly === undefined)
		{
			while (i < size)
			{
				var card = bottomDecks[i].getTop();
				if (card && card.isVisible())
				{
					if (this.addToAce(card))
					{
						found = true;
					}
				}
				i++;
			}
		}

		if (tempCard && tempCard.isVisible())
		{
			if (this.addToAce(tempCard))
			{
				found = true;
			}
		}

		if (found)
		{
			setTimeout(jQuery.proxy(this.autoPlay, this), 500);
		}
	},

	saveState:function()
	{
		var i = 0;

		// build stateObject
		var stateObject = {
			pack: this.stockPack.getCardStates(),
			wasteDeck: this.wastePack.getCardStates(),
			heartDeck: this.aceDecks[0].getCardStates(),
			diamondDeck: this.aceDecks[1].getCardStates(),
			spadeDeck: this.aceDecks[3].getCardStates(),
			clubDeck: this.aceDecks[2].getCardStates(),
			bottomDecks: [],
			score: this.score,
			time: this.time
		},
		bottomDecks = this.bottomDecks;

		for (i = 0; i < MAX_CARDS; i++)
		{
			stateObject.bottomDecks.push(bottomDecks[i].getCardStates());
			// DEBUG
			if (i < 4 && CM.DEBUG)
			{
				// ** Mojo.Log.info(Object.toJSON(stateObject.bottomDecks[i]));
			}
			// /DEBUG
		}

		StateManager.saveState(stateObject);
	},

	loadState: function()
	{
		// Console.log('Attempting to load game state...');
		StateManager.loadState(jQuery.proxy(this.resumeGame, this));
	},

	// TODO: fix me ! Every deck should know about its position !!!
	addToAce:function(card)
	{
		var testDeck = null,
		num = 0;

		switch(card.getCardType())
		{
			case 'spade':
				testDeck = this.aceDecks[2];
				num = 3;
			break;
			case 'diamond':
				testDeck = this.aceDecks[1];
				num = 1;
			break;
			case 'heart':
				testDeck = this.aceDecks[0];
				num = 0;
			break;
			case 'club':
				testDeck = this.aceDecks[3];
				num = 2;
			break;
		}

		if (testDeck.acceptCard(card))
		{
			// Console.log(card.getCardType() + ' accepted');
			this.cardPos = { x: this.acePosX + (num * this.aceSpace), y: this.wastePosY };
			this.swapDeck(card, testDeck);
			this.toggleSelectedCard(this.selectedCard);
			this.selectedCard = null;

			SoundManager.playSound(SND_FLICK_CARD);
			return true;
		}
		else
		{
			return false;
		}
	},

	togglePauseGame:function(bool)
	{
		// console.log('toggle game...', this.gameStats.status);
		if (this.gameStats.status === G_PAUSED)
		{
			TimerManager.start(this.time);
			this.gameStats.status = G_RUNNING;
		}
		else
		{
			if (bool)
			{
				TimerManager.stop();
				// only put game in pause mode if it was running
				if (this.gameStats.status == G_RUNNING)
					this.gameStats.status = G_PAUSED;
			}
		}
	},

	endGameWon: function()
	{
		// TODO: use G_WON status in place of STOPPED ?
		this.gameStats.status = G_STOPPED;

		SoundManager.playSound(SND_YOU_WIN);

		TimerManager.stop();

		this.gameStats.gamesWon++;
		this.gameStats.scoreTotal += this.score;

		/* new: ask for score if in top 3 */

		this.scoreObj = {
			nick: '',
			score: this.score,
			time: this.time,
			location: 'Paris',
			date: new Date().toUTCString()
		};

		// do we have a highscore ? => maybe we'll need to load the score :)
		this.scorePosition = -1;
		for (i = 0; i < this.scores.length; i++)
		{
			// this.score !!
			if (this.score > this.scores[i].score)
			{
				this.scorePosition = i;
				break;
			}
		}

		$('#youWon span.score').text(this.score).focus();
		if (this.scorePosition == -1)
		{
			$('#youWon input').hide();
			$('#youWon p').hide();
		}
		else
		{
			$('#youWon input').show();
			$('#youWon p').show();
		}
		/* / new*/

		// alert('You made it ! (yeah, end game could and definitely *will* be improved ;))');
		$('.dialog').center();

		$('#shadow').fadeIn('normal', function() {
			$('#youWon').toggleClass('flipped');
			$('#youWon input').focus();
		});
	}
};
