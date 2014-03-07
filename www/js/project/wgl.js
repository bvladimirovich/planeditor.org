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
	
	for (var i in _global_.Building.getItem()){
		var item = _global_.Building.getItem(i);
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

// Глобальные переменные.
// Их необходимо спрятать в модуль.
// Так будет и удобнее, и безопаснее
var cameraControl;
var highlightedItems;
var highlightColor;
var graph;
function initScene(elem) {
	console.time('Время загрузки initScene()');
	
	// Установки холста по умолчанию
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	// Инициализация глобальных переменных
	// _global_ - префикс глобальных переменных
	// highlightedItems - выделенные элементы
	highlightedItems = new Set();
	// highlightColor - цвет выделения
	highlightColor = new Color();
	// cameraControl - управление камерой
	// Параметры по умолчанию
	cameraControl = new Camera({
		zoom: 10.0,
		dx: 0.0,
		dz: 0.0,
		left: -1.0,
		right: 1.0,
		bottom: -1.0,
		top: 1.0
	});
	// Building - объект класса Building / Здание
	// Хранит все объекты, отображаемые на холсте
	_global_.Building = new Building();
	
	// Переменная метода
	// Слушает нажатия клавиш, возвращает код клавиши
	var key = new Keyboard();
	
	// Запуск функций, которые выполняют работу с холстом
	// и объектами на нем
	WheelListener(elem);
	MouseListener(elem);
	
	// Первая отрисовка холста
	drawScene(cameraControl, highlightedItems, highlightColor);

	// *Возможно, стоит вынести эту функцию в отдельный файл
	// Функция обрабатывает движение колёсика, из-за чего меняется масштаб
	// *Взята из интернета*
	// Имеет один входной параметр - DOM объект, канвас,
	// но, думаю, следует убрать использование глобальных объектов
	// и вынести их во входные параметры
	function WheelListener (elem) {
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
	
	// *Возможно, и эту функцию стоит вынести в отдельный файл
	// Обрабатывает все возможные движения мыши на холсте
	// Из-за большого количества внутренних функций, 
	// имеет смысл вынести их за её пределы
	// Имеет один входной параметр - DOM объект, канвас,
	// но, думаю, следует убрать использование глобальных объектов
	// и вынести их во входные параметры
	function MouseListener(elem) {
		var selector = '#canvas';
		// jQuery-обработка событий
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
		
		// previousSettingsItem - хранит в себе параметры элемента до изменения.
		// *В этом классе нужно применить геттеры и сеттеры
		var previousSettingsItem = new OldItem();
		// Переменная глобальной области видимости
		// *Следует перенести ее объявление в начало
		graph = new Graph();
		
		// Метод, который занимается обработкой движений в области холста
		function Draggable() {
			// Локальные переменные метода
			// Выбранный элемент
			// *Используется во многих функциях метода,
			// возможно, есть смысл сделать его глобальным
			var	currentItem = undefined,
			// изменяемая сторона элемента
				sideChanges = undefined;
			
			// Логические операторы действий
			// Оператор разрешения перемещения камеры
			var moveCamera = false,
			// Оператор разрешения перемещения элемента
				moveItem = false,
			// Оператор разрешения изменения размеров элемента
				resizeItem = false;
			
			// Предыдущие координаты
			// камеры,
			var prevXd,
				prevZd,
			// элемента
				prevXm,
				prevZm; 
			
			// Коробка для хранения объектов, которые соединены с выбранным
			var boxItems = {};
			
			// Коды клавиш
			// *Возможно, нужно вынести этот объект за пределы метода в модуль
			var keyCode = {
				SHIFT: 16,
				CTRL: 17,
				ALT: 18,
				DELETE: 46
			};
			
			// Кодировки цветов для выделения (RGBA)
			// *Возможно, нужно вынести этот объект за пределы метода в модуль
			var color = {
				RED: [1.0, 0.0, 0.0, 1.0],
				TURQUOISE: [0.0, 1.0, 1.0, 1.0]
			};
			// Установка цвета выделения по умолчанию
			// *В этом классе нужно применить геттеры и сеттеры
			highlightColor.set(color.TURQUOISE);
			
			// Функция обработки нажатия кнопки мыши
			// ev - событие
			this.mousedown = function (ev) {
				// В первую очередь обрабатывается нажатие правой кнопки мыши
				// для изменения положения камеры
				var isRightButton = defineRightButton(ev);
				// Если нажата правая кнопка мыши
				// сохраняются координаты в момент нажатия
				// разрешается возможность изменения положения камеры
				// Если же нажата левая кнопка, то управление переходит дальше
				if (isRightButton) {
					prevXd = fs(ev, 'x');
					prevZd = gl.viewportHeight - fs(ev, 'z');
					moveCamera = true;
				} else {
					// Запоминается положение мыши в абсолютных координатах
					// *Используются только в этой функции
					var x = fs(ev, 'x')*(cameraControl.get().r-cameraControl.get().l)/gl.viewportWidth + cameraControl.get().l;
					var	z = (gl.viewportWidth-fs(ev, 'z'))*(cameraControl.get().b-cameraControl.get().t)/gl.viewportHeight - cameraControl.get().b;
					
					// Условие добавления новой комнаты
					// *Есть смысл упаковать это в функцию
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
						_global_.Building.addRoom(positionNewItem.x, positionNewItem.y, positionNewItem.z,
							sizeNewItem.lx, sizeNewItem.ly, sizeNewItem.lz);
					}
					
					// Получение объекта
					currentItem = findItem(x, z, _global_.Building.getItem());
					// Условия работы с объектом
					if (currentItem !== undefined) {
						// 
						isMoveItem();
						isResizeItem();
						// Запись исходного состояния объекта
						previousSettingsItem.setOldItem(currentItem);
						
						// !По какой-то причине с первого клика соседние элементы не определяются
						// Одна из возможных причин: переменная graph еще не заполнена, необходимо проверить.
						definingNeighbors(_global_.Building.getItem(), graph, currentItem, boxItems);
						console.warn(boxItems);
						// Массив выделенных элементов
						// Применяется для создания дверей между комнатами и выделения цветом
						var arrayItems = highlightedItems.valueOf();
						// Обработка клавиши SHIFT
						if (key.getKeyCode() == keyCode.SHIFT) {
							// При этом, если ещё нет выделенных элементов, то ни чего не произойдёт
							if (arrayItems.length == 0) return;
							// Перемещение элемента и изменение размеров блокируется
							moveItem = false;
							resizeItem = false;
							// Получение из выделенных первого
							var previousItem = _global_.Building.getItem(arrayItems[0]);
							// Все элементы на холсте
							var allItems = _global_.Building.getItem();
							// Получение пространства между комнатами
							// *Возможно, применение геттеров и сеттеров упростит запись и сделает ее красивее
							var spaceBetweenRooms = new Section().get(previousItem, currentItem, allItems);
							
							// *Это условие нужно исправить - избавиться от вложенности
							if (spaceBetweenRooms !== undefined) {
								var MIN_SIZE_SPACE = {
									x: 0.5, y: 0.5, z: 0.5
								};
								var MAX_SIZE_SPACE = {
									x: 3.0, y: 3.0, z: 3.0
								};
								// Сообщение о выполнении условий
								// *Все подобные сообщения стоит упорядочить,
								// возможно в таблицу
								var responseMessage = 'success';
								// Ограничение размеров двери при создании
								// *Пересмотреть с целью переработки цикла
								for (var i in spaceBetweenRooms.distance) {
									if (spaceBetweenRooms['l'+i] < MIN_SIZE_SPACE[i]) {
										responseMessage = 'Fail. Размер двери не соответствует требованиям. l' + i + ' меньше '+ MIN_SIZE_SPACE[i];
										break;
									} else if (spaceBetweenRooms.distance[i] >= MAX_SIZE_SPACE[i]) {
										responseMessage = 'Fail. Размер двери не соответствует требованиям. Расстояние между комнатами больше '+ MAX_SIZE_SPACE[i];
										break;
									}
								}
								// Обработка удовлетворения условиям
								if (responseMessage === 'success') {
									// И создание двери между выбранными комнатами
									var door = _global_.Building.addDoor(previousItem, currentItem);
									// Выделение цветом новой двери в связке с комнатами
									highlightedItems.add(door.id);
									// Добавление ребра (двери) между узлами (комнатами) в граф
									graph.add(door.id, previousItem.id, currentItem.id);
								} else {
									// Если не выполнены условия при создании двери,
									// список выделенных элементов чистится,
									// а в консоль выводятся сведения об ошибке
									highlightedItems.clear();
									console.error(responseMessage);
								}
								// Помимо всего выделяется последний выбранный элемент
								highlightedItems.add(currentItem.id);
							}
						// Обработка клавиши ALT для прилипания комнат
						} else if (key.getKeyCode() == keyCode.ALT){
							// Какой-то код
						// Действия в случае отсутствия нажатых клавиш
						} else {
							// Чистка списка выделенных элементов
							// при выборе нового
							if (arrayItems.length > 0) {
								highlightedItems.clear();
							}
							
							highlightedItems.add(currentItem.id);
							// Выделение графа
							selectedGraph(currentItem, graph);
							// Отображение параметров выбранного элемента в HTML форме
							showParameters(currentItem);
						}
					} else {
						// При нажатии на пустое место холста
						// очистка списка выделенных элементов
						highlightedItems.clear();
					}
					// Обновление (перерисовка) холста в любом случае
					drawScene(cameraControl, highlightedItems, highlightColor);
					
					// *Переименовать!
					function isMoveItem () {
						moveItem = true;
						prevXm = x - currentItem.x; // координаты мышки на элементе
						prevZm = z - currentItem.z;
					}
					
					function isResizeItem () {
						var side = findBorder(x, z, _global_.Building.getItem(currentItem.id), cameraControl.getZoom());
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
					var ERROR = _global_.Building.updateItem(currentItem);
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
							if (!(dlx > minSize.lx)) break;
							
							if (currentItem.type == 'door') {
								var door = currentItem;
								var nodes = graph.getNode(door.id);
								
								var firstNode = _global_.Building.getItem(nodes[0]);
								var secondNode = _global_.Building.getItem(nodes[1]);
								
								var dx = firstNode.center.x - secondNode.center.x;
								if (dx > (firstNode.lx/2 + secondNode.lx/2)) break;
								
								// код ниже не работает
								// --- start ---
								var marginalPosition = Math.max(firstNode.x, secondNode.x);
								console.log(currentItem.x, marginalPosition);
								if (currentItem.x < marginalPosition) {
									break;
								}
								// --- end ---
							}
							
							changeCurrentItem(currentItem, {x: x, lx: dlx});
							
							if (!IsSimpleItem(currentItem, graph)) {
								if (boxItems.LEFT === undefined) break;
								
								var local = {};
								for (var i = boxItems.LEFT.length; --i >= 0;) {
									local.door = _global_.Building.getItem(boxItems.LEFT[i]);
									local.door.x1 = x;
									local.door.lx = local.door.x1 - local.door.x;
									_global_.Building.updateItem(local.door);
									
									// если вместо return стоит break, то условие не работает
									if (!(local.door.lx > minSize.lx)) return;
								}
							}
							break;
						case 'right': // изменяем размер вправо
							dlx = currentItem.lx + (x - currentItem.x1);
							if (!(dlx > minSize.lx)) break;

							if (IsSimpleItem(currentItem, graph)) {
								changeCurrentItem(currentItem, {x1: x, lx: dlx});
							} else {
								if (currentItem.type == 'room') {
									if (boxItems.RIGHT !== undefined) {
										changeCurrentItem(currentItem, {x1: x, lx: dlx});
										
										for (var i = boxItems.RIGHT.length; --i >= 0;) {
											var m_door = _global_.Building.getItem(boxItems.RIGHT[i]);
											// если поменять строчки 1 и 2 местами
											// не будет работать изменение размера зависимого объекта
											m_door.lx = m_door.lx + (m_door.x - x);	// 1
											m_door.x = x;							// 2
											_global_.Building.updateItem(m_door);
											
											if (!(m_door.lx > minSize.lx)) return;
										}
									} else {
										changeCurrentItem(currentItem, {x1: x, lx: dlx});
									}
								} else if (currentItem.type == 'door') {								
									// делать что-то, если выбрана дверь
								}
							}

							break;
						case 'top': // изменяем размер вверх
							dlz = currentItem.lz + (currentItem.z - z);
							if (!(dlz > minSize.lz)) break;

							if (currentItem.type == 'door') {
								var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, _global_.Building);
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
							break;
						case 'bottom': // изменяем размер вниз
							dlz = currentItem.lz + (z - currentItem.z1);
							if (!(dlz > minSize.lz)) break;

							if (currentItem.type == 'door') {
								var borderDoor = getSpaceBetweenRooms(currentItem.id, graph, _global_.Building);
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
							break;
						case 'topLeft':
							dlx = currentItem.lx + (currentItem.x - x);
							dlz = currentItem.lz + (currentItem.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type == 'door') return;
								
								currentItem.lx = dlx;
								currentItem.lz = dlz;
								currentItem.x = x;
								currentItem.z = z;
							}
							break;
						case 'bottomLeft':
							dlx = currentItem.lx + (currentItem.x - x);
							dlz = currentItem.lz + (z - currentItem.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type == 'door') return;
								
								currentItem.lx = dlx;
								currentItem.lz = dlz;
								currentItem.x = x;
								currentItem.z1 = z;
							}
							break;
						case 'topRight':
							dlx = currentItem.lx + (x - currentItem.x1);
							dlz = currentItem.lz + (currentItem.z - z);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type == 'door') return;
								
								currentItem.lx = dlx;
								currentItem.lz = dlz;
								currentItem.x1 = x;
								currentItem.z = z;
							}
							break;
						case 'bottomRight':
							dlx = currentItem.lx + (x - currentItem.x1);
							dlz = currentItem.lz + (z - currentItem.z1);
							if (dlx > minSize.lx && dlz > minSize.lz) {
								if (currentItem.type == 'door') return;
								
								currentItem.lx = dlx;
								currentItem.lz = dlz;
								currentItem.x1 = x;
								currentItem.z1 = z;
							}
							break;
						default:
							console.log('Непонятки');
							break;
					}
					var ERROR = _global_.Building.updateItem(currentItem);
					if (ERROR) {
						highlightColor.set(color.RED);
					} else {
						highlightColor.set(color.TURQUOISE);
					}
					drawScene(cameraControl, highlightedItems, highlightColor);
				} else {
					if (highlightedItems.valueOf().length > 0 && key.getKeyCode() === undefined) {
						currentItem = findItem(x, z, _global_.Building.getItem());
						if (currentItem !== undefined) {
							if (highlightedItems.has(currentItem.id)) {
								findBorder(x, z, currentItem, cameraControl.getZoom());
							}
						} else {
							findBorder(x, z, _global_.Building.getItem(highlightedItems.valueOf()[0]), cameraControl.getZoom());
						}
					}
				}
				
				if (moveItem || resizeItem) {
					showParameters(currentItem);
				}
				
				function changeCurrentItem(currentItem, obj) {
					for (var i in obj) {
						currentItem[i] = obj[i];
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
						var deletedItem = _global_.Building.removeItem(currentItem.id);
						if (graph.remove(currentItem.id)) {
							console.info('Удален элеменет "' + deletedItem.type + '"', deletedItem);
						}
					}
				}
				
				drawScene(cameraControl, highlightedItems, highlightColor);
				
				//var str = JSON.stringify(_global_.Building.getItem(), "", 4);
				//console.log(str);
				
				function returnPreviousValue () {
					var ERROR = _global_.Building.updateItem(currentItem);
					if (ERROR) {
						_global_.Building.updateItem(previousSettingsItem.getOldItem());
						highlightColor.set(color.TURQUOISE);
					}
				}
			}
		}
		
		function showParameters(currentItem) {
			$('#id').val(currentItem.id);
			$('#type').val(currentItem.type);
			$('#lx').val(currentItem.lx.toFixed(2));
			$('#ly').val(currentItem.ly.toFixed(2));
			$('#lz').val(currentItem.lz.toFixed(2));
			$('#x').val(currentItem.x.toFixed(2));
			$('#y').val(currentItem.y.toFixed(2));
			$('#z').val(currentItem.z.toFixed(2));
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
		
		function getSpaceBetweenRooms(itemId, graph, building) {
			var e = graph.getNode(itemId);
			var item0 = building.getItem(e[0]);
			var item1 = building.getItem(e[1]);
			var borderDoor = new Section().get(item0, item1, building.getItem());
			return borderDoor;
		}
		
		function definingNeighbors(building, graph, currentItem, boxItems) {
			var nodesOfGraphTotal = graph.getGraph(currentItem.id).length;
			if (nodesOfGraphTotal > 1) {
				if (currentItem.type !== 'room') return
				var arrDoorsId = graph.getEdge(currentItem.id);
				var doorsOfRoomTotal = arrDoorsId.length;
				
				var boxLeftItems = new Set();
				var boxRightItems = new Set();
				var boxTopItems = new Set();
				var boxButtomItems = new Set();

				for (var i = doorsOfRoomTotal; --i >= 0;) {
					var door = _global_.Building.getItem(arrDoorsId[i]);
					currentItem.center = {
						x: currentItem.x + currentItem.lx/2.0,
						y: currentItem.y + currentItem.ly/2.0,
						z: currentItem.z + currentItem.lz/2.0
					};
					door.center = {
						x: door.x + door.lx/2.0,
						y: door.y + door.ly/2.0,
						z: door.z + door.lz/2.0
					};
					
					var dx = currentItem.center.x - door.center.x,	// расстояние между центрами
						dy = currentItem.center.y - door.center.y,	// элементов
						dz = currentItem.center.z - door.center.z;

					if (dx < 0) {
						if (currentItem.x1 == door.x) {
							boxRightItems.add(door.id);
							boxItems.RIGHT = boxRightItems.valueOf();
						}
					} else if (dx > 0) {
						if (currentItem.x == door.x1) {
							boxLeftItems.add(door.id);
							boxItems.LEFT = boxLeftItems.valueOf();
						}
					}
					
					if (dz < 0) {
						if (currentItem.z1 == door.z) {
							boxButtomItems.add(door.id);
							boxItems.BOTTOM = boxButtomItems.valueOf();
						}
					} else if (dz > 0) {
						if (currentItem.z == door.z1) {
							boxTopItems.add(door.id);
							boxItems.TOP = boxTopItems.valueOf();
						}
					}
					
				}
			}
		}
	}
	console.timeEnd('Время загрузки initScene()');
}

function initNavigation() {
	$('#saveProject').click(function () {
		var objForSave = {};
		for (var item in _global_.Building.getItem()) {
			var graphForSave = graph.getGraph(item);
			if (graphForSave.length < 2) continue;
			
			for (var node = graphForSave.length; --node >= 0;) {
				var arrEdges = graph.getEdge(graphForSave[node])
				for (var j = arrEdges.length; --j >=0;) {
					var edge = arrEdges[j];
					objForSave[edge] = graph.getNode(edge);
				}
			}		
		}
		
		$.ajax({
			url: 'cgi-php/saveProject.php',
			type: 'post',
			data: {
				build: _global_.Building.getItem(),
				graph: objForSave,
			},
			success: function (data, code) {
				console.info(code); // запрос успешно прошёл
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				console.error('Критическая ошибка', str);
			}
		});
	});
	
	$('#openProject').click(function () {
		$.ajax({
			url: 'cgi-php/openProjectBuild.php',
			type: 'post',
			dataType: 'json',
			success: function (response, code) {
				_global_.Building.readBuildingFromFile(response);
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				 console.error('Критическая ошибка', str); 
			}
		});
		
		$.ajax({
			url: 'cgi-php/openProjectGraph.php',
			type: 'post',
			dataType: 'json',
			success: function (response, code) {
				graph.readGraphsFromFile(response);
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				 console.error('Критическая ошибка', str); 
			}
		});
	});
}
