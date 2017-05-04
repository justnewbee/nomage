"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (r) {
	if ("number" !== typeof r) {
		throw new Error("r must be a number");
	}
	if (r < 1) {
		throw new Error("r must be greater than 1");
	}

	var width = this.width,
	    height = this.height,
	    data = this.data;

	var rs = Math.ceil(r * 2.57); // significant radius

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var red = 0;
			var green = 0;
			var blue = 0;
			var alpha = 0;
			var wSum = 0;
			var idx = void 0;

			for (var iy = y - rs; iy < y + rs + 1; iy++) {
				for (var ix = x - rs; ix < x + rs + 1; ix++) {
					var x1 = Math.min(width - 1, Math.max(0, ix));
					var y1 = Math.min(height - 1, Math.max(0, iy));
					var dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
					var wGht = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);

					idx = (0, _bit.bitShiftL)(y1 * width + x1, 2);

					red += data[idx] * wGht;
					green += data[idx + 1] * wGht;
					blue += data[idx + 2] * wGht;
					alpha += data[idx + 3] * wGht;
					wSum += wGht;
				}

				idx = (0, _bit.bitShiftL)(y * width + x, 2);

				data[idx] = Math.round(red / wSum);
				data[idx + 1] = Math.round(green / wSum);
				data[idx + 2] = Math.round(blue / wSum);
				data[idx + 3] = Math.round(alpha / wSum);
			}
		}
	}

	return this;
};

var _bit = require("../util/bit");

module.exports = exports["default"];

/**
 * WARNING: VERY slow
 * applies a true Gaussian blur to the image
 * http://blog.ivank.net/fastest-gaussian-blur.html
 * @param {Number} r the pixel radius of the blur
 */