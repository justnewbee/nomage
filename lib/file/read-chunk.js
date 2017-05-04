"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Read a chunk from a file
 * @param {String} filePath
 * @param {int} [startPos]
 * @param {int} [len]
 * @return {Buffer}
 * @throws {Error} when filePath refers to a file that cannot be read or does NOT exist
 */
exports.default = function (filePath) {
	var startPos = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	var len = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 262;

	var buffer = new Buffer(len);

	var fd = _fs2.default.openSync(filePath, "r");
	var bytesRead = _fs2.default.readSync(fd, buffer, 0, len, startPos);

	_fs2.default.closeSync(fd);

	if (bytesRead < len) {
		buffer = buffer.slice(0, bytesRead);
	}

	return buffer;
};

module.exports = exports["default"];