function initMove () {
	console.log(build.getItem());
	$.ajax({
		url: "cgi-php/ajaxtest.php",
		type: "post",
		dataType: 'json',
		data: {
			data: build.getItem()
		},
		success: function (data, code) {
			if (code == 'success') {
				console.log(data); // запрос успешно прошёл
			} else {
				console.log(code); // возникла ошибка, возвращаем код ошибки
			}
		},
		error: function(xhr, str) {
			 console.log('Критическая ошибка', str); 
		},
	});
}
