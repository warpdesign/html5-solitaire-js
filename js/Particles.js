function randRange(min, max)
{
	return randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
}

function Fly(x, y)
{
	this.x = x;
	this.y = y;
	this.flocon = jQuery('<div/>').css({opacity: 0}).appendTo('#playground');
	this.nextParticle = null;	// chain list to avoid usay array
	this.visible = true;

	var randNumber = randRange(0, 30);
	
	if (randNumber < 10)
		this.flocon.addClass('particle1');
	else if (randNumber < 20)
		this.flocon.addClass('particle2');
	else
		this.flocon.addClass('particle3');

	this.maxX = -16 * 3;
}

Fly.prototype.move = function()
{
	if (!this.visible)
		return;

	this.a += (Math.random() * .1) - .05;
	this.a *= .90;
	this.angle += this.a;
	this.y += Math.abs(Math.sin(this.angle)*2);
	this.x += Math.cos(this.angle)*5;

	var x = this.x,
		y = this.y;

	if (x > 1000 || x < this.maxX || y > 800 || y < 0)
	{
		this.hide();
		return;
	}
  
	  if (this.off == true) // On diminue
	  {
		  if (this.alpha > 0)
			this.alpha -= .02;
		  else
		  {
			  this.hide();
			  return;
		  }
	  }
	  else
	  {
		  if (this.alpha < 1)
			this.alpha += .05;
	  }
	  
	this.flocon.css({left: x + 'px', top: y + 'px', opacity: this.alpha});
}

Fly.prototype.hide = function()
{
	this.visible = false;
	this.flocon.css('opacity', 0);
}

Fly.prototype.setPos = function(x, y)
{
	this.x = x;
	this.y = y;

	return this;
}

Fly.prototype.init = function()
{
	this.a = 0;
	this.alpha = 1;
	this.off = true;
	this.angle = -1.55;
	// ** this.clearInterval();
	this.visible = true;

	this.flocon.css({left: this.x + 'px', top: this.y + 'px', opacity: this.alpha});

	this.angle = -1.55;
}

var Particles = {
	ctx:		null,	// canvas context
	interval:	null,
	firstParticle: null,
	maxFly:	0,

	init: function(size)
	{
		this.maxFly = size;

		var currentParticle = this.firstParticle = new Fly(0, 0);

		for (var k = 0, max = size; k < max; k++)
		{
			currentParticle.nextParticle = new Fly(0, 0);
			currentParticle = currentParticle.nextParticle;

			currentParticle.nextParticle = new Fly(0, 0);
			currentParticle = currentParticle.nextParticle;

			currentParticle.nextParticle = new Fly(0, 0);
			currentParticle = currentParticle.nextParticle;

			currentParticle.nextParticle = new Fly(0, 0);
			currentParticle = currentParticle.nextParticle;
		}

	},
	
	updateParticles: function()
	{
		var alive = 0,
			currentFly = this.firstParticle;

		// animation test
		while (currentFly)
		{
			if (currentFly.visible)
			{
				currentFly.move();
				alive++;
			}
			currentFly = currentFly.nextParticle;
		}

		// all particles are dead, no need to call interval again
		if (alive == 0)
		{
			clearInterval(this.interval);
			this.interval = null;
		}
	},

	launchParticles: function(startPos)
	{
		var	x1 = startPos.x - 20,
			x2 = startPos.x + 90,
			y1 = startPos.y - 10,
			y2 = startPos.y + 126,
			currentFly = this.firstParticle;

		// clear interval if any
		if (this.interval)
		{
			clearInterval(this.interval);
			this.interval = null;
		}


		// set random position for all flies
		while (currentFly)
		{
			currentFly.x = randRange(x1, x2);
			currentFly.y = randRange(y1, y2);
			currentFly.init();
			currentFly = currentFly.nextParticle;
		}

		// update particles every 40ms
		this.interval = setInterval(jQuery.proxy(this.updateParticles, this), 30);
	}
}