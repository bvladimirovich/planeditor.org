/** Прослушивание нажатий клавиш */
var Keyboard = function () {
	window.addEventListener('keydown', function (e) {	// определение нажатие клавиши
		Keyboard.key = e.keyCode;	// сохранение кода нажатой клавиши
	}, false);
	window.addEventListener('keyup', function (e) {	// определения поднятия клавиши
		Keyboard.key = undefined;	// удаление ранее записанных данных
	}, false);
};
Keyboard.prototype.getKeyCode = function () {	// получение кода клавиши
	return Keyboard.key; // возвращает код клавиши или undefined
};