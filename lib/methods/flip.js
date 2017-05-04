"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var horizontal = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	var vertical = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
	var data = this.data;

	var buffer = new Buffer(data.length);

	var scanMode = "none";
	if (horizontal && vertical) {
		scanMode = "BT-RL";
	} else if (horizontal) {
		scanMode = "TB-RL";
	} else if (vertical) {
		scanMode = "BT-LR";
	} else {
		return;
	}

	var loopIndex = 0;

	this._scan(scanMode, function (idx) {
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), loopIndex++ * 4, true);
	});

	this._bitmap.data = new Buffer(buffer);

	return this;
};

module.exports = exports["default"]; /**
                                      * flip the image horizontally
                                      * @param {Boolean} [horizontal = true]
                                      * @param {Boolean} [vertical = false]
                                      */