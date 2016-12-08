import tinyColor from "tinycolor2";

import bitmapParse from "./bitmap/parse";
import bitmapUnparse from "./bitmap/unparse";
import fileSave from "./file/save";

import {bitShiftL, bitShiftRU, bitAnd} from "./util";

//function createBitmapFromScratch(w, h, fill) {
//	let bitmap = {
//		buffer: new Buffer(w * h * 4),
//		width: w,
//		height: h,
//	};
//	
//	for (let i = 0; i < bitmap.buffer.length; i = i + 4) {
//		bitmap.buffer.writeUInt32BE(fill, i);
//	}
//}
//function createFromPath(filePath) {
//	var that = this;
//	
//	let buffer = fs.readFileSync(filePath);
//	
//	parseBitmap(buffer);
////	
////	getMIMEFromPath(filePath, function(err, mime) {
////		fs.readFileSync(filePath, function(err, data) {
////			if (err) {
////				return throwError.call(that, err, cb);
////			}
////			parseBitmap.call(buffer, mime, cb);
////		});
////	});
//}


const BLUR_MUL_TABLE = [
	1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39,
	137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81,
	151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153,
	73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177,
	171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231,
	224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79,
	155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115,
	113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175,
	43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67,
	33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213,
	105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43,
	85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145,
	143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61,
	121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207,
	205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179,
	178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5,
	79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137,
	17, 135, 134, 133, 66, 131, 65, 129, 1
];
const BLUR_SHG_TABLE = [
	0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17,
	17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20,
	20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22,
	21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22,
	21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23,
	21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24,
	24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24,
	20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24,
	24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25,
	25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25,
	25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25,
	25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18
];
const DITHER_RGB565_MATRIX = [
	1, 9, 3, 11,
	13, 5, 15, 7,
	4, 12, 2, 10,
	16, 8, 14, 6
];

/**
 * tinyColor has quite a performance issue when doing a big loop
 * @param {Array|String|Color} color
 * @return {Number[]} the RGB values
 */
function getRGB(color = [0, 0, 0]) {
	if (Array.isArray(color)) {
		let [r = 0, g = 0, b = 0] = color;
		
		return [r, g, b];
	}
	
	let {r, g, b} = tinyColor(color).toRgb();
	return [r, g, b];
}

/**
 * a wrapper over bitmap
 */
class Image {
	constructor(bitmap) {
		this._bitmap = bitmap;
	}
	
	get width() {
		return this._bitmap.width;
	}
	
	get height() {
		return this._bitmap.height;
	}
	
	get mime() {
		return this._bitmap.mime;
	}
	
	get data() {
		return this._bitmap.data;
	}
	
	get base64() {
		
	}
	
	/**
	 * get a range inside the image, if the range is outside of the image, null is returned
	 * @param {Integer} [x1=1]
	 * @param {Integer} [y1=1]
	 * @param {Integer} [x2=this.width]
	 * @param {Integer} [y2=this.height]
	 * @return {Array} or null
	 */
	_getRange(x1 = 1, y1 = 1, x2 = this.width, y2 = this.height) {
		let {width, height} = this;
		
		// make sure (x1, y1) is the top-left corner of the range and (x2, y2) the bottom-right
		if (x1 > x2) {
			[x1, x2] = [x2, x1];
		}
		if (y1 > y2) {
			[y1, y2] = [y2, y1];
		}
		
		if (x1 > width || x2 < 0 || y1 > height || y2 < 0) {
			return null;
		}
		
		// limit the coordinates inside the image, with x between [1, width] and y [1, height]
		x1 = Math.min(width, Math.max(1, x1));
		y1 = Math.min(height, Math.max(1, y1));
		x2 = Math.min(width, Math.max(1, x2));
		y2 = Math.min(height, Math.max(1, y2));
		
		return [x1, y1, x2, y2];
	}
	/**
	 * scan through a region of the bitmap, calling a function for each pixel
	 * NOTE (x1, y1) and (x2, y2) ranges start from 1
	 * @param {Function} fn a function to call on even pixels; the (x, y) position of the pixel
	 * @param {Integer} [x1=1] the x coordinate to begin the scan at
	 * @param {Integer} [y1=1] the y coordinate to begin the scan at
	 * @param {Integer} [x2=this.width] the width of the scan region
	 * @param {Integer} [y2=this.height] the height of the scan region
	 */
	_scan(fn, x1, y1, x2, y2) {
		let range = this._getRange(x1, y1, x2, y2);
		if (!range) {
			return this;
		}
		
		[x1, y1, x2, y2] = range;
		let {width} = this;
		
		for (let y = y1; y <= y2; y++) {
			for (let x = x1; x <= x2; x++) {
				fn(bitShiftL(width * (y - 1) + x - 1, 2), x, y);
			}
		}
		
		return this;
	}
	
	/**
	 * adjusts the brightness of the image
	 * @param {Number} val the amount to adjust the brightness, a number between -1 and +1
	 */
	brightness(val = 0) {
		if ("number" !== typeof val) {
			throw new Error("val must be a number");
		}
		if (val < -1 || val > +1) {
			throw new Error("val must be a number between -1 and +1");
		}
		if (val === 0) {
			return this;
		}
		
		let {data} = this;
		
		return this._scan(idx => {
			if (val < 0) {
				data[idx] = data[idx] * (1 + val);
				data[idx + 1] = data[idx + 1] * (1 + val);
				data[idx + 2] = data[idx + 2] * (1 + val);
			} else {
				data[idx] = data[idx] + (255 - data[idx]) * val;
				data[idx + 1] = data[idx + 1] + (255 - data[idx + 1]) * val;
				data[idx + 2] = data[idx + 2] + (255 - data[idx + 2]) * val;
			}
		});
	}
	
	/**
	 * adjusts the contrast of the image
	 * @param {Number} val the amount to adjust the contrast, a number between -1 and +1
	 */
	contrast(val = 0) {
		if ("number" !== typeof val) {
			throw new Error("val must be a number");
		}
		if (val < -1 || val > +1) {
			throw new Error("val must be a number between -1 and +1");
		}
		if (val === 0) {
			return this;
		}
		
		let {data} = this;
		
		function adjust(n) {
			let x;
			
			if (val < 0) {
				x = n > 127 ? 1 - n / 255 : n / 255;
				if (x < 0) {
					x = 0;
				}
				x = 0.5 * Math.pow(x * 2, 1 + val);
				return n > 127 ? (1.0 - x) * 255 : x * 255;
			}
			
			x = n > 127 ? 1 - n / 255 : n / 255;
			if (x < 0) {
				x = 0;
			}
			x = 0.5 * Math.pow(2 * x, val === 1 ? 127 : 1 / (1 - val));
			return n > 127 ? (1 - x) * 255 : x * 255;
		}
		
		return this._scan(idx => {
			data[idx] = adjust(data[idx]);
			data[idx + 1] = adjust(data[idx + 1]);
			data[idx + 2] = adjust(data[idx + 2]);
		});
	}
	
	/**
	 * apply a posterize effect TODO 没什么用
	 * @param {Number} val the amount to adjust the contrast, minimum threshold is 2
	 * @returns this for chaining of methods
	 */
	posterize(val = 2) {
		if ("number" !== typeof val) {
			throw new Error("val must be a number");
		}
		
		if (val < 2) { // minimize 2 levels
			val = 2;
		}
		
		let {data} = this;
		
		return this._scan(idx => {
			data[idx] = Math.floor(data[idx] / 255 * (val - 1)) / (val - 1) * 255;
			data[idx + 1] = Math.floor(data[idx + 1] / 255 * (val - 1)) / (val - 1) * 255;
			data[idx + 2] = Math.floor(data[idx + 2] / 255 * (val - 1)) / (val - 1) * 255;
		});
	}
	
	/**
	 * normalizes the image <- TODO 有什么用
	 */
	normalize() {
		let {data} = this;
		let histogram = {
			r: new Array(256).fill(0),
			g: new Array(256).fill(0),
			b: new Array(256).fill(0)
		};
		
		this._scan(idx => {
			histogram.r[data[idx]]++;
			histogram.g[data[idx + 1]]++;
			histogram.b[data[idx + 2]]++;
		});
		
		/**
		 * normalize values
		 * @param {Integer} value Pixel channel value
		 * @param {Integer} min minimum value for channel
		 * @param {Integer} max maximum value for channel
		 * @return {Integer}
		 */
		function normalize(value, min, max) {
			return (value - min) * 255 / (max - min);
		}
		
		function getBounds(histogramChannel) {
			return [histogramChannel.findIndex(value => value > 0), 255 - histogramChannel.slice().reverse().findIndex(value => value > 0)];
		}
		
		// store bounds (minimum and maximum values)
		let bounds = {
			r: getBounds(histogram.r),
			g: getBounds(histogram.g),
			b: getBounds(histogram.b)
		};
		
		// apply value transformations
		return this._scan(idx => {
			let r = data[idx];
			let g = data[idx + 1];
			let b = data[idx + 2];
			
			data[idx] = normalize(r, bounds.r[0], bounds.r[1]);
			data[idx + 1] = normalize(g, bounds.g[0], bounds.g[1]);
			data[idx + 2] = normalize(b, bounds.b[0], bounds.b[1]);
		});
	}
	
	/**
	 * flip the image horizontally
	 * @param {Boolean} [horizontal = true]
	 * @param {Boolean} [vertical = false]
	 */
	flip(horizontal = true, vertical = false) {
		let {data, width, height} = this;
		let buffer = new Buffer(data.length);
		
		this._scan((idx, x, y) => {
			let xFlipped = horizontal ? width - 1 - x : x;
			let yFlipped = vertical ? height - 1 - y : y;
			let idxFlipped = bitShiftL(width * yFlipped + xFlipped, 2);
			
			buffer.writeUInt32BE(data.readUInt32BE(idx, true), idxFlipped, true);
		});
		
		this._bitmap.data = new Buffer(buffer);
		
		return this;
	}
	
	/**
	 * NOTE: only have effect on PNG
	 * multiplies the opacity of each pixel by a factor between 0 and 1
	 * @param {Number} f the factor by which to multiply the opacity of each pixel
	 */
	opacity(f) {
		if ("number" !== typeof f) {
			throw new Error("f must be a number");
		}
		if (f < 0 || f > 1) {
			throw new Error("f must be a number from 0 to 1");
		}
		
		let {data} = this;
		
		return this._scan(idx => {
			data[idx + 3] = data[idx + 3] * f;
		});
	}
	
	/**
	 * set the alpha channel on every pixel to fully opaque
	 */
	opaque() {
		let {data} = this;
		
		return this._scan(idx => {
			data[idx + 3] = 255;
		});
	}
	// **************************************** //
	// color modifications - customizable
	// **************************************** //
	/**
	 * mix with another color
	 * @param {Array|String|Color} color
	 * @param {Number} [percentage=50] 1-100
	 * @return {*}
	 */
	mix(color, percentage = 50) {
		let {data} = this;
		let [r2, g2, b2] = getRGB(color);
		let p = percentage / 100;
		
		return this._scan(idx => {
			let r = data[idx];
			let g = data[idx + 1];
			let b = data[idx + 2];
			
			data[idx] = (r2 - r) * p + r;
			data[idx + 1] = (g2 - g) * p + g;
			data[idx + 2] = (b2 - b) * p + b;
		});
	}
	/**
	 * tint
	 * @param {Number} percentage
	 */
	tint(percentage) {
		return this.mix([255, 255, 255], percentage);
	}
	/**
	 * shade
	 * @param {Number} percentage
	 */
	shade(percentage) {
		return this.mix([0, 0, 0], percentage);
	}
	/**
	 * perform XOR on each color
	 * @param {String|Array} color
	 */
	xor(color) {
		let {data} = this;
		let [r2, g2, b2] = getRGB(color);
		
		return this._scan(idx => {
			let r = data[idx];
			let g = data[idx + 1];
			let b = data[idx + 2];
			
			data[idx] = r ^ r2;
			data[idx + 1] = g ^ g2;
			data[idx + 2] = b ^ b2;
		});
	}
	/**
	 * adjust red chanel
	 * @param {Integer} amount [-255, 255]
	 */
	red(amount) {
		let {data} = this;
		
		return this._scan(idx => {
			data[idx] = Math.max(0, Math.min(data[idx] + amount, 255));
		});
	}
	/**
	 * adjust green chanel
	 * @param {Number} amount [-255, 255]
	 */
	green(amount) {
		let {data} = this;
		
		return this._scan(idx => {
			data[idx + 1] = Math.max(0, Math.min(data[idx + 1] + amount, 255));
		});
	}
	/**
	 * adjust blue chanel
	 * @param {Number} amount [-255, 255]
	 */
	blue(amount) {
		let {data} = this;
		
		return this._scan(idx => {
			data[idx + 2] = Math.max(0, Math.min(data[idx + 2] + amount, 255));
		});
	}
	/**
	 * WARN: slow as tinyColor is used on each pixel
	 * spin the HSL color plate
	 * @param {Number} amount [-360, 360]
	 */
	spin(amount = 0) {
		let {data} = this;
		
		if (amount % 360 === 0) {
			return this;
		}
		
		return this._scan(idx => {
			let {r, g, b} = tinyColor({
				r: data[idx],
				g: data[idx + 1],
				b: data[idx + 2]
			}).spin(amount).toRgb();
			
			data[idx] = r;
			data[idx + 1] = g;
			data[idx + 2] = b;
		});
	}
	// **************************************** //
	// filters - predefined color modifications
	// **************************************** //
	/**
	 * invert color
	 */
	invert() {
		let {data} = this;
		
		return this._scan(idx => {
			data[idx] = 255 - data[idx];
			data[idx + 1] = 255 - data[idx + 1];
			data[idx + 2] = 255 - data[idx + 2];
		});
	}
	/**
	 * removes colour from the image using ITU Rec 709 luminance values
	 */
	greyscale() {
		let {data} = this;
		
		return this._scan(idx => {
			let grey = parseInt(0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2], 10);
			
			data[idx] = grey;
			data[idx + 1] = grey;
			data[idx + 2] = grey;
		});
	}
	/**
	 * applies a sepia tone to the image
	 */
	sepia() {
		let {data} = this;
		
		return this._scan(idx => {
			let r = data[idx];
			let g = data[idx + 1];
			let b = data[idx + 2];
			
			r = r * 0.393 + g * 0.769 + b * 0.189;
			g = r * 0.349 + g * 0.686 + b * 0.168;
			b = r * 0.272 + g * 0.534 + b * 0.131;
			
			data[idx] = r < 255 ? r : 255;
			data[idx + 1] = g < 255 ? g : 255;
			data[idx + 2] = b < 255 ? b : 255;
		});
	}
	/**
	 * apply a ordered dithering effect
	 */
	dither() {
		let {data} = this;
		
		return this._scan((idx, x, y) => {
			let dither = DITHER_RGB565_MATRIX[bitShiftL(bitAnd(y, 3), 2) + x % 4];
			
			data[idx] = Math.min(data[idx] + dither, 0xff);
			data[idx + 1] = Math.min(data[idx + 1] + dither, 0xff);
			data[idx + 2] = Math.min(data[idx + 2] + dither, 0xff);
		});
	}
	// **************************************** //
	// blurring
	// **************************************** //
	/**
	 * WARNING: VERY slow
	 * applies a true Gaussian blur to the image
	 * http://blog.ivank.net/fastest-gaussian-blur.html
	 * @param {Number} r the pixel radius of the blur
	 */
	gaussian(r) {
		if ("number" !== typeof r) {
			throw new Error("r must be a number");
		}
		if (r < 1) {
			throw new Error("r must be greater than 1");
		}
		
		let {width, height, data} = this;
		let rs = Math.ceil(r * 2.57); // significant radius
		
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				let red = 0;
				let green = 0;
				let blue = 0;
				let alpha = 0;
				let wsum = 0;
				
				for (let iy = y - rs; iy < y + rs + 1; iy++) {
					for (let ix = x - rs; ix < x + rs + 1; ix++) {
						let x1 = Math.min(width - 1, Math.max(0, ix));
						let y1 = Math.min(height - 1, Math.max(0, iy));
						let dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
						let wght = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
						let idx = bitShiftL(y1 * width + x1, 2);
						
						red += data[idx] * wght;
						green += data[idx + 1] * wght;
						blue += data[idx + 2] * wght;
						alpha += data[idx + 3] * wght;
						wsum += wght;
					}
					
					let idx = bitShiftL(y * width + x, 2);
					
					data[idx] = Math.round(red / wsum);
					data[idx + 1] = Math.round(green / wsum);
					data[idx + 2] = Math.round(blue / wsum);
					data[idx + 3] = Math.round(alpha / wsum);
				}
			}
		}
		
		return this;
	}
	/**
	 * A fast blur algorithm that produces similar effect to a gausian blur - but MUCH quicker
	 * @param {Number} r the pixel radius of the blur
	 */
	blur(r) {
		if ("number" != typeof r) {
			throw new Error("r must be a number");
		}
		if (r < 1) {
			throw new Error("r must be greater than 0");
		}
		
		let {data, width, height} = this;
		let wm = width - 1;
		let hm = height - 1;
		let rad1 = r + 1;
		let mulSum = BLUR_MUL_TABLE[r];
		let shgSum = BLUR_SHG_TABLE[r];
		let red = [];
		let green = [];
		let blue = [];
		let alpha = [];
		let vmin = [];
		let vmax = [];
		let sumR;
		let sumG;
		let sumB;
		let sumA;
		let x;
		let y;
		let i;
		let p;
		let p1;
		let p2;
		let yp;
		let yi;
		let yw;
		let pa;
		let iterations = 2;
		
		while (iterations-- > 0) {
			yw = yi = 0;
			
			for (y = 0; y < height; y++) {
				sumR = data[yw] * rad1;
				sumG = data[yw + 1] * rad1;
				sumB = data[yw + 2] * rad1;
				sumA = data[yw + 3] * rad1;
				
				for (i = 1; i <= r; i++) {
					p = yw + bitShiftL(i > wm ? wm : i, 2);
					sumR += data[p++];
					sumG += data[p++];
					sumB += data[p++];
					sumA += data[p];
				}
				
				for (x = 0; x < width; x++) {
					red[yi] = sumR;
					green[yi] = sumG;
					blue[yi] = sumB;
					alpha[yi] = sumA;
					
					if (y == 0) {
						vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
						vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
					}
					
					p1 = yw + vmin[x];
					p2 = yw + vmax[x];
					
					sumR += data[p1++] - data[p2++];
					sumG += data[p1++] - data[p2++];
					sumB += data[p1++] - data[p2++];
					sumA += data[p1] - data[p2];
					
					yi++;
				}
				yw += bitShiftL(width, 2);
			}
			
			for (x = 0; x < width; x++) {
				yp = x;
				sumR = red[yp] * rad1;
				sumG = green[yp] * rad1;
				sumB = blue[yp] * rad1;
				sumA = alpha[yp] * rad1;
				
				for (i = 1; i <= r; i++) {
					yp += i > hm ? 0 : width;
					sumR += red[yp];
					sumG += green[yp];
					sumB += blue[yp];
					sumA += alpha[yp];
				}
				
				yi = x << 2;
				for (y = 0; y < height; y++) {
					data[yi + 3] = pa = bitShiftRU(sumA * mulSum, shgSum);
					if (pa > 255) { // normalise alpha
						data[yi + 3] = 255;
					}
					if (pa > 0) {
						pa = 255 / pa;
						data[yi] = bitShiftRU(sumR * mulSum, shgSum) * pa;
						data[yi + 1] = bitShiftRU(sumG * mulSum, shgSum) * pa;
						data[yi + 2] = bitShiftRU(sumB * mulSum, shgSum) * pa;
					} else {
						data[yi] = data[yi + 1] = data[yi + 2] = 0;
					}
					if (x == 0) {
						vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
						vmax[y] = (p = y - r) > 0 ? p * width : 0;
					}
					
					p1 = x + vmin[y];
					p2 = x + vmax[y];
					
					sumR += red[p1] - red[p2];
					sumG += green[p1] - green[p2];
					sumB += blue[p1] - blue[p2];
					sumA += alpha[p1] - alpha[p2];
					
					yi += bitShiftL(width, 2);
				}
			}
		}
		
		return this;
	}
	// **************************************** //
	// size changing
	// **************************************** //
	/**
	 * crops the image at a given point to a give size FIXME not working
	 * note that the numbers can be negative, as long as they cover a range on the canvas
	 * @param {Integer} x1 start coordinate x
	 * @param {Integer} y1 start coordinate y
	 * @param {Integer} x2 end coordinate x
	 * @param {Integer} y2 end coordinate y
	 */
	crop(x1, y1, x2, y2) {
		let range = this._getRange(x1, y1, x2, y2);
		
		if (!range) { // cropped nothing
			return this;
		}
		
		[x1, y1, x2, y2] = range;
		if (x1 === 1 && y1 == 1 && x2 === this.width && y2 === this.height) { // cropped everything
			return this;
		}
		
		let {data} = this;
		let w = x2 - x1 + 1;
		let h = y2 - y1 + 1;
		let buffer = new Buffer(w * h * 4);
		let offset = 0;
		
		this._scan(idx => {
			buffer.writeUInt32BE(data.readUInt32BE(idx, true), offset, true);
			offset += 4;
		}, x1, y1, x2, y2);
		
		this._bitmap.data = new Buffer(buffer);
		this._bitmap.width = w;
		this._bitmap.height = h;
		
		return this;
	};
	// **************************************** //
	// file operations
	// **************************************** //
//	/**
//	 * Writes the image to a local file
//	 * @param {String} savePath a path to the destination file (either PNG or JPG)
//	 * @returns {Promise}
//	 */
	save(savePath) {
		return bitmapUnparse(this._bitmap).then(buffer => fileSave(buffer, savePath));
	}
}

export default file => {
//	let arg0 = arguments[0];
//	
//	if ("number" === typeof arg0) {
//		this._bitmap = createBitmapFromScratch(arg0, arguments[1], arguments[2]);
////		} else if ("object" === typeof arg0 && arg0.constructor === Image) {
////			this._createFromClone();
////		} else if (/(?:[a-z]+:)?\/\//.test(arg0)) {
////			this._createFromUrl(arg0);
//	} else if ("string" === typeof arg0 || Buffer.isBuffer(arg0)) {
//		this._bitmap = bitmap;
//	} else {
//		throw new Error("no matching constructor overloading was found. Please see the docs for how to call the Image constructor.");
//	}
	
	return bitmapParse(file).then(bitmap => new Image(bitmap));
};