/**
	Класс Camera.
	Устанавливает положение камеры.
	@param {number} zoom - приближение/отдаление,
					dx, dy - перемещение центра координатной оси,
					l, r, b, t - центр координатной системы.
	Входной параметр для setZoom() - коэффициент изменения приближения/отдаления.
	Входные параметры для setDxDz() - коэффициенты для изменения положения по осям.
	Метод update() возвращает параметры положения центра координатной системы.
*/
var Camera = function (obj) {
	this.zoom = obj.zoom;	// масштабирование
	this.dx = obj.dx;	// смещение по оси X
	this.dz = obj.dz;	// смещение по оси Y

	this.l = obj.left;	// левая граница камеры
	this.r = obj.right;	// правая граница камеры
	this.b = obj.bottom;	// нижняя граница камеры
	this.t = obj.top;	// верхняя граница камеры
};
Camera.prototype.setZoom = function (a) {	// установка масштабирования 
	this.zoom = Math.max(Math.min(this.zoom * a, 40.0), 1.0);
};
Camera.prototype.getZoom = function (a) {	// получение текущего масштаба
	return this.zoom;
};
Camera.prototype.setDxDz = function (a, b) {	// установка смещения по осям
	this.dx -= a;
	this.dz -= b;
};
Camera.prototype.get = function () {	// получение параметров камеры
	return {
		l: this.l*this.zoom + this.dx,
		r: this.r*this.zoom + this.dx,
		b: this.b*this.zoom + this.dz,
		t: this.t*this.zoom + this.dz
	}
};