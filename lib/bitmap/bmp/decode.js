"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (buffer, withAlpha) {
	if (buffer.toString("utf-8", 0, 2) !== "BM") {
		throw new Error("Invalid BMP File");
	}

	var header = parseHeader(buffer, withAlpha);
	var width = header.width,
	    height = header.height,
	    bitPP = header.bitPP;

	var data = new Buffer(width * height * 4);

	switch (bitPP) {
		case 1:
			bit1(data, buffer, header);
			break;
		case 4:
			bit4(data, buffer, header);
			break;
		case 8:
			bit8(data, buffer, header);
			break;
		case 15:
			bit15(data, buffer, header);
			break;
		case 16:
			bit16(data, buffer, header);
			break;
		case 24:
			bit24(data, buffer, header);
			break;
		case 32:
			bit32(data, buffer, header);
			break;
		default:
			throw new Error("[bmp/decode] bit " + bitPP + " not supported");
	}

	return {
		data: data, width: width, height: height
	};
};

var _bmp = require("./bmp");

var _bmp2 = _interopRequireDefault(_bmp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BIN_1_5 = 31; // 11111 in binary
var BIN_1_6 = 63; // 111111 in binary

function bit1(data, buffer, header) {
	var width = header.width,
	    height = header.height,
	    palette = header.palette;

	var len = Math.ceil(width / 8);
	var mode = len % 4;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < len; x++) {
			var b = buffer.readUInt8(offset++);
			var location = y * width * 4 + x * 32;

			for (var i = 0; i < 8; i++) {
				if (x * 8 + i < width) {
					var rgb = palette[b >> 7 - i & 0x1];

					data[location + i * 4] = rgb.blue;
					data[location + i * 4 + 1] = rgb.green;
					data[location + i * 4 + 2] = rgb.red;
					data[location + i * 4 + 3] = 0xFF;
				} else {
					break;
				}
			}
		}

		if (mode !== 0) {
			offset += 4 - mode;
		}
	}
}

function bit4(data, buffer, header) {
	var width = header.width,
	    height = header.height,
	    palette = header.palette;

	var len = Math.ceil(width / 2);
	var mode = len % 4;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < len; x++) {
			var b = buffer.readUInt8(offset++);
			var location = y * width * 4 + x * 2 * 4;
			var before = b >> 4;
			var after = b & 0x0F;
			var rgb = palette[before];

			data[location] = rgb.blue;
			data[location + 1] = rgb.green;
			data[location + 2] = rgb.red;
			data[location + 3] = 0xFF;

			if (x * 2 + 1 >= width) {
				break;
			}

			rgb = palette[after];
			data[location + 4] = rgb.blue;
			data[location + 4 + 1] = rgb.green;
			data[location + 4 + 2] = rgb.red;
			data[location + 4 + 3] = 0xFF;
		}

		if (mode !== 0) {
			offset += 4 - mode;
		}
	}
}

function bit8(data, buffer, header) {
	var width = header.width,
	    height = header.height,
	    palette = header.palette;

	var mode = width % 4;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var b = buffer.readUInt8(offset++);
			var location = y * width * 4 + x * 4;

			if (b < palette.length) {
				var rgb = palette[b];

				data[location] = rgb.blue;
				data[location + 1] = rgb.green;
				data[location + 2] = rgb.red;
				data[location + 3] = 0xFF;
			} else {
				data[location] = 0xFF;
				data[location + 1] = 0xFF;
				data[location + 2] = 0xFF;
				data[location + 3] = 0xFF;
			}
		}
		if (mode !== 0) {
			offset += 4 - mode;
		}
	}
}

function bit15(data, buffer, header) {
	var width = header.width,
	    height = header.height;

	var difW = width % 3;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var B = buffer.readUInt16LE(offset);

			offset += 2;

			var blue = (B & BIN_1_5) / BIN_1_5 * 255 | 0;
			var green = (B >> 5 & BIN_1_5) / BIN_1_5 * 255 | 0;
			var red = (B >> 10 & BIN_1_5) / BIN_1_5 * 255 | 0;
			var alpha = B >> 15 ? 0xFF : 0x00;
			var location = y * width * 4 + x * 4;

			data[location] = red;
			data[location + 1] = green;
			data[location + 2] = blue;
			data[location + 3] = alpha;
		}

		offset += difW;
	}
}

function bit16(data, buffer, header) {
	var width = header.width,
	    height = header.height;

	var difW = width % 3;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var B = buffer.readUInt16LE(offset);

			offset += 2;

			var alpha = 0xFF;
			var blue = (B & BIN_1_5) / BIN_1_5 * 255 | 0;
			var green = (B >> 5 & BIN_1_6) / BIN_1_6 * 255 | 0;
			var red = (B >> 11) / BIN_1_5 * 255 | 0;
			var location = y * width * 4 + x * 4;

			data[location] = red;
			data[location + 1] = green;
			data[location + 2] = blue;
			data[location + 3] = alpha;
		}

		offset += difW;
	}
}

function bit24(data, buffer, header) {
	var width = header.width,
	    height = header.height;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var blue = buffer.readUInt8(offset++);
			var green = buffer.readUInt8(offset++);
			var red = buffer.readUInt8(offset++);
			var location = y * width * 4 + x * 4;

			data[location] = red;
			data[location + 1] = green;
			data[location + 2] = blue;
			data[location + 3] = 0xFF;
		}

		offset += width % 4;
	}
}

function bit32(data, buffer, header) {
	var width = header.width,
	    height = header.height;
	var offset = header.offset;


	for (var y = height - 1; y >= 0; y--) {
		for (var x = 0; x < width; x++) {
			var blue = buffer.readUInt8(offset++);
			var green = buffer.readUInt8(offset++);
			var red = buffer.readUInt8(offset++);
			var alpha = buffer.readUInt8(offset++);
			var location = y * width * 4 + x * 4;

			data[location] = red;
			data[location + 1] = green;
			data[location + 2] = blue;
			data[location + 3] = alpha;
		}

		offset += width % 4;
	}
}

/**
 * 
 * @param {Buffer} buffer
 * @param {Boolean} [withAlpha=false]
 * @return {Object}
 */
function parseHeader(buffer, withAlpha) {
	var bitPP = buffer.readUInt16LE(28); // 30 - 31
	var colors = buffer.readUInt32LE(48); // 48 - 51
	var palette = void 0;

	if (bitPP === 16 && withAlpha) {
		bitPP = 15;
	}
	if (bitPP < 15) {
		palette = new Array(len);

		var len = colors === 0 ? 1 << bitPP : colors;

		for (var i = 0; i < len; i++) {
			palette[i] = {
				red: buffer.readUInt8(_bmp2.default.DATA_OFFSET),
				green: buffer.readUInt8(_bmp2.default.DATA_OFFSET + 1),
				blue: buffer.readUInt8(_bmp2.default.DATA_OFFSET + 2),
				quad: buffer.readUInt8(_bmp2.default.DATA_OFFSET + 3)
			};
		}
	}

	return {
		// file header 0 - 13
		//		size: buffer.readUInt32LE(2), // 2-5
		//		reserved1: buffer.readUInt16LE(6), // 6 - 7 <- useless
		//		reserved2: buffer.readUInt16LE(6), // 8 - 9 <- useless
		offset: buffer.readUInt32LE(10), // 10 - 13
		//		headerSize: buffer.readUInt32LE(14), // 14 - 17
		width: buffer.readUInt32LE(18), // 18 - 21
		height: buffer.readUInt32LE(22), // 22 - 25 <-- FIXME cannot get it right when the BMP is generated in mac...
		//		planes: buffer.readUInt16LE(26), // 26 - 27
		bitPP: bitPP,
		//		compress: buffer.readUInt32LE(32), // 32 - 35
		//		rawSize: buffer.readUInt32LE(36), // 36 - 39
		//		hr: buffer.readUInt32LE(40), // 40 - 43
		//		vr: buffer.readUInt32LE(44), // 44 - 47
		//		colors,
		//		importantColors: buffer.readUInt32LE(52), // 52 - 55
		palette: palette
	};
}

/**
 * BMP decoder, support 1bit 4bit 8bit 24bit bmp.
 */
module.exports = exports["default"];