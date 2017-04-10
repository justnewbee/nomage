import fs from "fs";

/**
 * Read a chunk from a file
 * @param {String} filePath
 * @param {int} [startPos]
 * @param {int} [len]
 * @return {Buffer}
 * @throws {Error} when filePath refers to a file that cannot be read or does NOT exist
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
