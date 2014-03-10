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
Graph.prototype.readGraphsFromFile = function (response) {
	for (var i in response) {
		this.add(parseInt(i), parseInt(response[i][0]), parseInt(response[i][1]));
	}
};