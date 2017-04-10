"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (amount, x1, y1, x2, y2) {
  var data = this.data;


  return this._scan(function (idx) {
    data[idx] = Math.max(0, Math.min(data[idx] + amount, 255));
  }, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * adjust red chanel
                                      * @param {Integer} amount [-255, 255]
                                      * @param {Integer} [x1]
                                      * @param {Integer} [y1]
                                      * @param {Integer} [x2]
                                      * @param {Integer} [y2]
                                      */