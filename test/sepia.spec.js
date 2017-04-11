/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("sepia()", () => {
	it("bmp", testOpAndSaveGen("sepia")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("sepia")(IMAGES.JPG));
	it("png", testOpAndSaveGen("sepia")(IMAGES.PNG));
});
describe("sepia(x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "sepia")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "sepia")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "sepia")(IMAGES.PNG));
});