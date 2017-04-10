"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _request = require("request");

var _request2 = _interopRequireDefault(_request);

var _mime = require("../file/mime");

var _mime2 = _interopRequireDefault(_mime);

var _decode = require("./bmp/decode");

var _decode2 = _interopRequireDefault(_decode);

var _decode3 = require("./jpg/decode");

var _decode4 = _interopRequireDefault(_decode3);

var _decode5 = require("./png/decode");

var _decode6 = _interopRequireDefault(_decode5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var requestFile = _request2.default.defaults({
	encoding: null
});

/**
 * decode an image file, whether local file path, url or just a file buffer, into a bitmap object - which then can be used to perform image edting actions
 * @param {String|Buffer} file when string it can be file local path or a url
 * @return {Promise.<Object>} bitmap object { width, height, mime, data, data_ }
 */
exports.default = function (file) {
	return new _promise2.default(function (resolve, reject) {
		if (Buffer.isBuffer(file)) {
			resolve(file);
		} else if (typeof file === "string") {
			if (/^(?:\w+:)?\/\//.test(file)) {
				// URL
				requestFile(file, function (err, response, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			} else {
				// local file
				_fs2.default.readFile(file, function (err, data) {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			}
		} else {
			reject({
				message: "cannot resolve to a buffer",
				detail: file
			});
		}
	}).then(function (buffer) {
		var mime = _mime2.default.determine(buffer);
		var bitMap = void 0;

		switch (mime) {
			case _mime2.default.BMP:
				bitMap = (0, _decode2.default)(buffer);
				break;
			case _mime2.default.JPG:
				bitMap = (0, _decode4.default)(buffer);
				break;
			case _mime2.default.PNG:
				bitMap = (0, _decode6.default)(buffer);
				break;
			default:
				throw new Error("[bitmap/parse] unsupported mime \"" + mime + "\"");
		}

		bitMap.mime = mime;

		return bitMap;
	});
};

module.exports = exports["default"];