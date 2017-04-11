"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (amount, x1, y1, x2, y2) {
  var data = this.data;


  return this._scan(function (idx) {
    data[idx + 1] = Math.max(0, Math.min(data[idx + 1] + amount, 255));
  }, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * adjust green chanel
                                      * @param {Number} amount [-255, 255]
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */