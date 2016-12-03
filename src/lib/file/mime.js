import parseFileType from "file-type";

import readChunk from "./read-chunk";

/**
 * get file mime type string from file path or buffer
 * @param {String|Buffer} file file path or file buffer
 * @return {String}
 */
export default file => {
	let buffer = typeof file === "string" ? readChunk(file) : file;
	let fileType = Buffer.isBuffer(buffer) ? parseFileType(buffer) : null;
	
	return fileType ? fileType.mime : "";
};