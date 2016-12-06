import parseFileType from "file-type";

import readChunk from "./read-chunk";

/**
 * get file mime type string from file path or buffer
 * @param {String|Buffer} file file path or file buffer
 * @return {String}
 * @throws {Error} when filePath refers to a file that cannot be read or does NOT exist - from readChunk
 */
export default file => {
	let buffer = typeof file === "string" ? readChunk(file) : file;
	
	if (!Buffer.isBuffer(buffer)) {
		throw new Error("should provide a file buffer or path");
	}
	
	let fileType = parseFileType(buffer);
	
	return fileType ? fileType.mime : "";
};