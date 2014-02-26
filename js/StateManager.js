// TODO: this is a duplicate of G_* found inside game.js: FIX ME !!!
var ST_STOPPED = 3;
var ST_PAUSED = 4;
var MAX_SCORES = 4;

// GameState Manager: handles options, gameSave, and gameState: should be renamed !!
var StateManager = 
{
	options: {},						// DataBase options (TODO: set buckname)
	db: null,							// DataBase identifier
	status: {							// GameStatus: { status: ST_PAUSED | ST_STOPPED, date: Date }
		status: ST_STOPPED,				// Game in progress ?
		date: new Date().toUTCString(),	// Date
		gamesTotal:0,
		gamesWon:0,
		scoreTotal:0
	},	
	gameOptions: { 
		sound: false,					// sound enabled ?
		background: 2,					// background picture nb
		cardset: 1,						// cardset sprites picture nb
		autoflip: false
	},
	scores: [
			{nick: 'Leo', score: '360', time: {h:0, m:1, s:10}, location: 'London', date: new Date().toUTCString()},
			{nick: 'Nard', score: '340', time: {h:0, m:2, s:0}, location: 'New-York', date: new Date().toUTCString()},
			{nick: 'Warp', score: '320', time: {h:0, m:1, s:45}, location: 'Zurick', date: new Date().toUTCString()},
			{nick: 'Leo', score: '300', time: {h:0, m:2, s:15}, location: 'Paris', date: new Date().toUTCString()}
		],
	 
	version: 0,														// Game revision
	gameState: null,
	scoresCallback: null,

	init: function(version)
	{
		// Console.log('initializing StateManager with version ' + version);
		alert('init');
		this.options = {
			name: 'WarpKlondike',
			version: version,
			displayName: 'WarpKlondike',
			replace: false
			// estimatedSize   Number  Optional Estimated size for this database.
			// filters         Array   Optional List of strings that objects in the depot can use as filters.
			// identifiers   
		};
		this.version = version;

		this.db = new Mojo.Depot(this.options, this.onDepotOpened.bind(this), this.onFailure.bind(this));
	},

	getStatus: function()
	{
		return this.status;
	},

	setStatus: function(status)
	{
		this.saveStatus(status);
	},

	/* position: 0..3 (MAX_SCORES-1) */
	setScore: function(score, position)
	{
		if ((position > (MAX_SCORES-1)) || (position < 0))
		{
			// Console.log('setScore not possible (pos=' + position + ', max=' + (MAX_SCORES-1) + ')');
			return false;
		}
		else
		{
			// Console.log('setScore possible !! (pos=' + position + ', max=' + (MAX_SCORES-1) + ')');
			this.scores[position] = score;
			this.saveScores();
		}
	},

	getGameOptions: function()
	{
		return this.gameOptions;
	},
	
	setGameOptions: function(gameOptions)
	{
		this.gameOptions = gameOptions;
		// Console.log('setGameOptions: snd = ' + gameOptions.sound + ', back = ' + gameOptions.background + ', cardset= ' + gameOptions.cardset + ', autoflip=' + gameOptions.autoflip);
	},
	
	setGameOption: function(optionName, value)
	{
		this.gameOptions[optionName] = value;	
	},
	
	getGameOption: function(optionName)
	{
		return this.gameOptions[optionName];
	},
	
	/***** Database Actions start here: LOAD/SAVE/REMOVE *****/
	loadStatus: function()
	{
		// Console.log('Attempting to LOAD Status Information !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('status', this.onLoadStatus.bind(this), this.onFailure.bind(this));
		}
		else
			;
			// Console.log('Cannot load Status: error accessing the DataBase');
	},

	loadGameOptions: function()
	{
		// Console.log('Attempting to LOAD Options !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('gameOptions', this.onLoadGameOptions.bind(this), this.onFailure.bind(this));
		}
		else
			;
			// Console.log('Cannot loading gameoptions: error accessing the DataBase');		
	},

	loadScores: function(scoresCallback)
	{
		// Console.log('Attempting to Load Scores !');
		if (typeof scoresCallback !== 'undefined')
		{
			// Console.log('scores callback detected');
			this.scoresCallback = scoresCallback;
		}
		else
		{
			// Console.log('scores callback NOT detected !');
			this.scoresCallback = null;
		}
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('scores', this.onLoadScores.bind(this), this.onFailure.bind(this));
		}
		else
			;
			// Console.log('cannot load scores: error accessing the DataBase');
	},

	saveScores: function()
	{
		// Console.log('Attempting to Save Scores !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.add('scores', this.scores, function()
			{
				// Console.log('saved scores success !!');
			},
			function(error)
			{
				// Console.log('oops: error while saving scores: ' + error);
			});
		}
		else
			;
			// Console.log('cannot save scores: error accessing the DataBase');
	},

	saveStatus: function(status)
	{
		// Console.log('Attempting to SAVE Status Information !');
		var that = this;

		// HACK TO PREVENT FIRST-RUN status problem: status shouldn't be set unless it has been saved
		this.status = status;
		// /HACK

		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.add('status', status, function()
			{
				// Console.log('saved status success !!');
				that.status = status;
			},
			function(error)
			{
				// Console.log('oops: error while saving status: ' + error);
			});
		}
		else
			;
			// Console.log('Cannot save game: error accessing the DataBase');
	},

	saveGameOptions: function()
	{
		// Console.log('Attempting to SAVE GameOptions Information !');
		var that = this;		
		
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.add('gameOptions', this.gameOptions,
			function()
			{
				// Console.log('saved gameoptions success !!');
			},
			function(error)
			{
				// Console.log('oops: error while saving gameoptions: ' + error);
			});
		}
		else
			;
			// Console.log('Cannot save gameoptions: error accessing the DataBase');		
	},

	loadState: function(callback)
	{
		// Console.log('Attempt at loading state...');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('saveGame', callback, this.onFailure.bind(this));
		}
		else
			;
			// Console.log('Cannot save game: error accessing the DataBase');		
	},

	/* stateObject structure:
	   {
			score: (int) score,
			time: {h, m, s} time,
			bottomDecks: [cardStates],
			...
		}
	*/
	saveState: function(stateObject)
	{
		// Console.log('Attempt at saving state...');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.add('saveGame', stateObject,
			function()
			{
				// Console.log('saved success !!');
			},
			function(error)
			{
				// Console.log('oops: error while saving game: ' + error);
			});
		}
		else
			;
			// Console.log('Cannot save game: error accessing the DataBase');
	},

	removeState: function()
	{
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			// use default bucket for now: FIX ME !
			this.db.remove(null, 'saveGame',
			function()
			{
				// Console.log('state successfully deleted !!');
			},
			function(error)
			{
				// Console.log('oops: error while removing state game: ' + error);
			});
		}
		else
			;
			// Console.log('Cannot deleteState: error accessing the Database...');
	},

	/**** Database Action callbacks start here ****/

	onLoadSaveGame: function(saveGame)
	{
		if (saveGame !== null)
		{
			// Console.log('Game Loaded !');
			return saveGame;
		}
		else
		{
			// Console.log("couldn't get SaveGame !");
			return null;
		}
	},

	onLoadStatus: function(status)
	{
		if (status !== null)
		{
			// Console.log('Got status: st = ' + status.status + ', Date = ' + status.date);
			this.status = status;
		}
		else
		{
			// Console.log("couldn't get status ! Assume it's the first run, so we generate the object");
			this.saveStatus(this.status);
			this.removeState();
		}
	},

	onLoadGameOptions: function(gameOptions)
	{	
		if (gameOptions !== null)
		{
			if (CM.DEBUG)
				Mojo.Log.info(Object.toJSON(gameOptions));
			
			//// Console.log('Got gameOptions: snd = ' + gameOptions.sound + ', back = ' + gameOptions.background + ', cardset= ' + gameOptions.cardset + ', autoflip=' + gameOptions.autoflip);
			this.gameOptions = gameOptions;
		}
		else
		{
			// Console.log("couldn't get gameOptions ! Assume it's the first run, so we generate the object with default gameOptions");
			this.saveGameOptions(this.gameOptions);
		}		
	},

	onLoadScores: function(scores)
	{
		if (scores !== null)
		{
			if (CM.DEBUG)
				Mojo.Log.info(Object.toJSON(scores));
			
			this.scores = scores;
		}
		else
		{
			// Console.log("Seems like we have no local scores, let's generate default ones !");
			this.saveScores(this.scores);
			scores = this.scores;
		}
		// in anycase we call the callback with new (saved ones) or default ones
		if (this.scoresCallback !== null)
		{
			this.scoresCallback(scores);
		}
	},

	/*** Depot connection callbacks ***/
	onDepotOpened: function()
	{
		// Depot successfully opened: let's retrieve game status
		// Console.log('depot successfully created/opened !');
		this.loadStatus();
		// test: 
		this.loadGameOptions();
	},

	onFailure: function(error)
	{
		// Console.log('Error opening/creating depot: ' + error);
	}
};