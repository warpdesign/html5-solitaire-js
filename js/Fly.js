var flies = [];

function randRange(min, max)
{
	var randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
	return randomNum;
}

function Fly(x, y)
{
	this.x = x;
	this.y = y;
	this.ctx = jQuery('#canvas')[0].getContext('2d');
	this.angle = -1.55;
	this.a = 0;
	num = randRange(0, 10);
	if (num < 5)
	{
		this.img = img;
	}
	else
		this.img = img2;
	// ** var that = this;
	// ** setInterval(jQuery.proxy(that.draw, this), 500);
}

Fly.prototype.draw = function()
{
	this.a += (Math.random() * .1) - .05;
	this.a *= .90;
	this.angle += this.a;
	var ywave = Math.sin(this.angle)*2;
	var xwave = Math.cos(this.angle)*5;
	this.x += xwave;
	this.y += ywave;

	this.ctx.drawImage(this.img, this.x, this.y);
}

Fly.prototype.init = function()
{
	d = 0;
	d++;
}

// test canvas
//var ctx = document.getElementById('canvas').getContext('2d');  
var img = new Image();
var img2 = new Image();
img.onload = function()
{  
	/*ctx.drawImage(img, 0, 0);  
	ctx.drawImage(img, 100, 100);  
	*/
}

img.src = 'img/particle2.png';
img2.src = 'img/particle3.png';

function drawFlies()
{
	jQuery('#canvas')[0].getContext('2d').clearRect(0, 0, 480, 320);
	deleted = 0;
	for (var i in flies)
	{
		fly = flies[i];
		fly.draw();
		if ((fly.x>480) || (fly.x < (-5*3)) || (fly.y > 320) || (fly.y < -5))
		{
			// remove
			toto = flies.splice(i, 1);
			deleted++;
			delete toto;
			// TODO: add more...
			//flies.push(new Fly(randRange(0, 480), randRange(50, 70)));
		}
	}
	for(var i = 0; i <deleted; i++)
	{
	   flies.push(new Fly(randRange(0, 480), randRange(50, 300)));
	}
}