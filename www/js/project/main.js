function initMove () {
	
	$('#saveProject').click(function (e) {
		var objForSave = {};
		for (var i in build.getItem()) {
			if (graph.getGraph(i).length > 1) {
				for (var l = graph.getGraph(i).length; --l >= 0;) {
					for (var j = graph.getEdge(graph.getGraph(i)[l]).length; --j >=0;) {
						var node1 = i;
						var edge = graph.getEdge(graph.getGraph(node1)[l])[j];
						objForSave[edge] = graph.getNode(edge);
					}
				}
			}
		}
		$.ajax({
			url: 'cgi-php/saveProject.php',
			type: 'post',
			data: {
				build: build.getItem(),
				graph: objForSave,
			},
			success: function (data, code) {
				console.info(code); // запрос успешно прошёл
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				console.error('Критическая ошибка', str);
			}
		});
	});
	
	$('#openProject').click(function (e) {
		$.ajax({
			url: 'cgi-php/openProjectBuild.php',
			type: 'post',
			dataType: 'json',
			success: function (response, code) {
				build.readBuildingFromFile(response);
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				 console.error('Критическая ошибка', str); 
			}
		});
		
		$.ajax({
			url: 'cgi-php/openProjectGraph.php',
			type: 'post',
			dataType: 'json',
			success: function (response, code) {
				graph.readGraphsFromFile(response);
				drawScene(cameraControl, highlightedItems, highlightColor);
			},
			error: function(xhr, str) {
				 console.error('Критическая ошибка', str); 
			}
		});
	});
}
