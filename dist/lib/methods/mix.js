"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = function (color) {
	var percentage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 50;
	var x1 = arguments[2];
	var y1 = arguments[3];
	var x2 = arguments[4];
	var y2 = arguments[5];
	var data = this.data;

	var _getRGB = (0, _util.getRGB)(color),
	    _getRGB2 = (0, _slicedToArray3.default)(_getRGB, 3),
	    r2 = _getRGB2[0],
	    g2 = _getRGB2[1],
	    b2 = _getRGB2[2];

	var p = percentage / 100;

	return this._scan(function (idx) {
		var r = data[idx];
		var g = data[idx + 1];
		var b = data[idx + 2];

		data[idx] = (r2 - r) * p + r;
		data[idx + 1] = (g2 - g) * p + g;
		data[idx + 2] = (b2 - b) * p + b;
	}, x1, y1, x2, y2);
};

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];

/**
 * mix with another color
 * you can give an optional range
 * @param {Array|String|Color} color
 * @param {Number} [percentage=50] 1-100
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */