import fs from "fs";

export default (buffer, filePath) => new Promise((resolve, reject) => {
	let stream = fs.createWriteStream(filePath);
	
	stream.on("open", () => {
		stream.write(buffer);
		stream.end();
	}).on("error", err => reject(err)).on("finish", resolve);
});