import {MIME} from "../const";

import bmpUnparse from "./bmp/unparse";
import jpgUnparse from "./jpg/unparse";
import pngUnparse from "./png/unparse";

/**
 * convert bitmap object's data into a file buffer
 * @param {Object} bitmap
 * @return {Buffer} file buffer instead of image buffer
 */
export default bitmap => new Promise((resolve, reject) => {
	switch (bitmap.mime) {
	case MIME.BMP:
		return resolve(bmpUnparse(bitmap));
	case MIME.JPG:
		return resolve(jpgUnparse(bitmap));
	case MIME.PNG:
		return resolve(pngUnparse(bitmap));
	default: // no other mime types, default png
		reject(`[bitmap/unparse] unsupported mime "${bitmap.mime}"`);
	}
});