function speedoflight() {
	 //holdervariables:
	var renderer, scene, camera, controls;
	
	//animationvariables:
	var nEnd = 0, nMax, nStep;
	
	//statusvariables:
	var drawn = false, isRecording = false;
	
	//groupvariables
	var meshes = [];
	
	//configvariables
	var debug = false;
	
	var effectFXAA;
	var composer;
	
	
	this.init = function() {
		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor(0x000000); //BG-Color
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.autoClear = false;
		document.body.appendChild(renderer.domElement);
		
		scene = new THREE.Scene();
	}
	
	this.setMeshColor = function (hue, saturation, lightness) {
		for (var i = 0; i < meshes.length; i++) {
			meshes[i].material.color.setHSL(hue, saturation, lightness);
		}
	}
	
	this.drawForm = function(coordinateSets, form, brushes, spaceBetweenLines) {
		//Start - remove all forms before drawing a new one
			for (var i = 0; i < meshes.length; i++) {
				scene.remove(meshes[i]);
			}
		//End - remove all forms before drawing a new one
		
		var points = [];
		var geometries = [];
		
		//Start - draw first line
			points[0] = new Array();
			
			//Start - define vectors
				for (var i = 0; i < coordinateSets.length; i++) {
					points[0].push(new THREE.Vector3(coordinateSets[i]['x'], coordinateSets[i]['y'], coordinateSets[i]['z']).multiplyScalar(3));
				}
			//End - define vectors
			
			geometries[0] = drawLine(points[0]);
		//End - draw first line
			
		//Start - calculate the boundingbox
			geometries[0].computeBoundingBox();
			
			centerX = ((geometries[0].boundingBox.max.x - geometries[0].boundingBox.min.x) / 2) + geometries[0].boundingBox.min.x;
			centerY = ((geometries[0].boundingBox.max.y - geometries[0].boundingBox.min.y) / 2) + geometries[0].boundingBox.min.y;
			centerZ = ((geometries[0].boundingBox.max.z - geometries[0].boundingBox.min.z) / 2) + geometries[0].boundingBox.min.z;
		//End - calculate the boundingbox
		
		//Start - align camera
			//Start - define the cameraperspective
				camera = new THREE.PerspectiveCamera(
					90, // Field of view
					window.innerWidth / window.innerHeight, // Aspect ratio
					1, //Near
					1000 //Far
				);
			//End - define the cameraperspective
			
			//Start - calculate the cameraposition
				var smallestCoordinate = getSmallestCoordinate(centerX,centerY,centerZ);
				
				camera.position.set(
					centerX-((smallestCoordinate == 'x') ? geometries[0].boundingBox.max.x - geometries[0].boundingBox.min.x : 0),
					centerY-((smallestCoordinate == 'y') ? geometries[0].boundingBox.max.y - geometries[0].boundingBox.min.y : 0),
					centerZ-((smallestCoordinate == 'z') ? geometries[0].boundingBox.max.z - geometries[0].boundingBox.min.z : 0)
				);
				
				camera.lookAt(new THREE.Vector3(centerX,centerY,centerZ));
			//End - calculate the cameraposition
			
			scene.add(camera);
		//End - align camera
			
		//Start - define the controls
			controls = new THREE.OrbitControls(camera, renderer.domElement);
			controls.minDistance = 1;
			controls.maxDistance = 500;
			controls.target.set(centerX, centerY, centerZ);
		//End - define the controls
		
		//Start - define the shaders
			var renderModel = new THREE.RenderPass(scene, camera);
			var effectBloom = new THREE.BloomPass(1.3); //glow-thickness
			var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
			
			effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
			
			var width = window.innerWidth || 2;
			var height = window.innerHeight || 2;
			
			effectFXAA.uniforms['resolution'].value.set(1 / width, 1 / height);
			
			effectCopy.renderToScreen = true;
			
			composer = new THREE.EffectComposer(renderer);
			
			composer.addPass(renderModel);
			composer.addPass(effectFXAA);
			composer.addPass(effectBloom);
			composer.addPass(effectCopy);
		//End - define the shaders
		
		//Start - debug helpers
			if (debug == true) {
				var ball = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
				var material = new THREE.MeshNormalMaterial();
				var cube = new THREE.Mesh(ball, material);
				cube.position.x = centerX;
				cube.position.y = centerY;
				cube.position.z = centerZ;
				scene.add(cube);
				
				scene.add(new THREE.CameraHelper(camera));
				scene.add(new THREE.AxisHelper(20));
			}
		//End - debug helpers
			
		switch (form) {
			case 'line':
				var totalBrushes = brushes;
				
				for (var i = 1; i < totalBrushes; i++) {
					//Start - define vectors
						points[i] = new Array();
						
						for (var j = 0; j < coordinateSets.length; j++) {
							points[i].push(new THREE.Vector3(
								coordinateSets[j]['x'] + ((smallestCoordinate == 'x') ? (i * spaceBetweenLines) : 0),
								coordinateSets[j]['y'] + ((smallestCoordinate == 'y') ? (i * spaceBetweenLines) : 0),
								coordinateSets[j]['z'] + ((smallestCoordinate == 'z') ? (i * spaceBetweenLines) : 0)
							).multiplyScalar(3));
						}
					//End - define vectors
					
					geometries[i] = drawLine(points[i]);
				}
			break;
			case 'triangle':
				//todo: berechnung anhand smallestCoordinate
				
				var totalBrushes = (brushes-1)*3;
				var angle = Math.cos(30*Math.PI/180); //30° in radians
				
				for (var i = 1; i < totalBrushes; i++) {
					if (i < brushes) {
						var counter = 0;
					} else {
						if (i <= ((brushes-1) * 2)) {
							counter++;
						} else {
							counter--;
						}
					}
					
					//Start - define vectors
						points[i] = new Array();
						
						for (var j = 0; j < coordinateSets.length; j++) {
							if (i < brushes) {
								x = coordinateSets[j]['x'] + (i * spaceBetweenLines);
								y = coordinateSets[j]['y'];
							} else {
								x = coordinateSets[j]['x'] + ((totalBrushes - i) / 2) * spaceBetweenLines;
								y = coordinateSets[j]['y'] + counter * angle * spaceBetweenLines;
							}
							
							points[i].push(new THREE.Vector3(
								x,
								y,
								coordinateSets[j]['z']
							).multiplyScalar(3));
						}
					//End - define vectors
					
					geometries[i] = drawLine(points[i]);
				}
			break;
			case 'circle':
				var totalBrushes = brushes;
			break;
		}
		
		for (var i = 0; i < geometries.length; i++) {
			geometries[i] = new THREE.BufferGeometry().fromGeometry(geometries[i]);
		}
		
		//Start - definition des materials
			var material = new THREE.MeshBasicMaterial({
				color: 0xffffff, //Farbe der Linie
				wireframe: false, //Gitterraster anzeigen?
				side: THREE.DoubleSide
			});
		//End - definition des materials
		
		for (var i = 0; i < totalBrushes; i++) {
			meshes[i] = new THREE.Mesh(geometries[i], material);
			scene.add(meshes[i]);
		}
		
		//Start - define animationsteps
			nStep = coordinateSets.length*3; // count faces * 3 vertices/face
			nMax = geometries[0].attributes.position.count;
			animate();
		//End - define animationsteps
	}
	
	var drawLine = function(points) {
		var path = new THREE.CatmullRomCurve3(points);
		
		geometry = new THREE.TubeGeometry(
			path,
			100, //segments (Qualität)
			0.2, //radius (Dicke)
			//Math.random(),
			30,//radiusSegments (anzahl Ecken)
			false
		);
		
		return geometry;
	}
	
	var getSmallestCoordinate = function (x, y, z) {
		var coordinates = {
			x: x,
			y: y,
			z: z
		};
		
		var sorted = Object.keys(coordinates).sort(function(keya, keyb) {
			return coordinates[keyb] - coordinates[keya];
		});
			
		return sorted[2];
	}
	
	var animate = function () {
		requestAnimationFrame(animate);
		
		if (!isRecording) {
			nEnd = (nEnd + nStep) % nMax;
			
			if (nEnd + nStep >= nMax) {
				drawn = true;
			}
			
			if (!drawn) {
				for (var i = 0; i < meshes.length; i++) {
					meshes[i].geometry.setDrawRange(0, nEnd);
				}
			}
			
			renderer.clear();
			composer.render();
		}
	}
	
	this.record = function() {
		console.log('recording start..');
		
		//Start - enable camerarotation
			controls.enabled = false;
			isRecording = true;
		//End - enable camerarotation
		
		nEnd = 0;
		
		var pictures = [];
		
		do {
			nEnd = (nEnd + nStep) % nMax;
			
			for (var i = 0; i < meshes.length; i++) {
				meshes[i].geometry.setDrawRange(0, nEnd);
			}
			
			renderer.clear();
			composer.render();
			
			imgData = renderer.domElement.toDataURL();
			pictures.push(imgData);
			
		} while(nEnd + nStep < nMax)
		
		//Start - save cameraposition
			console.log(camera.position.x);
			console.log(camera.position.y);
			console.log(camera.position.z);
			console.log(camera.rotation.x);
			console.log(camera.rotation.y);
			console.log(camera.rotation.z);
		//End - save cameraposition
		
		//Start - enable camerarotation
			isRecording = false;
			controls.enabled = true;
		//End - enable camerarotation
		
		console.log('recording stop..');
		//console.log(pictures);
	}
	
	var onWindowResize = function() {
		windowHalfX = window.innerWidth / 2;
		windowHalfY = window.innerHeight / 2;
		
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
		
		renderer.setSize( window.innerWidth, window.innerHeight );
		
		effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
		
		composer.reset();
	}
	
	window.addEventListener('resize', onWindowResize, false);
}