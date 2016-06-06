/***
   - 14.04:
   --
   FIXED: missing this from Card.pop() method, was causing random elements to have deck set to null (that was a tough one !)

***/

function Card(cardtype, number, attributes)
{
	// card properties
	this.color = 0;
	this.status = ST_UNSELECTED;
	this.number = number;	// number inside the deck
	this.colorNumber = 0;	// number inside color (ie: from 1 to 13)
	this.cardtype = cardtype;
	this.selectable = false;
	this.visible = false;
	this.deck = null;		// deck of the card (can be null => main pack)

	// CSS/Graphics Stuff
	this.position = {x:0, y:0}
	this.jQueryElt = jQuery('<div touch-action="none" />');
	this.zIndex = 0;

	this.dblclickTimeout = null;

	/* d&d */
	this.dragging = false;
	this.dragEnabled = false;
	this.dropEnabled = false;

	this.oldCssPosition = null;

	this.width = 0;
	this.height = 0;

	this.deckNum = 0;

	// methods: drag and drop
	/* /d&d */

	if (typeof attributes !== undefined)
	{
		for (var option in attributes)
		{
			/* Console.log('option=', option); */
			this[option] = attributes[option];
		}
		/* Console.log('setting option...', this.visible); */
	}

	// let's do some little init
	this.init();
}

Card.prototype.init = function()
{
	this.colorNumber = this.number % 13;
	if (this.colorNumber === 0 && (this.cardtype.indexOf('ace') < 0))
		this.colorNumber = 13; // King

	switch (this.cardtype)
	{
		case 'club':
		case 'spade':
			this.color = BLACK;
		break;

		case 'diamond':
		case 'heart':
			this.color = RED;
		break;

		case 'king':
		case 'ace':
		default:
			this.color = ANY;
		break;
	}
	
	this.jQueryElt.addClass('card').removeClass('visible');
	// attr('id', this.colorNumber + '_' + this.cardtype);

	// set card image
	if (this.visible === true)
	{
		this.jQueryElt.css({cursor:'pointer'});

		// TODO: we should be clear about the meaning of this.visible which doesn't mean anything !!!
		// ie, it's used to define the state of a card: returned or not...
		if (this.cardtype.indexOf('ace') > -1)
			this.jQueryElt.removeClass('card').addClass('pack ' + this.cardtype).addClass('visible');
		else if (this.cardtype == 'king')
			this.jQueryElt.removeClass('card').addClass('pack king').addClass('visible');
		else
		{
			this.jQueryElt.css('background-position', -(game.spriteXStart + ((this.colorNumber - 1) * game.xSpace)) + 'px ' + '-' + game.backsY[this.cardtype] + 'px');
		}		
	}
	else
	{
		/*
		Console.log('[INIT] pos of ' + this.colorNumber + ' de ' + this.cardtype);
		Console.log('=> ' + DISPLAY_POSITIONS[CM.phoneType].CARDBACK.x + 'px -' + DISPLAY_POSITIONS[CM.phoneType].BACKSY.misc + 'px');
		*/
		this.jQueryElt.css('background-position', '-' + game.cardBackX + 'px -' + game.backYMisc + 'px');
	}

	// add draggable event (disabled)

	this.jQueryElt.appendTo('#playground');

	/* d&d */
	this.width = this.jQueryElt.width();
	this.height = this.jQueryElt.height();

	this.position = {
		x1: this.jQueryElt.position().left,
		y1: this.jQueryElt.position().top,
		x2: this.jQueryElt.position().left + this.jQueryElt.width(),
		y2: this.jQueryElt.position().top + this.jQueryElt.height()
	};
	/* /d&d */
}

Card.prototype.setDeckNum = function(num)
{
	this.deckNum = num;
}

Card.prototype.getDeckNum = function()
{
	return this.deckNum;
}

Card.prototype.setDeck = function(deck)
{
	this.deck = deck;
}

Card.prototype.getDeck = function()
{
	return this.deck;
}

Card.prototype.setCard = function(cardtype)
{
	this.color = cardtype.color;
	this.number = cardtype.number;
	this.type = cardtype.type;
}

Card.prototype.getCard = function()
{
	return {
		color:this.color,
		number:this.number,
		cardtype: this.cardtype
	};
}

Card.prototype.getColorNumber = function()
{
	return this.colorNumber;
}

Card.prototype.getColor = function()
{
	return this.color;
}

Card.prototype.setColor = function(color)
{
	this.color = color;
}

Card.prototype.setNumber = function(num)
{
	this.number = num;
}

Card.prototype.getNumber = function()
{
	return this.number;
}

Card.prototype.setCardType = function(cardtype)
{
	this.cardtype = cardtype;
}

Card.prototype.setVisible = function(bool, doNotRotate)
{
	var that = this;
	this.visible = bool;

	if (this.visible === true)
	{
		/* Console.log('set visible !'); */
		this.jQueryElt.removeClass('rotate').css({cursor:'pointer'});
		if (doNotRotate === undefined)
			setTimeout(function() { that.jQueryElt.addClass('rotate'); }, 5);
		
		setTimeout(function() { that.jQueryElt.css('background-position', -(game.spriteXStart + ((that.colorNumber - 1) * game.xSpace)) + 'px -' + game.backsY[that.cardtype] + 'px');}, 250);
		this.dropEnabled = this.dragEnabled = true;
		// ** this.jQueryElt.data({draggable: true});
	}
	else
	{
		this.jQueryElt.css({'background-position': '-' + game.cardBackX + 'px -' + game.backYMisc + 'px', cursor: 'normal'});
		this.dropEnabled = this.dragEnabled = false;
		// prevent dragging
		// this.jQueryElt.data({draggable: false});
	}
}

Card.prototype.isVisible = function()
{
	return this.visible;
}

Card.prototype.getCardType = function()
{
	return this.cardtype;
}

Card.prototype.setStatus = function(status)
{
	this.status = status;
}

Card.prototype.toggleStatus = function()
{
	this.setStatus(this.status === ST_SELECTED ? ST_UNSELECTED : ST_SELECTED);
}

Card.prototype.onClick = function(event)
{
	game.clickCard(this);
}

Card.prototype.onDoubleClick = function(event)
{
	var deckType = this.deck.getDeckType();

	// only allow flicking from the **top** card of pack and bottom decks
	if ((deckType === DECK_BOTTOM) || (deckType === DECK_WASTE) && (this.deck.getTop() === this))
	{
		game.addToAce(this);
	}
}

Card.prototype.onOver = function(draggedElt)
{
	// Console.log('' + draggedElt + 'over ' + this);
	if (this.deck !== null)
	{
		if (this.deck.acceptCard(draggedElt))
			this.jQueryElt.css('opacity', 0.5);
	}
	else
	{
		var deck = game.bottomDecks[this.deckNum];
		if (deck.acceptCard(draggedElt))
			this.jQueryElt.css('opacity', 0.5);
	}
}

Card.prototype.onOut = function(draggedElt)
{
	//Console.log('out ' + this);
	this.jQueryElt.css('opacity', 1);
}

Card.prototype.onStoppedDragging = function()
{
	//Console.log('stopped dropping');
	// ** this.jQueryElt.removeClass('dragged');
	this.deck.toggleDragging(this, false);
}

Card.prototype.onCancelDragging = function()
{
	//Console.log('stopped dragging ' + this);
	var deck = this.deck;

	// ** this.jQueryElt.removeClass('dragged');
	deck.toggleDragging(this, false);
	// ** this.jQueryElt.css(this.oldCssPosition);
	deck.setOldPositionFromCard(this);
	setTimeout(function() { game.blockedSelection = false; }, 300);
}

Card.prototype.onStartDragging = function()
{
	//Console.log('started dragging ' + this);
	// test !!
	game.blockedSelection = true;
	/*
	game.maxDepth++;
	this.depth(game.maxDepth);
	this.jQueryElt.addClass('dragged');
	*/
	this.deck.toggleDragging(this, true);
}

Card.prototype.onDropping = function(droppedElt)
{
	//Console.log('dropped ', droppedElt, ' over ', this);
	var deck = (this.deck !== null) ? this.deck : game.bottomDecks[this.deckNum];

	// TODO: this has nothing to do here, should
	// call a method of game instead !!!
	if (deck.acceptCard(droppedElt))
	{
		//Console.log('accepted !');
		// ** HACK ** FIX ME !!!
		game.cardPos = { x: this.position.x, y: this.position.y };
		game.swapDeck(droppedElt, deck);
		// ** game.toggleSelectedCard(this.selectedCard);
		game.selectedCard = null;
	}
	else	// this will put the card back to its place
	{
		//Console.log('refused :' + droppedElt + ' over ' + this);
		droppedElt.onCancelDragging();
	}
}

Card.prototype.onDragging = function(x, y)
{
	this.deck.setPositionFromCard(this, x, y);
}

Card.prototype.toggleDragging = function(bool)
{
	if (bool)
	{
		this.jQueryElt.addClass('dragged');
		game.maxDepth++;
		this.depth(game.maxDepth);
	}
	else
		this.jQueryElt.removeClass('dragged');
}

Card.prototype.toggleSelected = function()
{
	this.jQueryElt.toggleClass('selected');
}

Card.prototype.toggleMoving = function()
{
	this.jQueryElt.removeClass('moving');
	this.jQueryElt.addClass('moving');
}

Card.prototype.enableSelection = function(bool)
{
	if (this.selectable === bool || typeof bool !== 'boolean')
		return;

	this.selectable = bool;

	// TODO: we should remove listeners when the card isn't supposed to be moved as well (ie: in the middle of the stack...)
	// TODO: maybe we should have different this.selectable and this.movable ?
	if (this.selectable === true)
	{
		this.jQueryElt.css('cursor', 'pointer');
		this.jQueryElt.bind(EventsManager.EVENT_DOWN, jQuery.proxy(function(event) 
		{
			// DO NOT allow drag when selection is blocked and only allow *left* lmb
			if (game.blockedSelection === true || (event.button && (event.button !== 0)))
				return;
			
			this.oldCssPosition = {
				left: this.jQueryElt.css('left'),
				top: this.jQueryElt.css('top')
			};

			EventsManager.setDraggingElement(this, (CM.isiOS ? event.originalEvent.touches[0] : event));

		}, this));
	}
	else
	{
		// Console.log('unbind !');
		this.jQueryElt.css('cursor', 'auto');
		this.jQueryElt.unbind(EventsManager.EVENT_DOWN);
	}
}

Card.prototype.enableDragAndDrop = function(dragBool, dropBool)
{
	if (dragBool !== null)
		this.dragEnabled = dragBool;
	
	if (dropBool !== null)
		this.dropEnabled = dropBool;
}

Card.prototype.toString = function()
{
	return this.colorNumber + ' de ' + this.cardtype;
}

Card.prototype.setPosition = function(x, y, x2, y2)
{
	var position = this.position,
		that = this;

	/* Console.log('setPosition(' + x + ', ' + y + ', ' + x2 + ', ' + y2); */
	if (typeof x2 !== 'undefined')
	{
		if (x === null)
		{
			this.jQueryElt.addClass('visible');
		}
		else
		{
			// first get back to the position
			position.x = x2;
			position.y = y2;

			this.jQueryElt.css({
				top:	y + 'px',
				left:	x + 'px'
			});

			this.jQueryElt.addClass('visible');
			
			setTimeout(function() {that.jQueryElt.css({
				top:	y2 + 'px',
				left:	x2 + 'px'
			});}, 25);
		}
	}
	else
	{
		if (x != null)
		{
			position.x = x;
			position.y = y;

			// Console.log('setting ' + x  + ', ' + y + ' position...');

			// do we need to animate the card ?
			this.jQueryElt.addClass('visible').css({
				top:	position.y + 'px',
				left:	position.x + 'px'
			});
		}
		else
			this.jQueryElt.addClass('visible');
	}
	
	/* d&d */

	position.x1 = position.x;
	position.y1 = position.y;
	position.x2 = position.x1 + this.width;
	position.y2 = position.y1 + this.height;

	// keep previous position to be able to restore it in case drag cancelled
	if (this.oldCssPosition == null)
	{
		this.oldCssPosition = {
			left: position.x + 'px',
			top: position.y + 'px'
		};
	}

	/*
	this.oldCssPosition = {
		left: this.position.x + 'px',
		top: this.position.y + 'px'
	};
	*/

	// Console.log('pos=', this.position.x1, this.position.x2, this.position.y1, this.position.y2);

	/* /d&d */
}

Card.prototype.saveOldPosition = function(x, y)
{
	this.oldCssPosition = {
		left: x + 'px',
		top: y + 'px'
	};
}

Card.prototype.setOldPosition = function()
{
	var position = this.position;

	position.x1 = position.x = parseInt(this.oldCssPosition.left);
	position.y1 = position.y = parseInt(this.oldCssPosition.top);
	position.x2 = position.x1 + this.width;
	position.y2 = position.y1 + this.height;

	this.jQueryElt.css(
		this.oldCssPosition
	);
}

Card.prototype.getPosition = function()
{
	return this.position;
}

Card.prototype.hide = function()
{
	// FIXED: we use direct DOM manipulation since jQuery's hide() method seems to resets transitions
	// this fixes the fact than transitions didn't work after the first turn of waste pile: hard one !! :)
	// ** this.jQueryElt.get(0).style.display = 'none';
	this.jQueryElt.removeClass('visible');
	//hide();
}

Card.prototype.show = function()
{
	this.jQueryElt.show();
}

Card.prototype.depth = function(depth)
{
	if (typeof depth === 'undefined')	//  || this.zIndex > depth
		return this.zIndex;
	else
	{
		this.zIndex = depth;
		this.jQueryElt.css('z-index', this.zIndex)
	}
}

Card.prototype.getStateInfo = function()
{
	return {
		number: this.number,
		cardtype: this.cardtype,
		visible: this.visible
	};
};

/*
King.prototype = new Card;
King.prototype.constructor = King;
function King()
{
	// Call the card's constructor
	Card.call(this, 'king', -1);
}

Ace.prototype = new Card;
Ace.prototype.constructor = Ace;
function Ace()
{
	// Call the card's constructor
	Card.call(this, 'ace', -1);
}
*/