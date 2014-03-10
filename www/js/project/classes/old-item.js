/**	Хранение/копирование элемента */
var OldItem = {};
Object.defineProperty(OldItem, "val", {
	get: function() {
		return this.oldItem;
	},
	set: function(item) {
		this.oldItem = {};
		for (var i in item) {
			this.oldItem[i] = item[i];	// перезапись всех свойств входящего элемента в новый.
		}
	}
});