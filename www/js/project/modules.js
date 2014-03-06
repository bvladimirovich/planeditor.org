var IsSimpleItem = function (currentItem, graph) {
	var numberOfSelectedItems = graph.getGraph(currentItem.id).length;
	return numberOfSelectedItems == 1 ? true : false;
};

var _global_ = (function () {
	var global = {};
	
	global.CurrentItem;
	global.CameraManagement;
	global.HighlightedItems;
	global.HighlightColor;
	global.Building;
	global.Graph;
	
	return global;
}());