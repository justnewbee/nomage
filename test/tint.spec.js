/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("tint(33)", () => {
	it("bmp", testOpAndSaveGen("tint", 33)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("tint", 33)(IMAGES.JPG));
	it("png", testOpAndSaveGen("tint", 33)(IMAGES.PNG));
});
describe("tint(25, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "tint", 25)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "tint", 25)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "tint", 25)(IMAGES.PNG));
});