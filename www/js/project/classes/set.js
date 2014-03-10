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
Set.prototype.isEmpty = function () {
	if (this.set.length == 0) {
		return true;
	} else {
		return false;
	}
};