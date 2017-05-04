import fileMime from "../file/mime";

import bmpEncode from "./bmp/encode";
import jpgEncode from "./jpg/encode";
import pngEncode from "./png/encode";

/**
 * encode a bitmap object back to a file buffer - which then can be used for saving
 * @param {Object} bitmap
 * @param {Object} [opts] only for JPEG
 * @return {Promise.<Buffer>} file buffer instead of image buffer
 */
export default (bitmap, opts = {}) => new Promise((resolve, reject) => {
	let {mime} = opts;
	
	if (!fileMime.isSupported(mime)) {
		mime = bitmap.mime;
	}
	if (!fileMime.isSupported(mime)) { // check again, although it will NEVER happen
		mime = fileMime.PNG;
	}
	
	switch (mime) {
	case fileMime.BMP:
		return resolve(bmpEncode(bitmap));
	case fileMime.JPG:
		return resolve(jpgEncode(bitmap, opts.quality));
	case fileMime.PNG:
		return resolve(pngEncode(bitmap));
	default: // won't happen, but keep the logic robust
		reject(`[bitmap/encode] unsupported mime "${mime}"`);
	}
});