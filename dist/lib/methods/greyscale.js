"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (x1, y1, x2, y2) {
	var data = this.data;


	return this._scan(function (idx) {
		var grey = parseInt(0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2], 10);

		data[idx] = grey;
		data[idx + 1] = grey;
		data[idx + 2] = grey;
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * removes colour from the image using ITU Rec 709 luminance values
                                      * @param {Integer} [x1]
                                      * @param {Integer} [y1]
                                      * @param {Integer} [x2]
                                      * @param {Integer} [y2]
                                      */