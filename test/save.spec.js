/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES} from "./_helper";

function test(what) {
	return nomage(what.PATH).then(img => img.save(what.PATH_SAVE)).should.be.fulfilled();
}

describe("save(path)", () => {
	it("bmp", () => test(IMAGES.BMP));
	it("jpg", () => test(IMAGES.JPG));
	it("png", () => test(IMAGES.PNG));
});