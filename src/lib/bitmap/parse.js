import fs from "fs";

import {MIME} from "../const";
import mime from "../file/mime";

import bmpParse from "./bmp/parse";
import jpgParse from "./jpg/parse";
import pngParse from "./png/parse";

/**
 * convert file into a bitmap object
 * @param {String|Buffer} file
 * @return {Object} data
 */
export default file => {
	let buffer = typeof file === "string" ? fs.readFileSync(file) : file;
	let mimeType = mime(buffer);
	let bitMap;
	
	switch (mimeType) {
	case MIME.BMP:
		bitMap = bmpParse(buffer);
		break;
	case MIME.JPG:
		bitMap = jpgParse(buffer);
		break;
	case MIME.PNG:
		bitMap = pngParse(buffer);
		break;
	default:
		throw new Error(`[bitmap/parse] unsupported mime "${mimeType}"`);
	}
	
	bitMap.mime = mimeType;
	bitMap.data_ = buffer; // file buffer and image buffer are quite different, put one here for ref
	
	return bitMap;
};