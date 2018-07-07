var loader;
$(document).ready(function(){
    $('#lightbox').hide();
    $('#lightbox').click(function(){
        location.hash = "nothing";
        $('#lightbox').hide();
    });
    $('#content').click(function(){
        return false;
    });

    window.onhashchange = function(e) {
        load();
    }

    function load(hash){
        if (!hash)
            hash = location.hash;
        if (hash == "")
            return;
        hash = hash.split("#")[1];
        hash = hash.split(":");
        loader[hash[0]](hash[1]);
    }

    loader = {
        box : function(content){
            $('#content').html(content);
            $('#lightbox').show();
        }
        ,
        img : function(url){
            this.box("<img src='"+url+"' class='center'>");	
        }
        ,
        page : function(url){
            this.box("loading...");
            $('#content').load(url);
        }
        ,
        frame : function(url){
            nfo = url.split(";");
            if (nfo.length == 1){
                this.box("<iframe src=\"" + url + "\" width=640 height=480 style=\"border:solid 1px #000\"></iframe><br>");
            }else{
                this.box("<iframe src=\"" + nfo[0] + "\" width=" + nfo[1] + " height=" + nfo[2] + " style=\"border:solid 1px #000\"></iframe><br>");
            }
        }
    }

    $(".group h2").prepend("<i class=\"icon-angle-right \"></i>");
    try{
        load();
    }catch(e){}
    
    /*
    $("#outline").fracs("outline", {
        crop: true,
        styles: [
            {
                selector: 'li',
                fillStyle: 'rgb(230,230,230)'
            },
            {
                selector: 'h1',
                fillStyle: 'rgb(140,140,140)'
            }
        ],
        viewportStyle: {
            fillStyle: 'rgba(144,144,144,0.3)'
        },
        viewportDragStyle: {
            fillStyle: 'rgba(144,144,144,0.5)'
        },
    });*/
});