/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {MIME} from "../src/lib/const";
import fileMime from "../src/lib/file/mime";

import {PATH_TEST_JS, IMAGES} from "./_helper";

describe("file mime", function() {
	describe("get image mime from file path", function() {
		it("bmp", () => fileMime(IMAGES.BMP.PATH).should.equal(MIME.BMP));
		it("jpg", () => fileMime(IMAGES.JPG.PATH).should.equal(MIME.JPG));
		it("png", () => fileMime(IMAGES.PNG.PATH).should.equal(MIME.PNG));
	});
	
	describe("get image mime from file buffer", function() {
		it("bmp", () => fileMime(IMAGES.BMP.BUFFER).should.equal(MIME.BMP));
		it("jpg", () => fileMime(IMAGES.JPG.BUFFER).should.equal(MIME.JPG));
		it("png", () => fileMime(IMAGES.PNG.BUFFER).should.equal(MIME.PNG));
	});
	
	describe("handle exception, throw or return an empty string", function() {
		it("throw when provided param that is NOT a file buffer or path", function() {
			(function() {
				fileMime();
			}).should.throw();
			(function() {
				fileMime(null);
			}).should.throw();
			(function() {
				fileMime(true);
			}).should.throw();
			(function() {
				fileMime(123);
			}).should.throw();
			(function() {
				fileMime({});
			}).should.throw();
			(function() {
				fileMime([]);
			}).should.throw();
		});
		it("throw when provided a file path that does not exist", function() {
			(function() {
				fileMime("hello/i/do/NOT.exist");
			}).should.throw();
		});
		it("return an empty string when the file does NOT have mime type", function() {
			fileMime(PATH_TEST_JS).should.equal("");
		});
	});
});