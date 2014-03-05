<html>

<head>
<title>Editor</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<script src="js/other/glMatrix-0.9.5.min.js"></script>
<script src="js/other/jquery-2.0.3.min.js"></script>
<script src="js/project/struct.js"></script>
<script src="js/project/wgl.js"></script>
<script src="js/project/modules.js"></script>
<script src="js/project/main.js"></script>

<script id="shader-fs" type="x-shader/x-fragment">
    precision mediump float;
	uniform vec4 uColor;

    void main(void) {
        gl_FragColor = uColor;
    }
</script>

<script id="shader-vs" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;

    uniform mat4 uMMatrix;
    uniform mat4 uPVMatrix;

    void main(void) {
        gl_Position = uPVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    }
</script>

<script id="shader-fs-grid" type="x-shader/x-fragment">
    precision mediump float;
	uniform vec4 uColor;

    void main(void) {
        gl_FragColor = uColor;
    }
</script>

<script id="shader-vs-grid" type="x-shader/x-vertex">
    attribute vec3 aVertexPosition;

    uniform mat4 uMMatrix;
    uniform mat4 uPVMatrix;

    void main(void) {
        gl_Position = uPVMatrix * uMMatrix * vec4(aVertexPosition, 1.0);
    }
</script>

<script>
    function webGLStart() {
        var canvas = document.getElementById("canvas");
        initGL(canvas);
        initShaders();
        initBuffers();
		initBuffersGrid();
		initBuffersBorder();
		initScene(canvas);
		initNavigation();
		initMove();
    }
</script>
<style>
	.alignment-left{
		float: left;
	}
</style>
</head>
<body onload="webGLStart();">
    <div class='alignment-left'>
		<canvas id="canvas" style="border: none;" width="800" height="800"></canvas>
	</div>
	<div class='alignment-left' style='width:30px; height:500px;'></div>
	<div class='alignment-left'>
		<div>
			Информация: <br>
			ID: <input id='id' type='text' size='5'> <br>
			Type: <input id='type' type='text' size='5'> <br>
			Size: 
			[ 
			lx: <input id='lx' type='text' size='5'>
			ly: <input id='ly' type='text' size='5'>
			lz: <input id='lz' type='text' size='5'>
			] <br>
			Position: 
			[ 
			x: <input id='x' type='text' size='5'>
			y: <input id='y' type='text' size='5'>
			z: <input id='z' type='text' size='5'>
			]
			<br>
		</div>
		<div style='width:100%; height:30px;'></div>
		<div>
			<button id='saveProject'>Сохранить проект</button>
			<button id='openProject'>Открыть проект</button>
		</div>
		<div style='width:100%; height:30px;'></div>
		<div>
			<input type='checkbox' name='autosave'> Автосохранение
		</div>
		<div style='width:100%; height:30px;'></div>
		<div>
			<button id='upload'>Загрузить подложку</button>
		</div>
		<div style='width:100%; height:30px;'></div>
		<div>
			<button id='addFloor'>Добавить этаж</button> 
			<button id='removeFloor'>Удалить этаж</button>
		</div>
	</div>	
</body>

</html>
