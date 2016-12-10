import {MIME} from "../const";

import bmpEncode from "./bmp/encode";
import jpgEncode from "./jpg/encode";
import pngEncode from "./png/encode";

/**
 * encode a bitmap object back to a file buffer - which then can be used for saving
 * @param {Object} bitmap
 * @return {Buffer} file buffer instead of image buffer
 */
export default bitmap => new Promise((resolve, reject) => {
	switch (bitmap.mime) {
	case MIME.BMP:
		return resolve(bmpEncode(bitmap));
	case MIME.JPG:
		return resolve(jpgEncode(bitmap));
	case MIME.PNG:
		return resolve(pngEncode(bitmap));
	default: // no other mime types, default png
		reject(`[bitmap/encode] unsupported mime "${bitmap.mime}"`);
	}
});