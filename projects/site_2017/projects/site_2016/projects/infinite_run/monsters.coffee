class Monster
	w : 16
	h : 32
	speed : 0.2 * fs
	dmg : 1
	img : "monster-2.png"

	constructor : (@platform) ->
		@x = platform.x + platform.w / 2
		@y = platform.y - 32
		@endRight = @platform.x + @platform.w - 24 - @speed
		@endLeft = @platform.x + 8 - @speed
		@w = 16
		@h = 32

	move : () ->
		@x += @speed
		if @x < @endLeft || @x > @endRight
			@speed = -@speed


	draw : (g) ->
		if @speed > 0
			g.scale(-1, 1)
			g.drawImage(imgBank.get(@img), 16*ani, 0, 16, 32, -@x-16, @y, 16, 32)
			g.scale(-1, 1)
		else
			g.drawImage(imgBank.get(@img), 16*ani, 0, 16, 32, @x, @y, 16, 32)

class Slime extends Monster
	img : "monster-2.png"
	speed : 0.05 * fs

class Onion extends Monster
	img : "monster-1.png"

class Mummy extends Monster
	img : "monster-3.png"
	speed : 0.1 * fs

	draw : (g) ->
		if @speed > 0
			g.scale(-1, 1)
			g.drawImage(imgBank.get(@img), 16*ani8, 0, 16, 32, -@x-16, @y, 16, 32)
			g.scale(-1, 1)
		else
			g.drawImage(imgBank.get(@img), 16*ani8, 0, 16, 32, @x, @y, 16, 32)
