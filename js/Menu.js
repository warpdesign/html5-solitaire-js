/**** Menu Class ***/

// Menu constructor, DOMSelector is a PROTOTYPE style selector, menuParams an Object containing menu entries and options:
/* {
	entries: 
	[
		{
			title: 'foo',
			callback: function() {},
			[disabled: true]
		},
		...
	]
	onSelect: function() {},
	onInit: function() {},
	onDestroy: function() {},
	position: {left, top}
	} */
function Menu(DOMSelector, menuParams, selectedMenu)
{
	this.entries = menuParams.entries;
	this.length = this.entries.length;
	this.selectedEntry = selectedMenu !== 'undefined' ? selectedMenu : 0;
	this.DOMElement = $$(DOMSelector)[0];
	this.onInit = menuParams.onInit !== 'undefined' ? menuParams.onInit : null;
	this.onSelect = menuParams.onSelect !== 'undefined' ? menuParams.onSelect : null;
	this.onDestroy = menuParams.onDestroy !== 'undefined' ? menuParams.onDestroy : null;
	this.offset = menuParams.offset;
	this.shown = false;
	this.optionsList = null;
	this.init();
}

Menu.prototype.init = function()
{
	var that = this;
	var i = 0;

	if (CM.DEBUG)
		Mojo.Log.info('[Menu Class] Initializing Menu...');
	
	// Generate HTML list
	this.optionsList = new Element('ul');
	while (i < this.length)
	{
		var li = new Element('li', {'class': 'menu'});
		li.update('<a>' + this.entries[i].title + '</a>').hide().insert({bottom: '<div class="shadow">' + this.entries[i].title + '</div>'});
		this.optionsList.insert({bottom: li});
		i++;
	}
	this.DOMElement.insert({bottom: this.optionsList});
	
	// Don't add listeners here as this is done on menu toggle...
	// this.addListeners();
};

Menu.prototype.addListeners = function()
{
	var that = this;
	this.optionsList.select('li a').each(function(element, i)
	{
		// TODO: fix me ! The call back gets executed before the menu slideUp/Down effect has been finished, introduce some timeout !!
		Mojo.Event.listen(element, Mojo.Event.tap, function(callback){ return callback; }(that.entries[i].callback));
	});
};

Menu.prototype.removeListeners = function()
{
	// Console.log('WARN: cannot unbind menu elements, FIX ME !');
	this.optionsList.select('li a').each(function(element){
		// element.unbind('click');
	});
};

Menu.prototype.showEntry = function(i, bool)
{
	if (i < this.length)
		this.entries[i].disabled = !bool;
};

Menu.prototype.toggle = function(effect)
{
	if (this.shown === true) {
		this.optionsList.hide(); // slideUp('slow');
		this.optionsList.select('li').each(function(element){
			element.hide();
		});
		this.removeListeners();
	}
	else
	{
		var that = this;		
		this.optionsList.show(); // slideDown('slow');
		this.optionsList.select('li').each(function(element, i)
		{
			if (typeof that.entries[i].disabled === 'undefined' || that.entries[i].disabled === false)			
			{
				element.show();//fadeIn('normal');
			}
		});
		this.addListeners();		
	}

	this.shown = !this.shown;
};