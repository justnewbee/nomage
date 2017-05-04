"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (factor, x1, y1, x2, y2) {
	if (factor < 0 || factor >= 1) {
		return this;
	}

	var data = this.data;


	return this._scan(function (idx) {
		data[idx + 3] = data[idx + 3] * factor;
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * multiplies the opacity of each pixel by a factor between 0 and 1
                                      * you can give an optional range
                                      * @param {Number} factor [0, 1)
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */