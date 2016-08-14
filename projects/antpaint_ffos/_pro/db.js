db = (function(undefined){

    var db = {};

    var thumb_width = db.thumb_width = ((window.innerWidth - 96) / 3) | 0;
    var thumb_height = db.thumb_height = (window.innerHeight * thumb_width / window.innerWidth) | 0;
    
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };

    var pics; //exportálás
    if (navigator.getDeviceStorage)
        pics = navigator.getDeviceStorage("pictures");
    
    /**
     * {name: xxxxxx, thumb: dataurl}
     */
    db.thumbs = JSON.parse(localStorage["thumbs"] || "[]");
    
    /**
     * @param name thumbsból vett név
     * @return {dataurl, points[]} (Image obj src-jébe beadagolni)
     */
    db.open = function(name){
        return JSON.parse(localStorage["img#" + name]);
    }
    
    /**
     * @param [index] thumbnail indexe a tömbben (ha üres akk új néven mentjük)
     */
    db.save = function(dataurl, points, index){
        var obj = {
            dataurl: dataurl,
            points: points
        };
        
        if (index !== undefined){
            localStorage.setItem("img#" + this.thumbs[index].name, JSON.stringify(obj));
            save_thumb(index, dataurl);
        }else{
            var name = Date.now();
            this.thumbs.unshift({
                name: name,
                thumb: null
            })
            save_thumb(0, dataurl);
            localStorage.setItem("img#" + name, JSON.stringify(obj));
        }
    }
    
    function save_thumb(index, dataurl){
        var img = new Image();
        img.src = dataurl;
        var canvas = document.createElement("canvas");
        canvas.width = thumb_width;
        canvas.height = thumb_height;
        var g = canvas.getContext('2d');
        
        img.onload = function(){
            g.drawImage(img, 0, 0, thumb_width, thumb_height);
            
            db.thumbs[index].thumb = canvas.toDataURL();
            localStorage.setItem("thumbs", JSON.stringify(db.thumbs));
        }    
    }

    var dataurl2blob = function(uri){
        var data = uri.split(',')[1];
        var bytes = atob(data);
        var t = new Uint8Array(new ArrayBuffer(bytes.length));
        for (var i = 0; i < bytes.length; i++) {
            t[i] = bytes.charCodeAt(i);
        }

        var blob = new Blob([t], { type: uri.split(';')[0].slice(5) });
        return blob;
    };

    db.export = pics ? function(dataurl){
        window.gui.notification.show("exporting...", "cancel", "progress");
        var name = Date.now() + ".png";
        var blob = dataurl2blob(dataurl);
        var request = pics.addNamed(blob, name);
        
        request.onsuccess = function () {
            window.gui.notification.show("image succesfully exported to the gallery!", "ok");
        }

        request.onerror = function () {
            window.gui.notification.show("file could be not saved", "ok")
        }
    } : function(dataurl){
        window.location = dataurl;
    };

    return db;
})();