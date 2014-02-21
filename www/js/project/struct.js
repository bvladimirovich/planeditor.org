/**
 Класс 'Struct'.
 Описывает структуру элемента.
 @param {number} id, x,y,z,lx,ly,lz
 @param {string} type
 @returns экземпляр класса 'Struct'
*/
var Struct = function () {};
Struct.prototype.set = function (id, type, x, y, z, lx, ly, lz) {
	this.id = id;
	this.type = type;
	this.x = x; 
	this.y = y; 
	this.z = z;
	this.lx = lx;
	this.ly = ly;
	this.lz = lz;
	return {
		id: this.id,
		type: this.type,
		x: this.x,
		y: this.y,
		z: this.z,
		lx: this.lx,
		ly: this.ly,
		lz: this.lz
	}
};

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
	console.assert(a.constructor !== Struct, 'Параметр a не является экземпляром функции-конструктора Struct');
	console.assert(b.constructor !== Struct, 'Параметр b не является экземпляром функции-конструктора Struct');
	
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

/**
 Класс 'Building'.
 Создаёт экземпляр здания
 в который можно добавлять
 комнаты и двери, 
 изменять параметры выбранных элементов,
 удалять и производить подсчёт элементов одного типа
*/

var Building = function(){
	Building.ID = 0;	// идентификатор
	Building.list = {};	// список элементов
}
/**
	Метод добавления комнаты.
	@param {number} x,y,z,lx,ly,lz - координаты и размеры комнаты
	@returns экземпляр класса 'Struct'
	
	Создаёт новый экземпляр класса Struct с указанными параметрами
	Помещает этот элемент в список элементов, если он ни с кем не пересекается
*/
Building.prototype.addRoom = function (x, y, z, lx, ly, lz) {
	var b = new Struct().set(Building.ID,'room',x,y,z,lx,ly,lz);	// инициализация нового объекта класса Struct
	if (Building.ID == 0) {
		Building.list[Building.ID] = b;		// помещение объекта в список
		Building.ID++;
		return b;
	} else if (Building.ID > 0) {
		var isIntersect = false;
		for (var i in Building.list) {
			if (isIntersects(Building.list[i], b)) {
				isIntersect = true;
			}
		}
		if (isIntersect == false) {
			Building.list[Building.ID] = b;
			Building.ID++;
			return b;
		} else if (isIntersect == true) {
			throw new Error('Невозможно добавить элемент с такими параметрами');
		}
	}
}

/**
 Метод добавления двери между двумя комнатами.
 @param {Struct} a,b - экземпляры класса 'Struct'
 @param {number} lx,ly,lz - размеры комнаты
 @returns экземпляр класса 'Struct'
*/
Building.prototype.addDoor = function(a, b, lx, ly, lz){	// добавление двери
	if (a.type == 'door' || b.type == 'door' || a.id == b.id) {	// если элементы, между которыми нужно создать дверь, являются дверями
		return false;	// функция возвращает false
	}
	
	var c = new Section().get(a, b, Building.list);	// определение пространства между выбранными элементами
	lx = lx || c.lx;
	ly = ly || c.ly;
	lz = lz || c.lz;
	
	var q = undefined;
	q = new Struct().set(Building.ID, 'door', c.x, c.y, c.z, lx, ly, lz);	// создание нового элемента с типом дверь

	if (c.info == Message.SUCCESS[0]) {
		if (q.lx <= c.lx && q.ly <= c.ly && q.lz <= c.lz) {	// проверка размеров нового элемента, 
															// чтоб они не превышали размеров свободного пространства 
															// между выделенными элементами
			Building.list[Building.ID] = q;	// добавление элемента в список
			Building.ID++
			return q;	// возврат нового элемента
		} else {
			throw Message.ERROR.GENERAL[1];
		}
	} else if (c.info == Message.ERROR.OBSTACLE[0]) {
		throw Message.ERROR.OBSTACLE[1];
	} else if (c.info == Message.ERROR.TOUCH_LEMENTS[0]) {
		throw Message.ERROR.TOUCH_LEMENTS[1];
	} else if (c.info == Message.ERROR.INTERSECTION[0]) {
		throw Message.ERROR.INTERSECTION[1];
	}
}
Building.prototype.removeItem = function(id){	// удаление элемента по его идентификатору
	var i = Building.list[id];
	delete Building.list[id];
	return i;	// и возвращает удалённый элемент
}
Building.prototype.numberOfItems = function(){	// общее количество элементов 
	var counter = 0;
	for (var i in Building.list) {
		counter++;
	}
	return counter;
}
Building.prototype.getItem = function(idItem){	// получение списка элементов или одного по id
	return idItem === undefined ? Building.list : Building.list[idItem];
}
Building.prototype.updateItem = function (item) {	// обновление параметров элементов
	Building.list[item.id] = new Struct().set(item.id, item.type, item.x, item.y, item.z, item.lx, item.ly, item.lz);
	this.errorItem = {};
	for (var i in Building.list) {
		if (item.id != i && isIntersects(item, Building.list[i])) {	// проверка, не создаёт ли помех элемент с новыми параметрами	
																	// существующим
			this.errorItem[i] = Building.list[i];
		}
	}
	var count = 0;
	for (var i in this.errorItem) {
		count++;
	}
	if (count > 0) {
		return true; // возвращает true, если элемент создаёт помехи
	}
}
Building.prototype.getErrorItem = function () {		// возвращает элементы, с которыми пересекается активный элемент
	return this.errorItem;
};


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
	return{
		l: this.l*this.zoom + this.dx,
		r: this.r*this.zoom + this.dx,
		b: this.b*this.zoom + this.dz,
		t: this.t*this.zoom + this.dz
	}
};

/** Управление цветом */
var Color = function () {
	this.color = undefined;
};
Color.prototype.set = function (color) {	// установка цвета выделения
	this.color = color
};
Color.prototype.get = function () {	// получение цвета
	return this.color;
};

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

/**	Хранение/копирование элемента */
var OldItem = function () {
	this.oldItem = {};	// новый элемент
};
OldItem.prototype.setOldItem = function (item) {	// установка элемента
	for (var i in item) {
		this.oldItem[i] = item[i];	// перезапись всех свойств входящего элемента в новый.
	}
};
OldItem.prototype.getOldItem =  function () {	// получение элемента
	return this.oldItem;
};

/** Граф */
var Graph = function () {
    this.listOfNodes = {};	// список вершин с рёбрами
    this.listOfEdges = {};	// список рёбер с вершинами
};
Graph.prototype.add = function (edge, node1, node2) {	// добавление ребра и его вершин в граф
    this.listOfEdges[edge] = [node1, node2];	// помещение ребра с его вершинами в список 

    this.listOfNodes[node1] = this.listOfNodes[node1] || [];	// если массив вершин не создан, то создаётся
    this.listOfNodes[node2] = this.listOfNodes[node2] || [];
    
    this.listOfNodes[node1].push(edge);		// добавление ребра к списку вершин
    this.listOfNodes[node2].push(edge);
};
Graph.prototype.getNode = function (idEdge) {	// получение вершин указанного ребра или списка всех вершин
	return idEdge === undefined ? this.listOfNodes : this.listOfEdges[idEdge];
};
Graph.prototype.getEdge = function (idNode) {	// получение рёбер указанной вершины или списка всех рёбер
	return idNode === undefined ? this.listOfEdges : this.listOfNodes[idNode];
};
Graph.prototype.getOppositeNode = function (idNode, idEdge) {	// получение противоположных вершин указанной
	var arr = undefined;	// список вершин
	for (var n in this.listOfNodes) {	// обход по всем вершинам
		if (idNode != n) continue;		// если входящая вершина не равна вершине из списка, выполняется переход к следующей
		for (var e in this.listOfEdges) {	// иначе выполняется обход по всем рёбрам графа
			if (idEdge != e) continue;		// если входящее ребро не равно ребру из списка, выполняется переход к следующему
			if (this.listOfEdges[e][0] == idNode) {	// если вершина ребра равна входящей вершине
				arr = this.listOfEdges[e][1];		// то вершина с другого конца ребра добавляется в массив
			} else if (this.listOfEdges[e][1] == idNode) {
				arr = this.listOfEdges[e][0];
			}
		}
	}
	return arr;	// функция возвращает массив
};
Graph.prototype.getGraph = function (N) {	// получение графа из вершины
	var set = new Set();
	var tmp = new Set();
	var tmp2 = new Set();
	set.add(N);
	tmp.add(N);
	
	while (tmp.valueOf().length != 0) {
		for (var n in tmp.valueOf()) {
			var n1 = tmp.valueOf()[n];	// вершина из списка пройденных 
			for (var r in this.listOfEdges) {
				var n2 = this.getOppositeNode(n1, r);
				if (set.has(n2) == false && n2 !== undefined) {
					set.add(n2);
					tmp2.add(n2);
				}
			}
		}
		tmp = tmp2;
		tmp2 = new Set();
	}

	return set.valueOf()	// возвращает список вершин в графе
}
Graph.prototype.isEdge = function (N) {
	var isEdge = false;
	for (var i in this.listOfEdges) {
		if (N == i) {
			isEdge = true;
			break;
		}
	}
	return isEdge;
}
Graph.prototype.isNode = function (N) {
	var isNode = false;
	for (var i in this.listOfNodes) {
		if (N == i) {
			isNode = true;
			break;
		}
	}
	return isNode;
}
Graph.prototype.remove = function (N) {
	var result = false;
	if (this.isNode(N)) {
		delete this.listOfNodes[N];
		result = true;
	} else if (this.isEdge(N)) {
		delete this.listOfEdges[N];
		result = true;
	}
	return result;
}

/** Множество не повторяющихся элементов */
var Set = function () {
	this.set = [];	// множество элементов
};
Set.prototype.add = function (N) {	// добавление элементов во множество
	if (this.has(N)) {
		return false;
	} else {
		this.set.push(N);
		return true;
	}
};
Set.prototype.delete = function (N) {	// удаление элемента массива, где N - элемент.
	for (var i in this.set) {
		if (N == this.set[i]) {
			this.set.splice(i, 1);	
		}
	}
};
Set.prototype.has = function (N) {	// проверка на присутствие элемента в массиве
	for (var i in this.set) {
		if (N == this.set[i]) {	// если элемент существует
			return true;	// возвращается true
		}
	}
	return false; // иначе - false
};
Set.prototype.clear = function (N) {	// очистка массива
	this.set = [];
};
Set.prototype.valueOf = function () {	// получение всего массива
	return this.set;
};

var Item = function () {
	this.item = undefined;
};
Item.prototype.add = function (i) {
	this.item = i;
};
Item.prototype.get = function () {
	if (!this.is) {
		console.error('Элемент еще не существует');
	}
	return this.item;
};
Item.prototype.remove = function () {
	if (!this.is) {
		console.error('Элемент еще не существует');
	}
	this.item = undefined;
};
Item.prototype.change = function () {
	if (!this.is) {
		console.error('Элемент еще не существует');
	}
	return {
		x: function (x) {this.item.x = x},
		y: function (y) {this.item.y = y},
		z: function (z) {this.item.z = z},
		lx: function (lx) {this.item.lx = lx},
		ly: function (ly) {this.item.ly = ly},
		lz: function (lz) {this.item.lz = lz},
	};
};
Item.prototype.is = function () {
	if (this.item === undefined) {
		return false;
	} else {
		return true;
	}
};
