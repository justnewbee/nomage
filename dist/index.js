"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _decode = require("./lib/bitmap/decode");

var _decode2 = _interopRequireDefault(_decode);

var _encode = require("./lib/bitmap/encode");

var _encode2 = _interopRequireDefault(_encode);

var _mime = require("./lib/file/mime");

var _mime2 = _interopRequireDefault(_mime);

var _save = require("./lib/file/save");

var _save2 = _interopRequireDefault(_save);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * a wrapper over bitmap
 */
var Image = function () {
	function Image(bitmap) {
		(0, _classCallCheck3.default)(this, Image);

		this._bitmap = bitmap;
	}

	(0, _createClass3.default)(Image, [{
		key: "getPixelColorHex",


		/**
   * get pixel color as 32bits HEX integer
   * @param {Integer} x
   * @param {Integer} y
   * @return {Integer} rgba color HEX that is below or equal to 0xFFFFFFFF
   */
		value: function getPixelColorHex(x, y) {
			var data = this.data;

			var idx = this._getPixelIndex(x, y);

			return data.readUInt32BE(idx);
		}
		/**
   * set pixel color with 32bits HEX integer
   * @param {Integer} x
   * @param {Integer} y
   * @param {Integer} hex
   */

	}, {
		key: "setPixelColorHex",
		value: function setPixelColorHex(x, y, hex) {
			var data = this.data;

			var idx = this._getPixelIndex(x, y);

			data.writeUInt32BE(hex, idx, true);

			return this;
		}
		/**
   * get pixel color as rgba object
   * @param {Integer} x
   * @param {Integer} y
   * @return {Object} r, g, b, a values are within the range [0, 255]
   */

	}, {
		key: "getPixelColorRGBA",
		value: function getPixelColorRGBA(x, y) {
			var data = this.data;

			var idx = this._getPixelIndex(x, y);

			return {
				r: data[idx],
				g: data[idx + 1],
				b: data[idx + 2],
				a: data[idx + 3]
			};
		}
		/**
   * get a range inside the image, if the range is outside of the image, null is returned
   * @param {Integer} [x1=1]
   * @param {Integer} [y1=1]
   * @param {Integer} [x2=this.width]
   * @param {Integer} [y2=this.height]
   * @return {Array} or null
   */

	}, {
		key: "_getRange",
		value: function _getRange() {
			var x1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
			var y1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
			var x2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.width;
			var y2 = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : this.height;
			var width = this.width,
			    height = this.height;

			// make sure (x1, y1) is the top-left corner of the range and (x2, y2) the bottom-right

			if (x1 > x2) {
				var _ref = [x2, x1];
				x1 = _ref[0];
				x2 = _ref[1];
			}
			if (y1 > y2) {
				var _ref2 = [y2, y1];
				y1 = _ref2[0];
				y2 = _ref2[1];
			}

			if (x1 > width || x2 < 0 || y1 > height || y2 < 0) {
				return null;
			}

			// limit the coordinates inside the image, with x between [1, width] and y [1, height]
			x1 = Math.min(width, Math.max(1, x1));
			y1 = Math.min(height, Math.max(1, y1));
			x2 = Math.min(width, Math.max(1, x2));
			y2 = Math.min(height, Math.max(1, y2));

			return [x1, y1, x2, y2];
		}
		/**
   * scan through a region of the bitmap, calling a function for each pixel
   * NOTE (x1, y1) and (x2, y2) ranges start from 1
   */

	}, {
		key: "_scan",
		value: function _scan() {
			var _this = this;

			for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
				args[_key] = arguments[_key];
			}

			// _scan(fn) - scan the whole area in default mode
			// _scan(mode, fn) - scan the whole area in a specified mode
			// _scan(fn, x1, y1, x2, y2) - scan an area
			// _scan(mode, fn, x1, y1, x2, y2) - scan an area in a specified mode
			var mode = typeof args[0] === "string" ? args.shift() : "TB-LR";
			var fn = args.shift();
			var x1 = args[0],
			    y1 = args[1],
			    x2 = args[2],
			    y2 = args[3];

			var range = this._getRange(x1, y1, x2, y2);

			if (!range) {
				return this;
			}

			var _range = (0, _slicedToArray3.default)(range, 4);

			x1 = _range[0];
			y1 = _range[1];
			x2 = _range[2];
			y2 = _range[3];


			function t2b(callback) {
				for (var y = y1; y <= y2; y++) {
					callback(y);
				}
			}
			function b2t(callback) {
				for (var y = y2; y >= y1; y--) {
					callback(y);
				}
			}
			function l2r(callback) {
				for (var x = x1; x <= x2; x++) {
					callback(x);
				}
			}
			function r2l(callback) {
				for (var x = x2; x >= x1; x--) {
					callback(x);
				}
			}
			var scanFn = function scanFn(x, y) {
				return fn(_this._getPixelIndex(x, y), x, y);
			};

			switch (mode) {
				// horizontal scan
				case "TB-LR":
					/* 
      * outer (big) loop: TOP to BOTTOM
      * inner {small} loop: LEFT to RIGHT
      *
      * START (x1, y1) >>>>>>>>>>>>
      *  ⤷ ...
      *  ⤷ >>>>>>>>>>> (x2, y2) END
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 1 2 3 4, 5 6 7 8
      */
					t2b(function (y) {
						return l2r(function (x) {
							return scanFn(x, y);
						});
					});
					break;
				case "TB-RL":
					/*
      * outer (big) loop: TOP to BOTTOM
      * inner {small} loop: RIGHT to LEFT
      * 
      * <<<<<<<<<<<<< (x2, y1) START
      *                       ... ⤶
      * END (x1, y2) <<<<<<<<<<<< ⤶
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 4 3 2 1, 8 7 6 5
      */
					t2b(function (y) {
						return r2l(function (x) {
							return scanFn(x, y);
						});
					});
					break;
				case "BT-LR":
					/*
      * outer (big) loop: BOTTOM to TOP
      * inner {small} loop: LEFT to RIGHT
      * 
      * ↱ >>>>>>>>>> (x2, y1) END
      * ↱...
      * START (x1, y2) >>>>>>>>>>>
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 5 6 7 8, 1 2 3 4
      */
					b2t(function (y) {
						return l2r(function (x) {
							return scanFn(x, y);
						});
					});
					break;
				case "BT-RL":
					/*
      * outer (big) loop: BOTTOM to TOP
      * inner {small} loop: RIGHT to LEFT
      * 
      * END (x1, y2) <<<<<<<<<<<< ↰
      *                       ... ↰
      * <<<<<<<<<<<<< (x2, y1) START
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 8 7 6 5, 4 3 2 1
      */
					b2t(function (y) {
						return r2l(function (x) {
							return scanFn(x, y);
						});
					});
					break;
				// vertical scan
				case "LR-TB":
					/*
      * outer (big) loop: LEFT to RIGHT
      * inner {small} loop: TOP to BOTTOM
      * 
      * START (x1, y1) ↴ .... ↴
      *   ⬇           ⬇      ⬇
      *   .            .       .
      *   ⬇           ⬇      ⬇
      *   ⬇...        ⬇  (x2, y1) END
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 1 5, 2 6, 3 7, 4 8
      */
					l2r(function (x) {
						return t2b(function (y) {
							return scanFn(x, y);
						});
					});
					break;
				case "LR-BT":
					/*
      * outer (big) loop: LEFT to RIGHT
      * inner {small} loop: BOTTOM to TOP
      * 
      *   ⬆ ....       ⬆ (x2, y1) END
      *   ⬆            ⬆    ⬆
      *   .             .     .
      *   ⬆            ⬆    ⬆
      * START (x1, y2) ︎︎⤴... ⤴
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 5 1, 6 2, 7 3, 8 4
      */
					l2r(function (x) {
						return b2t(function (y) {
							return scanFn(x, y);
						});
					});
					break;
				case "RL-TB":
					/*
      * outer (big) loop: RIGHT to LEFT
      * inner {small} loop: TOP to BOTTOM
      * 
      *  ⤹....      ... ⤹  START (x2, y1)
      *  ⬇          ... ⬇    ⬇
      *  .           ... .     .
      *  ⬇          ... ⬇    ⬇
      * (x1, y2) END ... ⬇    ⬇
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 4 8, 3 7, 2 6, 1 5
      */
					r2l(function (x) {
						return t2b(function (y) {
							return scanFn(x, y);
						});
					});
					break;
				case "RL-BT":
					/*
      * outer (big) loop: RIGHT to LEFT
      * inner {small} loop: BOTTOM to TOP
      * 
      * START (x1, y1) ︎... ⬆      ⬆
      *  ⬆                ⬆      ⬆
      *  .                 .       .
      *  ⬆                ⬆      ⬆
      *  ︎︎↻            ... ↻ (x2, y2) START
      * 
      * e.g.
      * -------
      * 1 2 3 4
      * 5 6 7 8
      * -------
      * the scan sequence will be: 8 4, 7 3, 6 2, 5 1
      */
					r2l(function (x) {
						return b2t(function (y) {
							return scanFn(x, y);
						});
					});
					break;
				default:
					throw new Error("scan mode \"" + mode + "\" not supported");
			}

			return this;
		}

		/**
   * returns the offset of a pixel in the bitmap buffer
   * @param {Integer} x
   * @param {Integer} y
   * @returns {Integer} the index of the pixel or -1 if not found
   */

	}, {
		key: "_getPixelIndex",
		value: function _getPixelIndex(x, y) {
			return (this.width * (y - 1) + x - 1) * 4;
		}
	}, {
		key: "_getPixel",
		value: function _getPixel(x, y) {
			var data = this.data;

			var idx = this._getPixelIndex(x, y);

			return {
				r: data[idx],
				g: data[idx + 1],
				b: data[idx + 2],
				a: data[idx + 3]
			};
		}
		/**
   * converts the image data to a buffer
   * @param {Object} [opts] some options
   * @return {Promise.<Buffer>}
   */

	}, {
		key: "toBuffer",
		value: function toBuffer(opts) {
			return (0, _encode2.default)(this._bitmap, opts);
		}

		/**
   * converts the image data to a base 64 string
   * @param {String} [mime]
   * @return {Promise.<String>}
   */

	}, {
		key: "toBase64",
		value: function toBase64() {
			var mime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.mime;

			return this.toBuffer({
				mime: mime
			}).then(function (buffer) {
				return "data:" + mime + ";base64," + buffer.toString("base64");
			});
		}
	}, {
		key: "clone",
		value: function clone() {
			var dataToClone = this.data,
			    width = this.width,
			    height = this.height,
			    mime = this.mime;

			var data = new Buffer(dataToClone.length);
			this._scan(function (idx) {
				return data.writeUInt32BE(dataToClone.readUInt32BE(idx, true), idx, true);
			});

			return new Image({
				data: data, width: width, height: height, mime: mime
			});
		}

		/**
   * Writes the image to a local file
   * @param {String} savePath a path to the destination file, will try to determine mime from it
   * @param {Object} [opts] saving options
   * @returns {Promise}
   */

	}, {
		key: "save",
		value: function save(savePath) {
			var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

			if (!opts.mime) {
				opts.mime = _mime2.default.determine(savePath);
			}

			return this.toBuffer(opts).then(function (buffer) {
				return (0, _save2.default)(buffer, savePath);
			});
		}
	}, {
		key: "data",
		get: function get() {
			return this._bitmap.data;
		}
	}, {
		key: "mime",
		get: function get() {
			return this._bitmap.mime;
		}
	}, {
		key: "width",
		get: function get() {
			return this._bitmap.width;
		}
	}, {
		key: "height",
		get: function get() {
			return this._bitmap.height;
		}
	}]);
	return Image;
}();

// load methods


(function (pluginDir) {
	var protoOfImage = Image.prototype;

	_fs2.default.readdirSync(pluginDir).forEach(function (fileName) {
		if (fileName.startsWith("_") || !fileName.endsWith(".js")) {
			return;
		}

		protoOfImage[fileName.replace(/\.js$/, "")] = require(_path2.default.join(pluginDir, fileName));
	});
})(_path2.default.join(__dirname, "lib/methods"));

/**
 * create an Image instance using file path or buffer
 * @param {String|Buffer} file
 * @return {Promise.<Image>}
 */

exports.default = function (file) {
	return (0, _decode2.default)(file).then(function (bitmap) {
		return new Image(bitmap);
	});
};

module.exports = exports["default"];