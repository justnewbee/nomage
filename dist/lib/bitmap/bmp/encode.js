"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _bmp = require("./bmp");

var _bmp2 = _interopRequireDefault(_bmp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * BMP format encoder, encode 24bit BMP
 * not support quality compression
 */
exports.default = function (bitmap) {
	var data = bitmap.data,
	    width = bitmap.width,
	    height = bitmap.height;

	var extraBytes = width % 4;
	var rgbSize = height * (3 * width + extraBytes);
	var rowBytes = 3 * width + extraBytes;

	var buffer = new Buffer(_bmp2.default.DATA_OFFSET + rgbSize);
	// header
	buffer.write(_bmp2.default.FLAG, 0, 2);
	buffer.writeUInt32LE(_bmp2.default.DATA_OFFSET + rgbSize, 2);
	buffer.writeUInt32LE(0, 6);
	buffer.writeUInt32LE(_bmp2.default.DATA_OFFSET, 10);
	buffer.writeUInt32LE(_bmp2.default.INFO_SIZE, 14);
	buffer.writeUInt32LE(width, 18);
	buffer.writeUInt32LE(height, 22);
	buffer.writeUInt16LE(1, 26);
	buffer.writeUInt16LE(24, 28);
	buffer.writeUInt32LE(0, 30);
	buffer.writeUInt32LE(rgbSize, 34);
	buffer.writeUInt32LE(0, 38);
	buffer.writeUInt32LE(0, 42);
	buffer.writeUInt32LE(0, 46);
	buffer.writeUInt32LE(0, 50);

	var i = 0;
	// data
	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var p = 54 + y * rowBytes + x * 3;
			buffer[p + 2] = data[i++]; // r
			buffer[p + 1] = data[i++]; // g
			buffer[p] = data[i++]; // b
			i++;
		}
		if (extraBytes > 0) {
			var fillOffset = 54 + y * rowBytes + width * 3;
			buffer.fill(0, fillOffset, fillOffset + extraBytes);
		}
	}

	return buffer;
};

module.exports = exports["default"];