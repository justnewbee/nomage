import fs from "fs";

import request from "request";

const requestFile = request.defaults({
	encoding: null
});

import fileMime from "../file/mime";

import bmpDecode from "./bmp/decode";
import jpgDecode from "./jpg/decode";
import pngDecode from "./png/decode";

/**
 * decode an image file, whether local file path, url or just a file buffer, into a bitmap object - which then can be used to perform image edting actions
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
	const mime = fileMime.determine(buffer);
	let bitMap;
	
	switch (mime) {
	case fileMime.BMP:
		bitMap = bmpDecode(buffer);
		break;
	case fileMime.JPG:
		bitMap = jpgDecode(buffer);
		break;
	case fileMime.PNG:
		bitMap = pngDecode(buffer);
		break;
	default:
		throw new Error(`[bitmap/parse] unsupported mime "${mime}"`);
	}
	
	bitMap.mime = mime;
	bitMap._buffer = buffer; // file buffer and image buffer are quite different, put one here for ref
	
	return bitMap;
});