"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (srcImg) {
	var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
	var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
	var srcX1 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
	var srcY1 = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;

	var _this = this;

	var srcX2 = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : srcImg.width;
	var srcY2 = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : srcImg.height;

	x = Math.round(x);
	y = Math.round(y);
	srcX1 = Math.round(srcX1);
	srcY1 = Math.round(srcY1);
	srcX2 = Math.round(srcX2);
	srcY2 = Math.round(srcY2);

	var data = this.data;

	var srcData = srcImg.data;

	srcImg._scan(function (idx, sx, sy) {
		var dstIdx = _this._getPixelIndex(x + sx - srcX1, y + sy - srcY1);
		var bgR = data[dstIdx] / 255;
		var bgG = data[dstIdx + 1] / 255;
		var bgB = data[dstIdx + 2] / 255;
		var bgA = data[dstIdx + 3] / 255;
		var fgR = srcData[idx] / 255;
		var fgG = srcData[idx + 1] / 255;
		var fgB = srcData[idx + 2] / 255;
		var fgA = srcData[idx + 3] / 255;
		var a = bgA + fgA - bgA * fgA;

		data[dstIdx] = (fgR * fgA + bgR * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 1] = (fgG * fgA + bgG * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 2] = (fgB * fgA + bgB * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 3] = a * 255;
	}, srcX1, srcY1, srcX2, srcY2);

	return this;
};

module.exports = exports["default"]; /**
                                      * composites a source image over to this image respecting alpha channels
                                      * @param {Image} srcImg
                                      * @param {int} [x=1] the x position to compose
                                      * @param {int} [y=1] the y position to compose
                                      * @param {int} [srcX1=1] the x position from which to compose
                                      * @param {int} [srcY1=1] the y position from which to compose
                                      * @param {int} [srcX2] the width to which to compose
                                      * @param {int} [srcY2] the height to which to compose
                                      */