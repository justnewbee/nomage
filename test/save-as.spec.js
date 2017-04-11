/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {nomage, IMAGES} from "./_helper";

function test(what, ext) {
	return nomage(what.PATH).then(img => img.save(`${what.PATH_SAVE}.${ext}`)).should.be.fulfilled();
}

describe("save-as bmp", () => {
	it("jpg", () => test(IMAGES.JPG, "bmp"));
	it("png", () => test(IMAGES.PNG, "bmp"));
});
describe("save-as jpg", () => {
	it("bmp", () => test(IMAGES.BMP, "jpg"));
	it("png", () => test(IMAGES.PNG, "jpg"));
});
describe("save-as png", () => {
	it("bmp", () => test(IMAGES.BMP, "png"));
	it("jpg", () => test(IMAGES.JPG, "png"));
});