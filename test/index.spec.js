/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import path from "path";

import CONST from "../src/lib/const";
import bitmapParse from "../src/lib/bitmap/parse";

describe("nomage", function() {
	describe("parse a image file to bitmap object", function() {
		it("throw error trying to parse anything other than bmp/png/jpg", function() {
			(function() {
				bitmapParse(path.join(__dirname, "./index.spec.js"));
			}).should.throw();
		});
		it("parse bmp", function() {
			let bitmap = bitmapParse(path.join(__dirname, "./images/test_320x240.bmp"));
			
			bitmap.width.should.eql(320);
			bitmap.height.should.eql(240);
			bitmap.mime.should.eql(CONST.MIME.BMP);
			Buffer.isBuffer(bitmap.data).should.eql(true);
		});
		it("parse png", function() {
			let bitmap = bitmapParse(path.join(__dirname, "./images/test_1000x1460.png"));
			
			bitmap.width.should.eql(1000);
			bitmap.height.should.eql(1460);
			bitmap.mime.should.eql(CONST.MIME.PNG);
			Buffer.isBuffer(bitmap.data).should.eql(true);
		});
		it("parse jpg", function() {
			let bitmap = bitmapParse(path.join(__dirname, "./images/test_1920x1200.jpg"));
			
			bitmap.width.should.eql(1920);
			bitmap.height.should.eql(1200);
			bitmap.mime.should.eql(CONST.MIME.JPG);
			Buffer.isBuffer(bitmap.data).should.eql(true);
		});
	});
});