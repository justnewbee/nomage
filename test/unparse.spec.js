/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import fileSave from "../src/lib/file/save";
import bitmapParse from "../src/lib/bitmap/parse";
import bitmapUnparse from "../src/lib/bitmap/unparse";

import {IMAGES} from "./_helper";

describe("bitmap unparse - promise", function() {
	describe("unparse from bitmap to file buffer which can be saved", function() {
		function test(what, done) {
			bitmapUnparse(bitmapParse(what.BUFFER)).then(buffer => {
				Buffer.isBuffer(buffer).should.equal(true);
				fileSave(buffer, what.PATH_SAVE);
				done();
			}, done);
		}
		
		it("bmp", done => test(IMAGES.BMP, done));
		it("jpg", done => test(IMAGES.JPG, done));
		it("png", done => test(IMAGES.PNG, done));
	});
});