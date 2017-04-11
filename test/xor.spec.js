/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("xor('#123456')", () => {
	it("bmp", testOpAndSaveGen("xor", "#123456")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("xor", "#123456")(IMAGES.JPG));
	it("png", testOpAndSaveGen("xor", "#123456")(IMAGES.PNG));
});
describe("xor(#fc9630, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.PNG));
});