"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pngjs = require("pngjs");

exports.default = function (bitmap) {
  return _pngjs.PNG.sync.write(bitmap);
};

module.exports = exports["default"];