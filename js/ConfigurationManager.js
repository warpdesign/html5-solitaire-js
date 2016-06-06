// Small ConfigurationManager for phone specific stuff
var CM = 
{
	phoneType: '', 			// Can be: 'pre' or 'pixi'
	screenHeight: 0,		// Could be 480 or 400
	emulator: false,		// true if emulator detected (we cannot test screenOrientationChanges properly on emulator, so
							// we do not automatically rotate the display
	env: 'dev',				// running environment ('dev'/'prod')
	trueModelName: '',		// as returned my Mojo.Environment
	isiOS: false,
	isPlaybook: false,
	twitterURL: 'http://twitter.com/home?status=',
	
	init: function()
	{
		if (typeof Mojo != 'undefined')
		{
			this.phoneType = (Mojo.Environment.DeviceInfo.screenHeight < 480) ? 'pixi' : 'pre';	// is it safe ?
			this.screenHeight = screen.height;
			this.emulator = (Mojo.Environment.DeviceInfo.modelName === '(Device)') ? true : false;
			this.trueModelName = Mojo.Environment.DeviceInfo.modelName;		
		}
		else
		{
			this.phoneType = 'hd';
			this.screenHeight = 768;
			this.emulator = true;
			this.trueModelName = '(Device)';
			this.isiOS = false; 
			// (navigator.userAgent.match(/iPhone|iPod|iPad|PlayBook/) !== null); // ((navigator.userAgent.indexOf("iPhone") != -1) || (navigator.userAgent.indexOf("iPod") != -1) || (navigator.userAgent.indexOf("iPad") != -1));
			// this.isPlaybook = (navigator.userAgent.match(/PlayBook/) !== null);
		}

		Console.init();
	},
	
	debug: function()
	{
		Console.log('[' + this.phoneType + '] ' + 'h=' + this.screenHeight + 'px, emu=' + this.emulator + ' (' + this.trueModelName + ')');
	}
}

CM.init();