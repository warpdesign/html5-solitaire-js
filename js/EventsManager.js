var EventsManager = {
	draggingElt: null,
	overElt: null,
	dragging: false,

	draggables: [],
	droppables: [],

	gap: {
		x:0,
		y:0
	},

	// EVENT_DOWN: CM.isiOS ? 'touchstart' : 'mousedown',
	// EVENT_UP: CM.isiOS ? 'touchend' : 'mouseup',
	// EVENT_MOVE: CM.isiOS ? 'touchmove' : 'mousemove',
	// EVENT_OVER: CM.isiOS ? 'touchstart' : 'mouseover',
	// EVENT_OUT: CM.isiOS ? 'touchstart' : 'mouseout',
	EVENT_DOWN: 'pointerdown',
	EVENT_UP: 'pointerup',
	EVENT_MOVE: 'pointermove',
	EVENT_OVER: 'pointerover',
	EVENT_OUT: 'pointerout',	
	EVENT_CHANGE: 'change',

	checkIntersectsInterval: null,
	dblclickTimeout: null,

	// TODO: recieve selector or jQuery element here, and create the interactive element...
	addDroppable: function(element)
	{
		this.droppables.push(element);
	},

	// TODO: recieve selector or jQuery element here, and create the interactive element...
	addDraggable: function(element)
	{
		this.draggables.push(element);
	},

	emptyElements: function()
	{
		if (this.draggables.length)
			this.draggables.splice(0, this.draggables.length);

		if (this.droppables.length)
			this.droppables.splice(0, this.droppables.length);
	},

	setDraggingElement: function(element, event)
	{
		this.draggingElt = element;

		// seems like event.touches doesn't get the layerX/layerY properties so we need to do some more calculations to get the gap...
		// Edit: Opera doesn't seem to include layerX either, so let's make this the default method...
		var offset = element.jQueryElt.offset();
		this.gap = 
		{
			x: event.pageX - offset.left,
			y: event.pageY - offset.top
		};
		this.parentOffset = element.jQueryElt.offsetParent().offset();
	},

	toggleDragging: function()
	{
		this.dragging = !this.dragging;
	},

	checkIntersect: function()
	{
		// Console.log('checkIntersect()');
		//Console.log(this.draggingElt);

		var droppable = null,
		dragging = this.draggingElt.jQueryElt,
		x1 = dragging.position().left,
		x2 = x1 + this.draggingElt.width,
		y1 = dragging.position().top,
		y2 = y1 + this.draggingElt.height,
		x11 = x21 = y11 = y21 = 0,
		oldOver = this.overElt,
		found = false;
		this.overElt = null;

		for (var i = 0, taille = this.droppables.length; i < taille; i++)
		{
			droppable = this.droppables[i];

			if (this.draggingElt !== droppable && droppable.dropEnabled)
			{
				x11 = droppable.position.x1,
				x21 = droppable.position.x2,
				y11 = droppable.position.y1,
				y21 = droppable.position.y2;

				if ((x2 > (x11 + 20 ) && x1 < x11) || (x1 > x11 && x1 < (x21 - 20)))
				{
					if ((y1 > y11 && y1 < y21) || (y1 < y11 && y2 > y11))
					{
						this.overElt = droppable;
						//Console.log('colision over: ' + droppable);
						found = true;
					}
				}
			}
		}

		return found;
	},

	initIntersect: function()
	{
		this.checkIntersectsInterval = setInterval(jQuery.proxy(this.checkIntersect, this), 100);
	},

	clearIntersect: function()
	{
		//Console.log('clearIntersect()');
		clearInterval(this.checkIntersectsInterval);
		this.checkIntersectsInterval = null;
	},

	preventTouchDefaults: function()
	{
		// if (CM.isiOS)
		// {
		// 	jQuery('body').bind(this.EVENT_MOVE + ' ' + this.EVENT_UP + ' ' + this.EVENT_DOWN, function(event){
		// 		event.preventDefault();
		// 	});
		// }
	},

	init: function()
	{
		var that = this;

		// prevent touchScroll on touch (iOS) devices
		this.preventTouchDefaults();

		var mouseUpCallback = jQuery.proxy(function(event) {
			// IE && FF assigns different values to left click (need to check the behaviour in webkit & touch browsers)
			if (event.button && (event.button !== 0) && (event.button !== 1))
				return;

			// don't do anything if dragging hasn't started
			if (!this.draggingElt)
				return;

			var elt = this.draggingElt;

			if (this.dragging)
			{
				// Console.log('was dragging: call !');
				// TODO: use drag'n'drop manager
				this.dragging = false;

				// TODO: only do that if refused... better: onRefuseDrop...
				if (this.checkIntersect())
				{
					// Console.log('yeahhh ! dropped something !');
					elt.onStoppedDragging();
					this.overElt.onOut(elt);
					this.overElt.onDropping(elt);
					// don't forget to call out as well
				}
				else
				{
					// Console.log('Ooops :( dropped NOT possible :( !');
					if (elt.onCancelDragging)
						elt.onCancelDragging();
				}
			}
			else
			{
				// TODO: use timeout in order to detect double click
				// Console.log("wasn't dragging: call simple click or double click ?");
				if (this.dblclickTimeout === null)
				{
					// Console.log('first click');
					// first click...
					if (elt.onClick)
						elt.onClick();
					this.dblclickTimeout = setTimeout( function() { that.dblclickTimeout = null; }, DBLCLICK_DELAY);
				}
				else
				{
					// second mouse up
					// Console.log('second click !');
					if (elt.onDoubleClick)
						elt.onDoubleClick();
				}
			}
			this.draggingElt = null;

		}, that);

		// only listen for mouse up once
		$('body').bind(this.EVENT_UP, mouseUpCallback);

		var mouseMoveCallback = jQuery.proxy(function(event) {
			if (!this.draggingElt || !this.draggingElt.dragEnabled)
				return;

			var draggingElt = this.draggingElt;

			if (!this.dragging)
			{
				this.dragging = true;
				if (draggingElt.onStartDragging)
					draggingElt.onStartDragging();
			}
			else
			{
				if (draggingElt.onDragging)
				{
					if (CM.isiOS)
					{
						var e = event.originalEvent.touches[0];
					}
					else
						var e = event.originalEvent;

					draggingElt.onDragging(e.pageX - this.gap.x - this.parentOffset.left, e.pageY - this.gap.y - this.parentOffset.top);
				}
			}
		}, this);

		$('body').bind(this.EVENT_MOVE, mouseMoveCallback);
	}
};