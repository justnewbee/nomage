"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	var x1 = arguments[1];
	var y1 = arguments[2];
	var x2 = arguments[3];
	var y2 = arguments[4];

	if (amount === 0 || amount < -1 || amount > +1) {
		return this;
	}

	var data = this.data;

	var multiplier = amount > 0 ? 1 - amount : 1 + amount;
	var adjustment = amount > 0 ? 255 * amount : 0;

	return this._scan(function (idx) {
		data[idx] = data[idx] * multiplier + adjustment;
		data[idx + 1] = data[idx + 1] * multiplier + adjustment;
		data[idx + 2] = data[idx + 2] * multiplier + adjustment;
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * adjusts the brightness of the image
                                      * you can give an optional range
                                      * @param {Number} [amount=0] adjust between [-1, 1]
                                      * @param {Integer} [x1]
                                      * @param {Integer} [y1]
                                      * @param {Integer} [x2]
                                      * @param {Integer} [y2]
                                      */