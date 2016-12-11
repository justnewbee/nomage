import path from "path";
import fs from "fs";

import bitmapDecode from "./lib/bitmap/decode";
import bitmapEncode from "./lib/bitmap/encode";
import fileSave from "./lib/file/save";

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
				fn((width * (y - 1) + x - 1) * 4, x, y);
			}
		}
		
		return this;
	}
	
	/**
	 * Writes the image to a local file
	 * @param {String} savePath a path to the destination file (either PNG or JPG)
	 * @param {Number} quality [1-100] only for JPEG
	 * @returns {Promise}
	 */
	save(savePath, quality) {
		return bitmapEncode(this._bitmap, quality).then(buffer => fileSave(buffer, savePath));
	}
}

// load methods
(pluginDir => {
	let protoOfImage = Image.prototype;
	
	fs.readdirSync(pluginDir).forEach(fileName => {
		if (fileName.startsWith("_") || !fileName.endsWith(".js")) {
			return;
		}
		
		let pluginName = fileName.replace(/\.js$/, "");
		
		protoOfImage[pluginName] = require(path.join(pluginDir, fileName));
	});
})(path.join(__dirname, "lib/methods"));



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
	
	return bitmapDecode(file).then(bitmap => new Image(bitmap));
};