/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("posterize(10)", () => {
	it("bmp", testOpAndSaveGen("posterize", 10)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("posterize", 10)(IMAGES.JPG));
	it("png", testOpAndSaveGen("posterize", 10)(IMAGES.PNG));
});
describe("posterize(5, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "posterize", 5)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "posterize", 5)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "posterize", 5)(IMAGES.PNG));
});