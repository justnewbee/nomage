import fs from "fs";

/**
 * Read a chunk from a file
 * @param {String} filePath
 * @param {Integer} [startPos]
 * @param {Integer} [len]
 * @return {Buffer}
 */
export default (filePath, startPos = 0, len = 262) => {
	let buffer = new Buffer(len);
	
	const fd = fs.openSync(filePath, "r");
	const bytesRead = fs.readSync(fd, buffer, 0, len, startPos);
	
	fs.closeSync(fd);
	
	if (bytesRead < len) {
		buffer = buffer.slice(0, bytesRead);
	}
	
	return buffer;
};
