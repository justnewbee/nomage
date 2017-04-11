/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("invert()", () => {
	it("bmp", testOpAndSaveGen("invert")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("invert")(IMAGES.JPG));
	it("png", testOpAndSaveGen("invert")(IMAGES.PNG));
});
describe("invert(x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "invert")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "invert")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "invert")(IMAGES.PNG));
});