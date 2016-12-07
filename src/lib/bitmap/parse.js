import fs from "fs";

import request from "request";

const requestFile = request.defaults({
	encoding: null
});

import {MIME} from "../const";
import fileMime from "../file/mime";

import bmpParse from "./bmp/parse";
import jpgParse from "./jpg/parse";
import pngParse from "./png/parse";

/**
 * convert file into a bitmap object
 * @param {String|Buffer} file when string it can be file local path or a url
 * @return {Promise.<Object>} bitmap object { width, height, mime, data, data_ }
 */
export default file => new Promise((resolve, reject) => {
	if (Buffer.isBuffer(file)) {
		resolve(file);
	} else if (typeof file === "string") {
		if (/^(?:\w+:)?\/\//.test(file)) { // URL
			requestFile(file, function(err, response, data) {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		} else { // local file
			fs.readFile(file, (err, data) => {
				if (err) {
					reject(err);
				} else {
					resolve(data);
				}
			});
		}
	} else {
		reject({
			message: "cannot resolve to a buffer",
			detail: file
		});
	}
}).then(buffer => {
	let mime = fileMime(buffer);
	let bitMap;
	
	switch (mime) {
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
		throw new Error(`[bitmap/parse] unsupported mime "${mime}"`);
	}
	
	bitMap.mime = mime;
	bitMap.data_ = buffer; // file buffer and image buffer are quite different, put one here for ref
	
	return bitMap;
});