/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import path from "path";
import fs from "fs";

import CONST from "../src/lib/const";
import mime from "../src/lib/file/mime";
import bitmapParse from "../src/lib/bitmap/parse";

const PATH_TEST_JS = path.join(__dirname, "./index.spec.js");

const PATH_BMP = path.join(__dirname, "./images/test_320x240.bmp");
const PATH_JPG = path.join(__dirname, "./images/test_1280x1920.jpg");
const PATH_PNG = path.join(__dirname, "./images/test_1000x1460.png");

const BUFFER_BMP = fs.readFileSync(PATH_BMP);
const BUFFER_JPG = fs.readFileSync(PATH_JPG);
const BUFFER_PNG = fs.readFileSync(PATH_PNG);

describe("file mime", function() {
	describe("get image mime from file path", function() {
		it("bmp", function() {
			mime(PATH_BMP).should.equal(CONST.MIME.BMP);
		});
		it("jpg", function() {
			mime(PATH_JPG).should.equal(CONST.MIME.JPG);
		});
		it("png", function() {
			mime(PATH_PNG).should.equal(CONST.MIME.PNG);
		});
	});
	
	describe("get image mime from file buffer", function() {
		it("bmp", function() {
			mime(BUFFER_BMP).should.equal(CONST.MIME.BMP);
		});
		it("jpg", function() {
			mime(BUFFER_JPG).should.equal(CONST.MIME.JPG);
		});
		it("png", function() {
			mime(BUFFER_PNG).should.equal(CONST.MIME.PNG);
		});
	});
	
	describe("handle exception, throw or return an empty string", function() {
		it("throw when provided param that is NOT a file buffer or path", function() {
			(function() {
				mime();
			}).should.throw();
			(function() {
				mime(null);
			}).should.throw();
			(function() {
				mime(true);
			}).should.throw();
			(function() {
				mime(123);
			}).should.throw();
			(function() {
				mime({});
			}).should.throw();
			(function() {
				mime([]);
			}).should.throw();
		});
		it("throw when provided a file path that does not exist", function() {
			(function() {
				mime("hello/i/do/NOT.exist");
			}).should.throw();
		});
		it("return an empty string when the file does NOT have mime type", function() {
			mime(PATH_TEST_JS).should.equal("");
		});
	});
});

describe("bitmap parse", function() {
	describe("parse from image file path into a bitmap", function() {
		it("bmp", function() {
			let bitmap = bitmapParse(PATH_BMP);
			
			bitmap.width.should.equal(320);
			bitmap.height.should.equal(240);
			bitmap.mime.should.equal(CONST.MIME.BMP);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("jpg", function() {
			let bitmap = bitmapParse(PATH_JPG);
			
			bitmap.width.should.equal(1280);
			bitmap.height.should.equal(1920);
			bitmap.mime.should.equal(CONST.MIME.JPG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("png", function() {
			let bitmap = bitmapParse(PATH_PNG);
			
			bitmap.width.should.equal(1000);
			bitmap.height.should.equal(1460);
			bitmap.mime.should.equal(CONST.MIME.PNG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
	});
	
	describe("parse from image file buffer into a bitmap", function() {
		it("bmp", function() {
			let bitmap = bitmapParse(BUFFER_BMP);
			
			bitmap.width.should.equal(320);
			bitmap.height.should.equal(240);
			bitmap.mime.should.equal(CONST.MIME.BMP);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("jpg", function() {
			let bitmap = bitmapParse(BUFFER_JPG);
			
			bitmap.width.should.equal(1280);
			bitmap.height.should.equal(1920);
			bitmap.mime.should.equal(CONST.MIME.JPG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("png", function() {
			let bitmap = bitmapParse(BUFFER_PNG);
			
			bitmap.width.should.equal(1000);
			bitmap.height.should.equal(1460);
			bitmap.mime.should.equal(CONST.MIME.PNG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
	});
	
	describe("handle errors", function() {
		it("throw error trying to parse anything other than bmp/jpg/png", function() {
			(function() {
				bitmapParse(PATH_TEST_JS);
			}).should.throw();
		});
	});
});