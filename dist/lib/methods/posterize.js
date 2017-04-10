"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2;
	var x1 = arguments[1];
	var y1 = arguments[2];
	var x2 = arguments[3];
	var y2 = arguments[4];

	if (amount < 2) {
		// minimize 2 levels
		amount = 2;
	}

	var data = this.data;


	return this._scan(function (idx) {
		data[idx] = Math.floor(data[idx] / 255 * (amount - 1)) / (amount - 1) * 255;
		data[idx + 1] = Math.floor(data[idx + 1] / 255 * (amount - 1)) / (amount - 1) * 255;
		data[idx + 2] = Math.floor(data[idx + 2] / 255 * (amount - 1)) / (amount - 1) * 255;
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * apply a posterize effect
                                      * @param {Number} [amount=2] adjust over 2
                                      * @param {Integer} [x1]
                                      * @param {Integer} [y1]
                                      * @param {Integer} [x2]
                                      * @param {Integer} [y2]
                                      */