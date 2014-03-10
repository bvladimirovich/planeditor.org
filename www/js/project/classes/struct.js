/**
	Функция определения пересечения элементов.
	Алгоритм работы:
	1. Вычисляются координаты центров входящих элементов
	2. Вычисляется расстояние между найденными центрами
	3. Инвертируется знак полученного значения расстояния между 
		центрами элементов
	4. Сравнивается расстояние между центрами элементов с суммой половин длин
		сторон по каждой из осей и возвращается результат.
*/
var isIntersects = function (a, b){
	a.center = {	// координаты центра элемента a
		x: a.x + a.lx/2.0,
		y: a.y + a.ly/2.0,
		z: a.z + a.lz/2.0
	};
	b.center = {	// координаты центра элемента b
		x: b.x + b.lx/2.0,
		y: b.y + b.ly/2.0,
		z: b.z + b.lz/2.0
	};
	
	var dx = a.center.x - b.center.x,	// расстояние между центрами
		dy = a.center.y - b.center.y,	// входящими элементов
		dz = a.center.z - b.center.z;
	
	if (dx < 0.0) dx *= -1.0;	// инвертирование знака значения расстояния
	if (dy < 0.0) dy *= -1.0;	// между центрами элементов
	if (dz < 0.0) dz *= -1.0;

	return	(dx < (a.lx/2.0 + b.lx/2.0)) &&		// определение пересечения
			(dy < (a.ly/2.0 + b.ly/2.0)) &&		// true - пересекается
			(dz < (a.lz/2.0 + b.lz/2.0));		// false - не пересекается
}

/** Перечисление сообщений при выполнении программы*/
var Message = {
	SUCCESS: [100, 'Completed successfully.'],		// все в порядке
	ERROR: {
		GENERAL: [200, 'General error.'],	// ошибка общего назначения
		TOUCH_LEMENTS: [201, 'There is no distance between the elements.'],	// ошибка расстояния между элементами
		OBSTACLE: [202, 'Between the elements is the obstacle.'], 	// ошибка препятствия между элементами
		INTERSECTION: [203, 'The selected items are not crossed.']	// ошибка отсутствия общей зоны элементов
	}
}

/**
 Класс 'Section'.
 Определяет общую часть скрещиваемых объектов.
 @param {Struct} a,b
 @param {array} arr - массив всех элементов
 @returns c - объект, по содержанию похож на экземпляр 'Struct'
*/
var Section = function () {};
Section.prototype.get = function(a, b, arr) {	// поиск общей зоны выделенных элементов
	var distanceBox = {		// объект хранящий информацию о расстоянии между выделенными элементами
		x: new Set(),		// сделано для предотвращения добавления дверей между элементами по диагонали
		y: new Set(),
		z: new Set()
	}
	
	var c = {	// задание значений по умолчанию для нового элемента 
		x:-1, y:-1, z:-1,
		lx:-1, ly:-1, lz:-1,
		info: Message.SUCCESS[0]
	};
	
	overlap(a, b, c);	// определение координат и размеров общей зоны
	for (var i in c) {
		if (c[i] == -1) {		// если остались не изменённые параметры,
			overlap(b, a, c);	// то запустить конструктор, поменяв местами входные данные
		}
	}
	
	var distance = 0.0;	// минимальное расстояние между комнатами
	if (c.lx <= distance || c.ly <= distance || c.lz <= distance) {
		c.info = Message.ERROR.TOUCH_LEMENTS[0];
	}

	for (var k in arr) {
		if (arr[k].id != a.id && arr[k].id != b.id) {	// исключение использования входных данных для определения пересечения
			if (isIntersects(c, arr[k])) {	// определения пересечения полученной области между элементами с другими элементами
				c.info = Message.ERROR.OBSTACLE[0];	// расстояние между элементами занято другим элементом
				c.intersectsID = arr[k].id;	// Возвращается идентификатор инородного элемента
			}
		}
	}
	
	var count = 0;
	for (var i in distanceBox) {
		if (distanceBox[i].valueOf().length > 1 || distanceBox[i].valueOf()[0] != 0) {	// проверка количества записей о расстояниях между 
																						// элементами и количеством этих элементов
			count++;
		}
	}
	if (count > 1) {
		c.info = Message.ERROR.INTERSECTION[0];	// Элементы не скрещиваются
	}
  
	/**
		Функция определения общего пространства между двумя элементами
		@param {Struct} a,b
		@returns {Object} c - с параметрами общей зоны
	*/
	function overlap(a,b,c){	
		a.x1 = a.x + a.lx;	// вычисление дальней координаты элемента a
		a.z1 = a.z + a.lz;
		a.y1 = a.y + a.ly;
		b.x1 = b.x + b.lx;	// вычисление дальней координаты элемента b
		b.z1 = b.z + b.lz;
		b.y1 = b.y + b.ly;
		
		c.distance = { 	// расстояние между элементами по оси
			x: 0, y: 0, z: 0	// после работы функции не равным нулю должен быть только один параметр
		};
		for (var m in c.distance) {
			if ( (a[m] <= b[m] && b[m] <= a[m+'1'] && b[m+'1'] >= a[m+'1']) || 
				(a[m] >= b[m] && b[m+'1'] <= a[m+'1'] && b[m+'1'] >= a[m]) || 
				(a[m] <= b[m] && a[m+'1'] >= b[m+'1']) || 
				(a[m] >= b[m] && a[m+'1'] <= b[m+'1']) ) {
				
				c[m] = Math.max(b[m], a[m]);
				c['l'+m] = Math.pow(Math.pow(Math.min(b[m+'1'], a[m+'1']) - c[m],2.0),0.5);
			} else {
				if (a[m+'1'] < b[m]) {
					c.distance[m] = c['l'+m] = Math.pow(Math.pow(b[m] - a[m+'1'],2.0),0.5);
					c[m] = a[m+'1'];
				}else if (a[m] < b[m+'1']) {
					c.distance[m] = c['l'+m] = Math.pow(Math.pow(a[m] - b[m+'1'],2.0),0.5);
					c[m] = b[m+'1'];
				}else if (a[m+'1'] == b[m] || a[m] == b[m+'1']) {
					c.distance[m] = c['l'+m] = 0;
					c[m] = Math.max(a[m],b[m]);
				}
			}
		}
		distanceBox.x.add(c.distance.x);	// заполнение массива (сет) значениями расстояния между элементами
		distanceBox.y.add(c.distance.y);
		distanceBox.z.add(c.distance.z);
	}
  
	return c;
}