// TODO: replace direct sqlite calls with lawnchair API since even the W3C
// recomends not using this API since it's a direct implementation of sqlite
// and "isn't acceptable as a standard"
// then whenever a new implementation will be available only a new adaptor
// will be needed !
//
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
		background: 0,					// background picture nb
		cardset: 0,						// cardset picture nb
		theme: 'fantasy',
		autoFlip: true,
		autoPlay: false
	},
	scores: [
			{nick: 'Leo', score: '460', time: {h:0, m:1, s:10}, location: 'London', date: new Date().toUTCString()},
			{nick: 'Nard', score: '340', time: {h:0, m:2, s:0}, location: 'New-York', date: new Date().toUTCString()},
			{nick: 'Warp', score: '320', time: {h:0, m:1, s:45}, location: 'Zurick', date: new Date().toUTCString()},
			{nick: 'Leo', score: '300', time: {h:0, m:2, s:15}, location: 'Paris', date: new Date().toUTCString()}
		],
	 
	version: 0,				// Game revision
	gameState: null,
	initCallback: null,
	scoresCallback: null,

	init: function(version, callback)
	{
		// Console.log('initializing StateManager with version ' + version);
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

		if (typeof callback !== 'undefined')
			this.initCallback = callback;

		// openDatabase will:
		// 1. create the db if no version exists
		// 2. fail with an exception with a db with a different version exists
		// 3. load it if it exists and has the version specified
		try
		{
			// this.db = openDatabase(this.options.name, version, "WarpKlondike Database", 1024 * 10);
			this.db = new Lawnchair(this.options.name);
		}
		catch(err)
		{
			this.db = null;
		}

		if (this.db !== null)
		{
			// Console.log('opened db !');
			this.onDepotOpened();
		}
		else
		{
			// Console.log('oops ! error while opening db !');
			if (this.initCallback)
				this.initCallback(this.gameOptions, this.scores);
		}
		// new Mojo.Depot(this.options, this.onDepotOpened.bind(this), this.onFailure.bind(this));
	},

	clearDB: function()
	{
		if (this.db !== null)
			this.db.nuke();
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
		// Console.log('setGameOptions: snd = ' + gameOptions.sound + ', back = ' + gameOptions.background + ', cardset= ' + gameOptions.cardset + ', autoFlip=' + gameOptions.autoFlip + ', autoPlay=' + gameOptions.autoPlay + ', theme=' + gameOptions.theme);
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
		// Console.log(this.db);
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('status', jQuery.proxy(this.onLoadStatus, this));
		}
		/*
		else
			Console.log('Cannot load Status: error accessing the DataBase');
		*/
	},

	loadGameOptions: function()
	{
		//Console.log('Attempting to LOAD Options !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('gameOptions', jQuery.proxy(this.onLoadGameOptions, this));
		}
		/*
		else
			Console.log('Cannot loading gameoptions: error accessing the DataBase');
		*/
	},

	loadScores: function()
	{
		// Console.log('Attempting to Load Scores !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('scores', jQuery.proxy(this.onLoadScores, this));
		}
		/*
		else
			Console.log('cannot load scores: error accessing the DataBase');
		*/
	},

	saveScores: function()
	{
		//Console.log('Attempting to Save Scores !');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.save({key: 'scores', value: this.scores}, function(r) 
			{
				/*
				if (r)
					Console.log('saved scores success !!');
				else
					Console.log('oops: error while saving scores: ' + r);
				*/
			});
		}
		/*
		else
			Console.log('cannot save scores: error accessing the DataBase');
		*/
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
			this.db.save({key: 'status', value: status} , function(r) 
			{
				if (r !== null)
				{
					// Console.log('saved status success !!');
					that.status = status;
				}
				/*
				else
				{
					Console.log('oops: error while saving status: ' + r);
				}
				*/
			});
		}
		/*
		else
			Console.log('Cannot save game: error accessing the DataBase');
		*/
	},

	saveGameOptions: function()
	{
		//Console.log('Attempting to SAVE GameOptions Information !');
		//Console.log('gameOptions: snd = ' + this.gameOptions.sound + ', back = ' + this.gameOptions.background + ', cardset= ' + this.gameOptions.cardset + ', autoFlip=' + this.gameOptions.autoFlip + ', autoPlay=' + this.gameOptions.autoPlay + ', theme=' + this.gameOptions.theme);
		var that = this;		
		
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.save({key: 'gameOptions', value: this.gameOptions}, function(r) 
			{
				/*
				if (r !== null)
					Console.log('saved gameoptions success !!');
				else
					Console.log('oops: error while saving gameoptions: ' + r);
				*/
			});
		}
		/*
		else
			Console.log('Cannot save gameoptions: error accessing the DataBase');
		*/
	},

	loadState: function(callback)
	{
		//Console.log('Attempt at loading state...');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.get('saveGame', callback);
		}
		/*
		else
			Console.log('Cannot save game: error accessing the DataBase');		
		*/
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
		//Console.log('Attempt at saving state...');
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.save({key: 'saveGame', value: stateObject}, function(r)
			{
				/*
				if (r)
					Console.log('saved success !!');
				else
					Console.log('oops: error while saving game: ' + r);
				*/
			});
		}
		/*
		else
			Console.log('Cannot save game: error accessing the DataBase');
		*/
	},

	removeState: function()
	{
		if (this.db !== null && typeof this.db !== 'undefined')
		{
			this.db.remove('saveGame', function(r) {
				/*
				if (r)
					Console.log('state successfully deleted !!');
				else
					Console.log('oops: error while removing state game: ' + r);
				*/
			});
		}
		/*
		else
			Console.log('Cannot deleteState: error accessing the Database...');
		*/
	},

	/**** Database Action callbacks start here ****/

	onLoadSaveGame: function(saveGame)
	{
		if (saveGame !== null)
		{
			//Console.log('Game Loaded !');
			return saveGame.value;
		}
		else
		{
			//Console.log("couldn't get SaveGame !");
			return null;
		}
	},

	onLoadStatus: function(status)
	{
		if (status !== null)
		{
			//Console.log('Got status: st = ' + status.value.status + ', Date = ' + status.value.date + 'gamesTotal = ' + status.value.gamesTotal + ', gamesWon=' + status.value.gamesWon + ', scoreTotal=' + status.value.scoreTotal);
			this.status = status.value;
		}
		else
		{
			//Console.log("couldn't get status ! Assume it's the first run, so we generate the object");
			this.saveStatus(this.status);
			this.removeState();
		}
	},

	onLoadGameOptions: function(gameOptions)
	{	
		if (gameOptions !== null)
		{	
			//Console.log('Got gameOptions: snd = ' + gameOptions.value.sound + ', back = ' + gameOptions.value.background + ', cardset= ' + gameOptions.value.cardset + ', autoFlip=' + gameOptions.value.autoFlip + ', autoPlay=' + gameOptions.value.autoPlay + ', theme=' + gameOptions.value.theme);
			this.gameOptions = gameOptions.value;
		}
		else
		{
			//Console.log("couldn't get gameOptions ! Assume it's the first run, so we generate the object with default gameOptions");
			this.saveGameOptions(this.gameOptions);
		}
		
		if (this.initCallback !== null)
		{
			//Console.log('yo :)');
			this.initCallback(this.gameOptions, this.status, this.scores);
		}
	},

	onLoadScores: function(scores)
	{
		if (scores !== null)
		{		
			this.scores = scores.value;
		}
		else
		{
			//Console.log("Seems like we have no local scores, let's generate default ones !");
			this.saveScores(this.scores);
			scores = this.scores;
		}
		this.loadGameOptions();
	},

	/*** Depot connection callbacks ***/
	onDepotOpened: function()
	{
		// Depot successfully opened: let's retrieve game status
		//Console.log('depot successfully created/opened !');
		this.loadStatus();
		// test: 
		this.loadScores();
	},

	onFailure: function(error)
	{
		//Console.log('Error opening/creating depot: ' + error);
	}
};