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

		data[dstIdx] = srcData[idx];
		data[dstIdx + 1] = srcData[idx + 1];
		data[dstIdx + 2] = srcData[idx + 2];
		data[dstIdx + 3] = srcData[idx + 3];
	}, srcX1, srcY1, srcX2, srcY2);

	return this;
};

module.exports = exports["default"]; /**
                                      * blits a source image on to this image
                                      * @param {Image} srcImg
                                      * @param {Integer} [x=1] the x position to blit
                                      * @param {Integer} [y=1] the y position to blit
                                      * @param {Integer} [srcX1=1] the x position from which to blit
                                      * @param {Integer} [srcY1=1] the y position from which to blit
                                      * @param {Integer} [srcX2] the width to which to blit
                                      * @param {Integer} [srcY2] the height to which to blit
                                      */