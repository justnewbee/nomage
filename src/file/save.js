import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";

export default (buffer, filePath) => new Promise((resolve, reject) => {
	mkdirp(path.dirname(filePath), err => {
		if (err) {
			return reject(err);
		}
		
		const stream = fs.createWriteStream(filePath);
		
		stream.on("open", () => {
			stream.write(buffer);
			stream.end();
		}).on("error", err2 => reject(err2)).on("finish", resolve);
	});
});