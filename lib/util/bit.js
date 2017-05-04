"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _tinycolor = require("tinycolor2");

var _tinycolor2 = _interopRequireDefault(_tinycolor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
	/**
  * 
  * @param {Object} o
  * @param {Function} fn
  */
	each: function each(o, fn) {
		for (var k in o) {
			if (o.hasOwnProperty(k)) {
				fn(o[k], k);
			}
		}
	},

	/**
  * bitwise left shift
  * @param {int} num
  * @param {int} n
  */
	bitShiftL: function bitShiftL(num, n) {
		return num << n;
	},

	/**
  * bitwise right shift
  * @param {int} num
  * @param {int} n
  * @return {int}
  */
	bitShiftR: function bitShiftR(num, n) {
		return num >> n;
	},

	/**
  * bitwise right shift unsigned
  * @param {int} num
  * @param {int} n
  * @return {int}
  */
	bitShiftRU: function bitShiftRU(num, n) {
		return num >>> n;
	},

	/**
  * bit and
  * @param {int} n1
  * @param {int} n2
  * @return {int}
  */
	bitAnd: function bitAnd(n1, n2) {
		return n1 & n2;
	},

	/**
  * bit or
  * @param {int} n1
  * @param {int} n2
  * @return {int}
  */
	bitOr: function bitOr(n1, n2) {
		return n1 | n2;
	},

	/**
  * tinyColor has quite a performance issue when doing a big loop
  * @param {Array|String|Color} color
  * @return {Number[]} the RGB values
  */
	getRGB: function getRGB() {
		var color = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];

		if (Array.isArray(color)) {
			var _color = (0, _slicedToArray3.default)(color, 3),
			    _color$ = _color[0],
			    _r = _color$ === undefined ? 0 : _color$,
			    _color$2 = _color[1],
			    _g = _color$2 === undefined ? 0 : _color$2,
			    _color$3 = _color[2],
			    _b = _color$3 === undefined ? 0 : _color$3;

			return [_r, _g, _b];
		}

		var _tinyColor$toRgb = (0, _tinycolor2.default)(color).toRgb(),
		    r = _tinyColor$toRgb.r,
		    g = _tinyColor$toRgb.g,
		    b = _tinyColor$toRgb.b;

		return [r, g, b];
	}
};
module.exports = exports["default"];