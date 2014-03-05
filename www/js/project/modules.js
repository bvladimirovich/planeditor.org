var IsSimpleItem = function (currentItem, graph) {
	var numberOfSelectedItems = graph.getGraph(currentItem.id).length;
	return numberOfSelectedItems == 1 ? true : false;
};