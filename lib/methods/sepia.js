"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (x1, y1, x2, y2) {
	var data = this.data;


	return this._scan(function (idx) {
		var r = data[idx];
		var g = data[idx + 1];
		var b = data[idx + 2];

		r = r * 0.393 + g * 0.769 + b * 0.189;
		g = r * 0.349 + g * 0.686 + b * 0.168;
		b = r * 0.272 + g * 0.534 + b * 0.131;

		data[idx] = r < 255 ? r : 255;
		data[idx + 1] = g < 255 ? g : 255;
		data[idx + 2] = b < 255 ? b : 255;
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * applies a sepia tone to the image
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */