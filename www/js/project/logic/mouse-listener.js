// Обрабатывает все возможные движения мыши на холсте
// Из-за большого количества внутренних функций, 
// имеет смысл вынести их за её пределы
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
		// Переименовать в moveCameraStatus
		var moveCamera = false,
		// Оператор разрешения перемещения элемента
			moveItem = false,
		// Оператор разрешения изменения размеров элемента
			resizeItem = false;
		
		// Предыдущие координаты
		// камеры,
		var prevXd,
			prevZd,
			prevXm,
		// элемента
			prevZm; 
		
		// Коробка для хранения объектов, которые соединены с выбранным
		var boxItems;
		
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
				// Определяется положение мыши в абсолютных координатах
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
					building.addRoom(positionNewItem.x, positionNewItem.y, positionNewItem.z,
						sizeNewItem.lx, sizeNewItem.ly, sizeNewItem.lz);
				}
				
				// Получение объекта
				currentItem = findItem(x, z, building.getItem());
				// Условия работы с объектом
				if (currentItem !== undefined) {
					// 
					isMoveItem();
					isResizeItem();
					// Запись исходного состояния объекта
					OldItem.val = currentItem;
					
					// !По какой-то причине с первого клика соседние элементы не определяются
					// Одна из возможных причин: переменная graph еще не заполнена, необходимо проверить.
					boxItems = {};
					definingNeighbors(building, graph, currentItem, boxItems);
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
						var previousItem = building.getItem(arrayItems[0]);
						// Все элементы на холсте
						var allItems = building.getItem();
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
								var door = building.addDoor(previousItem, currentItem);
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
						SelectedGraph(currentItem, graph);
						// Отображение параметров выбранного элемента в HTML форме
						showParameters(currentItem);
					}
				} else {
					// При нажатии на пустое место холста
					// очистка списка выделенных элементов
					highlightedItems.clear();
				}
				// Обновление (перерисовка) холста в любом случае
				drawScene(cameraControl, highlightedItems, Color.val);
				
				// *Переименовать!
				function isMoveItem () {
					moveItem = true;
					prevXm = x - currentItem.x; // координаты мышки на элементе
					prevZm = z - currentItem.z;
				}
				// *Переименовать!
				function isResizeItem () {
					// Определение выбранной грани
					// Зона для появления значка изменения размера зависит от масштаба
					// Чем крупнее, тем зона меньше
					var side = findBorder(x, z, building.getItem(currentItem.id), cameraControl.getZoom());
					if (side != undefined) {
						// В момент изменения размеров запрещается перемещение объекта
						moveItem = false;
						resizeItem = true;
						sideChanges = side;
					}
				}
				// Функция выделения связанных объектов
				function SelectedGraph (currentItem, graph) {
					console.time('Время выделения графа');
					var currentItemID = currentItem.id;
					// Если выбрано ребро графа (дверь), то берётся первый узел этой двери
					if (graph.isEdge(currentItemID)) {
						currentItemID = graph.getNode(currentItemID)[0];
					}
					// Инициализация графа перед использованием,
					// чтоб не определять его каждый раз
					var g = graph.getGraph(currentItemID);
					// *Возможно, стоит убрать вложенность этого условия
					if (g.length > 1) {
						// Обход по графу и выделение всех вершин
						for (var i = g.length; --i >= 0;) {
							if (!highlightedItems.has(g[i])) {
								highlightedItems.add(g[i]);
							}
						}
						// Обход по графу и выделение всех рёбер
						for (var i = g.length; --i >= 0;) {
							// Для каждой вершины определяются все ребра
							// и по ним делается обход
							var e = graph.getEdge(g[i]);
							for (var j in e) {
								if (!highlightedItems.has(e[j])) {
									highlightedItems.add(e[j]);
								}
							}
						}
						// Элементы графа запрещено перемещать
						moveItem = false;
					}
					console.timeEnd('Время выделения графа');
				}
			}
		}
		
		// Функция обработки перемещения мыши в области холста
		// ev - событие
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
				drawScene(cameraControl, highlightedItems, Color.val);
			} else if (moveItem) {
				currentItem.x = x - prevXm,
				currentItem.z = z - prevZm;
				var ERROR = building.updateItem(currentItem);
				if (ERROR) {
					Color.val = color.RED;
				} else {
					Color.val = color.TURQUOISE;
				}
				drawScene(cameraControl, highlightedItems, Color.val);
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
							if (boxItems.LEFT !== undefined) break;
							var room1 = building.getItem(graph.getNode(currentItem.id)[0]);
							var room2 = building.getItem(graph.getNode(currentItem.id)[1]);
							
							if (x < Math.max(room1.x, room2.x)) break;
						}
						
						var min_X = new Set();
						if (boxItems.TOP !== undefined) {
							for (var i = boxItems.TOP.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.TOP[i]);
								min_X.add(otherDoor.x);
							}
						}
						if (boxItems.BOTTOM !== undefined) {
							for (var i = boxItems.BOTTOM.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.BOTTOM[i]);
								min_X.add(otherDoor.x);
							}
						}
						if (x >= Math.min.apply(null, min_X.valueOf())) break;
						
						
						var limitChanges = new Set();
						var roomsLeft = boxItems.LEFT;
						if (roomsLeft !== undefined) {
							var door = {};
							for (var i = roomsLeft.length; --i >= 0;) {
								door[i] = building.getItem(roomsLeft[i]);
								limitChanges.add(door[i].x + minSize.lx);
							}
							
							if (x <= Math.max.apply(null, limitChanges.valueOf())) break;
							
							for (var i = roomsLeft.length; --i >= 0;) {
								door[i].x1 = x;
								door[i].lx = door[i].x1 - door[i].x;
							}
						}
						
						changeCurrentItem(currentItem, {x: x, lx: dlx});
						break;
					case 'right': // изменяем размер вправо
						dlx = currentItem.lx + (x - currentItem.x1);
						if (!(dlx > minSize.lx)) break;
						
						if (currentItem.type == 'door') {
							if (boxItems.RIGHT !== undefined) break;
							var room1 = building.getItem(graph.getNode(currentItem.id)[0]);
							var room2 = building.getItem(graph.getNode(currentItem.id)[1]);
							
							if (x > Math.min(room1.x1, room2.x1)) break;
						}
						
						var max_X = new Set();					
						if (boxItems.TOP !== undefined) {
							for (var i = boxItems.TOP.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.TOP[i]);
								max_X.add(otherDoor.x1);
							}
						}
						if (boxItems.BOTTOM !== undefined) {
							for (var i = boxItems.BOTTOM.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.BOTTOM[i]);
								max_X.add(otherDoor.x1);
							}
						}
						if (x <= Math.max.apply(null, max_X.valueOf())) break;
						
						var limitChanges = new Set();
						var roomsRight = boxItems.RIGHT;
						if (roomsRight !== undefined) {
							var door = {};
							for (var i = roomsRight.length; --i >= 0;) {
								door[i] = building.getItem(roomsRight[i]);
								limitChanges.add(door[i].x1 - minSize.lx);
							}
							
							if (x >= Math.min.apply(null, limitChanges.valueOf())) break;
							
							for (var i = roomsRight.length; --i >= 0;) {
								door[i].lx = door[i].lx + (door[i].x - x);
								door[i].x = x;
							}
						}

						changeCurrentItem(currentItem, {x1: x, lx: dlx});
						break;
					case 'top': // изменяем размер вверх
						dlz = currentItem.lz + (currentItem.z - z);
						if (!(dlz > minSize.lz)) break;

						if (currentItem.type == 'door') {
							if (boxItems.TOP !== undefined) break;
							var room1 = building.getItem(graph.getNode(currentItem.id)[0]);
							var room2 = building.getItem(graph.getNode(currentItem.id)[1]);
							
							if (z < Math.max(room1.z, room2.z)) break;
						}
						
						var min_Z = new Set();					
						if (boxItems.LEFT !== undefined) {
							for (var i = boxItems.LEFT.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.LEFT[i]);
								min_Z.add(otherDoor.z);
							}
						}
						if (boxItems.RIGHT !== undefined) {
							for (var i = boxItems.RIGHT.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.RIGHT[i]);
								min_Z.add(otherDoor.z);
							}
						}
						if (z >= Math.min.apply(null, min_Z.valueOf())) break;
						
						var limitChanges = new Set();
						var roomsTop = boxItems.TOP;
						if (roomsTop !== undefined) {
							var door = {};
							for (var i = roomsTop.length; --i >= 0;) {
								door[i] = building.getItem(roomsTop[i]);
								limitChanges.add(door[i].z + minSize.lz);
							}
							
							if (z <= Math.max.apply(null, limitChanges.valueOf())) break;
							
							for (var i = roomsTop.length; --i >= 0;) {
								door[i].z1 = z;
								door[i].lz = door[i].z1 - door[i].z;
							}
						}

						changeCurrentItem(currentItem, {z: z, lz: dlz});
						break;
					case 'bottom': // изменяем размер вниз
						dlz = currentItem.lz + (z - currentItem.z1);
						if (!(dlz > minSize.lz)) break;
						
						if (currentItem.type == 'door') {
							if (boxItems.BOTTOM !== undefined) break;
							var room1 = building.getItem(graph.getNode(currentItem.id)[0]);
							var room2 = building.getItem(graph.getNode(currentItem.id)[1]);
							
							if (z > Math.min(room1.z1, room2.z1)) break;
						}
						
						var max_Z = new Set();					
						if (boxItems.LEFT !== undefined) {
							for (var i = boxItems.LEFT.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.LEFT[i]);
								max_Z.add(otherDoor.z1);
							}
						}
						if (boxItems.RIGHT !== undefined) {
							for (var i = boxItems.RIGHT.length; --i >= 0;) {
								var otherDoor = building.getItem(boxItems.RIGHT[i]);
								max_Z.add(otherDoor.z1);
							}
						}
						if (z <= Math.max.apply(null, max_Z.valueOf())) break;
					
						var limitChanges = new Set();
						var roomsBottom = boxItems.BOTTOM;
						if (roomsBottom !== undefined) {
							var door = {};
							for (var i = roomsBottom.length; --i >= 0;) {
								door[i] = building.getItem(roomsBottom[i]);
								limitChanges.add(door[i].z1 - minSize.lz);
							}
							
							if (z >= Math.min.apply(null, limitChanges.valueOf())) break;
							
							for (var i = roomsBottom.length; --i >= 0;) {
								door[i].lz = door[i].lz + (door[i].z - z);
								door[i].z = z;
							}
						}
						
						changeCurrentItem(currentItem, {z1: z, lz: dlz});
						break;
					case 'topLeft':
						if (!IsSimpleItem(currentItem, graph)) return;
						
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
						if (!IsSimpleItem(currentItem, graph)) return;
						
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
						if (!IsSimpleItem(currentItem, graph)) return;
						
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
						if (!IsSimpleItem(currentItem, graph)) return;
						
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
				var ERROR = building.updateItem(currentItem);
				if (ERROR) {
					Color.val = color.RED;
				} else {
					Color.val = color.TURQUOISE;
				}
				drawScene(cameraControl, highlightedItems, Color.val);
			} else {
				
				if (highlightedItems.valueOf().length > 0 && key.getKeyCode() === undefined) {
					currentItem = findItem(x, z, building.getItem());
					if (currentItem !== undefined) {						
						if (highlightedItems.has(currentItem.id)) {
							findBorder(x, z, currentItem, cameraControl.getZoom());
						}
					} else {
						findBorder(x, z, building.getItem(highlightedItems.valueOf()[0]), cameraControl.getZoom());
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
					var deletedItem = building.removeItem(currentItem.id);
					if (graph.remove(currentItem.id)) {
						console.info('Удален элеменет "' + deletedItem.type + '"', deletedItem);
					}
				}
			}
			
			drawScene(cameraControl, highlightedItems, Color.val);
			
			//var str = JSON.stringify(building.getItem(), "", 4);
			//console.log(str);
			
			function returnPreviousValue () {
				var ERROR = building.updateItem(currentItem);
				if (ERROR) {
					building.updateItem(OldItem.val);
					Color.val = color.TURQUOISE;
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
		if (graph.getGraph(currentItem.id).length == 1) return;
		var itemsAround;
		if (currentItem.type == 'room') {
			itemsAround = graph.getEdge(currentItem.id);
		} else if (currentItem.type == 'door') {
			itemsAround = graph.getNode(currentItem.id);
		}
		
		var itemsAroundTotal = itemsAround.length;
		
		var boxLeftItems = new Set();
		var boxRightItems = new Set();
		var boxTopItems = new Set();
		var boxButtomItems = new Set();

		for (var i = itemsAroundTotal; --i >= 0;) {
			var entityItem = building.getItem(itemsAround[i]);
			if (entityItem === undefined) continue;
			
			currentItem.center = {
				x: currentItem.x + currentItem.lx/2.0,
				y: currentItem.y + currentItem.ly/2.0,
				z: currentItem.z + currentItem.lz/2.0
			};
			entityItem.center = {
				x: entityItem.x + entityItem.lx/2.0,
				y: entityItem.y + entityItem.ly/2.0,
				z: entityItem.z + entityItem.lz/2.0
			};
			
			var dx = currentItem.center.x - entityItem.center.x,	// расстояние между центрами
				dy = currentItem.center.y - entityItem.center.y,	// элементов
				dz = currentItem.center.z - entityItem.center.z;

			if (dx < 0) {
				if (currentItem.x1 == entityItem.x) {
					boxRightItems.add(entityItem.id);
					boxItems.RIGHT = boxRightItems.valueOf();
				}
			} else if (dx > 0) {
				if (currentItem.x == entityItem.x1) {
					boxLeftItems.add(entityItem.id);
					boxItems.LEFT = boxLeftItems.valueOf();
				}
			}
			
			if (dz < 0) {
				if (currentItem.z1 == entityItem.z) {
					boxButtomItems.add(entityItem.id);
					boxItems.BOTTOM = boxButtomItems.valueOf();
				}
			} else if (dz > 0) {
				if (currentItem.z == entityItem.z1) {
					boxTopItems.add(entityItem.id);
					boxItems.TOP = boxTopItems.valueOf();
				}
			}
		}
	}
	
	function IsSimpleItem(currentItem, graph) {
		var numberOfSelectedItems = graph.getGraph(currentItem.id).length;
		return numberOfSelectedItems == 1 ? true : false;
	};
}