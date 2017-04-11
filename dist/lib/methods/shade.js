"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (percentage, x1, y1, x2, y2) {
  return this.mix([0, 0, 0], percentage, x1, y1, x2, y2);
};

module.exports = exports["default"]; /**
                                      * shade
                                      * you can give an optional range
                                      * @param {Number} percentage
                                      * @param {int} [x1]
                                      * @param {int} [y1]
                                      * @param {int} [x2]
                                      * @param {int} [y2]
                                      */