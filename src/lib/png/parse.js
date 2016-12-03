import fs from "fs";

import {PNG} from "pngjs";

/**
 * 
 * @param {String|Buffer} file
 */
export default file => {
	let buffer = typeof file === "string" ? fs.readFileSync(file) : file;
	let bitmap = PNG.sync.read(buffer);
	
	bitmap.data_ = buffer;
	
	return bitmap;
};