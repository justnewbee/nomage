/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import fileSave from "../src/lib/file/save";
import bitmapParse from "../src/lib/bitmap/parse";
import bitmapUnparse from "../src/lib/bitmap/unparse";

import {IMAGES} from "./_helper";

describe("bitmap unparse - promise", function() {
	describe("unparse from bitmap to file buffer which can be saved", function() {
		function test(what) {
			return bitmapParse(what.BUFFER || what.PATH).then(bitmap => bitmapUnparse(bitmap)).then(buffer => {
				Buffer.isBuffer(buffer).should.equal(true);
				fileSave(buffer, what.PATH_SAVE);
			}).should.be.fulfilled();
		}
		
		it("bmp", () => test(IMAGES.BMP));
		it("jpg", () => test(IMAGES.JPG));
		it("png", () => test(IMAGES.PNG));
		it("bmp - remote", () => test(IMAGES.BMP_REMOTE));
		it("jpg - remote", () => test(IMAGES.JPG_REMOTE));
		it("png - remote", () => test(IMAGES.PNG_REMOTE));
	});
});