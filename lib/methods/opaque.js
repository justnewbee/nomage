"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (x1, y1, x2, y2) {
  var data = this.data;


  return this._scan(function (idx) {
    data[idx + 3] = 255;
  }, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * set the alpha channel on every pixel to fully opaque
                                      * you can give an optional range
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */