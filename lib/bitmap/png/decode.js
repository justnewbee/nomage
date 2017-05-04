"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _pngjs = require("pngjs");

/**
 * 
 * @param {Buffer} buffer
 */
exports.default = function (buffer) {
  var _PNG$sync$read = _pngjs.PNG.sync.read(buffer),
      width = _PNG$sync$read.width,
      height = _PNG$sync$read.height,
      data = _PNG$sync$read.data; // the original one has other info

  return { width: width, height: height, data: data };
};

module.exports = exports["default"];