function initMove () {
    var m = new Move();
    m.addItems(3, 7, 15);
    m.addItems(0, 5, 301);
    //console.log(m.getItems());
}

var Move = function () {
    this.i1 = undefined;
    this.i2 = undefined;
    this.i3 = undefined;
    this.count = 0;
    this.listItems = {};
};
Move.prototype.addItems = function (i1, i2, i3) {
    this.i1 = i1;
    this.i2 = i2;
    this.i3 = i3;
    
    var arr = [];
    arr.push(this.i1, this.i2, this.i3);
    this.listItems[this.count++] = arr;
};
Move.prototype.getItems = function () {
    return this.listItems;
};
