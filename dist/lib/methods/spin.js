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
	var data = this.data;


	if (amount % 360 === 0) {
		return this;
	}

	return this._scan(function (idx) {
		var _tinyColor$spin$toRgb = (0, _tinycolor2.default)({
			r: data[idx],
			g: data[idx + 1],
			b: data[idx + 2]
		}).spin(amount).toRgb(),
		    r = _tinyColor$spin$toRgb.r,
		    g = _tinyColor$spin$toRgb.g,
		    b = _tinyColor$spin$toRgb.b;

		data[idx] = r;
		data[idx + 1] = g;
		data[idx + 2] = b;
	}, x1, y1, x2, y2);
};

var _tinycolor = require("tinycolor2");

var _tinycolor2 = _interopRequireDefault(_tinycolor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"];

/**
 * WARN: slow as tinyColor is used on each pixel
 * spin the HSL color plate
 * @param {Number} amount [-360, 360]
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */