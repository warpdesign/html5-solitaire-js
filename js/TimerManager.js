// Small TimerManager for timing stuff
// TODO: ability to call several callbacks (well.. it's the manager's goal, right ? ;))
// TODO: stops clears the timeinterval, pause mode should stop but not clear the interval: fix it.
var TimerManager = 
{
	time: {h:0, m:0, s:0},
	timeInterval:null,
	callback:null,
	
	init: function(callbackFunc)
	{
		this.callback = callbackFunc;
	},

	start: function(time)
	{
		this.time = { h: time.h, m: time.m, s: time.s };
		this.timeInterval = setInterval(jQuery.proxy(TimerManager.setTime, TimerManager), 1000);
	},

	stop: function()
	{
		if (this.timeInterval === null)
			; // Console.log('TimerManager::stop() WARN: calling stop and manager already stopped !');
		else
		{
			// Console.log('TimerManager: stopping timer...');
			clearInterval(this.timeInterval);
			this.time = {h:0, m:0, s:0};
		}
	},

	setTime: function()
	{
		this.time.s++;
		if (this.time.s === 60)
		{
			this.time.m++;
			this.time.s = 0;
		}
		if (this.time.m === 60)
		{
			this.time.h++;
			this.time.m = 0;
		}

		if (this.callback)
			this.callback(this.time);
	}
}