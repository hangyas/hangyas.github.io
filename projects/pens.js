var tools = AntPaint.tools = (function(gt){
    var tools = {};
    
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
    
    var pen = {
        style : "rgba(0, 0, 0, 0.2)",

        setStyle : function(rgb){
            this.style = "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.2)";
        },

        move : function(t, last){
            gt.drawLine(last.pageX, last.pageY, t.pageX, t.pageY, this.style);
            gt.randomLine(t.pageX, t.pageY);

            AntPaint.points.push(new Point(last.pageX, last.pageY));
        }
    };
    tools["pen"] = pen;

    var rad = {
        style : "#ffffff",

        move : function(t, last){
            gt.drawLine(last.pageX, last.pageY, t.pageX, t.pageY, this.style, 20);
        },

        end : function(evt){
            AntPaint.deleteUselessPoints();
        }
    };
    tools["rad"] = rad;

    var filc = {
        style : "rgba(0, 0, 0, 0.2)",

        setStyle : function(rgb){
            this.style = "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.2)";
        },

        move : function(t, last){
            gt.drawLine(last.pageX, last.pageY, t.pageX, t.pageY, this.style, 10);
        }
    };
    tools["filc"] = filc;

    var ecset = {
        style : "rgba(0, 0, 0, 0.2)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.05)";
        },

        move : function(t, last){
            gt.drawLine(last.pageX-7, last.pageY, t.pageX-7, t.pageY, this.style, 2);
            gt.drawLine(last.pageX+7, last.pageY, t.pageX+7, t.pageY, this.style, 6);
            gt.drawLine(last.pageX-4, last.pageY, t.pageX-4, t.pageY, this.style, 5);
            gt.drawLine(last.pageX+3, last.pageY, t.pageX+3, t.pageY, this.style, 7);
        }
    };
    tools["ecset"] = ecset;


    /*
    -------------------------PRO----------------------
    */

    var szoro = {
        style : "rgba(0, 0, 0, 0.2)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.2)";
        },

        gen : function(kx, ky, max){
            var d = Math.random();
            d *= max;

            var alpha = Math.random() * 2 * Math.PI;

            var r = {
                x : Math.sin(alpha)*d + kx,
                y : Math.cos(alpha)*d + ky
            };

            return r;
        },

        move : function(t, last){
            for (i=0; i<10; ++i){
                var p = this.gen(t.pageX, t.pageY, 8);
                gt.drawCircle(p.x, p.y, 1, this.style);
            }
        }
    };
    tools["szoro"] = szoro;


    var firka = {
        lastP : null,
        last : null, //tárolunk sajátot h a legutobbi elég messze lehessen
        irany : 1,
        size : 2,

        style : "rgba(0, 0, 0, 0.2)",

        setStyle : function(rgb){
            this.style = "rgba("+rgb.r+","+rgb.g+","+rgb.b+",0.2)";
        },

        start : function(t){
            this.last = t;
        },

        move : function(t, lastt){
            if (this.lastP != null){
                var lastPDistance = Math.sqrt((t.pageX-this.lastP.x)*(t.pageX-this.lastP.x)
                        +(t.pageY-this.lastP.y)*(t.pageY-this.lastP.y));
                if (lastPDistance > 20)
                    this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }else{
                this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }

            var length = Math.sqrt((t.pageX-this.last.pageX)*(t.pageX-this.last.pageX)
                +(t.pageY-this.last.pageY)*(t.pageY-this.last.pageY));
            var n = length / this.size; //hány keresztvonal legyen

            for (i = 0; n > 8 && i < n; ++i){
                var l = (i * this.size) / length; //arány az egész vonalhoz képest
                var pRel = {
                    x : (t.pageX - this.last.pageX) * l,
                    y : (t.pageY - this.last.pageY) * l,
                };
                var p = {
                    x : this.last.pageX + pRel.x,
                    y : this.last.pageY + pRel.y,
                };

                j = i == 0 ? 0.00000001 : i;
                var k = (Math.random() * 10 + 5 ) / (j*this.size) ; //technikai vonaltól távolság aránya

                p.x += pRel.y * this.irany * k;
                p.y -= pRel.x * this.irany * k;
                this.irany *= -1;

                gt.drawLine(this.lastP.x, this.lastP.y, p.x, p.y, this.style);
                this.lastP = {x:p.x, y:p.y};
                //console.log(p.x + ":" + p.y);
            }
            if (n > 8)
                this.last = t;
        }
    };
    tools["firka"] = firka;


    var sin = {
        lastP : null,
        last : null, //tárolunk sajátot h a legutobbi elég messze lehessen
        n : 0,

        style : "rgba(0, 0, 0, 0.02)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.12)";
        },

        start : function(t){
            this.last = t;
        },

        move : function(t, lastt){
            if (this.lastP == null)
                this.lastP = {x:0, y:0};

            var length = Math.sqrt((t.pageX-this.last.pageX)*(t.pageX-this.last.pageX)
                +(t.pageY-this.last.pageY)*(t.pageY-this.last.pageY));

            for (i_ = 1; i_ < length; ++i_){
                var i = this.n;
                var l = i_ / length; //arány az egész vonalhoz képest
                var pRel = {
                    x : (t.pageX - this.last.pageX) * l,
                    y : (t.pageY - this.last.pageY) * l,
                };
                var p = {
                    x : this.last.pageX + pRel.x,
                    y : this.last.pageY + pRel.y,
                };

                var a = Math.sin(this.n) * 10;
                var b = Math.cos(this.n) * 10;
                gt.drawLine(p.x+a, p.y+b, p.x-a, p.y-b, this.style);

                this.lastP = {x:p.x, y:p.y};
                //console.log(p.x + ":" + p.y);
                this.n += 0.1;
            }
            if (length >= 1)
                this.last = t;
        }
    };
    tools["sin"] = sin;


    var tus = {
        lastA : null,
        lastB : null,
        maxsize : 6,

        style : "rgba(0, 0, 0, 1)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";
        },

        start : function(t){
            this.lastA = {x:t.pageX, y:t.pageY};
            this.lastB = {x:t.pageX, y:t.pageY};
        },

        move : function(t, last){
            var length = Math.sqrt((t.pageX-last.pageX)*(t.pageX-last.pageX)
                +(t.pageY-last.pageY)*(t.pageY-last.pageY));
            if (length > 11.5)
                length = 11.5;
            var size = this.maxsize * (Math.cos(length / 4) + 1) / 2;

            var A = {
                x : (t.pageX + last.pageX) / 2 - size ,
                y : (t.pageY + last.pageY) / 2 - size
            };
            var B = {
                x : (t.pageX + last.pageX) / 2 + size,
                y : (t.pageY + last.pageY) / 2 + size
            };

            gt.ctx.beginPath();
            gt.ctx.fillStyle = this.style;
            gt.ctx.strokeStyle = this.style;
            gt.ctx.lineWidth = 0;
            gt.ctx.lineCap = 'round';
            gt.ctx.moveTo(this.lastA.x, this.lastA.y);
            gt.ctx.lineTo(this.lastB.x, this.lastB.y);
            gt.ctx.lineTo(B.x, B.y);
            gt.ctx.lineTo(A.x, A.y);
            gt.ctx.fill();
    //        gt.ctx.stroke();

            this.lastA = {x:A.x, y:A.y};
            this.lastB = {x:B.x, y:B.y};
        }
    };
    tools["tus"] = tus;

    var kocka = {
        lastP : null,
        last : null,

        style : "rgba(0, 0, 0, 1)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 1)";
        },

        start : function(t){
            this.last = t;
        },

        move : function(t, lastt){
            if (this.lastP != null){
                var lastPDistance = Math.sqrt((t.pageX-this.lastP.x)*(t.pageX-this.lastP.x)
                        +(t.pageY-this.lastP.y)*(t.pageY-this.lastP.y));
                if (lastPDistance > 20)
                    this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }else{
                this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }

            var length = Math.sqrt((t.pageX-this.last.pageX)*(t.pageX-this.last.pageX)
                +(t.pageY-this.last.pageY)*(t.pageY-this.last.pageY));
            var n = Math.floor(length / 20); //hány keresztvonal legyen
            var size = length / n;

            /*
                 C
            --A<   >B--
                 D
            */
            for (i = 1; n >= 1 && i <= n; ++i){
                var bLambda = (i * size) / length; //arány az egész vonalhoz képest
                var kLambda = ((i - .5) * size) / length; //arány az egész vonalhoz képest

                var A = {
                    x : this.lastP.x,
                    y : this.lastP.y
                };
                var B = {
                    x : (t.pageX - this.last.pageX) * bLambda + this.last.pageX,
                    y : (t.pageY - this.last.pageY) * bLambda + this.last.pageY
                };

                //a kzéppontból számoljuk ki a 2 külső pontot
                var K = {
                    x : (t.pageX - this.last.pageX) * kLambda + this.last.pageX,
                    y : (t.pageY - this.last.pageY) * kLambda + this.last.pageY
                };
                var C = {
                    x : K.x - (B.y - K.y),
                    y : K.y + (B.x - K.x)
                };
                var D = {
                    x : K.x + (B.y - K.y),
                    y : K.y - (B.x - K.x)
                };

                //console.log("aaaa")
                gt.ctx.beginPath();
                gt.ctx.fillStyle = this.style;
                gt.ctx.strokeStyle = this.style;
                gt.ctx.lineWidth = 1;
                gt.ctx.lineCap = 'round';
                gt.ctx.moveTo(A.x, A.y);
                gt.ctx.lineTo(C.x, C.y);
                gt.ctx.lineTo(B.x, B.y);
                gt.ctx.lineTo(D.x, D.y);
                gt.ctx.fill();

                AntPaint.points.push(new Point(C.x, C.y));
                AntPaint.points.push(new Point(D.x, D.y));
                this.lastP = {x:B.x, y:B.y};
                //console.log(p.x + ":" + p.y);
            }

            if (n >= 1)
                this.last = t;
        }
    };
    tools["kocka"] = kocka;


    var racs = {
        lastP : null,
        last : null,

        style : "rgba(0, 0, 0, 1)",

        setStyle : function(rgb){
            this.style = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.5)";
        },

        start : function(t){
            this.last = t;
        },

        move : function(t, lastt){
            if (this.lastP != null){
                var lastPDistance = Math.sqrt((t.pageX-this.lastP.x)*(t.pageX-this.lastP.x)
                        +(t.pageY-this.lastP.y)*(t.pageY-this.lastP.y));
                if (lastPDistance > 20)
                    this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }else{
                this.lastP = {x:this.last.pageX, y:this.last.pageY};
            }

            var length = Math.sqrt((t.pageX-this.last.pageX)*(t.pageX-this.last.pageX)
                +(t.pageY-this.last.pageY)*(t.pageY-this.last.pageY));
            var n = Math.floor(length / 20); //hány keresztvonal legyen
            var size = length / n;

            /*
                 C
            --A<   >B--
                 D
            */
            for (i = 1; n >= 1 && i <= n; ++i){
                var bLambda = (i * size) / length; //arány az egész vonalhoz képest
                var kLambda = ((i - .5) * size) / length; //arány az egész vonalhoz képest

                var A = {
                    x : this.lastP.x,
                    y : this.lastP.y
                };
                var B = {
                    x : (t.pageX - this.last.pageX) * bLambda + this.last.pageX,
                    y : (t.pageY - this.last.pageY) * bLambda + this.last.pageY
                };

                //a kzéppontból számoljuk ki a 2 külső pontot
                var K = {
                    x : (t.pageX - this.last.pageX) * kLambda + this.last.pageX,
                    y : (t.pageY - this.last.pageY) * kLambda + this.last.pageY
                };
                var C = {
                    x : K.x + (B.y - K.y),
                    y : K.y + (B.x - K.x)
                };
                var D = {
                    x : K.x - (B.y - K.y),
                    y : K.y - (B.x - K.x)
                };

                gt.ctx.beginPath();
                gt.ctx.fillStyle = this.style;
                gt.ctx.strokeStyle = this.style;
                gt.ctx.lineWidth = 1;
                gt.ctx.lineCap = 'round';
                gt.ctx.moveTo(A.x, A.y);
                gt.ctx.lineTo(C.x, C.y);
                gt.ctx.lineTo(B.x, B.y);
                gt.ctx.lineTo(D.x, D.y);
                gt.ctx.lineTo(A.x, A.y);
                gt.ctx.stroke();

                AntPaint.points.push(new Point(C.x, C.y));
                AntPaint.points.push(new Point(D.x, D.y));
                this.lastP = {x:B.x, y:B.y};
                //console.log(p.x + ":" + p.y);
            }

            if (n >= 1)
                this.last = t;
        }
    };
    tools["racs"] = racs;
    
    return tools;
})(AntPaint.gt);
AntPaint.setTool("pen");