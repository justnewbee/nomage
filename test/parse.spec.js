/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {MIME} from "../src/lib/const";
import bitmapParse from "../src/lib/bitmap/parse";

import {PATH_TEST_JS, IMAGES} from "./_helper";

describe("bitmap parse", function() {
	function test(what, mime, useBuffer) {
		let bitmap = bitmapParse(useBuffer ? what.PATH : what.BUFFER);
		
		bitmap.width.should.equal(what.W);
		bitmap.height.should.equal(what.H);
		bitmap.mime.should.equal(mime);
		Buffer.isBuffer(bitmap.data).should.equal(true);
	}
	
	describe("parse from image file path into a bitmap", function() {
		it("bmp", () => test(IMAGES.BMP, MIME.BMP));
		it("jpg", () => test(IMAGES.JPG, MIME.JPG));
		it("png", () => test(IMAGES.PNG, MIME.PNG));
	});
	
	describe("parse from image file buffer into a bitmap", function() {
		it("bmp", () => test(IMAGES.BMP, MIME.BMP, true));
		it("jpg", () => test(IMAGES.JPG, MIME.JPG, true));
		it("png", () => test(IMAGES.PNG, MIME.PNG, true));
	});
	
	describe("handle errors", function() {
		it("throw error trying to parse anything other than bmp/jpg/png", function() {
			(function() {
				bitmapParse(PATH_TEST_JS);
			}).should.throw();
		});
	});
});