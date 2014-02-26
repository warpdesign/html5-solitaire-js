// Small function that just shakes the display
jQuery.fn.shake = function(intShakes /*Amount of shakes*/, intDistance /*Shake distance*/, intDuration /*Time duration*/)
{
	this.each(function()
	{
			/*jQuery(this).css({position:'relative'});*/
			var origLeft = parseInt(jQuery(this).css('left'), 10)
			for (var x=1; x<=intShakes; x++)
			{
				jQuery(this).animate({left:origLeft-(intDistance*-1)}, (((intDuration/intShakes)/4)))
				.animate({left:origLeft+intDistance}, ((intDuration/intShakes)/2))
				.animate({left:origLeft}, (((intDuration/intShakes)/4)));
			}
	});
	return this;
};

// returns a random number between 0 and max
function Random(max)
{
	return Math.floor((Math.random() * max) + 1);
}