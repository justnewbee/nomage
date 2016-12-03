import fs from "fs";

import JPEG from "jpeg-js";

export default file => {
	let buffer = typeof file === "string" ? fs.readFileSync(file) : file;
	let bitmap = JPEG.decode(buffer);
	
	bitmap.data_ = buffer;
	
	return bitmap;
};