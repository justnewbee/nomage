"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _MIME_MAP;

var _readChunk = require("./read-chunk");

var _readChunk2 = _interopRequireDefault(_readChunk);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BMP = "image/bmp";
var JPG = "image/jpeg";
var PNG = "image/png";
var MIME_MAP = (_MIME_MAP = {}, (0, _defineProperty3.default)(_MIME_MAP, BMP, ["bmp"]), (0, _defineProperty3.default)(_MIME_MAP, JPG, ["jpg", "jpeg", "jpe"]), (0, _defineProperty3.default)(_MIME_MAP, PNG, ["png"]), _MIME_MAP);
var REG_EXT = /\.(\w+)$/;

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
function extToMime() {
	var ext = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

	var mime = void 0;

	ext = ext.toLowerCase();

	for (mime in MIME_MAP) {
		if (MIME_MAP.hasOwnProperty(mime)) {
			if (MIME_MAP[mime].indexOf(ext) >= 0) {
				return mime;
			}
		}
	}

	return "";
}

exports.default = {
	BMP: BMP, JPG: JPG, PNG: PNG,
	/**
  * check if the mime is supported yet
  * @param {String} mime
  * @return {Boolean}
  */
	isSupported: function isSupported(mime) {
		return [BMP, JPG, PNG].indexOf(mime) >= 0;
	},

	/**
  * determine supported image mime type string from file path or buffer by
  * checking the [magic number](http://en.wikipedia.org/wiki/Magic_number_(programming)#Magic_numbers_in_files) of the buffer
  * @param {String|Buffer} file file path or file buffer
  * @param {Boolean} [lookDeeper] by default file ext is used to determine image mime, however, when the image comes with no ext,
  *   or cannot determine whether it is an image, we still will look into the buffer
  * @return {String}
  * @throws {Error} when filePath refers to a file that cannot be read or does NOT exist - from readChunk
  */
	determine: function determine(file, lookDeeper) {
		var mime = void 0;

		if (typeof file === "string" && !lookDeeper) {
			mime = extToMime(getExt(file));
		}

		if (mime) {
			return mime;
		}

		var buffer = typeof file === "string" ? (0, _readChunk2.default)(file) : file;

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
	},


	/**
  * get ext string regarding the mime type
  * @param {String} mime
  * @return {String}
  */
	mimeToExt: function mimeToExt(mime) {
		return (MIME_MAP[mime] || [""])[0];
	}
};
module.exports = exports["default"];