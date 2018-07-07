Array.prototype.top = function() {
	return this[this.length - 1];
};

var canvas, g;

var keys = {
    up : false,
    right : false,
    left : false
}

var sdr = {
    pos : {
        x : 0,
        y : 0
    },

    irany : {
        x : 0,
        y : 0
    },

    intersect : function(){
		for (i in platforms){
			if (pointInt(this.pos.x, this.pos.y, platforms[i].y, platforms[i].x, platforms[i].w, platforms[i].h)
			 || pointInt(this.pos.x+10, this.pos.y, platforms[i].y, platforms[i].x, platforms[i].w, platforms[i].h)
			 || pointInt(this.pos.x, this.pos.y+10, platforms[i].y, platforms[i].x, platforms[i].w, platforms[i].h)
			 || pointInt(this.pos.x+10, this.pos.y+10, platforms[i].y, platforms[i].x, platforms[i].w, platforms[i].h))
			{
				return true;
			}
		}

		return false;
    }
}

function pointInt(x, y, dx, dy, w, h){
	return x > dx && x < dx + w && y > dy && y < dy + h;
}

var platforms = [];

function Platform(x, y, w, h){
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function generatePlm(){
	var x, y, w;
	x = platforms.top().x + (platforms.top().w + 50 ) * Math.random() * Math.random();
	y = canvas.height * Math.random();
	w = 200 * Math.random();

	return new Platform(x, y, w, 10);
}

function makeBetaMap(){
	platforms.push(new Platform(0, canvas.height-10, 50, 10));

	for (i=0; i < 10; ++i){
		platforms.push(generatePlm());
	}
}

$(document).ready(function(){
    // CANVAS

    canvas = document.getElementById('screen');
    g = canvas.getContext("2d");

    canvas.width = $(window).width()-50;
    canvas.height = 300;
    
    document.onkeydown = function(e){
        switch (e.keyCode){
            case 38 : keys.up = true;
            		  if (sdr.irany.y == 0)
            		  	sdr.irany.y = -25;
                      break;
            case 65 :
            case 37 : keys.left = true;
            		  sdr.irany.x = -10;
            		  break;
            case 68 :
            case 39 : keys.right = true;
            		  sdr.irany.x = 10;
            		  break;
        }
    };
    
    document.onkeyup = function(e){
        switch (e.keyCode){
            case 38 : keys.up = false; break;
            case 65 :
            case 37 : keys.left = true;
            		  sdr.irany.x = 0;
            		  break;
            case 68 :
            case 39 : keys.right = true;
            		  sdr.irany.x = 0;
            		  break;
        }
    };
    
    makeBetaMap();

    setInterval(draw, 50);
    setInterval(frame, 50);
});

function draw(){
    g.clearRect (0, 0, canvas.width, canvas.height);

	for (i in platforms)
		drawRect(platforms[i].x, platforms[i].y, platforms[i].w, platforms[i].h, "#000000");

    drawRect(sdr.pos.x, sdr.pos.y, 10, 10, "#000000");
}

function frame(){
	sdr.pos.y += sdr.irany.y;
	sdr.pos.x += sdr.irany.x;

	if (sdr.irany.y < 20)
		sdr.irany.y += 2.5; 

    if (sdr.pos.y > canvas.height-20 || sdr.intersect())
        sdr.irany.y = 0;
}

function drawRect(x, y, w, h, s){
    g.beginPath();
    g.rect(x, y, w, h);
    g.fillStyle = s;
    g.lineWidth = 0;
    g.strokeStyle = 'none';
    g.stroke();
}