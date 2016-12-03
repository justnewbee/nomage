import fs from "fs";

//import BMP from "bmp-js";

import decode from "./decode";

/**
 * 
 * @param {String|Buffer} file
 */
export default file => {
	let buffer = typeof file === "string" ? fs.readFileSync(file) : file;
//	let bitmap = /*BMP.*/decode(buffer);
//	
//	bitmap.data_ = buffer;
	
	decode.fuck(buffer);
	
//	return bitmap;
};