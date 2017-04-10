"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (x1, y1, x2, y2) {
	var data = this.data;


	return this._scan(function (idx, x, y) {
		var dither = DITHER_RGB565_MATRIX[(0, _util.bitShiftL)((0, _util.bitAnd)(y, 3), 2) + x % 4];

		data[idx] = Math.min(data[idx] + dither, 0xff);
		data[idx + 1] = Math.min(data[idx + 1] + dither, 0xff);
		data[idx + 2] = Math.min(data[idx + 2] + dither, 0xff);
	}, x1, y1, x2, y2);
};

var _util = require("../util");

var DITHER_RGB565_MATRIX = [1, 9, 3, 11, 13, 5, 15, 7, 4, 12, 2, 10, 16, 8, 14, 6];

/**
 * apply a ordered dithering effect
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
module.exports = exports["default"];