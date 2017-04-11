/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("dither()", () => {
	it("bmp", testOpAndSaveGen("dither")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("dither")(IMAGES.JPG));
	it("png", testOpAndSaveGen("dither")(IMAGES.PNG));
});
describe("dither(x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "dither")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "dither")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "dither")(IMAGES.PNG));
});