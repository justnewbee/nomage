/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("flip()", () => { // horizontal
	it("bmp", testOpAndSaveGen("flip")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("flip")(IMAGES.JPG));
	it("png", testOpAndSaveGen("flip")(IMAGES.PNG));
});
describe("flip(false, true)", () => { // vertical
	it("bmp", testOpAndSaveGen("flip", false, true)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("flip", false, true)(IMAGES.JPG));
	it("png", testOpAndSaveGen("flip", false, true)(IMAGES.PNG));
});
describe("flip(true, true)", () => { // both horizontal and vertical
	it("bmp", testOpAndSaveGen("flip", true, true)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("flip", true, true)(IMAGES.JPG));
	it("png", testOpAndSaveGen("flip", true, true)(IMAGES.PNG));
});