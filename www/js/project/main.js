function initMove () {
	// var arr = [];
	// for (var i = 0; i < 100; i++) {
		// for (var j = 0; j < 2; j++) {
			// arr.push(i, j);
		// }
	// }
	
	// console.log(arr);
}


function roundPlus(x, n) { // x - число, n - количество знаков 
	if (isNaN(x) || isNaN(n)) return false;
	var m = Math.pow(10,n);
	return Math.round(x*m)/m;
}
