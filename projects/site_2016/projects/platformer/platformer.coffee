topOf = (array) -> 
	array[array.length - 1];

# @param del array of indexes
# @param array array where delete from
deleteFrom = (del, array) ->
	for i in [0...del.length]
		array.splice(del[i]-i, 1)

canvas = null
g = null
scrollX = 0
scrollY = 0

platforms = []
monsters = []

fs = 5
ani = 0
ani8 = 0
ani6 = 0

drawInterval = null
animInterval = null
plAniInterval = null
frameInterval = null
paused = false

maxlvl = 2
lvl = null
distance = 0

keys = {
	up : false
	rifht : false
	left : false
}

pl = {
	x : 0
	y : 0
	w : 32
	h : 40

	hp : 3
	maxHp : 3
	blink : 0

	speed : 0.8

	irany :
		x : 0
		y : 0

	imgIr : 1

	intersects : () ->
		for i in platforms
			if pointIntersect(@x, @y, i.x, i.y, i.w, i.h) \
			|| pointIntersect(@x+@w, @y, i.x, i.y, i.w, i.h)
				@y = i.y + i.h + 1 
				return true
			if pointIntersect(@x, @y+@h, i.x, i.y, i.w, i.h) \
			|| pointIntersect(@x+@w, @y+@h, i.x, i.y, i.w, i.h)
				@y = i.y - @h
				return true
		false

	init : ->
		@x = 0
		@y = 0
		@hp = 3
		@maxHp = 3
		@blink = 0
		@irany.x = 0
		@irany.y = 0
		@imgIr = 1
}

imgBank = {
	nimg : {}
	mimg : {}
	get : (name, scale) ->
		if (!@nimg[name])
			img = new Image()
			img.src = "img/" + name
			@nimg[name] = if scale then resize(img, scale) else img
		
		@nimg[name]
}

pointIntersect = (x, y, dx, dy, w, h) ->
	x >= dx && x <= dx + w && y >= dy && y <= dy + h

# @param all {bool} list all intersect default:false
# @param full {full} full interstect
intersect = (a, b, full = false, all = false) ->
	r = if all then [] else false
	if Array.isArray(a)
		for i of a
			if intersect(a[i], b, full, all)
				if (all)
					r.push(i)
				else
					return i
		return r

	if Array.isArray(b)
		for i of b
			if intersect(a, b[i], full, all)
				if (all)
					r.push(i)
				else
					return i
		return r

	if not full
		pointIntersect(a.x, a.y, b.x, b.y, b.w, b.h) \
		|| pointIntersect(a.x+a.w, a.y, b.x, b.y, b.w, b.h) \
		|| pointIntersect(a.x, a.y+a.h, b.x, b.y, b.w, b.h) \
		|| pointIntersect(a.x+a.w, a.y+a.h, b.x, b.y, b.w, b.h)
	else
		pointIntersect(a.x, a.y, b.x, b.y, b.w, b.h) \
		&& pointIntersect(a.x+a.w, a.y, b.x, b.y, b.w, b.h) \
		&& pointIntersect(a.x, a.y+a.h, b.x, b.y, b.w, b.h) \
		&& pointIntersect(a.x+a.w, a.y+a.h, b.x, b.y, b.w, b.h)

makeMap = () ->
	platforms.push(new Platform(0, canvas.height/2, 96, 16))

	for i in [0..30]
		platforms.push(levels[lvl].getPlm())

$(document).ready(()->
	#GUI	
	initRecords()
	printLevels()

	$('.handle').css({width : 3 * (width()-300) + "px"})
	new Dragdealer('lvl-menu', { vertical: false, steps: 3, loose: false,
	left: width()/3, right: width()/3 });

	#CANVAS

	canvas = document.getElementById('screen');
	canvas.width = width()
	canvas.height = height()
#	WebGL2D.enable(canvas);

	g = canvas.getContext("2d");
	g.mozImageSmoothingEnabled = false;
	g.imageSmoothingEnabled = false;

	setScreen("main-menu")

)

startGame = (_lvl) ->
	document.onkeydown = `function(e){
		switch (e.keyCode){
		    case 38 : jump();
		    		  break;
		    case 65 :
		    case 37 : left();
		    		  break;
		    case 68 :
		    case 39 : right();
		    		  break;
		}
	};`

	lvl = _lvl

	$('.game-bg').css({background : "url(img/" + levels[lvl].bbg + ")"})

	$('#pauseBtn').show()
	$('#contBtn').hide()
	paused = false

	scrollX = 0
	scrollY = 0

	distance = 0
	$('#distance').html("0.00m");

	platforms = []
	monsters = []
	pl.init()

	makeMap()
	pl.y = platforms[0].y - 40
	pl.x = 48;

	drawInterval = setInterval(draw, 50)
	plAniInterval = setInterval(plAni, 100)
	animInterval = setInterval(animFrame, 400)
	frameInterval = setInterval(frame, 5 * fs)

	setScreen("game")

stopGame = (screen = "main-menu") -> 
	if parseFloat(localStorage['record-' + lvl]) < distance
		localStorage['record-' + lvl] = distance
	initRecords()
	printLevels()
	$('#over-distance').html(parseFloat(distance).toFixed(2) + "m")
	g.translate(scrollX, scrollY)
	clearInterval(drawInterval)
	clearInterval(plAniInterval)
	clearInterval(animInterval)
	clearInterval(frameInterval)
	setScreen(screen)

pauseGame = ->
	paused = true
	$('#pauseBtn').hide()
	$('#contBtn').show()

continueGame = ->
	paused = false
	$('#pauseBtn').show()
	$('#contBtn').hide()

frame = () ->
	if paused
		return

	pl.y += pl.irany.y;
	pl.x += pl.irany.x;

	if pl.irany.y < 2.0 * fs
		pl.irany.y += 0.025 * fs * fs; 

	if pl.intersects()
		pl.irany.y = 0;
	
	if pl.x > canvas.width + scrollX - width()/2
		moveCamX()

	if pl.y <= 50
		g.translate(0, scrollY - pl.y + 50)
		scrollY = pl.y - 50
	else if scrollY != 0
		g.translate(0, scrollY)
		scrollY = 0

	else if pl.x < scrollX
		pl.irany.x = 0

	for i in monsters
		i.move()

	_distance = pl.x / 32 - 1.5
	if _distance > distance
		distance = _distance
		$('#distance').html(parseFloat(distance).toFixed(2) + "m");

	if pl.y > canvas.height-32
		stopGame("game-over")
		return

	if pl.blink == 0
		if m = intersect(pl, monsters)
			pl.hp -= monsters[m].dmg
			pl.blink = 75
			if pl.hp == 0
				stopGame("game-over")
				return
	else
		pl.blink--;

right = ->
	keys.right = true
	pl.irany.x = pl.speed * fs
	pl.imgIr = 1

left = ->
	if pl.x < scrollX
		return
	keys.left = true
	pl.irany.x = -pl.speed * fs
	pl.imgIr = -1

jump = ->
	if (pl.irany.y == 0)
		pl.irany.y = -2.5 * fs

animFrame = ->
	if paused
		return
	if ani < 3
		ani++;
	else
		ani = 0
	if ani8 < 7
		ani8++;
	else
		ani8 = 0

plAni = ->
	if paused
		return
	if ani6 < 5
		ani6++;
	else
		ani6 = 0

draw = () ->
	g.clearRect(scrollX, scrollY, canvas.width, canvas.height);

	#bg
	img = imgBank.get(levels[lvl].bg)
	bgpos = scrollX - scrollX%(img.width*4)/4
	g.drawImage(img, bgpos, scrollY)
	g.drawImage(img, bgpos + img.width, scrollY)

	#ground
	img = imgBank.get(levels[lvl].ground, 2)
	groundPos = scrollX - scrollX % img.width
	g.drawImage(img, groundPos, canvas.height - 32)
	g.drawImage(img, groundPos+img.width, canvas.height - 32)

	#platforms
	for i in platforms
		i.draw(g)
	for i in monsters
		i.draw(g)

	#hp
	for i in [0...pl.hp]
		g.drawImage(imgBank.get("life.png"), 0, 0, 16, 16, scrollX+8+i*18, scrollY+8, 16, 16)
	for i in [pl.hp...pl.maxHp]
		g.drawImage(imgBank.get("life.png"), 16, 0, 16, 16, scrollX+8+i*18, scrollY+8, 16, 16)
	
	#player
	if pl.irany.y != 0
		if pl.imgIr == -1
			g.drawImage(imgBank.get("pl-1.png"), pl.x, pl.y, pl.w, pl.h)
		else
			g.scale(-1, 1)
			g.drawImage(imgBank.get("pl-1.png"), -pl.x-pl.w, pl.y, pl.w, pl.h)
			g.scale(-1, 1)
		
	else if pl.irany.x == 0
		if pl.imgIr == -1
			g.drawImage(imgBank.get("pl-2.png"), pl.x, pl.y, pl.w, pl.h)
		else
			g.scale(-1, 1)
			g.drawImage(imgBank.get("pl-2.png"), -pl.x-pl.w, pl.y, pl.w, pl.h)
			g.scale(-1, 1)
	else
		if pl.imgIr > 0
			g.scale(-1, 1)
			g.drawImage(imgBank.get("pl-0.png"), pl.w*ani6, 0, pl.w, pl.h, -pl.x-pl.w, pl.y, pl.w, pl.h)
			g.scale(-1, 1)
		else
			g.drawImage(imgBank.get("pl-0.png"), pl.w*ani6, 0, pl.w, pl.h, pl.x, pl.y, pl.w, pl.h)
	
	if pl.blink > 0 && ani != 0
		drawRect(pl.x, pl.y, pl.w, pl.h, "rgba(255, 0, 0, 0.5)")


moveCamX = () ->
	scrollX += pl.irany.x
	g.translate(-pl.irany.x, 0)

	del = intersect(platforms, {x:0, y:0, w:scrollX, h:canvas.height}, true, true)
	deleteFrom(del, platforms)
	del = intersect(monsters, {x:0, y:0, w:scrollX, h:canvas.height}, true, true)
	deleteFrom(del, monsters)

	while topOf(platforms).x < scrollX + canvas.width
		platforms.push(levels[lvl].getPlm())


drawRect = (x, y, w, h, s) ->
	g.beginPath()
	g.rect(x, y, w, h)
	g.fillStyle = s
	g.lineWidth = 0
	g.fill()

#
#	GUI
#

screens = ["main-menu", "game-over", "lvl-menu", "game"]

setScreen = (str) ->
	for i in screens
		$("#" + i).hide()
	$("#" + str).show()

initRecords = ->
	for i in [0...maxlvl]
		if not localStorage['record-'+i]
			localStorage['record-'+i] = 0
		#$('#record-'+i).html(parseFloat(localStorage['record-'+i]).toFixed(2) + "m")
		levels[i].record = parseFloat(localStorage['record-'+i]).toFixed(2);

`var resize = function( img, scale ) {
    // Takes an image and a scaling factor and returns the scaled image
    
    // The original image is drawn into an offscreen canvas of the same size
    // and copied, pixel by pixel into another offscreen canvas with the 
    // new size.
    
    var widthScaled = img.width * scale;
    var heightScaled = img.height * scale;
    
    var orig = document.createElement('canvas');
    orig.width = img.width;
    orig.height = img.height;
    var origCtx = orig.getContext('2d');
    origCtx.drawImage(img, 0, 0);
    var origPixels = origCtx.getImageData(0, 0, img.width, img.height);
    
    var scaled = document.createElement('canvas');
    scaled.width = widthScaled;
    scaled.height = heightScaled;
    var scaledCtx = scaled.getContext('2d');
    var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );
    
    for( var y = 0; y < heightScaled; y++ ) {
        for( var x = 0; x < widthScaled; x++ ) {
            var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
            var indexScaled = (y * widthScaled + x) * 4;
            scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
            scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
            scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
            scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
        }
    }
    scaledCtx.putImageData( scaledPixels, 0, 0 );
    return scaled;
}`

`
function width(){
	return $(window).width();
}
function height(){
	return $(window).height();
}
`