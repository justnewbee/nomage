"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (x1, y1, x2, y2) {
	var data = this.data;


	return this._scan(function (idx) {
		data[idx] = 255 - data[idx];
		data[idx + 1] = 255 - data[idx + 1];
		data[idx + 2] = 255 - data[idx + 2];
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * invert color
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */