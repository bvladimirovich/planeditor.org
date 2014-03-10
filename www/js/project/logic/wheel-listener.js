// Функция обрабатывает движение колёсика, из-за чего меняется масштаб
// *Взята из интернета*
function WheelListener (obj) {
	var elem = obj.selector;
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
		obj.camera.setZoom((delta > 0) ? 1.1 : 0.9);
		obj.updateScene();
		e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	}
}