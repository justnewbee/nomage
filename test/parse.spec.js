/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import bitmapParse from "../src/lib/bitmap/parse";

import {PATH_TEST_JS, IMAGES} from "./_helper";

describe("bitmap parse", function() {
	function test(what, useBuffer) {
		return bitmapParse(useBuffer ? what.BUFFER : what.PATH).then(bitmap => {
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(what.MIME);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		}).should.be.fulfilled();
	}
	
	describe("parse from local path", function() {
		it("bmp", () => test(IMAGES.BMP));
		it("jpg", () => test(IMAGES.JPG));
		it("png", () => test(IMAGES.PNG));
	});
	describe("parse from file buffer", function() {
		it("bmp", () => test(IMAGES.BMP, true));
		it("jpg", () => test(IMAGES.JPG, true));
		it("png", () => test(IMAGES.PNG, true));
	});
	describe("parse from URL - might take time", function() {
		it("bmp", () => test(IMAGES.BMP_REMOTE));
		it("jpg", () => test(IMAGES.JPG_REMOTE));
		it("png", () => test(IMAGES.PNG_REMOTE));
	});
	describe("handle errors", function() {
		it("throw error trying to parse anything other than bmp/jpg/png", () => bitmapParse(PATH_TEST_JS).should.be.rejected());
	});
});