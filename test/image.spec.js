/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import image from "../src/lib/image";

import {IMAGES} from "./_helper";

describe("image", function() {
	describe("width height mime data", function() {
		function test(what) {
			return image(what.PATH).then(img => {
				img.width.should.equal(what.W);
				img.height.should.equal(what.H);
				img.mime.should.equal(what.MIME);
				Buffer.isBuffer(img.data).should.equal(true);
				
				return img.save(what.PATH_SAVE);
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