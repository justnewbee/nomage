import readChunk from "./read-chunk";

const BMP = "image/bmp";
const JPG = "image/jpeg";
const PNG = "image/png";
const MIME_MAP = {
	[BMP]: ["bmp"],
	[JPG]: ["jpg", "jpeg", "jpe"],
	[PNG]: ["png"]
};
const REG_EXT = /\.(\w+)$/;

/**
 * get file ext from file path
 * @param {String} filePath
 * @return {String}
 */
function getExt(filePath) {
	return REG_EXT.test(filePath) ? RegExp.$1 : "";
}

/**
 * get mime type string according to ext string
 * @param {String} ext
 * @return {String}
 */
function extToMime(ext = "") {
	let mime;
	
	ext = ext.toLowerCase();
	
	for (mime in MIME_MAP) {
		if (MIME_MAP.hasOwnProperty(mime)) {
			if (MIME_MAP[mime].indexOf(ext)) {
				return mime;
			}
		}
	}
	
	return "";
}

/**
 * get supported image mime type string from file path or buffer by
 * checking the [magic number](http://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files) of the buffer
 * @param {String|Buffer} file file path or file buffer
 * @param {Boolean} lookDeeper by default file ext is used to determine image mime, however, when the image comes with no ext,
 *   or cannot determine whether it is an image, we still will look into the buffer
 * @return {String}
 * @throws {Error} when filePath refers to a file that cannot be read or does NOT exist - from readChunk
 */
function determineMime(file, lookDeeper) {
	let mime;
	
	if (typeof file === "string" && !lookDeeper) {
		mime = extToMime(getExt(file));
	}
	
	if (mime) {
		return mime;
	}
	
	const buffer = typeof file === "string" ? readChunk(file) : file;
	
	if (!Buffer.isBuffer(buffer)) {
		throw new Error("should provide a file buffer or path");
	}
	
	if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
		return JPG;
	}
	
	if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
		return PNG;
	}
	
	if (buffer[0] === 0x42 && buffer[1] === 0x4D) {
		return BMP;
	}
	
	return "";
}
/**
 * get ext string regarding the mime type
 * @param {String} mime
 * @return {String}
 */
determineMime.mimeToExt = function(mime) {
	return (MIME_MAP[mime] || [""])[0];
};

export default determineMime;