/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES, composeSavePath} from "./_helper";

describe("clone", () => {
	function test(what) {
		return nomage(what.PATH).then(img => {
			const imgClone = img.clone();
			
			imgClone.width.should.equal(img.width);
			imgClone.height.should.equal(img.height);
			imgClone.mime.should.equal(img.mime);
			imgClone.data.length.should.equal(img.data.length);
			
			return imgClone.save(composeSavePath(what.PATH_SAVE, "clone"));
		}).should.be.fulfilled();
	}
	
	it("bmp", () => test(IMAGES.BMP));
	it("jpg", () => test(IMAGES.JPG));
	it("png", () => test(IMAGES.PNG));
});