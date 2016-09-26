function speedoflight() {
	 //holdervariables
	var renderer, scene, camera, controls, effectFXAA, composer, containerElement, containerWidth, containerHeight;
	
	//animationvariables
	var nEnd = 0, nMax, nStep;
	
	//statusvariables
	var drawn = false;
	
	//groupvariables
	var meshes = [];
	
	//configvariables
	var debug = false;
	
	this.init = function(container) {
		containerElement = document.getElementById(container);
		
		setCanvasSize();
		
		renderer = new THREE.WebGLRenderer({
			preserveDrawingBuffer: true 
		});
		renderer.setClearColor(0x000000); //BG-Color
		renderer.setPixelRatio(window.devicePixelRatio);
		
		renderer.autoClear = false;
		
		renderer.setSize(containerWidth, containerHeight);
		
		containerElement.appendChild(renderer.domElement);
		
		scene = new THREE.Scene();
	}
	
	this.redraw = function () {
		drawn = false;
		nEnd = 0;
	}
	
	this.setMeshColor = function (hue, saturation, lightness) {
		for (var i = 0; i < meshes.length; i++) {
			meshes[i].material.color.setHSL(hue, saturation, lightness);
		}
	}
	
	this.getCameraPosition = function() {
		return camera.position;
	}
	
	this.setCameraPosition = function (x, y, z) {
		camera.position.set(x, y, z);
	}
	
	this.getCameraRotation = function() {
		return camera.rotation;
	}
	
	this.setCameraRotation = function (x, y, z) {
		camera.rotation.set(x, y, z);
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
					containerWidth / containerHeight, // Aspect ratio
					1, //Near
					1000 //Far
				);
			//End - define the cameraperspective
			
			//Start - calculate the cameraposition
				var smallestCoordinate = getSmallestCoordinate(centerX,centerY,centerZ);
				this.setCameraPosition(
					centerX-((smallestCoordinate == 'x') ? geometries[0].boundingBox.max.x - geometries[0].boundingBox.min.x : 0),
					centerY-((smallestCoordinate == 'y') ? geometries[0].boundingBox.max.y - geometries[0].boundingBox.min.y : 0),
					centerZ-((smallestCoordinate == 'z') ? geometries[0].boundingBox.max.z - geometries[0].boundingBox.min.z : 0)
				);
				
				this.setCameraRotation(centerX, centerY, centerZ);
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
			
			var width = containerWidth || 2;
			var height = containerHeight || 2;
			
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
				var angle = Math.cos(30*Math.PI/180); //degrees in radians
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
				//todo: berechnung anhand smallestCoordinate
				var totalBrushes = brushes;
				for (var i = 1; i <= totalBrushes; i++) {
					//Start - define vectors
						points[i] = new Array();
						
						for (var j = 0; j < coordinateSets.length; j++) {
							x = coordinateSets[j]['x'] + Math.cos(((2*Math.PI)/totalBrushes)*i) * spaceBetweenLines;
							y = coordinateSets[j]['y'] + Math.sin(((2*Math.PI)/totalBrushes)*i) * spaceBetweenLines;
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
		}
		
		for (var i = 0; i < geometries.length; i++) {
			geometries[i] = new THREE.BufferGeometry().fromGeometry(geometries[i]);
		}
		
		//Start - define the material
			var material = new THREE.MeshBasicMaterial({
				color: 0xffffff, //Farbe der Linie
				side: THREE.DoubleSide
			});
		//End - define the material
		
		for (var i = 0; i < totalBrushes; i++) {
			meshes[i] = new THREE.Mesh(geometries[i], material);
			meshes[i].form = form; //necessary for the savingprocess
			scene.add(meshes[i]);
		}
		
		//Start - define animationsteps
			nStep = coordinateSets.length*3; // count faces * 3 vertices/face
			nMax = geometries[0].attributes.position.count;
			animate();
		//End - define animationsteps
	}
	
	var setCanvasSize = function() {
		containerWidth = containerElement.offsetWidth - 2; //2 is the border-width
		containerHeight = containerElement.offsetHeight - 2; //2 is the border-width
	}
	
	var drawLine = function(points) {
		var path = new THREE.CatmullRomCurve3(points);
		
		geometry = new THREE.TubeGeometry(
			path,
			100, //segments
			0.2, //radius 
			30,//radiusSegments
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
	
	this.save = function() {
		var result = new Object();
		
		//Start - save thumbnail
			result.image = renderer.domElement.toDataURL();
		//End - save thumbnail
		
		//Start - save cameraperspective
			result.camera = new Object();
			result.camera.position = new Object();
			result.camera.position.x = camera.position.x;
			result.camera.position.y = camera.position.y;
			result.camera.position.z = camera.position.z;
			result.camera.rotation = new Object();
			result.camera.rotation.x = camera.rotation.x;
			result.camera.rotation.y = camera.rotation.y;
			result.camera.rotation.z = camera.rotation.z;
		//End - save cameraperspective
		
		//Start - save geometrysettings
			result.geometry = new Object();
			result.geometry.colors = meshes[0].material.color.getHSL();
			result.geometry.form = meshes[0].form;
		//End - save geometrysettings
		
		return result;
	}
	
	var onWindowResize = function() {
		setCanvasSize();
		
		camera.aspect = containerWidth / containerHeight;
		camera.updateProjectionMatrix();
		
		renderer.setSize(containerWidth, containerHeight);
		
		effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / containerHeight);
		
		composer.reset();
	}
	
	window.addEventListener('resize', onWindowResize, false);
}