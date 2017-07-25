SRC=levels.coffee platformer.coffee monsters.coffee
#JS=$(SRC:.coffee=.js)
OUT=platformer.js
DEVFILES=Makefile src_img/ src_img/*

all: $(OUT)

$(OUT): $(SRC)
	coffee -b -cj $(OUT) $(SRC)
#	coffee -c -b $^
#	sed -i '2d' $@
#	sed -i '$$d' $@

pkg: $(OUT)
	zip -r InfiniteRun . -x $(SRC) $(DEVFILES)