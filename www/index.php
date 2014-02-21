<html>

<head>
<title>Editor</title>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<script src="js/other/glMatrix-0.9.5.min.js"></script>
<script src="js/other/jquery-2.0.3.min.js"></script>
<script src="js/project/struct.js"></script>
<script src="js/project/wgl.js"></script>
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

<script>
    function webGLStart() {
        var canvas = document.getElementById("canvas");
        initGL(canvas);
        initShaders();
        initBuffers();
		initBuffersBorder();
		initScene(canvas);
		initMove();
    }
</script>
<style>
	div{
		float: left;
	}
</style>
</head>
<body onload="webGLStart();">
    <div>
		<canvas id="canvas" style="border: none;" width="500" height="500"></canvas>
	</div>
	<div style='width:30px; height:500px;'></div>
	<div>
		lx: <input id='lx' type='text' size='5'>
		ly: <input id='ly' type='text' size='5'>
		lz: <input id='lz' type='text' size='5'>
		<br>
		<button id='addRoom'>Применить размеры</button>
	</div>
</body>

</html>
