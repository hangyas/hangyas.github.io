var WIDTH = $(document).width()-10,
    HEIGHT = $(document).height()-100,
    $container = $('#container'),
    renderer = new THREE.WebGLRenderer(),
    projector,
    VIEW_ANGLE = 45,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000,
    DELTA = 500,
    camera = new THREE.PerspectiveCamera(  VIEW_ANGLE,
                                  ASPECT,
                                  NEAR,
                                  FAR  ),
    scene = new THREE.Scene(),
    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.8;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.8;

camera.position.z = 300;
renderer.setSize(WIDTH, HEIGHT);
$container.append(renderer.domElement);
projector = new THREE.Projector();

var SIZE = 20, //tile mérete
    fal = 20,  //legalasonyabb pont (mindig 0) és a talaj aljának távolsága

    mapMesh,
    waterMesh;

var tool = digg;

function getSavable(o){
    if ( Array.isArray(o) ){
        r = [];
        for (i in o)
            r[i] = getSavable(o[i]);
//        console.log(r);
        return r;
    
    }else if( !o.savableProps ){
        return o;

    }else{
    
        r = {};
        for (i in o.savableProps){
            r[o.savableProps[i]] = getSavable(o[o.savableProps[i]]); 
        }
        return r;

        return r;
    }
}

/*                      
 _|_|_|  _|_|      _|_|_|  _|_|_|    
 _|    _|    _|  _|    _|  _|    _|  
 _|    _|    _|  _|    _|  _|    _|  
 _|    _|    _|    _|_|_|  _|_|_|    
                           _|        
                           _|        */

var iranyok = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];

var map = {

    savableProps : ['SIZE', 'talaj', 'water', 'objects'],

    SIZE : 20,

    talaj : null,
    water : null,
    objects : [],

    load : function (obj) {
        for (i in obj)
            this[i] = obj[i];
    },

    thread : null,

    start : function (){
        clearInterval(this.thread);

        this.thread = setInterval(this.run, DELTA);
    },

    run : function (){
        map.foly();
        map._runObjects();
        redraw();
    },

    _runObjects : function () {
        for (i in this.objects){
            try{
                this.objects[i].run();
            }catch(e){

            }
        }
    },

    min : function (rmap) {
        rmap = rmap || this.talaj;
        var r = rmap[0][0];
        for (i in rmap)
            for (j in rmap[i])
                if (rmap[i][j] < r)
                    r = rmap[i][j];
        return r;
    },

    distanceMatrix : function(kx, ky, t) {
        if (typeof f !== "function")
            throw new TypeError("not a function (distanceMatrix)");

        var r = new Array(this.SIZE)
        for (i = 0; i<this.SIZE; i++){
            r[i] = new Array(this.SIZE);
            for (j = 0; j<this.SIZE; j++)
                r[i][j] = Infinity;
        }

        var q = [{x : kx, y : ky}];
        r[kx][ky] = 0;

        while (q.length){
            var a = q.shift()
            for (i in iranyok){
                x = a.x + iranyok[i].x;
                y = a.y + iranyok[i].y;

                if (x in r && y in r[x] && r[x][y] == Infinity && t(x, y)){
                    r[x][y] = r[a.x][a.y] + 1;
                    q.push({x:x, y:y});
                }
            }
        }

        return r;
    },

    /*
        === WATER ===
     */

    sumWater : function() {
        var o = 0
        for (var i=0; i < this.SIZE; i++)
            for (var j=0; j < this.SIZE; j++)
                o+=this.water[i][j];
        return o;
    },

    foly : function() {
        for (var i = this.SIZE-2; i >= 0; i--)
        for (var j = this.SIZE-2; j >= 0; j--){
            this.atfoly({x:i, y:j}, {x:i+1, y:j});
            this.atfoly({x:i, y:j}, {x:i, y:j+1});
        }

        this.atfoly({x:this.SIZE-1, y:this.SIZE-1}, {x:this.SIZE-2, y:this.SIZE-1});
        this.atfoly({x:this.SIZE-1, y:this.SIZE-1}, {x:this.SIZE-1, y:this.SIZE-2});
    },

    atfoly : function(a, b, re) {
        if(typeof re === 'undefined') re = true;

        if (this.water[a.x][a.y]
            && this.water[a.x][a.y] + this.talaj[a.x][a.y] > this.water[b.x][b.y] + this.talaj[b.x][b.y]){
            
            var at = (this.water[a.x][a.y] + this.talaj[a.x][a.y] + this.water[b.x][b.y] + this.talaj[b.x][b.y] )/2; 
            if (at - this.talaj[a.x][a.y] < 0){
                this.water[b.x][b.y] += this.water[a.x][a.y];
                this.water[a.x][a.y] = 0;
            }else if (this.water[b.x][b.y] < 0){
                this.water[a.x][a.y] += this.water[b.x][b.y];
                this.water[b.x][b.y] = 0;
            }else{
                this.water[a.x][a.y] = at - this.talaj[a.x][a.y];
                this.water[b.x][b.y] = at - this.talaj[b.x][b.y];
            }
        }

        if(re)
            this.atfoly(b, a, false);
    },

    savable : function () {
        r = {};
        for (i in this.savableProps){
            r[this.savableProps[i]] = this[this.savableProps[i]];
        }
        return r;
    }
}

function Source(x, y, heigh){
    this.x = x;
    this.y = y;
    this.heigh = heigh;

    this.savableProps = ['x', 'y', 'heigh'];

    this.run = function(){
        if (map.water[this.x][this.y] + map.talaj[this.x][this.y] < heigh)
            map.water[this.x][this.y] = heigh - map.talaj[this.x][this.y];
    }

    this.meshPos = function(){
        return new THREE.Vector3(this.x * SIZE, this.y * SIZE, this.heigh);
    }

    this.mesh = new THREE.Mesh(new THREE.SphereGeometry(5, 10, 10), alertMaterial);
    this.mesh.position = this.meshPos();
    scene.add(this.mesh);
}

/*                                                                     
   _|_|_|  _|_|_|      _|_|    _|_|_|    _|    _|  _|_|_|    _|_|_|  
 _|        _|    _|  _|    _|  _|    _|  _|    _|    _|    _|        
 _|  _|_|  _|_|_|    _|_|_|_|  _|_|_|    _|_|_|_|    _|    _|        
 _|    _|  _|    _|  _|    _|  _|        _|    _|    _|    _|        
   _|_|_|  _|    _|  _|    _|  _|        _|    _|  _|_|_|    _|_|_|  
                                                                     */

var alertMaterial = new THREE.MeshLambertMaterial({
    color: 0xff0000,
    opacity: 1,
    transparent: true
});

var waterMaterial = new THREE.MeshLambertMaterial({
    color: 0x1111ff,
    opacity: 0.5,
    transparent: true
});

var talajMaterial = new THREE.MeshLambertMaterial({
    color: 0x8DCF37,
});

var talajVerticeZ = function(x, y){
    return map.talaj[x][y];
};

var waterVerticeZ = function(x, y){
    return map.water[x][y] ? map.water[x][y] + map.talaj[x][y] : 0;
};

var makeTalajMesh = function(){
    var geom = new THREE.Geometry(); 

    for (i=0; i < map.SIZE; i++)
    for (j=0; j < map.SIZE; j++)
        geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3(i * SIZE, j * SIZE, talajVerticeZ(i, j))));

    for (i=0; i < map.SIZE - 1; i++)
    for (j=0; j < map.SIZE - 1; j++){
        var a = i * map.SIZE + j;

        geom.faces.push( new THREE.Face3(a+1, a, a+map.SIZE));
        geom.faces.push( new THREE.Face3(a+map.SIZE+1, a+1, a+map.SIZE));
    }

    //oldalak
    var list = new Array();
    for (i=0; i<map.SIZE; i++){
        list.push ( geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3(i * SIZE, 0, -fal))) - 1 );
        list.push ( geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3(0, i * SIZE, -fal))) - 1 );
        list.push ( geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3(i * SIZE, (map.SIZE-1)*SIZE, -fal))) - 1 );
        list.push ( geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3((map.SIZE-1)*SIZE , i * SIZE, -fal))) - 1 );
    }
    for (i=0; i<map.SIZE - 1; i++){
        var a = i * map.SIZE;
        var b = i * 4;
        var c = (i+1) * map.SIZE
        var d = map.SIZE * (map.SIZE-1) + i;
        geom.faces.push( new THREE.Face3(list[b], list[b+4], a));
        geom.faces.push( new THREE.Face3(list[b+4], a+map.SIZE, a));

        geom.faces.push( new THREE.Face3(list[b+1], i, list[b+5]));
        geom.faces.push( new THREE.Face3(list[b+5], i, i+1));

        geom.faces.push( new THREE.Face3(list[b+2], c-1, list[b+6]));
        geom.faces.push( new THREE.Face3(list[b+6], c-1, c+map.SIZE-1));

        geom.faces.push( new THREE.Face3(list[b+3], list[b+7], d));
        geom.faces.push( new THREE.Face3(list[b+7], d+1, d));
    }

    geom.computeFaceNormals();
    geom.dynamic = true;
    var object = new THREE.Mesh( geom, talajMaterial);
    object.dynamic = true;
    object.geometry.computeCentroids();

    return object;
};

var makeWaterMesh = function(){
    var geom = new THREE.Geometry();

    for (i=0; i < map.SIZE; i++)
    for (j=0; j < map.SIZE; j++)
        geom.vertices.push(new THREE.Vertex(
            new THREE.Vector3(i * SIZE, j * SIZE, waterVerticeZ(i, j))));

    for (i=0; i < map.SIZE-1; i++)
    for (j=0; j < map.SIZE-1; j++){
        var a = i * map.SIZE + j;

        geom.faces.push( new THREE.Face3(a+1, a, a+map.SIZE));
        geom.faces.push( new THREE.Face3(a+map.SIZE+1, a+1, a+map.SIZE));
    }

    geom.computeFaceNormals();
    geom.dynamic = true;
    var object = new THREE.Mesh(geom, waterMaterial);
    object.dynamic = true;

    return object;
};

redraw = function (){
    for (i=0; i < map.SIZE; i++)
    for (j=0; j < map.SIZE; j++){
        var a = i * map.SIZE + j;

        mapMesh.geometry.vertices[a].position.z = talajVerticeZ(i, j);
        waterMesh.geometry.vertices[a].position.z = waterVerticeZ(i, j);
    }

    mapMesh.geometry.computeCentroids();

    waterMesh.geometry.__dirtyVertices = true;
    waterMesh.geometry.__dirtyNormals = true;
    waterMesh.geometry.computeFaceNormals();
    mapMesh.geometry.__dirtyVertices = true;
    mapMesh.geometry.__dirtyNormals = true;
    mapMesh.geometry.computeFaceNormals();
};

var initScene = function () {
    mapMesh = makeTalajMesh();
    waterMesh = makeWaterMesh();

    scene.add(mapMesh);
    scene.add(waterMesh);
}

/*
                                                               _|                
   _|_|_|    _|_|    _|_|_|      _|_|    _|  _|_|    _|_|_|  _|_|_|_|    _|_|    
 _|    _|  _|_|_|_|  _|    _|  _|_|_|_|  _|_|      _|    _|    _|      _|_|_|_|  
 _|    _|  _|        _|    _|  _|        _|        _|    _|    _|      _|        
   _|_|_|    _|_|_|  _|    _|    _|_|_|  _|          _|_|_|      _|_|    _|_|_|  
       _|                                                                        
   _|_|                                                                          */

function generate(mapsize){
    mapsize = mapsize || map.SIZE;
    var r = new Array(mapsize);
    for (i=0; i<r.length; i++)
        r[i] = new Array(mapsize);
    
    r[0][0] = Math.random() * 20;
    for (i=1; i<r.length; i++){
        r[i][0] = r[i-1][0] + Math.random() * 20 - 10;
        r[0][i] = r[0][i-1] + Math.random() * 20 - 10;
    }
    for (i=1; i<r.length; i++)
        for (j=1; j<r[i].length; j++)
            r[i][j] = (r[i][j-1] + r[i-1][j]) / 2 + Math.random() * 20 - 10;
    
    var m = map.min(r);
    var ujszint = m < 0 ? -m : m ;
    for (i = 0; i<mapsize; i++)
        for (j = 0; j<mapsize; j++)
            r[i][j] += ujszint;
    
    return r;
}

function randomWater(mapsize){
    mapsize = mapsize || map.SIZE;
    var water = new Array(mapsize);
    for (var i = 0; i<mapsize; i++){
        water[i] = new Array(mapsize);
        for (var j = 0; j<mapsize; j++)
            water[i][j] = 0;
    }

    var w = Math.random() * 8 + 10,
        h = Math.random() * 8 + 10;
    for (var i = 10; i<15; i++)
        for (var j = 10; j<15; j++)
            water[i][j] = 50;

    return water;
}

/*                                             
   _|                          _|            
 _|_|_|_|    _|_|      _|_|    _|    _|_|_|  
   _|      _|    _|  _|    _|  _|  _|_|      
   _|      _|    _|  _|    _|  _|      _|_|  
     _|_|    _|_|      _|_|    _|  _|_|_|    */


var diggC = 5;
function digg (x, y){
  if (map.talaj[x][y] % diggC == 0){
    map.talaj[x][y] -= diggC;
  }else{
    map.talaj[x][y] -= map.talaj[x][y] % diggC;
  }
}

function build (x, y){
  if (map.talaj[x][y] % diggC == 0){
    map.talaj[x][y] += diggC;
  }else{
    map.talaj[x][y] += diggC - map.talaj[x][y] % diggC;
  }
}

function putSource (x, y) {
    map.objects.push(new Source(x, y, map.talaj[x][y] + 20));
}

$(renderer.domElement).click(function ( event ) {
    event.preventDefault();
    
    var posX = event.pageX - $(this).offset().left;
    var posY = event.pageY - $(this).offset().top;
    
    var vector = new THREE.Vector3(
        ( posX / WIDTH ) * 2 - 1,
      - ( posY / HEIGHT ) * 2 + 1,
       0.1
    );
    projector.unprojectVector( vector, controls.object );

    var ray = new THREE.Ray( controls.object.position, 
                             vector.subSelf( controls.object.position ).normalize() );

    var intersects = ray.intersectObjects( [mapMesh] );

    //for (i in intersects) {
    if (intersects.length){
      i = 0;
      var x = Math.round(intersects[ i ].point.x / SIZE);
      var y = Math.round(intersects[ i ].point.y / SIZE);
      
      tool(x, y);
      redraw();
    }
});

$('#napej').click(function(){
  if (activeLight == sunLight){
    scene.remove(sunLight);
    scene.add(moonLight);
    activeLight = moonLight;
  }else{
    scene.remove(moonLight);
    scene.add(sunLight);
    activeLight = sunLight;
  }
});
$('#digg').click(function(){
  tool = digg;
});
$('#build').click(function(){
  tool = build;
});

/*                                
   _|_|_|    _|_|    _|      _|  
 _|        _|    _|  _|_|  _|_|  
 _|        _|_|_|_|  _|  _|  _|  
 _|        _|    _|  _|      _|  
   _|_|_|  _|    _|  _|      _|  */

scene.add(camera);
var fel = map.SIZE / 2 * SIZE;
var cam = 0;
camera.position.x = fel;
camera.position.y = fel;
camera.position.z = 750;
camera.lookAt(new THREE.Vector3(fel, fel, 0));

var moonLight = new THREE.PointLight( 0x31719F );
moonLight.position.x = map.SIZE / 2 * SIZE;
moonLight.position.y = map.SIZE / 2 * SIZE;
moonLight.position.z = 150;
//scene.add(moonLight);

var sunLight = new THREE.PointLight( 0xFFFFFF );
sunLight.position.x = map.SIZE / 2 * SIZE;
sunLight.position.y = map.SIZE / 2 * SIZE;
sunLight.position.z =  175;
scene.add(sunLight);
var activeLight = sunLight;

renderer.render(scene, camera);

  controls.target = new THREE.Vector3(fel, fel, 0 );

function animate(){  
  controls.update( 1 );
  renderer.render(scene, camera);
}
setInterval(animate, 5);

/*
 _|_|_|  _|      _|  _|_|_|  _|_|_|_|_|  
   _|    _|_|    _|    _|        _|      
   _|    _|  _|  _|    _|        _|      
   _|    _|    _|_|    _|        _|      
 _|_|_|  _|      _|  _|_|_|      _|      */


map.load({talaj : generate(), water : randomWater()});
initScene();
map.start();