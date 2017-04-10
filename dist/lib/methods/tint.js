"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (percentage, x1, y1, x2, y2) {
  return this.mix([255, 255, 255], percentage, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * tint
                                      * you can give an optional range
                                      * @param {Number} percentage
                                      * @param {Integer} [x1]
                                      * @param {Integer} [y1]
                                      * @param {Integer} [x2]
                                      * @param {Integer} [y2]
                                      */