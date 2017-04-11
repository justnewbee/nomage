/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES} from "./_helper";

function test(what) {
	return () => nomage(what.PATH).then(img => {
		img.width.should.equal(what.W);
		img.height.should.equal(what.H);
		img.mime.should.equal(what.MIME);
		Buffer.isBuffer(img.data).should.equal(true);
		img.data.length.should.equal(img.width * img.height * 4);
		img.getPixelColorHex(img.width / 2, img.height / 2).should.belowOrEqual(0xffffffff);
		
		const rgba = img.getPixelColorRGBA(img.width, img.height);
		rgba.should.have.keys("r", "g", "b", "a");
		rgba.r.should.be.within(0, 255);
		rgba.g.should.be.within(0, 255);
		rgba.b.should.be.within(0, 255);
		rgba.a.should.be.within(0, 255);
	}).should.be.fulfilled();
}

describe("getter-local", () => {
	it("bmp", test(IMAGES.BMP));
	it("jpg", test(IMAGES.JPG));
	it("png", test(IMAGES.PNG));
});
describe("getter-remote", () => {
	it("bmp-remote", test(IMAGES.BMP_REMOTE));
	it("jpg-remote", test(IMAGES.JPG_REMOTE));
	it("png-remote", test(IMAGES.PNG_REMOTE));
});