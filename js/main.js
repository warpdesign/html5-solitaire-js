$.fn.center = function(options)
{
	var width = window.innerWidth,
		height = window.innerHeight;

	return this.each(function()
	{
		$(this).css({left: ((width - $(this).outerWidth()) / 2) + 'px'});
		// , top: ((height - $(this).outerHeight()) / 2) + 'px'});
	});
};

var WarpKlondikeMain = (function(game) 
{	
	function bindListeners()
	{
		$('#playground').css('margin-top', parseInt((window.innerHeight - parseInt($('#playground').height())) / 2) + 'px');

		if (CM.isiOS)
			$('#sound').hide();

		$('div.check').bind(EventsManager.EVENT_UP, function()
		{
			var fieldName = $(this).attr('id');
			game.gameOptions[fieldName] = !game.gameOptions[fieldName];
			$(this).toggleClass('checked');
		});

		$('.ok').bind(EventsManager.EVENT_UP, function(){

			if ($(this).parent().parent().attr('id') === 'options')
			{
				StateManager.setGameOptions(game.gameOptions);
				StateManager.saveGameOptions();
			}
			$(this).parents('.dialog').removeClass('flipped');
			$('.icon').removeClass('over');

			game.togglePauseGame(false);

			$('#shadow').fadeOut();
		});

		$('.themeSelect').click(function(event){
			var themeName = $(this).find('img').attr('alt');

			$('ul#themeList li').removeClass('selected');
			$(this).parent().addClass('selected');
			$('#themeCSS').attr('href', 'css/themes/' + themeName + '/theme.css');
			game.gameOptions.theme = themeName;

			return false;
		});

		$('#showScores').bind(EventsManager.EVENT_UP, function(){

			$('.dialog').center();
			if ($('#scores').hasClass('flipped'))
				game.togglePauseGame(false);
			else
				game.togglePauseGame(true);			

			$('#options').removeClass('flipped');
			
			$('#shadow').fadeIn('normal', function() { 
				$('#scores').toggleClass('flipped');
			});

			return false;
		});

		$('#menuToggle').bind(EventsManager.EVENT_UP, function()
		{
			$('.dialog').center();

			$('#scores').removeClass('flipped');

			// options displayed, so we save settings and hide it
			if ($('#options').hasClass('flipped'))
			{
				StateManager.setGameOptions(game.gameOptions);
				StateManager.saveGameOptions();
				game.togglePauseGame(false);
			}
			else
				game.togglePauseGame(true);

			$(this).removeClass('over');

			$('#shadow').fadeIn('normal', function() { 
				$('#options').toggleClass('flipped');
			});

			return false;
		});

		if (!CM.isiOS)
		{
			$('.icon').bind(EventsManager.EVENT_OVER, function(){
				$(this).addClass('over');
			}).bind(EventsManager.EVENT_OUT, function() {
				$(this).removeClass('over');
			});
		}
	}

	function hideSplash() { $('#splash').animate({opacity: 0}, 500).delay(500).hide(); }

	return {
		status: 0,

		setStatus: function(status)
		{
			this.status = status;
		},

		init: function()
		{
			SoundManager.init();
			EventsManager.init();

			bindListeners();

			Particles.init(CM.isiOS ? 8 : 32);

			$('#splash .content').css('opacity', '1');
			setTimeout(function() {  }, 2901);
			setTimeout(hideSplash, 3000);

			// TODO: add proper methods for that 
			StateManager.init('1.0', function(gameOptions, status, scores)
			{
				//Console.log(scores);
				//Console.log(status);
				game.init(gameOptions, status, scores);

				if (game.gameStats.status == G_PAUSED)
				{
					setTimeout(function() {

						$.gritter.add({
							title: 'Information',
							text: 'A previous game state has been saved. Would you like to resume it ?<br /><br /><a class="restoreGame" href="#">Click here to restore it</a>',
							image: 'img/hd/icons/brainstorming.png',
							time: 7000,
							fade_in_speed: 'fast',
							fade_out_speed: 400
						}); 
						if (!navigator.userAgent.match('WebKit'))
						{
							$.gritter.add({
								title: 'Browser Information',
								text: 'Seems like you\'re not using a WebKit Browser.<br />This version works better on WebKit',
								image: 'img/hd/icons/brainstorming.png',
								time: 4000,
								fade_in_speed: 'fast',
								fade_out_speed: 400
							});
						}
					}, 4000);
				}

				game.shuffle();
				WarpKlondikeMain.setOptions();
				WarpKlondikeMain.setScores(scores);
				game.runGame();
			});
		},

		setTheme: function(themeName)
		{
			var $themeSheet = $('#themeCSS');
			
			if ($themeSheet.length)
			{
				$themeSheet.attr('href', 'css/themes/' + themeName + '/theme.css');
			}
			else
			{
				$('<link/>').attr({rel: 'stylesheet', type: 'text/css', 'href': 'css/themes/' + themeName + '/theme.css', id: 'themeCSS'}).appendTo('head');
			}
			$('ul#themeList li').removeClass('selected');
			$('#themeList').find('img[alt=' + themeName + ']').parent().parent().addClass('selected');
		},

		setOptions: function()
		{
			if (game.gameOptions.autoFlip)
			{
				$('#autoFlip').addClass('checked');
			}
			// attr('checked', 'checked');

			if (game.gameOptions.autoPlay)
			{
				$('#autoPlay').addClass('checked');
				//attr('checked', 'checked');
			}

			if (game.gameOptions.sound)
			{
				$('#sound').addClass('checked');
				// .attr('checked', 'checked');
			}

			if (!game.gameOptions.theme)
			{
				game.gameOptions.theme = 'fantasy';
			}

			WarpKlondikeMain.setTheme(game.gameOptions.theme);
		},

		setScores: function(scoresArray)
		{
			if (typeof scoresArray !== 'object')
				return;

			var $ul = $('#scores ul');
			$('#scores ul li').remove();
			
			for (var i = 0; i < scoresArray.length; i++)
			{
				$('<li/>').append('<span class="rank">' + (i+1) + '</span>' + '<span class="nick">' + scoresArray[i].nick + '</span>' + '<span class="score">' + scoresArray[i].score + '</span>').appendTo($ul);
			}
		}

	};
})(game);