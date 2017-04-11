/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES} from "./_helper";

describe("base64", function() {
	function test(what) {
		return () => nomage(what.PATH).then(img => img.toBase64()).then(base64 => {
			base64.should.startWith(`data:${what.MIME};base64,`);
		}).should.be.fulfilled();
	}
	
	it("bmp", test(IMAGES.BMP));
	it("jpg", test(IMAGES.JPG));
	it("png", test(IMAGES.PNG));
});