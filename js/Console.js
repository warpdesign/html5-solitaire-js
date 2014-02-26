var Console = function(){
	// only handles isiOS for now, should handle any portable/touch device in the future
	var isTouchDevice = false,
		$console = jQuery('<div/>').attr('id', 'debugConsole').hide(),
		reduced = true;


	return {
		init: function()
		{
			isTouchDevice = CM.isiOS;

			/* with FF, the console element isn't defined unless firebug is opened so in this case we default to builtin console */
			if (1)// (isTouchDevice === true) || (typeof window.console === 'undefined')
			{
				jQuery(document).ready(function()
				{
					$console.bind(EventsManager.EVENT_DOWN, function(){
						Console.reduce();
						return false;
					});
					jQuery('body').append($console);
				});
			}
		},
		
		reduce: function()
		{
			reduced = !reduced;
			var top = reduced ? '' : '0';
			var height = reduced ? '30px' : '100%';
			var bottom = reduced ? '0' : '';			
			
			$console.css({
				top: top,
				height: height,
				bottom: bottom
			});
			
		},

		// TODO: handle objects !
		log : function(content)
		{
			// defaults to dom console if console isn't defined: this will allow to debug on any device
			if (1) // (isTouchDevice === true) || (typeof window.console === 'undefined')
			{
				if (typeof content === 'object')
				{
					$console.prepend('<br />');
					for (var name in content)
					{
						if (content.hasOwnProperty(name))
						{
							$console.prepend('&nbsp;' + name + ': ' + content[name] + '<br />');
						}
					}
					$console.prepend('<strong>Object</strong><br />');
				}
				else
					$console.prepend(content + '<br /><br />');
			}
			else
			{
				console.log(content);
			}
		},
		
		clear : function()
		{
			$console.html('');
		}
	};		
}();