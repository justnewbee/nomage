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

	var data = this.data;

	var srcData = srcImg.data;

	srcImg._scan(function (idx, sx, sy) {
		var dstIdx = _this._getPixelIndex(x + sx - srcX1, y + sy - srcY1);
		var avg = (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / 3;

		data[dstIdx + 3] *= avg / 255;
	}, srcX1, srcY1, srcX2, srcY2);

	return this;
};

module.exports = exports["default"]; /**
                                      * masks a source image on to this image using average pixel color.
                                      * a completely black pixel on the mask will turn a pixel in the image completely transparent.
                                      * @param {Image} srcImg
                                      * @param {int} [x=1] the x position to mask
                                      * @param {int} [y=1] the y position to mask
                                      * @param {int} [srcX1=1] the x position from which to mask
                                      * @param {int} [srcY1=1] the y position from which to mask
                                      * @param {int} [srcX2] the width to which to mask
                                      * @param {int} [srcY2] the height to which to mask
                                      */