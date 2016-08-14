var AntPaint = (function(){
    var AntPaint = {};
    var gt = AntPaint.gt = {};
    
    var canvas, g;
    var touches = [];
    touches.getIndex = function(i){
        for(var j=0; j < this.length; ++j)
            if (this[j].identifier == i)
                return j;

        return -1;
    }
    
    var points = AntPaint.points = [];

    var tool = null;
    var tool_name = "pen";

    var drawHistory = [];
    var redoIndex = 0;

    var color = {
        r : 0,
        g : 0,
        b : 0
    };

    function Point(x, y){
        this.x = x;
        this.y = y;
    }

    function Color(r, g, b, a){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a || 1;
    }
    
    Color.prototype = {
        clone: function(){
            return new Color(this.r, this.g, this.b);
        }
    };

    var defPenStyle = "rgba(0, 0, 0, 0.2)";
    var radPenStyle = "#ffffff";
    
    //INIT
    $(document).ready(function(){
        AntPaint.canvas = canvas = document.getElementById('canvas');
        g = gt.ctx = canvas.getContext("2d");

        canvas.width = $(window).width();
        canvas.height = $(window).height();

        canvas.addEventListener("touchstart", touchStart, false);
        canvas.addEventListener("touchend", touchEnd, false);
        canvas.addEventListener("touchcancel", touchCancel, false);
        canvas.addEventListener("touchleave", touchEnd, false);
        canvas.addEventListener("touchmove", touchMove, false);

        gt.clr();
    });
    
    //PUBLIC FUNCTION
    
    AntPaint.setColor = function(c){
        color.r = parseInt(c.substr(0, 2), 16);
        color.g = parseInt(c.substr(2, 2), 16);
        color.b = parseInt(c.substr(4, 2), 16);
    }
    
    AntPaint.getColor = function(){
        return color.r.toString(16) + color.g.toString(16) + color.b.toString(16);
    }
    
    AntPaint.getRgb = function(){
        return {
            r : color.r,
            g : color.g,
            b : color.b
        }
    }
    
    AntPaint.color2Rgb = function(c){
        var color = {};
        color.r = parseInt(c.substr(0, 2), 16);
        color.g = parseInt(c.substr(2, 2), 16);
        color.b = parseInt(c.substr(4, 2), 16);
        return color;
    }
    
    AntPaint.rgb2Color = function(color){
        return color.r.toString(16) + color.g.toString(16) + color.b.toString(16);
    }
    
    AntPaint.setTool = function(t){
        tool = tools[t];
        tool_name = t;
    }
    
    AntPaint.getToolName = function(){
        return tool_name;
    }
    
    AntPaint.getPoints = function(){
        return points.slice(0);
    }
    
    AntPaint.dataurl = function(){
        return canvas.toDataURL('image/png');
    }
    
    AntPaint.load = function(h){
        var img = new Image();
        img.src = h.dataurl;
        img.onload = function(){
            gt.clr();
            gt.ctx.drawImage(img, 0, 0);
            pushHistory();
        }
        AntPaint.points = points = h.points.slice(0);        
    }
    
    //GRAPHIC TOOLKIT
    
    gt.clr = function(){
        this.drawRect(0, 0, canvas.width, canvas.height, "#fff")
        
        points = AntPaint.points = [];
        pushHistory();
    }

    gt.randomLine = function(x, y){
        if (points.length < 10)
            return;
        var m = Math.random() * 10;
        
        var overflow = 100;
        for (var i=0; i < m; ++i){
            var g = Math.round(Math.random() * (points.length-10));

            var xm = Math.abs(points[g].x - x);
            var ym = Math.abs(points[g].y - y);
            var d = Math.sqrt(xm*xm + ym*ym);
            d = 10/d;
            d *= d;
            if(d > 0.8)
                d = 0.8
            else if (d < 0.1 && overflow > 0){
                --i;
                --overflow;
                continue;
            }

            gt.drawLine(x, y, points[g].x, points[g].y, 
                "rgba("+color.r+", "+color.g+", "+color.b+", "+d+")");
        }
    }

    gt.drawLine = function(x0, y0, x1, y1, s, w){
        if (!s)
            s = defPenStyle;
        if (!w)
            w = 1;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);

        g.strokeStyle = s;
        g.lineWidth = w;
        g.lineCap = 'round';

        g.stroke();
    }

    gt.drawCircle = function(x, y, r, s){
        g.beginPath();
        g.fillStyle = s;
        g.arc(x, y, r, 0, 2 * Math.PI, false);
        g.closePath();
        g.fill();
    }


    gt.drawRect = function(x, y, w, h, s){
        g.beginPath();
        g.rect(x, y, w, h);
        g.fillStyle = s;
        g.lineWidth = 0;
        g.strokeStyle = 'none';
        g.fill();
    }

    //HISTORY
    
    function pushHistory(){
        if (redoIndex < drawHistory.length-1){
            redoIndex++;
            drawHistory.splice(redoIndex, Number.MAX_VALUE);
        }

        redoIndex = drawHistory.push({
            img: gt.ctx.getImageData(0, 0, canvas.width, canvas.height),
            points: points.slice(0)
        });
        --redoIndex;

        if (drawHistory.length > 10)
            drawHistory.splice(0, 1);
    }

    var undo = AntPaint.undo = function(){
        if (redoIndex <= 0)
            return;

        --redoIndex;
        var h = drawHistory[redoIndex];
        gt.ctx.putImageData(h.img, 0, 0);
        AntPaint.points = points = h.points.slice(0);
    }

    var redo = AntPaint.redo = function(){
        if (redoIndex == drawHistory.length-1)
            return;

        ++redoIndex;
        var h = drawHistory[redoIndex];
        gt.ctx.putImageData(h.img, 0, 0);
        AntPaint.points = points = h.points.slice(0);
    }

    //TOUCH EVENTS

    var startPoint;
    
    function touchStart(evt) {
        $('.submenu').hide();
        if (tool.setStyle)
            tool.setStyle(color);
        evt.preventDefault();
        
        for (var i=0; i < evt.changedTouches.length; i++){
            var t = evt.changedTouches[i];
            startPoint = t;
            touches.push(t); 
            if(tool.start)
                tool.start(t);
        }
    }

    function touchMove(evt){
        evt.preventDefault();

        for (var i=0; i < evt.changedTouches.length; i++){
            var t = evt.changedTouches[i];
            var lastI = touches.getIndex(t.identifier);
            var last = touches[lastI];

            if (window.gui.opened && Math.abs(t.pageX - startPoint.pageX) > 10 && Math.abs(t.pageY - startPoint.pageY) > 10){
                window.gui.toggle();
            }
            
            tool.move(t, last);

            touches.splice(lastI, 1, t);
        }
    }

    var touchCancel = touchEnd = function(evt){
        evt.preventDefault();

        for (var i=0; i < evt.changedTouches.length; i++){
            var t = evt.changedTouches[i];
            var lastI = touches.getIndex(t.identifier);
            var last = touches[lastI];

            touches.splice(lastI, 1);
            
            if (Math.abs(t.pageX - startPoint.pageX) < 10 && Math.abs(t.pageY - startPoint.pageY) < 10){
                window.gui.toggle();
                return;
            }
            
            tool.move(t, last);
            if (tool.end)
                tool.end(t);
        }

        pushHistory();
    }
/*
    function touchCancel(evt){
        evt.preventDefault();

        for (var i=0; i < evt.changedTouches.length; i++){
            var t = evt.changedTouches[i];
            var lastI = touches.getIndex(t.identifier);
            var last = touches[lastI];

            if (Math.abs(t.pageX - startPoint.pageX) < 10 && Math.abs(t.pageY - startPoint.pageY) < 10){
                window.gui.toggle();
            }

            tool.move(t, last);
            if (tool.end)
                tool.end(t);

            touches.splice(lastI, 1);
        }

        pushHistory();
    }*/

    function getImgMatrix(){
        var data = g.getImageData(0, 0, canvas.width, canvas.height).data;
        var img = [];

        for (i=0; i<canvas.height; ++i){
            img[i] = [];
            for (j=0; j<canvas.width; ++j){
                var index = ( i * canvas.width + j) * 4;
                img[i][j] = new Color(data[index],
                                      data[index+1],
                                      data[index+2],
                                      data[index+3]);
            }
        }

        return img;
    }

    var deleteUselessPoints = AntPaint.deleteUselessPoints = function(){
        var img = getImgMatrix();
        var r = [];

        for (i = 0 ; i < points.length; ++i){
            if (img[points[i].y][points[i].x].r < 200){
               r.push(points[i]);
            }
        }

        points = AntPaint.points = r;
    }
    
    return AntPaint;
})();