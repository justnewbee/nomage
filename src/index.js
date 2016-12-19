import path from "path";
import fs from "fs";

import bitmapDecode from "./lib/bitmap/decode";
import bitmapEncode from "./lib/bitmap/encode";
import fileMime from "./lib/file/mime";
import fileSave from "./lib/file/save";

/**
 * a wrapper over bitmap
 */
class Image {
	constructor(bitmap) {
		this._bitmap = bitmap;
	}
	
	get data() {
		return this._bitmap.data;
	}
	get mime() {
		return this._bitmap.mime;
	}
	get width() {
		return this._bitmap.width;
	}
	get height() {
		return this._bitmap.height;
	}
	
	/**
	 * get pixel color as 32bits HEX integer
	 * @param {Integer} x
	 * @param {Integer} y
	 * @return {Integer} rgba color HEX that is below or equal to 0xFFFFFFFF
	 */
	getPixelColorHex(x, y) {
		const {data} = this;
		const idx = this._getPixelIndex(x, y);
		
		return data.readUInt32BE(idx);
	}
	/**
	 * set pixel color with 32bits HEX integer
	 * @param {Integer} x
	 * @param {Integer} y
	 * @param {Integer} hex
	 */
	setPixelColorHex(x, y, hex) {
		const {data} = this;
		const idx = this._getPixelIndex(x, y);
		
		data.writeUInt32BE(hex, idx, true);
		
		return this;
	}
	/**
	 * get pixel color as rgba object
	 * @param {Integer} x
	 * @param {Integer} y
	 * @return {Object} r, g, b, a values are within the range [0, 255]
	 */
	getPixelColorRGBA(x, y) {
		const {data} = this;
		const idx = this._getPixelIndex(x, y);
		
		return {
			r: data[idx],
			g: data[idx + 1],
			b: data[idx + 2],
			a: data[idx + 3]
		};
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
		const {width, height} = this;
		
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
	 */
	_scan(...args) {
		// _scan(fn) - scan the whole area in default mode
		// _scan(mode, fn) - scan the whole area in a specified mode
		// _scan(fn, x1, y1, x2, y2) - scan an area
		// _scan(mode, fn, x1, y1, x2, y2) - scan an area in a specified mode
		const mode = typeof args[0] === "string" ? args.shift() : "TB-LR";
		const fn = args.shift();
		let [x1, y1, x2, y2] = args;
		const range = this._getRange(x1, y1, x2, y2);
		
		if (!range) {
			return this;
		}
		
		[x1, y1, x2, y2] = range;
		
		function t2b(callback) {
			for (let y = y1; y <= y2; y++) {
				callback(y);
			}
		}
		function b2t(callback) {
			for (let y = y2; y >= y1; y--) {
				callback(y);
			}
		}
		function l2r(callback) {
			for (let x = x1; x <= x2; x++) {
				callback(x);
			}
		}
		function r2l(callback) {
			for (let x = x2; x >= x1; x--) {
				callback(x);
			}
		}
		const scanFn = (x, y) => fn(this._getPixelIndex(x, y), x, y);
		
		switch (mode) {
		// horizontal scan
		case "TB-LR":
			/* 
			 * outer (big) loop: TOP to BOTTOM
			 * inner {small} loop: LEFT to RIGHT
			 *
			 * START (x1, y1) >>>>>>>>>>>>
			 *  ⤷ ...
			 *  ⤷ >>>>>>>>>>> (x2, y2) END
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 1 2 3 4, 5 6 7 8
			 */
			t2b(y => l2r(x => scanFn(x, y)));
			break;
		case "TB-RL":
			/*
			 * outer (big) loop: TOP to BOTTOM
			 * inner {small} loop: RIGHT to LEFT
			 * 
			 * <<<<<<<<<<<<< (x2, y1) START
			 *                       ... ⤶
			 * END (x1, y2) <<<<<<<<<<<< ⤶
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 4 3 2 1, 8 7 6 5
			 */
			t2b(y => r2l(x => scanFn(x, y)));
			break;
		case "BT-LR":
			/*
			 * outer (big) loop: BOTTOM to TOP
			 * inner {small} loop: LEFT to RIGHT
			 * 
			 * ↱ >>>>>>>>>> (x2, y1) END
			 * ↱...
			 * START (x1, y2) >>>>>>>>>>>
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 5 6 7 8, 1 2 3 4
			 */
			b2t(y => l2r(x => scanFn(x, y)));
			break;
		case "BT-RL":
			/*
			 * outer (big) loop: BOTTOM to TOP
			 * inner {small} loop: RIGHT to LEFT
			 * 
			 * END (x1, y2) <<<<<<<<<<<< ↰
			 *                       ... ↰
			 * <<<<<<<<<<<<< (x2, y1) START
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 8 7 6 5, 4 3 2 1
			 */
			b2t(y => r2l(x => scanFn(x, y)));
			break;
		// vertical scan
		case "LR-TB":
			/*
			 * outer (big) loop: LEFT to RIGHT
			 * inner {small} loop: TOP to BOTTOM
			 * 
			 * START (x1, y1) ↴ .... ↴
			 *   ⬇           ⬇      ⬇
			 *   .            .       .
			 *   ⬇           ⬇      ⬇
			 *   ⬇...        ⬇  (x2, y1) END
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 1 5, 2 6, 3 7, 4 8
			 */
			l2r(x => t2b(y => scanFn(x, y)));
			break;
		case "LR-BT":
			/*
			 * outer (big) loop: LEFT to RIGHT
			 * inner {small} loop: BOTTOM to TOP
			 * 
			 *   ⬆ ....       ⬆ (x2, y1) END
			 *   ⬆            ⬆    ⬆
			 *   .             .     .
			 *   ⬆            ⬆    ⬆
			 * START (x1, y2) ︎︎⤴... ⤴
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 5 1, 6 2, 7 3, 8 4
			 */
			l2r(x => b2t(y => scanFn(x, y)));
			break;
		case "RL-TB":
			/*
			 * outer (big) loop: RIGHT to LEFT
			 * inner {small} loop: TOP to BOTTOM
			 * 
			 *  ⤹....      ... ⤹  START (x2, y1)
			 *  ⬇          ... ⬇    ⬇
			 *  .           ... .     .
			 *  ⬇          ... ⬇    ⬇
			 * (x1, y2) END ... ⬇    ⬇
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 4 8, 3 7, 2 6, 1 5
			 */
			r2l(x => t2b(y => scanFn(x, y)));
			break;
		case "RL-BT":
			/*
			 * outer (big) loop: RIGHT to LEFT
			 * inner {small} loop: BOTTOM to TOP
			 * 
			 * START (x1, y1) ︎... ⬆      ⬆
			 *  ⬆                ⬆      ⬆
			 *  .                 .       .
			 *  ⬆                ⬆      ⬆
			 *  ︎︎↻            ... ↻ (x2, y2) START
			 * 
			 * e.g.
			 * -------
			 * 1 2 3 4
			 * 5 6 7 8
			 * -------
			 * the scan sequence will be: 8 4, 7 3, 6 2, 5 1
			 */
			r2l(x => b2t(y => scanFn(x, y)));
			break;
		default:
			throw new Error(`scan mode "${mode}" not supported`);
		}
		
		return this;
	}
	
	/**
	 * returns the offset of a pixel in the bitmap buffer
	 * @param {Integer} x
	 * @param {Integer} y
	 * @returns {Integer} the index of the pixel or -1 if not found
	 */
	_getPixelIndex(x, y) {
		return (this.width * (y - 1) + x - 1) * 4;
	}
	
	_getPixel(x, y) {
		const {data} = this;
		const idx = this._getPixelIndex(x, y);
		
		return {
			r: data[idx],
			g: data[idx + 1],
			b: data[idx + 2],
			a: data[idx + 3]
		};
	}
	/**
	 * converts the image data to a buffer
	 * @param {Object} [opts] some options
	 * @return {Promise.<Buffer>}
	 */
	toBuffer(opts) {
		return bitmapEncode(this._bitmap, opts);
	}
	
	/**
	 * converts the image data to a base 64 string
	 * @param {String} [mime]
	 * @return {Promise.<String>}
	 */
	toBase64(mime = this.mime) {
		return this.toBuffer({
			mime
		}).then(buffer => `data:${mime};base64,${buffer.toString("base64")}`);
	}
	
	clone() {
		const {data: dataToClone, width, height, mime} = this;
		const data = new Buffer(dataToClone.length);
		this._scan(idx => data.writeUInt32BE(dataToClone.readUInt32BE(idx, true), idx, true));
		
		return new Image({
			data, width, height, mime
		});
	}
	
	/**
	 * Writes the image to a local file
	 * @param {String} savePath a path to the destination file, will try to determine mime from it
	 * @param {Object} [opts] saving options
	 * @returns {Promise}
	 */
	save(savePath, opts = {}) {
		if (!opts.mime) {
			opts.mime = fileMime.determine(savePath);
		}
		
		return this.toBuffer(opts).then(buffer => fileSave(buffer, savePath));
	}
}

// load methods
(pluginDir => {
	const protoOfImage = Image.prototype;
	
	fs.readdirSync(pluginDir).forEach(fileName => {
		if (fileName.startsWith("_") || !fileName.endsWith(".js")) {
			return;
		}
		
		protoOfImage[fileName.replace(/\.js$/, "")] = require(path.join(pluginDir, fileName));
	});
})(path.join(__dirname, "lib/methods"));

/**
 * create an Image instance using file path or buffer
 * @param {String|Buffer} file
 * @return {Promise.<Image>}
 */
export default file => bitmapDecode(file).then(bitmap => new Image(bitmap));