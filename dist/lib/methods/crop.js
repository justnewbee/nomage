"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

exports.default = function (x1, y1, x2, y2) {
	var range = this._getRange(x1, y1, x2, y2);

	if (!range) {
		// cropped nothing
		return this;
	}

	var _range = (0, _slicedToArray3.default)(range, 4);

	x1 = _range[0];
	y1 = _range[1];
	x2 = _range[2];
	y2 = _range[3];

	if (x1 === 1 && y1 == 1 && x2 === this.width && y2 === this.height) {
		// cropped everything
		return this;
	}

	var data = this.data;

	var w = x2 - x1 + 1;
	var h = y2 - y1 + 1;
	var buffer = new Buffer(w * h * 4);

	var offset = 0;

	this._scan(function (idx) {
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), offset, true);
		offset += 4;
	}, x1, y1, x2, y2);

	this._bitmap.data = new Buffer(buffer);
	this._bitmap.width = w;
	this._bitmap.height = h;

	return this;
};

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports["default"]; /**
                                      * crops the image at a given point to a give size FIXME not working
                                      * note that the numbers can be negative, as long as they cover a range on the canvas
                                      * @param {Integer} x1 start coordinate x
                                      * @param {Integer} y1 start coordinate y
                                      * @param {Integer} x2 end coordinate x
                                      * @param {Integer} y2 end coordinate y
                                      */