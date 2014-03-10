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
	var room = {
		id: Building.ID,
		type: 'room',
		x: x,
		y: y,
		z: z,
		lx: lx,
		ly: ly,
		lz: lz
	};
	
	if (Building.ID == 0) {
		Building.list[Building.ID] = room;		// помещение объекта в список
		Building.ID++;
		return room;
	} else if (Building.ID > 0) {
		var isIntersect = false;
		for (var i in Building.list) {
			if (isIntersects(Building.list[i], room)) {
				isIntersect = true;
			}
		}
		if (isIntersect == false) {
			Building.list[Building.ID] = room;
			Building.ID++;
			return room;
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
Building.prototype.addDoor = function(room1, room2, lx, ly, lz){	// добавление двери
	if (room1.type == 'door' || room2.type == 'door' || room1.id == room2.id) {	// если элементы, между которыми нужно создать дверь, являются дверями
		return false;	// функция возвращает false
	}
	
	var spaceBetweenRooms = new Section().get(room1, room2, Building.list);	// определение пространства между выбранными элементами
	lx = lx || spaceBetweenRooms.lx;
	ly = ly || spaceBetweenRooms.ly;
	lz = lz || spaceBetweenRooms.lz;

	var door = {
		id: Building.ID,
		type: 'door',
		x: spaceBetweenRooms.x,
		y: spaceBetweenRooms.y,
		z: spaceBetweenRooms.z,
		lx: lx,
		ly: ly,
		lz: lz
	};

	if (spaceBetweenRooms.info == Message.SUCCESS[0]) {
		if (door.lx <= spaceBetweenRooms.lx && door.ly <= spaceBetweenRooms.ly && door.lz <= spaceBetweenRooms.lz) {	// проверка размеров нового элемента, 
															// чтоб они не превышали размеров свободного пространства 
															// между выделенными элементами
			Building.list[Building.ID] = door;	// добавление элемента в список
			Building.ID++
			return door;	// возврат нового элемента
		} else {
			throw Message.ERROR.GENERAL[1];
		}
	} else if (spaceBetweenRooms.info == Message.ERROR.OBSTACLE[0]) {
		throw Message.ERROR.OBSTACLE[1];
	} else if (spaceBetweenRooms.info == Message.ERROR.TOUCH_LEMENTS[0]) {
		throw Message.ERROR.TOUCH_LEMENTS[1];
	} else if (spaceBetweenRooms.info == Message.ERROR.INTERSECTION[0]) {
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
	Building.list[item.id] = item;
	
	var error = false;
	for (var i in Building.list) {
		if (item.id != i && isIntersects(item, Building.list[i])) {	// проверка, не создаёт ли помех элемент с новыми параметрами	
																	// существующим
			error = true;
		}
	}
	return error;
}
Building.prototype.readBuildingFromFile = function (response) {		// response - json файл
	var id;
	for (id in response) {
		var item = response[id];
		Building.list[id] = {
			id: id,
			type: item.type,
			x: parseFloat(item.x),
			y: parseFloat(item.y),
			z: parseFloat(item.z),
			lx: parseFloat(item.lx),
			ly: parseFloat(item.ly),
			lz: parseFloat(item.lz)
		};
	}
	Building.ID = parseInt(id) + 1;
}