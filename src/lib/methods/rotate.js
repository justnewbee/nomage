/**
 * rotates an image clockwise by a number of degrees rounded to the nearest 90 degrees
 * @param {Number} deg the number of degrees to rotate the image by
 */
function simpleRotate(deg) {
	const {data, width, height} = this;
	let i = Math.round(deg / 90) % 4;
	while (i < 0) i += 4;
	
	while (i > 0) {
		const dstBuffer = new Buffer(data.length);
		let dstOffset = 0;
		
		for (let x = 0; x < width; x++) {
			for (let y = height - 1; y >= 0; y--) {
				let srcOffset = (width * y + x) << 2;
				let data = data.readUInt32BE(srcOffset, true);
				dstBuffer.writeUInt32BE(data, dstOffset, true);
				dstOffset += 4;
			}
		}
		
		this._bitmap.data = new Buffer(dstBuffer);
		
//		let tmp = width;
//		width = height;
//		height = tmp;
		
		i--;
	}
}

/**
 * Rotates an image clockwise by an arbitary number of degrees. NB: 'this' must be a Jimp object.
 * @param {Number} deg the number of degress to rotate the image by
 * @param {String} [mode] resize mode or a boolean, if false then the width and height of the image will not be changed
 */
function advancedRotate(deg, mode) {
	const {data, width, height} = this;
	const rad = deg % 360 * Math.PI / 180;
	const cosine = Math.cos(rad);
	const sine = Math.sin(rad);
	
	let w, h; // the final width and height if resize == true
	
	if (mode == true || "string" == typeof mode) {
		// resize the image to it maximum dimention and blit the existing image onto the centre so that when it is rotated the image is kept in bounds
		
		// http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
		w = Math.round(Math.abs(width * cosine) + Math.abs(height * sine));
		h = Math.round(Math.abs(width * sine) + Math.abs(height * cosine));
		
		const c = this.clone();
		this._scan(idx => {
			data.writeUInt32BE(this._background, idx);
		});
		
		const max = Math.max(w, h, width, height);
		this.resize(max, max, mode);
		
		this.blit(c, width / 2 - c.bitmap.width / 2, height / 2 - c.bitmap.height / 2);
	}
	
	const dstBuffer = new Buffer(data.length);
	
	function createTranslationFunction(deltaX, deltaY) {
		return function(x, y) {
			return {
				x: x + deltaX,
				y: y + deltaY
			};
		};
	}
	
	const translate2Cartesian = createTranslationFunction(-(width / 2), -(height / 2));
	const translate2Screen = createTranslationFunction(width / 2, height / 2);
	
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cartesian = translate2Cartesian(x, height - y);
			const source = translate2Screen(
				cosine * cartesian.x - sine * cartesian.y,
				cosine * cartesian.y + sine * cartesian.x
			);
			if (source.x >= 0 && source.x < width && source.y >= 0 && source.y < height) {
				const srcIdx = (width * (height - source.y - 1 | 0) + source.x | 0) << 2;
				const pixelRGBA = data.readUInt32BE(srcIdx, true);
				const dstIdx = (width * y + x) << 2;
				dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
			} else { // reset off-image pixels
				const dstIdx = (width * y + x) << 2;
				dstBuffer.writeUInt32BE(this._background, dstIdx);
			}
		}
	}
	this._bitmap.data = dstBuffer;
	
	if (mode == true || "string" == typeof mode) {
		// now crop the image to the final size
		const x = width / 2 - w / 2;
		const y = height / 2 - h / 2;
		this.crop(x, y, w, h);
	}
}

/**
 * Rotates the image clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
 * @param deg the number of degress to rotate the image by
 * @param (optional) mode resize mode or a boolean, if false then the width and height of the image will not be changed
 * @returns this for chaining of methods
 */
export default function(deg, mode) {
	if (deg % 90 == 0 && mode !== false) {
		simpleRotate.call(this, deg);
	} else {
		advancedRotate.call(this, deg, mode);
	}
	
	return this;
}