/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("greyscale()", () => {
	it("bmp", testOpAndSaveGen("greyscale")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("greyscale")(IMAGES.JPG));
	it("png", testOpAndSaveGen("greyscale")(IMAGES.PNG));
});
describe("greyscale(x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "greyscale")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "greyscale")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "greyscale")(IMAGES.PNG));
});