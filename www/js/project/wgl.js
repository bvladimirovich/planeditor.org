var gl;
	
function initGL(canvas) {
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    gl = null;
    for (var i = 0; i < names.length; ++i) {
        try {
            gl = canvas.getContext(names[i]);
			gl.viewportWidth = canvas.width;
			gl.viewportHeight = canvas.height;
        } catch(e) {}
        if (gl) {
            break;
        }
    }
	if (!gl) {
		alert("Could not initialise WebGL, sorry :-(");
	}
}

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
	if (!shaderScript) {
		return null;
	}

	var str = "",
		k = shaderScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}

	var shader;
	if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
	} else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
	} else {
		return null;
	}

	gl.shaderSource(shader, str);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(gl.getShaderInfoLog(shader));
		return null;
	}

	return shader;
}

var shaderProgram;
var shaderProgramGrid;

function initShaders() {
	//shaderProgramGrid = setShaders('shader-fs-grid', 'shader-vs-grid');
	shaderProgram = setShaders('shader-fs', 'shader-vs');
	
	function setShaders(shaderFS, shaderVS) {
		var fragmentShader = getShader(gl, shaderFS);
		var vertexShader = getShader(gl, shaderVS);

		var locShaderProgram = gl.createProgram();
		gl.attachShader(locShaderProgram, vertexShader);
		gl.attachShader(locShaderProgram, fragmentShader);
		gl.linkProgram(locShaderProgram);

		if (!gl.getProgramParameter(locShaderProgram, gl.LINK_STATUS)) {
			alert("Could not initialise shaders");
		}

		gl.useProgram(locShaderProgram);

		locShaderProgram.vertexPositionAttribute = gl.getAttribLocation(locShaderProgram, "aVertexPosition");
		gl.enableVertexAttribArray(locShaderProgram.vertexPositionAttribute);

		locShaderProgram.pvMatrixUniform = gl.getUniformLocation(locShaderProgram, "uPVMatrix");
		locShaderProgram.mMatrixUniform = gl.getUniformLocation(locShaderProgram, "uMMatrix");
		locShaderProgram.uColor = gl.getUniformLocation(locShaderProgram, "uColor");
		
		return locShaderProgram;
	}
}

var mMatrix = mat4.create();
var pvMatrix = mat4.create();


var squareVertexPositionBuffer;
var borderVertexPositionBuffer;
var gridVertexPositionBuffer;

function initBuffers() {
	squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
	vertices = [
		 1.0, 0.0,  1.0,
		-1.0, 0.0,  1.0,
		 1.0, 0.0, -1.0,
		-1.0, 0.0, -1.0
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	squareVertexPositionBuffer.itemSize = 3;
	squareVertexPositionBuffer.numItems = 4;
}

function initBuffersBorder() {
	borderVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, borderVertexPositionBuffer);
	vertices = [
		 1.0, 0.0,  1.0,
		-1.0, 0.0,  1.0,
		-1.0, 0.0, -1.0,
		 1.0, 0.0, -1.0,
		 1.0, 0.0,  1.0,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	borderVertexPositionBuffer.itemSize = 3;
	borderVertexPositionBuffer.numItems = 5;
}

function initBuffersGrid() {
	var arr = [];
	for (var i = 0; i < 100; i++) {
		for (var j = 0; j < 2; j++) {
			arr.push(i, j);
		}
	}
	
	gridVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexPositionBuffer);
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
	gridVertexPositionBuffer.itemSize = 2;
	gridVertexPositionBuffer.numItems = arr.length/2;
}

function drawScene(cameraControl, highlightedItems, highlightColor) {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    mat4.ortho(cameraControl.get().l, cameraControl.get().r, cameraControl.get().b, cameraControl.get().t, 0.1, 100.0, pvMatrix);
	mat4.rotateX(pvMatrix, Math.PI/2.0);
	
	// mat4.identity(mMatrix);
	// gl.bindBuffer(gl.ARRAY_BUFFER, gridVertexPositionBuffer);
	// gl.vertexAttribPointer(shaderProgramGrid.vertexPositionAttribute, gridVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	// gl.uniformMatrix4fv(shaderProgramGrid.pvMatrixUniform, false, pvMatrix);
	// gl.uniformMatrix4fv(shaderProgramGrid.mMatrixUniform, false, mMatrix);
	// gl.uniform4fv(shaderProgramGrid.uColor, [1.0, 1.0, 1.0, 1.0]);
	// gl.drawArrays(gl.LINES, 0, gridVertexPositionBuffer.numItems);
	
	for (var i in build.getItem()){
		var item = build.getItem(i);
		if (item === undefined) continue;
		var	dx = item.x + item.lx * 0.5,
			dz = item.z + item.lz * 0.5,
			sx = item.lx * 0.5,
			sz = item.lz * 0.5;
		
		if (item.type == 'door') {
			var uColor = [1.0, 0.5, 0.0, 1.0];
		} else {
			var uColor = [1.0, 1.0, 0.7, 1.0];
		}
		
		mat4.identity(mMatrix);
		mat4.translate(mMatrix, [dx, -0.2, dz]);
		mat4.scale(mMatrix, [sx, 1.0, sz]);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
		gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
		gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
		gl.uniform4fv(shaderProgram.uColor, uColor);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
		
		
		
		if (highlightedItems.has(item.id)) {
			mat4.identity(mMatrix);
			mat4.translate(mMatrix, [dx, -0.1, dz]);
			mat4.scale(mMatrix, [sx, 1.0, sz]);
			
			gl.bindBuffer(gl.ARRAY_BUFFER, borderVertexPositionBuffer);
			gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, borderVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
			gl.uniformMatrix4fv(shaderProgram.pvMatrixUniform, false, pvMatrix);
			gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
			gl.uniform4fv(shaderProgram.uColor, highlightColor.get());
			gl.drawArrays(gl.LINE_STRIP, 0, borderVertexPositionBuffer.numItems);
		}
	}
}

/**
	initScene(elem) - Функция инициализации параметров сцены (рабочего пространства).
	Входной параметр elem - объект страницы над которым происходит изменение положения колёсика мыши.
	функция wheelListener() реализует приближение/отдаление сцены.
	функция dragRight() реализует перемещение сцены правой кнопкой мыши.
	Переменная cameraControl - объект класса Camera. При создании объекта 
устанавливаются начальные параметры смещения и приближения сцены.
	Функция drawScene(cameraControl) отрисовывает сцену. Входной параметр - объект класса Camera.
*/
var cameraControl;
var highlightedItems;
var highlightColor;
var build;
function initScene(elem) {
	console.time('Загрузка initScene()');
	
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	highlightedItems = new Set();
	highlightColor = new Color();
	cameraControl = new Camera({
		zoom: 10.0,
		dx: 0.0,
		dz: 0.0,
		left: -1.0,
		right: 1.0,
		bottom: -1.0,
		top: 1.0
	});
	
	build = new Building();
	build.addRoom(0.0,0.1,0.0, 0.6,1.0,0.6);
	build.addRoom(5.0,0.1,0.0, 0.6,1.0,0.6);
	build.addRoom(0.0,0.1,5.0, 2.0,1.0,2.0);
	build.addRoom(5.0,0.1,5.0, 2.0,1.0,2.0);
	
	var key = new Keyboard();
	
	wheelListener(elem);
	mouseListener(elem);
	
	drawScene(cameraControl, highlightedItems, highlightColor);

	function wheelListener (elem){
		if (elem.addEventListener) {
			if ('onwheel' in document) {
				elem.addEventListener("wheel", onWheel, false);
			} else if ('onmousewheel' in document) {
				elem.addEventListener("mousewheel", onWheel, false);
			} else {
				elem.addEventListener("MozMousePixelScroll", onWheel, false);
			}
		} else {
			elem.attachEvent("onmousewheel", onWheel);
		}

		function onWheel(e) {
			e = e || window.event;
			var delta = e.deltaY || e.detail || e.wheelDelta;
			cameraControl.setZoom((delta > 0) ? 1.1 : 0.9);
			drawScene(cameraControl, highlightedItems, highlightColor);
			e.preventDefault ? e.preventDefault() : (e.returnValue = false);
		}
	}
	
	function mouseListener(elem) {
		var selector = '#canvas';
		$(selector).on("mousedown", s);
		$(selector).on("mousemove", s);
		$(selector).on("mouseup", s);
		$(selector).on("contextmenu", function () {
			return false;
		});
		
		var tool = new Draggable();
		function s(e) {
			if (tool[e.type]) {
				tool[e.type](e);
			}
		}
		
		var previousSettingsItem = new OldItem();
		var graph = new Graph();

		function Draggable() {
			var	currentItem = undefined;
			
			var moveCamera = false,
				moveItem = false,
				resizeItem = false,
				sideChanges = undefined;
			
			var prevXd,
				prevZd,
				prevXm,
				prevZm; 
				
			var keyCode = {
				SHIFT: 16,
				CTRL: 17,
				ALT: 18,
				DELETE: 46
			};
				
			var color = {
				RED: [1.0, 0.0, 0.0, 1.0],
				TURQUOISE: [0.0, 1.0, 1.0, 1.0]
			};
			highlightColor.set(color.TURQUOISE);
			
			this.mousedown = function (ev) {
				var isRightButton = defineRightButton(ev);
				if (isRightButton) {
					prevXd = fs(ev, 'x');
					prevZd = gl.viewportHeight - fs(ev, 'z');
					moveCamera = true;
				} else {
					var x = fs(ev, 'x')*(cameraControl.get().r-cameraControl.get().l)/gl.viewportWidth + cameraControl.get().l;
					var	z = (gl.viewportWidth-fs(ev, 'z'))*(cameraControl.get().b-cameraControl.get().t)/gl.viewportHeight - cameraControl.get().b;
					
					if (key.getKeyCode() == keyCode.CTRL) {
						var sizeNewItem = {
							lx: 2.0,
							ly: 1.0,
							lz: 2.0
						};
						var positionNewItem = {
							x: x - sizeNewItem.lx / 2.0,
							y: 0.1,
							z: z - sizeNewItem.lz / 2.0
						};
						build.addRoom(positionNewItem.x, positionNewItem.y, positionNewItem.z,
							sizeNewItem.lx, sizeNewItem.ly, sizeNewItem.lz);
					}
					
					currentItem = findItem(x, z, build.getItem());
					
					if (currentItem !== undefined) {
						isMoveItem();
						isResizeItem();
						previousSettingsItem.setOldItem(currentItem);
						
						var arrayItems = highlightedItems.valueOf();
						if (key.getKeyCode() == keyCode.SHIFT) {
							if (arrayItems.length == 0) return;
							
							moveItem = false;
							resizeItem = false;
							
							var previousItem = build.getItem(arrayItems[0]);
							var allItems = build.getItem();
							var spaceBetweenRooms = new Section().get(previousItem, currentItem, allItems);
							
							if (spaceBetweenRooms !== undefined) {
								var MIN_SIZE_SPACE = {
									x: 0.5, y: 0.5, z: 0.5
								};
								var MAX_SIZE_SPACE = {
									x: 3.0, y: 3.0, z: 3.0
								};								
								var responseMessage = 'success';
								
								for (var i in spaceBetweenRooms.distance) {
									if (spaceBetweenRooms['l'+i] < MIN_SIZE_SPACE[i]) {
										responseMessage = 'Fail. Размер двери не соответствует требованиям. l' + i + ' меньше '+ MIN_SIZE_SPACE[i];
										break;
									} else if (spaceBetweenRooms.distance[i] >= MAX_SIZE_SPACE[i]) {
										responseMessage = 'Fail. Размер двери не соответствует требованиям. Расстояние между комнатами больше '+ MAX_SIZE_SPACE[i];
										break;
									}
								}
								if (responseMessage === 'success') {
									var door = build.addDoor(previousItem, currentItem);
									highlightedItems.add(door.id);
									graph.add(door.id, previousItem.id, currentItem.id);
								} else {
									highlightedItems.clear();
									console.error(responseMessage);
								}
								highlightedItems.add(currentItem.id);
							}
						} else if (key.getKeyCode() == keyCode.ALT){	// прилипание комнат

						} else {
							if (arrayItems.length > 0) {
								highlightedItems.clear();
							}

							highlightedItems.add(currentItem.id);							
							selectedGraph(currentItem, graph);
						}
					} else {
						highlightedItems.clear();
					}
					
					drawScene(cameraControl, highlightedItems, highlightColor);
					
					function isMoveItem () {
						moveItem = true;
						prevXm = x - currentItem.x; // координаты мышки на элементе
						prevZm = z - currentItem.z;
					}
					
					function isResizeItem () {
						var side = findBorder(x, z, build.getItem(currentItem.id), cameraControl.getZoom());
						if (side != undefined) {
							moveItem = false;
							resizeItem = true;
							sideChanges = side;
						}
					}
				
					function selectedGraph (currentItem, graph) {
						console.time('TimeWorkGraph');
						var currentItemID = currentItem.id;
						if (graph.isEdge(currentItemID)) {
							currentItemID = graph.getNode(currentItemID)[0];
						}
						var g = graph.getGraph(currentItemID);
						if (g.length > 1) {
							for (var i = g.length; --i >= 0;) {
								if (!highlightedItems.has(g[i])) {
									highlightedItems.add(g[i]);
								}
							}
							for (var i = g.length; --i >= 0;) {
								var e = graph.getEdge(g[i]);
								for (var j in e) {
									if (!highlightedItems.has(e[j])) {
										highlightedItems.add(e[j]);
									}
								}
							}
							moveItem = false;
						}
						console.timeEnd('TimeWorkGraph');
					}
				}
			}
			
			this.mousemove = function (ev) {
				var x = fs(ev, 'x')*(cameraControl.get().r-cameraControl.get().l)/gl.viewportWidth + cameraControl.get().l,
					z = (gl.viewportWidth-fs(ev, 'z'))*(cameraControl.get().b-cameraControl.get().t)/gl.viewportHeight - cameraControl.get().b;
					
				if (moveCamera){
					var k = gl.viewportWidth / (cameraControl.get().r - cameraControl.get().l),
						nX = fs(ev, 'x'),
						nZ = gl.viewportHeight - fs(ev, 'z');
						
					cameraControl.setDxDz((nX-prevXd)/k, (nZ-prevZd)/k);
					prevXd = nX;
					prevZd = nZ;
					drawScene(cameraControl, highlightedItems, highlightColor);
				} else if (moveItem) {
					currentItem.x = x - prevXm,
					currentItem.z = z - prevZm;
					var ERROR = build.updateItem(currentItem);
					if (ERROR) {
						highlightColor.set(color.RED);
					} else {
						highlightColor.set(color.TURQUOISE);
					}
					drawScene(cameraControl, highlightedItems, highlightColor);
				} else if (sideChanges) {
					var minSize = {
						lx: 0.6,
						lz: 0.6
					};
					var dlx, dlz;
					switch (sideChanges) {
						case 'left': // изменяем размер влево
							dlx = currentItem.lx + (currentItem.x - x);
							if (dlx > minSize.lx) {
								if (currentItem.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, build);
									if (borderDoor.distance.x == 0) {
										if (x > borderDoor.x) {
											currentItem.x = x;
											currentItem.lx = dlx;
										}
									}
								} else {
									currentItem.lx = dlx;
									currentItem.x = x;
								}
							}
							break;
						case 'right': // изменяем размер вправо
							dlx = currentItem.lx + (x - currentItem.x1);
							if (dlx > minSize.lx) {
								if (currentItem.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, build);
									if (borderDoor.distance.x == 0) {
										if (x < borderDoor.x + borderDoor.lx) {
											currentItem.lx = dlx;
											currentItem.x1 = x;
										}
									}
								} else {
									currentItem.lx = dlx;
									currentItem.x1 = x;
								}
							}
							break;
						case 'top': // изменяем размер вверх
							dlz = currentItem.lz + (currentItem.z - z);
							if (dlz > minSize.lz) {
								if (currentItem.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, build);
									if (borderDoor.distance.z == 0) {
										if (z > borderDoor.z) {
											currentItem.lz = dlz;
											currentItem.z = z;
										}
									}
								} else {
									currentItem.lz = dlz;
									currentItem.z = z;
								}
							}
							break;
						case 'bottom': // изменяем размер вниз
							dlz = currentItem.lz + (z - currentItem.z1);
							if (dlz > minSize.lz) {
								if (currentItem.type == 'door') {
									var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, build);
									if (borderDoor.distance.z == 0) {
										if (z < borderDoor.z + borderDoor.lz) {
											currentItem.lz = dlz;
											currentItem.z1 = z;
										}
									}
								} else {
									currentItem.lz = dlz;
									currentItem.z1 = z;
								}
							}
							break;
						case 'topLeft':
							dlx = currentItem.lx + (currentItem.x - x);
							dlz = currentItem.lz + (currentItem.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type != 'door') {
									currentItem.lx = dlx;
									currentItem.lz = dlz;
									currentItem.x = x;
									currentItem.z = z;
								}
							}
							break;
						case 'bottomLeft':
							dlx = currentItem.lx + (currentItem.x - x);
							dlz = currentItem.lz + (z - currentItem.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type != 'door') {
									currentItem.lx = dlx;
									currentItem.lz = dlz;
									currentItem.x = x;
									currentItem.z1 = z;
								}
							}
							break;
						case 'topRight':
							dlx = currentItem.lx + (x - currentItem.x1);
							dlz = currentItem.lz + (currentItem.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type != 'door') {
									currentItem.lx = dlx;
									currentItem.lz = dlz;
									currentItem.x1 = x;
									currentItem.z = z;
								}
							}
							break;
						case 'bottomRight':
							dlx = currentItem.lx + (x - currentItem.x1);
							dlz = currentItem.lz + (z - currentItem.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type != 'door') {
									currentItem.lx = dlx;
									currentItem.lz = dlz;
									currentItem.x1 = x;
									currentItem.z1 = z;
								}
							}
							break;
						default:
							console.log('Непонятки');
							break;
					}
					var ERROR = build.updateItem(currentItem);
					if (ERROR) {
						highlightColor.set(color.RED);
					} else {
						highlightColor.set(color.TURQUOISE);
					}
					drawScene(cameraControl, highlightedItems, highlightColor);
				} else {
					if (highlightedItems.valueOf().length > 0 && key.getKeyCode() === undefined) {
						currentItem = findItem(x, z, build.getItem());
						if (currentItem !== undefined) {
							if (highlightedItems.has(currentItem.id)) {
								findBorder(x, z, currentItem, cameraControl.getZoom());
							}
						} else {
							findBorder(x, z, build.getItem(highlightedItems.valueOf()[0]), cameraControl.getZoom());
						}
					}
				}
			}
			this.mouseup = function (ev) {
				if (moveCamera) {
					moveCamera = false;
				} else if (moveItem) {
					moveItem = false;
					returnPreviousValue();
				} else if (resizeItem) {
					resizeItem = false;
					sideChanges = undefined;
					returnPreviousValue();
				}
				
				if (key.getKeyCode() == keyCode.DELETE) {
					if (currentItem !== undefined) {
						var deletedItem = build.removeItem(currentItem.id);
						if (graph.remove(currentItem.id)) {
							console.info('Удален элеменет "' + deletedItem.type + '"', deletedItem);
						}
					}
				} 
				
				drawScene(cameraControl, highlightedItems, highlightColor);
				
				//var str = JSON.stringify(build.getItem(), "", 4);
				//console.log(str);
				
				function returnPreviousValue () {
					var ERROR = build.updateItem(currentItem);
					if (ERROR) {
						build.updateItem(previousSettingsItem.getOldItem());
						highlightColor.set(color.TURQUOISE);
					}
				}
			}
		}
			
		/* Функция определения координат мыши на холсте */
		// defineMousePosition
		function fs(ev, p) {
		  return (p=='x') ? ev.pageX-elem.offsetLeft : ev.pageY-elem.offsetTop;
		}
		/* Функция определения нажатой на мыши кнопки */
		function defineRightButton(e) {
			if (!e.which && e.button) { // если which нет, но есть button...
				if (e.button & 1) { 
					e.which = 1;        // левая кнопка
				} else if (e.button & 4) {
					e.which = 2; 		// средняя кнопка
				} else if (e.button & 2) {
					e.which = 3; 		// правая кнопка
				}
			}
			return e.which == 3 ? true : false;
		}
		
		/* Функция поиска элемента на холсте мышкой */
		function findItem(x, y, obj){
		  for (var i in obj){
			var e = obj[i];
			e.x1 = e.x + e.lx;
			e.z1 = e.z + e.lz;
			if ((x >= e.x && x <= e.x1) && (y >= e.z && y <= e.z1)) {
				return e;
			}
		  }
		  return undefined;
		}
		
		function findBorder(x, y, e, zoom) {
			if (e === undefined) return;
			var dx = (zoom <= 1.2) ? 0.04 : 0.18;
				
			e.x1 = e.x + e.lx;
			e.z1 = e.z + e.lz;
			if ((x < e.x+dx && x > e.x) && (y > e.z+dx && y < e.z1-dx)) {
				elem.style.cursor = 'w-resize';
				return 'left';
			} else if ((x > e.x1-dx && x < e.x1) && (y > e.z+dx && y < e.z1-dx)) {
				elem.style.cursor = 'w-resize';
				return 'right';
			} else if ((x > e.x+dx && x < e.x1-dx) && (y < e.z+dx && y > e.z)) {
				elem.style.cursor = 's-resize';
				return 'top';
			} else if ((x > e.x+dx && x < e.x1-dx) && (y > e.z1-dx && y < e.z1)) {
				elem.style.cursor = 's-resize';
				return 'bottom';
			} else if ((x < e.x+dx && x > e.x) && (y < e.z+dx && y > e.z)){
				elem.style.cursor = 'se-resize';
				return 'topLeft';
			} else if ((x < e.x+dx && x > e.x) && (y > e.z1-dx && y < e.z1)){
				elem.style.cursor = 'sw-resize';
				return 'bottomLeft';
			} else if ((y < e.z+dx && y > e.z) && (x > e.x1-dx && x < e.x1)){
				elem.style.cursor = 'sw-resize';
				return 'topRight';
			} else if ((y > e.z1-dx && y < e.z1) && (x > e.x1-dx && x < e.x1)){
				elem.style.cursor = 'se-resize';
				return 'bottomRight';
			} else {
				elem.style.cursor = 'default';
				return undefined;
			}
		}
		
		function getSpaceBetweenRooms(itemId, graph, build) {
			var e = graph.getNode(itemId);
			var item0 = build.getItem(e[0]);
			var item1 = build.getItem(e[1]);
			var borderDoor = new Section().get(item0, item1, build.getItem());
			return borderDoor;
		}
	}
	console.timeEnd('Загрузка initScene()');
}