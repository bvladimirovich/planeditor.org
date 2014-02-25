function initMove () {
	
	$('#saveProject').click(function (e) {
		var gr = {};
		for (var i in build.getItem()) {
			if (graph.getGraph(i).length > 1) {
				gr[i] = graph.getGraph(i);
			}
		}
		console.log(gr);
		$.ajax({
			url: 'cgi-php/saveProject.php',
			type: 'post',
			data: {
				build: build.getItem(),
				graph: gr,
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
				console.log(response);
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
