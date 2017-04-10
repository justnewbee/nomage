"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var deg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

	deg = deg % 360; // limit within (-360, 360)

	if (!deg) {
		return this;
	}
	if (deg < 0) {
		// change from anti-clockwise to clockwise
		deg += 360;
	}

	var data = this.data,
	    width = this.width,
	    height = this.height;

	var buffer = new Buffer(data.length);

	var loopIndex = 0;

	switch (deg) {
		case 90:
			this._scan("LR-BT", function (idx) {
				buffer.writeUInt32BE(data.readUInt32BE(idx, true), loopIndex++ * 4, true);
			});

			this._bitmap.data = new Buffer(buffer);
			this._bitmap.width = height;
			this._bitmap.height = width;
			break;
		case 180:
			this._scan("BT-RL", function (idx) {
				buffer.writeUInt32BE(data.readUInt32BE(idx, true), loopIndex++ * 4, true);
			});

			this._bitmap.data = new Buffer(buffer);
			break;
		case 270:
			this._scan("RL-TB", function (idx) {
				buffer.writeUInt32BE(data.readUInt32BE(idx, true), loopIndex++ * 4, true);
			});

			this._bitmap.data = new Buffer(buffer);
			this._bitmap.width = height;
			this._bitmap.height = width;
			break;
		default:
			advancedRotate.call(this, deg);
	}

	return this;
};

/**
 * Rotates an image clockwise by an arbitrary number of degrees.
 * @param {Number} deg the number of degrees to rotate the image by
 * @param {String} [mode] resize mode or a boolean, if false then the width and height of the image will not be changed
 */
function advancedRotate(deg) {
	var data = this.data,
	    width = this.width,
	    height = this.height;

	var rad = deg * Math.PI / 180;
	var cos = Math.cos(rad);
	var sin = Math.sin(rad);

	// after rotating the origin (x', y') will be (w * cos ^ 2, w * sin * cos)

	//	let w, h; // the final width and height if resize == true

	//	if (mode === true || "string" === typeof mode) {
	//		// resize the image to its maximum dimension and blit the existing image onto the centre so that when it is rotated the image is kept in bounds
	//		
	//		// http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
	//		w = Math.round(Math.abs(width * cosine) + Math.abs(height * sine));
	//		h = Math.round(Math.abs(width * sine) + Math.abs(height * cosine));
	//		
	//		const imgClone = this.clone();
	//		this._scan(idx => {
	//			data.writeUInt32BE(0, idx);
	//		});
	//		
	//		const max = Math.max(w, h, width, height);
	//		this.resize(max, max);
	//		
	//		this.blit(imgClone, width / 2 - imgClone.width / 2, height / 2 - imgClone.height / 2);
	//	}

	//	const newW = Math.round(cosine * width + sine * height);
	//	const newH = Math.round(sine * width + cosine * height);

	var dstBuffer = new Buffer(data.length);
	//	const dstBuffer = new Buffer(newW * newH);

	function createTranslationFunction(deltaX, deltaY) {
		return function (x, y) {
			return {
				x: x + deltaX,
				y: y + deltaY
			};
		};
	}

	var translate2Cartesian = createTranslationFunction(-(width / 2), -(height / 2));
	var translate2Screen = createTranslationFunction(width / 2, height / 2);

	for (var y = 0; y < height; y++) {
		for (var x = 0; x < width; x++) {
			var cartesian = translate2Cartesian(x, height - y);
			var source = translate2Screen(cos * cartesian.x - sin * cartesian.y, cos * cartesian.y + sin * cartesian.x);

			if (source.x >= 0 && source.x < width && source.y >= 0 && source.y < height) {
				var srcIdx = (width * (height - source.y - 1 | 0) + source.x | 0) << 2;
				var pixelRGBA = data.readUInt32BE(srcIdx, true);
				var dstIdx = width * y + x << 2;
				dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
			} else {
				// reset off-image pixels
				var _dstIdx = width * y + x << 2;
				dstBuffer.writeUInt32BE(this._background, _dstIdx);
			}
		}
	}
	this._bitmap.data = dstBuffer;
	this._bitmap.width = newW;
	this._bitmap.height = newH;

	//	if (mode === true || "string" === typeof mode) {
	//		// now crop the image to the final size
	//		const x = width / 2 - w / 2;
	//		const y = height / 2 - h / 2;
	//		this.crop(x, y, w, h);
	//	}
}

/**
 * Rotates the image clockwise by a number of degrees.
 */
module.exports = exports["default"];