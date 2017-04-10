"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _mime = require("../file/mime");

var _mime2 = _interopRequireDefault(_mime);

var _encode = require("./bmp/encode");

var _encode2 = _interopRequireDefault(_encode);

var _encode3 = require("./jpg/encode");

var _encode4 = _interopRequireDefault(_encode3);

var _encode5 = require("./png/encode");

var _encode6 = _interopRequireDefault(_encode5);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * encode a bitmap object back to a file buffer - which then can be used for saving
 * @param {Object} bitmap
 * @param {Object} [opts] only for JPEG
 * @return {Promise.<Buffer>} file buffer instead of image buffer
 */
exports.default = function (bitmap) {
	var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	return new _promise2.default(function (resolve, reject) {
		var mime = opts.mime;


		if (!_mime2.default.isSupported(mime)) {
			mime = bitmap.mime;
		}
		if (!_mime2.default.isSupported(mime)) {
			// check again, although it will NEVER happen
			mime = _mime2.default.PNG;
		}

		switch (mime) {
			case _mime2.default.BMP:
				return resolve((0, _encode2.default)(bitmap));
			case _mime2.default.JPG:
				return resolve((0, _encode4.default)(bitmap, opts.quality));
			case _mime2.default.PNG:
				return resolve((0, _encode6.default)(bitmap));
			default:
				// won't happen, but keep the logic robust
				reject("[bitmap/encode] unsupported mime \"" + mime + "\"");
		}
	});
};

module.exports = exports["default"];