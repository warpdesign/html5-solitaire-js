/***
   - 14.04:
   --
   ADDED: empty check for Deck.pop(), Deck.getTop() methods

***/

function isArray(array)
{
	return !!(array && array.constructor == Array); 
}

/**** Deck Class ***/

function Deck(deckType, deckNum) {
	this.cards = [];
	this.length = 0;
	this.deckType = deckType;
	this.deckNum = typeof deckNum !== 'undefined' ? deckNum : 0;
	this.topCard = null;
	this.init();
};

Deck.prototype.init = function()
{
	var deckType = this.deckType;

	// Add the Ace card if ace deck...
	if (deckType > 1 && deckType < 6)
	{
		var aceNum = deckType - 2,
		x = 0;

		this.topCard = new Card('ace' + aceNum, 0, {visible: true});
		this.topCard.setDeck(this);
		EventsManager.addDroppable(this.topCard);
		
		// TODO: we shouldn't have to poke the element for the CSS pos, problem is Ace is set to <num> in here,
		// and set to <name> in configuration array, FIX IT !
		x = game.acePosX + (aceNum * game.aceSpace);
		this.topCard.setPosition(x, game.wastePosY);
		
	}
	// Add the king card if king deck...
	else if (deckType === DECK_BOTTOM)
	{
		this.topCard = new Card('king', 0, {visible: true});
		this.topCard.setPosition(game.xStart + (this.deckNum * (game.xSpace + game.packCardSpace)), game.mainDeckY);
		this.topCard.setDeck(this);
	}
}

/* Should only be called for king/aces decks for now... */
Deck.prototype.bindTopListeners = function(type)
{
	EventsManager.addDroppable(this.topCard);
	// NEW ACE: Check that it works as it should !
	this.topCard.enableDragAndDrop(false, true);

	this.topCard.onDoubleClick = null;

	if (type === DECK_BOTTOM)
	{
		if (game.touchMode === false)
		{
			this.topCard.onClick = function()
			{
				game.cardPos = { x: parseInt(this.jQueryElt.css('left')), y: parseInt(this.jQueryElt.css('top')) };
				game.clickKing(this.deckNum, DECK_BOTTOM);
				return false;
			}
		}
		else
			this.topCard.onClick = null;

		this.topCard.enableSelection(true);
	}
	else	// aces decks
	{
		var i = this.deckNum;
		jQuery(this.topCard.jQueryElt).data('deck', this.deckNum);
		if (game.touchMode === false)
		{
			jQuery(this.topCard.jQueryElt).bind(EventsManager.EVENT_UP, function()
			{
				game.cardPos = { x: parseInt(jQuery(this).css('left')), y: parseInt(jQuery(this).css('top')) };
				game.clickKing(jQuery(this).data('deck'), i + 2);
				return false;
			});
		}
	}
}

Deck.prototype.setDeckNum = function(num)
{
	this.deckNum = num;
}

Deck.prototype.getDeckNum = function()
{
	return this.deckNum;
}

Deck.prototype.getDeckType = function()
{
	return this.deckType;
}

Deck.prototype.debug = function()
{
	var debugStr = '';
	var i = 0,
		size = this.length,
		card = null,
		cards = this.cards;

	while (i <= (size - 1))
	{
		card = cards[i];
		debugStr += card.getNumber() + ' (' + card.isVisible() + ') ';
		i++;
	}
	//Console.log('Deck = ' + debugStr);
}

// Add one or more cards to the deck *TOP*
Deck.prototype.push = function(cards)
{
	var _cards = this.cards;
	
	if (isArray(cards))
	{
		var size = cards.length,
			card = null;

		for (var i = 0; i < size; i++)
		{
			// Console.log('pushing...' + cards[i]);
			card = cards[i];
			card.setDeck(this);
			_cards.push(card);
		}
		this.length += cards.length;
	}
	else
	{
		cards.setDeck(this);
		_cards.push(cards);
		this.length++;
	}
}

Deck.prototype.getTop = function()
{
	var size = this.length;

	if (size)
	{
		return this.cards[size - 1];
	}
	else
		return null;
}

Deck.prototype.toggleSelectionFromCard = function(card)
{
	var i = 0,
	found = false,
	max = 0,
	cards = this.cards;

	max = cards.length;
	
	while (i < max)
	{
		if (cards[i] === card)
		{
			found = true;
			break;
		}
		i++;
	}

	if (found === true)
	{
		while (i < max)
		{
			cards[i].toggleSelected();
			i++;
		}
	}
}

Deck.prototype.toggleDragging = function(card, bool)
{
	var i = 0;
	found = false,
	max = this.cards.length,
	cards = this.cards;

	
	while (i < max)
	{
		if (cards[i] === card)
		{
			found = true;
			break;
		}
		i++;
	}

	for (var j = i; j < max; j++)
	{
		cards[j].toggleDragging(bool);
	}
}

Deck.prototype.setOldPositionFromCard = function(card)
{
	var i = 0,
	found = false,
	max = this.cards.length,
	cards = this.cards;

	while (i < max)
	{
		if (cards[i] === card)
		{
			found = true;
			break;
		}
		i++;
	}

	for (var j = (max - 1); j >= i; j--)
	{
		cards[j].setOldPosition();
	}
}

Deck.prototype.setPositionFromCard = function(card, x, y)
{
	var i = 0,
	k = 0,
	found = false,
	max = this.cards.length,
	cards = this.cards;

	while (i < max)
	{
		if (cards[i] === card)
		{
			found = true;
			break;
		}
		i++;
	}

	for (var j = i; j < max; j++)
	{
		cards[j].setPosition(x, y + (game.visibleCardSpace * k++));
	}
}

Deck.prototype.toggleMovingFromCard = function(card)
{
	var i = 0,
	found = false,
	max = this.cards.length,
	cards = this.cards;

	while (i < max)
	{
		if (cards[i] === card)
		{
			found = true;
			break;
		}
		i++;
	}

	if (found === true)
	{
		while (i < max)
		{
			cards[i].toggleMoving();
			i++;
		}
	}
}

// Pops multiple cards from the top
// if length < n, will pop length cards only
Deck.prototype.popMultiple = function(n)
{
	var i = 0;
	var cards = [],
		size = this.length;

	if (size)
	{
		if (n > size)
			n = size;

		for (i = 0; i < n; i++)
		{
			cards.push(this.pop());
		}

		return cards;
	}
	else
		return null;
}

// Pops the card from the top
Deck.prototype.pop = function()
{
	//Console.log('poping front-most card');
	// TODO: unit-test this one !!
	if (this.length)
	{
		this.length--;
		this.cards[this.length].setDeck(null);
		return this.cards.pop();
	}
	else
		return null;
}

// TODO: return visible card ?
Deck.prototype.reverseFirstInvisible = function()
{
	var cards = this.cards;

	for (var i = (cards.length - 1); i >= 0; i++)
	{
		var card = cards[i];
		if (card.isVisible() == false)
		{
			card.setVisible(true);
			return card;
			break;
		}
	}
	return null;
}

// parses all cards and enable selection where possible
// TODO: optimize !
Deck.prototype.setPossibleSelections = function()
{
	var topIndex = this.length - 1,
		i = topIndex,
		card = null,
		cards = this.cards;

	while(i >= 0 && cards[i].isVisible())
	{
		console.log('setting visible', cards[i], cards);
		card = cards[i];
		/* ugly hack */
		if (this === game.wastePack && i != topIndex)
			card.enableSelection(false);
		else
			card.enableSelection(true);
		
		/* /ugly hack */
		card.enableDragAndDrop(true, false);
		i--;
	}
	
	if (this.length && cards[topIndex].isVisible())
		cards[topIndex].enableDragAndDrop(true, true);

	// make the top selectable if it's not visible... this happens when autoflip is OFF
	if (this.length > 0 && this.getTop().isVisible() === false)
	{
		cards[topIndex].enableSelection(true);
	}

	return this;
}

// pop *all* visible cards, autoReversing the new TOP if needed
// TODO: check if there's no card and/or no visible cards
Deck.prototype.popVisible = function(autoReverse)
{
	var cards = this.cards,
		i = cards.length - 1;
	
	var poppedCards = new Array();
	while ((i >= 0) && (cards[i].isVisible() == true))
	{
		poppedCards.push(this.pop());
		i--;
	}
	if (cards.length && autoReverse == true) // do we have elements ?
		cards[this.length-1].setVisible(true);

	return poppedCards.reverse();
}

// get visible cards
Deck.prototype.getVisibleSize = function(autoReverse)
{
	var cards = this.cards,
		i = cards.length - 1,
		size = 0;
	
	var poppedCards = new Array();
	while ((i >= 0) && (cards[i].isVisible() == true))
	{
		size++;
		i--;
	}

	return size;
}

// pop *all* visible cards *up to* the specified card (seems like Solitaire plays like this after all...)
Deck.prototype.popVisibleUpTo = function(card, autoReverse)
{
	var cards = this.cards,
		i = cards.length - 1;
	var poppedCards = [];
	var found = false;
	
	while ((i >= 0) && (cards[i].isVisible() == true) && (found === false))
	{
		if (cards[i] === card)
			found = true;
		poppedCards.push(this.pop());
		i--;
	}
	if (cards.length && autoReverse == true && (cards[this.length-1].isVisible() === false)) // do we have elements ?
		cards[this.length-1].setVisible(true);

	return poppedCards.reverse();
}

// Main deck reverse stuff: TEST !!!
// TODO: show/hide animation
Deck.prototype.popToBack = function()
{
	// we don't need to do anything if there's only one card left
	if (this.length <= 1)
		return;

	// pop the first one... 
	var cards = this.cards,
		top = cards.pop(),
		size = cards.length;

	top.setVisible(false);
	top.hide();

	// set the new top to visible
	if (size)
	{
		cards[size - 1].setVisible(true);
		cards[size - 1].enableSelection(true);
		// add it to the bottom
		cards.splice(0, 0, top);
	}

}

Deck.prototype.isTop = function(card)
{
	var cards = this.cards,
		size = cards.length;

	return ((size > 0) && (cards[size - 1] === card));
}

Deck.prototype.acceptCard = function(card)
{
	var deckType = this.deckType,
		selfTop = this.getTop();

	// Console.log('AcceptCard, deckType = ' + deckType);

	/* NEW ACE (2) TODO: fix me !! */
	if (deckType == DECK_BOTTOM)
	{

		// only different color needed
		if (this.length === 0)
		{
			if (card.getColorNumber() == 13)
				return true;
		}
		else if (card.getColor() === selfTop.getColor())
			return false;
		else
			return ((selfTop.getColorNumber() - card.getColorNumber()) === 1);
	}
	else if (card === card.getDeck().getTop())	// only allow to move one card at once over ace decks
	{
		if (deckType == DECK_ACE_HEART)
		{	
			colorNum = (selfTop !== null) ? selfTop.getColorNumber() : 0;
			
			if (card.getColorNumber() == 0)
				return (card.getCardType() === 'ace0');
			else
				return (card.getCardType() === 'heart' && ((card.getColorNumber() - colorNum) == 1));
		}
		else if (deckType == DECK_ACE_DIAMOND)
		{
			colorNum = (selfTop !== null) ? selfTop.getColorNumber() : 0;
			
			if (card.getColorNumber() == 0)
				return (card.getCardType() === 'ace1');
			else
				return (card.getCardType() === 'diamond' && ((card.getColorNumber() - colorNum) == 1));
		}
		else if (deckType == DECK_ACE_SPADE)
		{
			colorNum = (selfTop !== null) ? selfTop.getColorNumber() : 0;

			if (card.getColorNumber() == 0)
				return (card.getCardType() === 'ace2');
			else
				return (card.getCardType() === 'spade' && ((card.getColorNumber() - colorNum) == 1));
		}
		else if (deckType == DECK_ACE_CLUB)
		{
			colorNum = (selfTop !== null) ? selfTop.getColorNumber() : 0;

			if (card.getColorNumber() == 0)
				return (card.getCardType() === 'ace3');
			else
				return (card.getCardType() === 'club' && ((card.getColorNumber() - colorNum) == 1));
		}
	}
	else if (deckType == DECK_PACK)
	{
		//Console.log('warning: adding card to pack deck ?!');
		return false;
	}
}

Deck.prototype.getCardsFromDeck = function(deck)
{
	// reverse cards, but we should have a parameter for that (ok for now since it's only used once)
	// this.cards.reverse();
	card = deck.pop();

	while (card !== null)
	{
		card.hide();
		this.push(card);
		card = deck.pop();
	}
}

Deck.prototype.getCardAtPos = function(pos)
{
	if ((pos >= this.cards.length) || (pos < 0))
		return null;
	else
		return this.cards[pos];
}

Deck.prototype.showCards = function(x, y)
{
	var i = 0,
		cards = this.cards,
		max = this.length;

	while (i < max)
	{
		cards[i].depth(i + 2);
		cards[i].setPosition(x, y);
		i++;
	}
}

Deck.prototype.toString = function()
{
	return this.deckType;
}

Deck.prototype.setAllCardsVisibility = function(visible)
{
	var cards = this.cards;

	for (var i = 0, max = this.length; i < max; i++)
	{
		cards[i].setVisible(visible);
		if (visible)
			cards[i].jQueryElt.addClass('visible');
		else
			cards[i].jQueryElt.removeClass('visible');
	}
}

Deck.prototype.setCardsVisibility = function(visible, size)
{
	var cards = this.cards;

	for (var i = this.length - 1, max = this.length - size; i >= max; i--)
	{
		cards[i].setVisible(visible, false);
		if (visible)
			cards[i].jQueryElt.addClass('visible');
		else
			cards[i].jQueryElt.removeClass('visible');
	}
}

Deck.prototype.getCardStates = function()
{
	var cardStates = [],
		cards = this.cards,
		size = cards.length;

	for (var i = 0; i < size; i++)
	{
		cardStates.push(cards[i].getStateInfo());
	}

	return cardStates;
};

Deck.prototype.fillWith = function(cardStatesArray)
{
	var size = cardStatesArray.length,
		card = null;

	for (var i = 0; i < size; i++)
	{
		card = new Card(cardStatesArray[i].cardtype, cardStatesArray[i].number);
		card.setVisible(cardStatesArray[i].visible);
		EventsManager.addDroppable(card);
		EventsManager.addDraggable(card);
		this.push(card);
	}
	return this;
};