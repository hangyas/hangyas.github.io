var gui = (function(db, AntPaint){
    var gui = {};
    var r = 20;

    function pos_calc(db, R){
        var a = Math.PI / (4 * db);    

        var r = [];
        for (var i = 0; i < db; ++i){
            r.push({
                x: Math.sin(i * 2 * a + a) * R,
                y: Math.cos(i * 2 * a + a) * R,
            });
        }

        return r;
    }

    var positions_10 = pos_calc(4, 150).concat(pos_calc(6, 200));
    var positions_5 = pos_calc(5, 175);

    var submenus = {
        menu: {
            open: function(){
                $('#menu').show();
                $('#menu > button').each(function(i){
                    $(this).animate({
                        top: positions_5[i].x - r,
                        right: positions_5[i].y - r
                    }, "fast");
                });
            },
            close: function(){
                $('#menu > button').animate({
                    top: -r,
                    right: -r
                }, "fast");
                $('#menu').hide("fast");
            }
        },

        tools: {
            open: function(){
                $('#tools').show();
                $('#tools > button').each(function(i){
                    $(this).animate({
                        bottom: positions_10[i].x - r,
                        left: positions_10[i].y - r
                    }, "fast");
                });
            },
            close: function(){
                $('#tools > button').animate({
                    bottom: -r,
                    left: -r
                }, "fast");
                $('#tools').hide("fast");
            }
        },

        colors: {
            open: function(){
                $("#colors-btn").animate({
                    bottom: $(window).height() - 210,
                    right: ($(window).width() - 200 ) / 2
                }, "fast");
                $("#colors").css({display: "block"}).animate({
                    top: 220,
                    right: ($(window).width() - $("#colors").width()) / 2,
                    opacity: 1
                }, "fast");
                
                $("#sliders").css({display: "block"}).animate({
                    left: ($(window).width() - $("#sliders").width()) / 2,
                    opacity: 1
                }, "fast");
            },

            close: function(){
                $("#colors-btn").animate({
                    bottom: -100,
                    right: -100
                }, "fast");
                $("#colors").animate({
                    top: 220,
                    right: -$("#colors").width(),
                    opacity: 0
                }, "fast");
                
                $("#sliders").css({display: "block"}).animate({
                    left: -$(window).width(),
                    opacity: 0
                }, "fast");
            }
        }
    };

    var opened_menu = null;
    
    var opened = gui.opened = true;
    var toggle = gui.toggle = function(){
        if (opened_menu){   
            submenus[opened_menu].close();
            opened_menu = null;
            $("#gui > button").animate({
                opacity: 1
            }, { duration: 500, queue: false });
        }

        $("#gui").fadeToggle();
        opened = gui.opened = !opened;
    };
    
    $(document).ready(function(){
        $('.submenu > button').css({
            width: 2 * r,
            height: 2 * r
        });
        $('#menu > button').css({
            top: -r,
            right: -r
        });
        $('#tools > button').css({
            bottom: -r,
            left: -r
        });
        $('.submenu:not(#colors)').hide();

        //SUBMENUS

        $("#menu-btn, #tools-btn, #colors-btn").click(function(){
            var i = $(this).data("submenu");

            if (i === opened_menu){
                submenus[i].close();
                opened_menu = null;
                $("#gui > button").animate({
                    opacity: 1
                }, { duration: 500, queue: false });
            }else{
                $("#gui > button:not(#"+i+"-btn)").animate({
                    opacity: 0.5
                }, { duration: 500, queue: false });
                if (opened_menu){
                    submenus[opened_menu].close();
                    $("#" + i + "-btn").animate({
                        opacity: 1
                    }, { duration: 500, queue: false });
                }
                submenus[i].open();
                opened_menu = i;
            }
        });
        
        $("#tools > button").click(function(){
            AntPaint.setTool($(this).data("tool"));
        });

        $("#export-btn").click(function(){
            db.export(AntPaint.dataurl());
        });
        
        //UNREDO

        $('#unredo').click(function(e){
            if (e.pageX > e.pageY)
                AntPaint.undo();
            else
                AntPaint.redo();
        });

        //COLOR
        
        var $colors = $("#colors");

        var hues = [0, 32, 64, 96, 160, 192, 224, 316];
        
        for (i = 1; i<5; ++i){
            var color = "hsl(0, 0%, " + (((i-1) / 3 * 100)|0) + "%)";
            $colors.append($("<button data-color=\""+color+"\"></button>")
                .css({"background-color": color})
            );
            for (j = 0; j < 8; ++j){
                color = "hsl(" + hues[j] + ", 100%, " + i * 20 + "%)";
                $colors.append($("<button data-color=\""+color+"\"></button>")
                    .css({"background-color": color})
                );
            }
            $colors.append("<br>")
        }
        
        $("#colors").css({
            top: 220,
            right: -$("#colors").width(),
            display: "block"
        });
        
        $("#colors > button").click(function(){
            var color = $.Color($(this).data("color"));
            set_color(color.toHexString().substr(1, 6));
        });
        
        $("#colors-btn").css({
            "background-color": "#" + AntPaint.getColor()
        });

        $("#sliders").css({
            top: 240 + $colors.height(),
            left: -$(window).width(),
            display: "block",
            width: $("#colors").width()
        });

        //FILEMENU

        $("#new-btn").click(function(){
            AntPaint.gt.clr();
        });

        $("#save-btn").click(file_dialog_save);
        $("#open-btn").click(file_dialog_open);

        $("#share-btn").click(function(){
            AntPaint.canvas.toBlob(function (blob) {
                new MozActivity({
                    name: "share",
                    data: {
                        type: "image/*",
                        number: 1,
                        blobs: [blob]
                    }
                });
            });
        });
        
        $("#files").click(function(){
            $(this).fadeOut();
        });
        
        //NOTIFICATION
        
        $("#notification > button").click(function(){
            gui.notification.hide();
        });
    });

    function set_color(color){
        AntPaint.setColor(color);
        $("#colors-btn").animate({
            "background-color": "#" + color
        });
    }
    
    function set_rgb(rgb){
        var color = AntPaint.rgb2Color(rgb);
        AntPaint.setColor(color);
        $("#colors-btn").animate({
            "background-color": "#" + color
        });
    }
    
    function file_dialog_open(){
        $files = $("#files");
        $files.html("");
        for (var i = 0; i < db.thumbs.length; ++i){
            var img = new Image;
            img.src = db.thumbs[i].thumb;
            $files.append($(img).data("index", i).data("name", db.thumbs[i].name));
        }
        $("#files > img").click(function(){
            AntPaint.load(db.open($(this).data("name")));
            $("#files").fadeOut();
        });
        
        $files.fadeIn("fast");
    }
    
    function file_dialog_save(){
        $files = $("#files");
        $files.html("");
        for (var i = 0; i < db.thumbs.length; ++i){
            var img = new Image;
            img.src = db.thumbs[i].thumb;
            $files.append($(img).data("index", i).data("name", db.thumbs[i].name));
        }
        $("#files > img").click(function(){
            db.save(AntPaint.dataurl(), AntPaint.getPoints(), $(this).data("index"));
            $("#files").fadeOut();
        });
        
        $files.prepend($("<div>").click(function(){
            db.save(AntPaint.dataurl(), AntPaint.getPoints());
            $("#files").fadeOut();
        }).css({
            width: db.thumb_width,
            height: db.thumb_height
        }).append($("<img src='img/new_file.png'>").css({
            "margin-left": 0|(db.thumb_width-28)/2,
            "margin-top": 0|(db.thumb_height-28)/2
        })));
        
        $files.fadeIn("fast");
    }
    
    gui.notification = {};
    
    gui.notification.show = function(msg, btn, component){
        $("#notification-msg").html(msg);
        $("#notification > button").html(btn);
        $("#notification").fadeIn();
        
        if (component){
            $("#" + component).fadeIn();
        }
    }
    
    gui.notification.hide = function(){
        $("#notification").fadeOut();
        $("#notification > div").fadeOut();
    }
    
    return gui;
    
})(db, AntPaint);