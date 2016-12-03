import parseFileType from "file-type";

import readChunk from "./read-chunk";

/**
 * get file type object from file path or buffer
 * @param {String|Buffer} file file path or file buffer
 * @return {Object} something like { ext: "jpg", mime: "image/jpeg" }
 */
export default file => {
	let buffer = typeof file === "string" ? readChunk(file) : file;
	let fileType = buffer instanceof Buffer ? parseFileType(buffer) : null;
	
	return fileType || {
		ext: "",
		mime: ""
	};
};