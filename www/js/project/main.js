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
	
	for (var i in building.getItem()){
		var item = building.getItem(i);
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
			gl.uniform4fv(shaderProgram.uColor, Color.val);
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
var cameraControl;
var highlightedItems;
var highlightColor;
var graph;
var key;
var building;
function initScene(elem) {
	console.time('Время загрузки initScene()');
	
	// Установки холста по умолчанию
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
	
	// Инициализация глобальных переменных
	
	// _global_ - префикс глобальных переменных
	// highlightedItems - выделенные элементы
	highlightedItems = new Set();
	
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
	building = new Building();
	
	// Объект класса Graph/Граф
	graph = new Graph();
	
	// Переменная метода
	// Слушает нажатия клавиш, возвращает код клавиши
	key = new Keyboard();

	var obj = {
		selector: elem,
		camera: cameraControl,
		highlightedItems: highlightedItems,
		highlightColor: Color.val,
		building: Building,
		key: key,
		graph: graph,
		updateScene: function () {
			drawScene(this.camera, this.highlightedItems, this.highlightColor);
		}
	}
	
	// Запуск функций, которые выполняют работу с холстом
	// и объектами на нем
	WheelListener(obj);
	MouseListener(obj.selector);
	
	// Первая отрисовка холста
	obj.updateScene();
	
	console.timeEnd('Время загрузки initScene()');
}

function initNavigation() {
	$('#saveProject').click(function () {
		var objForSave = {};
		for (var item in building.getItem()) {
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
				build: building.getItem(),
				graph: objForSave,
			},
			success: function (data, code) {
				console.info(code); // запрос успешно прошёл
				drawScene(cameraControl, highlightedItems, Color.val);
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
				building.readBuildingFromFile(response);
				drawScene(cameraControl, highlightedItems, Color.val);
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
				drawScene(cameraControl, highlightedItems, Color.val);
			},
			error: function(xhr, str) {
				 console.error('Критическая ошибка', str); 
			}
		});
	});
}
