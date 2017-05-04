"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require("mkdirp");

var _mkdirp2 = _interopRequireDefault(_mkdirp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (buffer, filePath) {
	return new _promise2.default(function (resolve, reject) {
		(0, _mkdirp2.default)(_path2.default.dirname(filePath), function (err) {
			if (err) {
				return reject(err);
			}

			var stream = _fs2.default.createWriteStream(filePath);

			stream.on("open", function () {
				stream.write(buffer);
				stream.end();
			}).on("error", function (err2) {
				return reject(err2);
			}).on("finish", resolve);
		});
	});
};

module.exports = exports["default"];