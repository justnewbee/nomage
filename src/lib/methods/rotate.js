/**
 * Rotates an image clockwise by an arbitary number of degrees. NB: 'this' must be a Jimp object.
 * @param deg the number of degress to rotate the image by
 * @param (optional) mode resize mode or a boolean, if false then the width and height of the image will not be changed
 * @returns nothing
 */
function advancedRotate(deg, mode) {
	let rad = (deg % 360) * Math.PI / 180;
	let cosine = Math.cos(rad);
	let sine = Math.sin(rad);
	
	let w, h; // the final width and height if resize == true
	
	if (mode == true || "string" == typeof mode) {
		// resize the image to it maximum dimention and blit the existing image onto the centre so that when it is rotated the image is kept in bounds
		
		// http://stackoverflow.com/questions/3231176/how-to-get-size-of-a-rotated-rectangle
		w = Math.round(Math.abs(this.bitmap.width * cosine) + Math.abs(this.bitmap.height * sine));
		h = Math.round(Math.abs(this.bitmap.width * sine) + Math.abs(this.bitmap.height * cosine));
		
		let c = this.clone();
		this._scan(idx => {
			this.bitmap.data.writeUInt32BE(this._background, idx);
		});
		
		let max = Math.max(w, h, this.bitmap.width, this.bitmap.height);
		this.resize(max, max, mode);
		
		this.blit(c, this.bitmap.width / 2 - c.bitmap.width / 2, this.bitmap.height / 2 - c.bitmap.height / 2);
	}
	
	let dstBuffer = new Buffer(this.bitmap.data.length);
	
	function createTranslationFunction(deltaX, deltaY) {
		return function(x, y) {
			return {
				x: x + deltaX,
				y: y + deltaY
			};
		};
	}
	
	let translate2Cartesian = createTranslationFunction(-(this.bitmap.width / 2), -(this.bitmap.height / 2));
	let translate2Screen = createTranslationFunction(this.bitmap.width / 2, this.bitmap.height / 2);
	
	for (let y = 0; y < this.bitmap.height; y++) {
		for (let x = 0; x < this.bitmap.width; x++) {
			let cartesian = translate2Cartesian(x, this.bitmap.height - y);
			let source = translate2Screen(
				cosine * cartesian.x - sine * cartesian.y,
				cosine * cartesian.y + sine * cartesian.x
			);
			if (source.x >= 0 && source.x < this.bitmap.width
				&& source.y >= 0 && source.y < this.bitmap.height) {
				let srcIdx = (this.bitmap.width * (this.bitmap.height - source.y - 1 | 0) + source.x | 0) << 2;
				let pixelRGBA = this.bitmap.data.readUInt32BE(srcIdx, true);
				let dstIdx = (this.bitmap.width * y + x) << 2;
				dstBuffer.writeUInt32BE(pixelRGBA, dstIdx);
			} else {
				// reset off-image pixels
				let dstIdx = (this.bitmap.width * y + x) << 2;
				dstBuffer.writeUInt32BE(this._background, dstIdx);
			}
		}
	}
	this.bitmap.data = dstBuffer;
	
	if (mode == true || "string" == typeof mode) {
		// now crop the image to the final size
		let x = this.bitmap.width / 2 - w / 2;
		let y = this.bitmap.height / 2 - h / 2;
		this.crop(x, y, w, h);
	}
};

/**
 * Rotates the image clockwise by a number of degrees. By default the width and height of the image will be resized appropriately.
 * @param deg the number of degress to rotate the image by
 * @param (optional) mode resize mode or a boolean, if false then the width and height of the image will not be changed
 * @param (optional) cb a callback for when complete
 * @returns this for chaining of methods
 */
export default function(deg, mode) {
	if (deg % 90 == 0 && mode !== false) {
		simpleRotate.call(this, deg, cb);
	} else {
		advancedRotate.call(this, deg, mode, cb);
	}
	
	if (isNodePattern(cb)) {
		return cb.call(this, null, this);
	} else {
		return this;
	}
};