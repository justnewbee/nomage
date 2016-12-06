import {MIME} from "./const";
import bitmapParse from "./bitmap/parse";
import bitmapUnparse from "./bitmap/unparse";
import fileSave from "./file/save";

//import mime from "mime";

function createBitmapFromScratch(w, h, fill) {
	let bitmap = {
		buffer: new Buffer(w * h * 4),
		width: w,
		height: h,
	};
	
	for (let i = 0; i < bitmap.buffer.length; i = i + 4) {
		bitmap.buffer.writeUInt32BE(fill, i);
	}
}
function createFromPath(filePath) {
	var that = this;
	
	let buffer = fs.readFileSync(filePath);
	
	parseBitmap(buffer);
//	
//	getMIMEFromPath(filePath, function(err, mime) {
//		fs.readFileSync(filePath, function(err, data) {
//			if (err) {
//				return throwError.call(that, err, cb);
//			}
//			parseBitmap.call(buffer, mime, cb);
//		});
//	});
}

function parseBitmap(buffer, mime) {
	switch (this.getMIME()) {
	case MIME.PNG:
		var png = new PNG();
		png.parse(buffer, function(err, data) {
			if (err) {
				return throwError.call(that, err, cb);
			}
			that.bitmap = {
				data: new Buffer(data.data),
				width: data.width,
				height: data.height
			};
			return cb.call(that, null, that);
		});
		break;
	case MIME.JPG:
		try {
			this.bitmap = JPEG.decode(buffer);
			exifRotate(this, buffer); // EXIF data
			return cb.call(this, null, this);
		} catch (err) {
			return cb.call(this, err, this);
		}
	case MIME.BMP:
		this.bitmap = BMP.decode(buffer);
		return cb.call(this, null, this);
	default:
		throw new Error("Unsupported MIME type: " + mime);
	}
}

export default class Image {
	constructor() {
		let arg0 = arguments[0];
		
		if ("number" === typeof arg0) {
			this._bitmap = createBitmapFromScratch(arg0, arguments[1], arguments[2]);
//		} else if ("object" === typeof arg0 && arg0.constructor === Image) {
//			this._createFromClone();
//		} else if (/(?:[a-z]+:)?\/\//.test(arg0)) {
//			this._createFromUrl(arg0);
		} else if ("string" === typeof arg0 || Buffer.isBuffer(arg0)) {
			this._bitmap = bitmapParse(arg0);
		} else {
			throw new Error("no matching constructor overloading was found. Please see the docs for how to call the Image constructor.");
		}
	}
	
	get width() {
		return this._bitmap.width;
	}
	
	get height() {
		return this._bitmap.height;
	}
	
	get buffer() {
		return this._bitmap.buffer;
	}
	
	get base64() {
		
	}
	
	draw() {
		
	}
	
	/**
	 * Writes the image to a local file
	 * @param {String} savePath a path to the destination file (either PNG or JPG)
	 * @returns {Promise}
	 */
	save(savePath) {
		return bitmapUnparse(bitmapParse(this.buffer)).then(buffer => {
			fileSave(buffer, savePath);
		});
	}
};