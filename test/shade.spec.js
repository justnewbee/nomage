/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("shade(33)", () => {
	it("bmp", testOpAndSaveGen("shade", 33)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("shade", 33)(IMAGES.JPG));
	it("png", testOpAndSaveGen("shade", 33)(IMAGES.PNG));
});
describe("shade(47, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "shade", 47)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "shade", 47)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "shade", 47)(IMAGES.PNG));
});