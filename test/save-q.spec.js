/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES, composeSavePath} from "./_helper";

function test(what, q) {
	return () => nomage(what.PATH).then(img => img.save(composeSavePath(what.PATH_SAVE, `q${q}`) + ".jpg", {quality: q})).should.be.fulfilled();
}

describe("save-q", () => {
	it("bmp", test(IMAGES.BMP, 25));
	it("jpg", test(IMAGES.JPG, 25));
	it("png", test(IMAGES.PNG, 25));
	
	it("bmp", test(IMAGES.BMP, 50));
	it("jpg", test(IMAGES.JPG, 50));
	it("png", test(IMAGES.PNG, 50));
	
	it("bmp", test(IMAGES.BMP, 75));
	it("jpg", test(IMAGES.JPG, 75));
	it("png", test(IMAGES.PNG, 75));
});