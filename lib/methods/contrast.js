"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function () {
	var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
	var x1 = arguments[1];
	var y1 = arguments[2];
	var x2 = arguments[3];
	var y2 = arguments[4];

	if (amount === 0 || amount < -1 || amount > +1) {
		return this;
	}

	var data = this.data;


	function adjust(n) {
		var x = void 0;

		if (amount < 0) {
			x = n > 127 ? 1 - n / 255 : n / 255;
			if (x < 0) {
				x = 0;
			}
			x = 0.5 * Math.pow(x * 2, 1 + amount);
			return n > 127 ? (1.0 - x) * 255 : x * 255;
		}

		x = n > 127 ? 1 - n / 255 : n / 255;
		if (x < 0) {
			x = 0;
		}
		x = 0.5 * Math.pow(2 * x, amount === 1 ? 127 : 1 / (1 - amount));
		return n > 127 ? (1 - x) * 255 : x * 255;
	}

	return this._scan(function (idx) {
		data[idx] = adjust(data[idx]);
		data[idx + 1] = adjust(data[idx + 1]);
		data[idx + 2] = adjust(data[idx + 2]);
	}, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * adjusts the contrast of the image
                                      * you can give an optional range
                                      * @param {Number} [amount=0] adjust between[-1, +1]
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */