"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = function (color, x1, y1, x2, y2) {
	var data = this.data;

	var _getRGB = (0, _util.getRGB)(color),
	    _getRGB2 = (0, _slicedToArray3.default)(_getRGB, 3),
	    r2 = _getRGB2[0],
	    g2 = _getRGB2[1],
	    b2 = _getRGB2[2];

	return this._scan(function (idx) {
		var r = data[idx];
		var g = data[idx + 1];
		var b = data[idx + 2];

		data[idx] = r ^ r2;
		data[idx + 1] = g ^ g2;
		data[idx + 2] = b ^ b2;
	}, x1, y1, x2, y2);
};

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];

/**
 * perform XOR on each color
 * you can give an optional range
 * @param {String|Array} color
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */