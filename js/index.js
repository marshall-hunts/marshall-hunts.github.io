//<link href="https://fonts.googleapis.com/css?family=Creepster" rel="stylesheet" type="text/css">
var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;
var game;
var player;
var mixer;
var die;
var run;
var jump;
var roll;
var completed = false
//var orbitControl;
var rollingGroundSphere;
var heroSphere;
var rollingSpeed=0.008;
var heroRollingSpeed;
var worldRadius=26;
var heroRadius=0.2;
var sphericalHelper;
var pathAngleValues;
var heroBaseY=1.8;
var bounceValue=0.1;
var gravity=0.005;
var leftLane=-1;
var rightLane=1;
var middleLane=0;
var currentLane;
var clock;
var jumping;
var treeReleaseInterval=0.5;
var lastTreeReleaseTime=0;
var treesInPath;
var treesPool;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var particles;
//var stats;
var distanceMeter;
var scoreText;
var score;
var hasCollided;
//GAME OVER CUSTOM ALERT FUNCTION
function customAlert(){
  this.render=function(dialog){
    var windH = window.innerHeight;
    var windW = window.innerWidth;
    var overlay = document.getElementById('overlay');
    var alertbox = document.getElementById('alertbox');
    
    overlay.style.display = "block";
    overlay.style.height = windH+"px";
    
      alertbox.style.left = (windW/2) - (550 * .5)+"px";
			alertbox.style.top = "100px";
			alertbox.style.display = "block";
    
      document.getElementById("alertheader").innerHTML = "Aknowledge this message";
			document.getElementById("alertbody").innerHTML = dialog;
			document.getElementById("alertfooter").innerHTML = "<input type='button' value='try again!!' onclick='alert(0)'>";
    
  }
  this.ok=function(){
    overlay.style.display = "none";
    alertbox.style.display = "none";
  }
}

var Alert = new customAlert();
///////////////score-board\\\\\\\\\\\\\\\\\\\\\\\
///////////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
init();

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}

function createScene(){
	hasCollided=false;
	score=0;
	treesInPath=[];
	treesPool=[];
	clock=new THREE.Clock();
	clock.start();
	heroRollingSpeed=(rollingSpeed*worldRadius/heroRadius)/5;
	sphericalHelper = new THREE.Spherical();
	pathAngleValues=[1.52,1.57,1.62];
    sceneWidth=window.innerWidth;
    sceneHeight=window.innerHeight;
    scene = new THREE.Scene();//the 3d scene
    scene.fog = new THREE.FogExp2( "white", 0.14 );
    camera = new THREE.PerspectiveCamera( 60, sceneWidth / sceneHeight, 0.1, 1000 );//perspective camera
    renderer = new THREE.WebGLRenderer();//renderer with transparent backdrop
    renderer.setClearColor("black", 1); 
    renderer.setSize( sceneWidth, sceneHeight );
    dom = document.getElementById('TutContainer');
	dom.appendChild(renderer.domElement);
	//stats = new Stats();
	//dom.appendChild(stats.dom);
	createTreesPool();
	addWorld();
	addHero();
	addLight();
	addExplosion();
	addMoon();
	camera.position.z = 6.5;
	camera.position.y = 2.5;
	/*orbitControl = new THREE.OrbitControls( camera, renderer.domElement );//helper to rotate around in scene
	orbitControl.addEventListener( 'change', render );
	orbitControl.noKeys = true;
	orbitControl.noPan = true;
	orbitControl.enableZoom = false;
	orbitControl.minPolarAngle = 1.1;
	orbitControl.maxPolarAngle = 1.1;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;
	*/
  ///create gate
  
  
	window.addEventListener('resize', onWindowResize, false);//resize callback

	document.onkeydown = handleKeyDown;
	
	scoreText = document.createElement('div');
	scoreText.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	scoreText.style.width = 100;
	scoreText.style.height = 100;
//	scoreText.style.backgroundColor = "blue";
	scoreText.innerHTML = "0";
  scoreText.style.display = "block";
	scoreText.style.top = 50 + 'px';
	scoreText.style.left = 10 + 'px';
 	scoreText.style.fontSize = "50px";
  scoreText.style.color = "red";
  scoreText.style.fontFamily = "Creepster";
	document.body.appendChild(scoreText);
  
  
  distanceMeter = document.createElement('div');
	distanceMeter.style.position = 'absolute';
	//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
	distanceMeter.style.width = 100;
	distanceMeter.style.height = 100;
//	scoreText.style.backgroundColor = "blue";
	distanceMeter.innerHTML = "0m";
  distanceMeter.style.display = "block";
	distanceMeter.style.top = 50 + 'px';
	distanceMeter.style.right = 10 + 'px';
 	distanceMeter.style.fontSize = "50px";
  distanceMeter.style.color = "grey";
  distanceMeter.style.fontFamily = "Creepster";
	document.body.appendChild(distanceMeter);
  
  var infoText = document.createElement('div');
	infoText.style.position = 'absolute';
	infoText.style.width = 100;
	infoText.style.height = 100;
	infoText.style.backgroundColor = "yellow";
	infoText.innerHTML = "UP - Jump, Left/Right - Move";
	infoText.style.top = 10 + 'px';
	infoText.style.left = 10 + 'px';
	document.body.appendChild(infoText);
}
function addMoon(){
  
  var geometry = new THREE.SphereGeometry( 30, 192, 192 );
var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
var moon = new THREE.Mesh( geometry, material );
scene.add( moon );
  
  moon.position.y = 200
  moon.position.z = -900
}
function addExplosion(){
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push( vertex );
	}
	var pMaterial = new THREE.ParticleBasicMaterial({
	  color: "red",
	  size: 0.2
	});
	particles = new THREE.Points( particleGeometry, pMaterial );
	scene.add( particles );
	particles.visible=false;
}
function createTreesPool(){
	var maxTreesInPool=10;
	var newTree;
  var newGate
	for(var i=0; i<maxTreesInPool;i++){
		newTree=createTree();
    newGate = createGate();
		treesPool.push(newTree);
    treesPool.push(newGate);
	}
}
function handleKeyDown(keyEvent){
	if(jumping)return;
	var validMove=true;
	if ( keyEvent.keyCode === 37) {//left
		if(currentLane==middleLane){
			currentLane=leftLane;
		}else if(currentLane==rightLane){
			currentLane=middleLane;
		}else{
			validMove=false;	
		}
	} else if ( keyEvent.keyCode === 39) {//right
		if(currentLane==middleLane){
			currentLane=rightLane;
		}else if(currentLane==leftLane){
			currentLane=middleLane;
		}else{
			validMove=false;	
		}
	}else{
		if ( keyEvent.keyCode === 38){//up, jump
			bounceValue=0.1;
			jumping=true;
      jump.play()
      run.stop()
      setTimeout(function(){
      jump.stop()
      run.play()
      },1000)
		}else if ( keyEvent.keyCode === 40){
      roll.play()
      run.stop()
      setTimeout(function(){
      roll.stop()
      run.play()
      },2300)
    }
		validMove=false;
	}
	//heroSphere.position.x=currentLane;
	if(validMove){
		jumping=true;
		bounceValue=0.06;
	}
}
var material = new THREE.MeshBasicMaterial({
  color: "gray",
                skinning: true
});

function addHero(){
		var loader = new THREE.JSONLoader();
				loader.load( 'https://cdn.rawgit.com/marshall-hunts/game-assets/master/alex-parkor.json', function ( geometry, materials ) {

			
						player = new THREE.SkinnedMesh( geometry, material );

						var s = THREE.Math.randFloat( 0.2, 0.2 );
						player.scale.set( s, s, s );
                  //mesh.rotation.y = THREE.Math.randFloat( -0.25, 0.25 );//
            console.log(player.scale)
						player.matrixAutoUpdate = true;
						player.updateMatrix();
            player.rotation.y = Math.PI;
						scene.add( player );
                  	console.log(geometry.animations.length)
                    mixer = new THREE.AnimationMixer( scene );
					run = mixer.clipAction( geometry.animations[1], player ).play()
          die = mixer.clipAction( geometry.animations[3], player )
                jump = mixer.clipAction( geometry.animations[2], player )
                roll = mixer.clipAction( geometry.animations[4], player )
          
                player.name = "lansmith"

	jumping=false;
	player.position.y=heroBaseY;
	player.position.z=4.8;
	currentLane=middleLane;
	player.position.x=currentLane;
  
				} );




}
function addWorld(){
	var sides=40;
	var tiers=40;
	var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
	var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xfffafa } )
	
	var vertexIndex;
	var vertexVector= new THREE.Vector3();
	var nextVertexVector= new THREE.Vector3();
	var firstVertexVector= new THREE.Vector3();
	var offset= new THREE.Vector3();
	var currentTier=1;
	var lerpValue=0.5;
	var heightValue;
	var maxHeight=0.07;
	for(var j=1;j<tiers-2;j++){
		currentTier=j;
		for(var i=0;i<sides;i++){
			vertexIndex=(currentTier*sides)+1;
			vertexVector=sphereGeometry.vertices[i+vertexIndex].clone();
			if(j%2!==0){
				if(i==0){
					firstVertexVector=vertexVector.clone();
				}
				nextVertexVector=sphereGeometry.vertices[i+vertexIndex+1].clone();
				if(i==sides-1){
					nextVertexVector=firstVertexVector;
				}
				lerpValue=(Math.random()*(0.75-0.25))+0.25;
				vertexVector.lerp(nextVertexVector,lerpValue);
			}
			heightValue=(Math.random()*maxHeight)-(maxHeight/2);
			offset=vertexVector.clone().normalize().multiplyScalar(heightValue);
			sphereGeometry.vertices[i+vertexIndex]=(vertexVector.add(offset));
		}
	}
	rollingGroundSphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow=false;
	rollingGroundSphere.rotation.z=-Math.PI/2;
	scene.add( rollingGroundSphere );
	rollingGroundSphere.position.y=-24;
	rollingGroundSphere.position.z=2;
	addWorldTrees();
}
function addLight(){
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa,0x000000, .9)
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight( 0xcdc1c5, 0.9);
	sun.position.set( 12,6,-7 );
	//sun.castShadow = true;
	scene.add(sun);
}
function addPathTree(){
	var options=[0,1,2];
	var lane= Math.floor(Math.random()*3);
	addTree(true,lane);
	options.splice(lane,1);
	if(Math.random()>0.5){
		lane= Math.floor(Math.random()*2);
		addTree(true,options[lane]);
	}
}
function addWorldTrees(){
	var numTrees=36;
	var gap=6.28/36;
	for(var i=0;i<numTrees;i++){
		addTree(false,i*gap, true);
		addTree(false,i*gap, false);
	}
}
function addTree(inPath, row, isLeft){
	var newTree;
	if(inPath){
		if(treesPool.length==0)return;
		newTree=treesPool.pop();
		newTree.visible=true;
		//console.log("add tree");
		treesInPath.push(newTree);
		sphericalHelper.set( worldRadius-0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x+4 );
	}else{
		newTree=createTree();
		var forestAreaAngle=0;//[1.52,1.57,1.62];
		if(isLeft){
			forestAreaAngle=1.68+Math.random()*0.1;
		}else{
			forestAreaAngle=1.46-Math.random()*0.1;
		}
		sphericalHelper.set( worldRadius-0.3, forestAreaAngle, row );
	}
	newTree.position.setFromSpherical( sphericalHelper );
	var rollingGroundVector=rollingGroundSphere.position.clone().normalize();
	var treeVector=newTree.position.clone().normalize();
	newTree.quaternion.setFromUnitVectors(treeVector,rollingGroundVector);
	newTree.rotation.x+=(Math.random()*(2*Math.PI/10))+-Math.PI/10;
	
	rollingGroundSphere.add(newTree);
}


function createTree(){
	     var tree = new THREE.Tree({
    generations : 4,        // # for branch' hierarchy
    length      : 4.0,      // length of root branch
    uvLength    : 16.0,     // uv.v ratio against geometry length (recommended is generations * length)
    radius      : 0.2,      // radius of root branch
    radiusSegments : 8,     // # of radius segments for each branch geometry
    heightSegments : 8      // # of height segments for each branch geometry
});

var geometry = THREE.TreeGeometry.build(tree);

var mesh = new THREE.Mesh(
    geometry, 
    new THREE.MeshBasicMaterial( {
			color: "brown"} )// set any material
);
mesh.scale.set(0.5, 0.5, 0.5)
mesh.visible = false
scene.add(mesh);

 
 // mesh.geometry.merge(gate, gate.matrix)
  /////\\\\\\
	return mesh;
}

function createGate(){
   //gate
   var loader = new THREE.TextureLoader();
    loader.crossOrigin = '*';
  //https://raw.githubusercontent.com/marshall-hunts/game-assets/master/PicsArt_11-12-04.48.39.png
  //https://raw.githubusercontent.com/marshall-hunts/game-assets/master/18337.gif
  
    var gateTexture = loader.load('https://rawcdn.githack.com/marshall-hunts/game-assets/master/PicsArt_11-12-04.48.39.png')

      var gatematerial1 = new THREE.MeshBasicMaterial( {
       // color: "green",
        color: "white",
        map: gateTexture,
        side:      THREE.DoubleSide
      });
  
   var gatematerial2 = new THREE.MeshBasicMaterial( {
       // color: "green",
        color: "white",
        map: loader.load('https://gitcdn.xyz/repo/marshall-hunts/game-assets/master/18337.gif'),
        side:      THREE.DoubleSide
      });
//////////
  
   var gategeometry = new THREE.PlaneGeometry( 5, 5, 32 );
      

      gategeometry.computeBoundingBox();
     
   
      
      
      var gate = new THREE.Mesh( gategeometry, gatematerial1);
      scene.add( gate );
     //cube.rotation.x = Math.PI/2
  /* (Math.round(Math.random() * 5) === 0) {
    gate.material = gatematerial2;
  }*/
      gate.material.transparent = true;
  gate.updateMatrix();
  gate.visible = false;
  return gate;
}

var health = 100; 
			scoreText.innerHTML=health.toString();
      
      var timer = 0
      var animationSpeed = 0
      var distanceCounter = 0
function update(){
	//stats.update();
  animationSpeed = clock.getDelta()
  if(mixer != undefined){
 mixer.update(Math.sin(animationSpeed))
 }
  
 
  //Game over!!!
  if(health < 0){
    distanceCounter = distanceCounter
    completed = true
     console.log("high score is "+localStorage.getItem("newscore"));
    
    distanceMeter.innerHTML = "completed distance: "+distanceCounter+"m"+"<br>highest distance: "+localStorage.getItem("newscore")+"m"
    //Alert.render('game over!!');
  }
  if(health <= 0){
  scoreText.textContent = "GAME OVER!!";
   
   if(distanceCounter > (localStorage.getItem("newscore"))){
     localStorage.setItem("newscore", distanceCounter)
    console.log("high score is "+localStorage.getItem("newscore"))
   }
    console.log("high score is "+localStorage.getItem("newscore"))
  
   // localStorage.removeItem("highscore")
  }
  /////
  if(player){
 var heroSphere = scene.getObjectByName("lansmith")
    //animate
    rollingGroundSphere.rotation.x += rollingSpeed;
   
    if(heroSphere.position.y<=heroBaseY){
    	jumping=false;
    	bounceValue=(Math.random()*0.04)+0.005;
    }
    heroSphere.position.y+=bounceValue;
    heroSphere.position.x=THREE.Math.lerp(heroSphere.position.x,currentLane, clock.getElapsedTime()/2.5);//clock.getElapsedTime());
    }
    bounceValue-=gravity;
    if(clock.getElapsedTime()>treeReleaseInterval){
    	clock.start();
    	addPathTree();
      if(completed === false){
         distanceCounter++;
      }
     
      distanceMeter.innerHTML = distanceCounter+"m"
    	if(!hasCollided){
			
		}
    }
    doTreeLogic();
    doExplosionLogic();
    render();
	game = requestAnimationFrame(update);//request next update
}
function doTreeLogic(){
	var oneTree;
	var treePos = new THREE.Vector3();
	var treesToRemove=[];
	treesInPath.forEach( function ( element, index ) {
		oneTree=treesInPath[ index ];
		treePos.setFromMatrixPosition( oneTree.matrixWorld );
		if(treePos.z>6 &&oneTree.visible){//gone out of our view zone
			treesToRemove.push(oneTree);
		}else{//check collision
    if(player){
			if(treePos.distanceTo(player.position)<=0.6){
				//console.log("hit");
        health -= 2;
				scoreText.innerHTML=health.toString();
        
        timer = 9000
     	die.play()
      run.stop()
      setTimeout(function(){
      die.stop()
      run.play()
      },1000)
      
				hasCollided=true;
				explode();
			}
      else{
     
     
      }
		}
    }
	});
	var fromWhere;
	treesToRemove.forEach( function ( element, index ) {
		oneTree=treesToRemove[ index ];
		fromWhere=treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere,1);
		treesPool.push(oneTree);
		oneTree.visible=false;
	//	console.log("remove tree");
	});
}
function doExplosionLogic(){
	
	if(!particles.visible)return;
	for (var i = 0; i < particleCount; i ++ ) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if(explosionPower>1.005){
		explosionPower-=0.001;
	}else{
		particles.visible=false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode(){
	particles.position.y=2;
	particles.position.z=4.8;
  if(player){
	particles.position.x=player.position.x;
  }
	for (var i = 0; i < particleCount; i ++ ) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2+Math.random() * 0.4;
		vertex.y = -0.2+Math.random() * 0.4 ;
		vertex.z = -0.2+Math.random() * 0.4;
		particleGeometry.vertices[i]=vertex;
	}
	explosionPower=1.07;
	particles.visible=true;
}
function render(){
    renderer.render(scene, camera);//draw
}
function gameOver () {
  cancelAnimationFrame(gameId);
 // window.clearInterval( powerupSpawnIntervalID );
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth/sceneHeight;
	camera.updateProjectionMatrix();
}
