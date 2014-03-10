/** Управление цветом */
var Color = {};
Object.defineProperty(Color, "val", {
	get: function() {
		return this.color;
	},
	set: function(color) {
		this.color = color
	}
});