class Platform
	constructor : (@x, @y, @w, @h) ->
		@readImgs()

	readImgs : () ->
		@imgs = []
		for i in levels[lvl].ptfm
			@imgs.push(imgBank.get(i))

	draw : (g) ->
		g.drawImage(@imgs[0], @x, @y)
		g.drawImage(@imgs[1], @x+@w-16, @y)
		i = 0
		while i*64 < @w - 32
			g.drawImage(@imgs[2], @x+i*64+16, @y)
			++i

class Level
	constructor : (options) ->
		{@name, @img, @ptfm, @getMob, @ground, @bg, @bbg, @unlock} = options

	getPlm : ->
		x = topOf(platforms).x + topOf(platforms).w / 3
		x += (topOf(platforms).w + 75) * Math.random() #1 -(Math.random() * Math.random() * 0.5)
		x |= 0
		
		y = topOf(platforms).y
		while not (100 > Math.abs(y - topOf(platforms).y) > 64)
			y = 32 + (canvas.height - 24) * Math.random()
			y -= y%25
		
		w = 64 * Math.floor(Math.random() * 3 + 1) + 32

		r = new Platform(x, y, w, 16)
		@getMob(r)

		r

levels = [
	new Level({
		name : "Forest"
		,
		img : "img/forest.png"
		,
		ptfm : ["ptfm-0-0.png", "ptfm-0-1.png", "ptfm-0-2.png"]
		,
		getMob : (p)->
			if (Math.random() < 0.1)
				monsters.push(new Slime(p))
			if (Math.random() < 0.1)
				monsters.push(new Onion(p))
		,
		ground : "marsh.png"
		,
		bg : "bg-0.png"
		,
		bbg : "bg-mountains.png"
		,
		unlock : 0
	}),
	new Level({
		name : "Egypt"
		,
		img : "img/egypt.png"
		,
		ptfm : ["ptfm-1-0.png", "ptfm-1-1.png", "ptfm-1-2.png"]
		,
		getMob : (p)->
			if (Math.random() < 0.1)
				monsters.push(new Slime(p))
			if (Math.random() < 0.2)
				monsters.push(new Mummy(p))
		,
		ground : "sand.png"
		,
		bg : "bg-1.png"
		,
		bbg : "bg-wall.png"
		,
		unlock : 200
	})
]

printLevels = () ->
	$('#level-list').html("")
	for i of levels
		level = levels[i];
		locked = level.unlock > 0 and level.unlock > levels[i-1].record

		$btn = $('<button class="bigBtn center">')
		$btn.data('lvl', i)
		if not locked
			$btn.click -> startGame($(this).data('lvl'))
		
		$wrap = $("<div class='img-wrap'><img src='#{level.img}'></div>")
		if locked
			$wrap.append('<img src="img/lock.png">')
		if locked
			$btn.append($wrap).append(level.name).append("<p>run #{level.unlock}m to unlock</p>")
		else	
			$btn.append($wrap).append(level.name).append("<p>#{level.record}m</p>")

		$('#level-list').append($('<div class="slide center">').append($btn))

	$('#level-list').append '
                <div class="slide center">
                    <button class="bigBtn center">
                        <div class="img-wrap">
                        <img src="img/soon.png"><br>
                        </div>
                        Soon
                    </button>
                </div>'

	$('.slide').css({width : (width()-300) + "px", height : height() + "px"})