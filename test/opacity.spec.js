/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("opacity(0.667)", () => {
	it("bmp", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.JPG));
	it("png", testOpAndSaveGen("opacity", 0.667)(IMAGES.PNG));
});
describe("opacity(0.3, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "opacity", 0.3)(IMAGES.PNG));
});