/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("blue(200)", () => {
	it("bmp", testOpAndSaveGen("blue", 200)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("blue", 200)(IMAGES.JPG));
	it("png", testOpAndSaveGen("blue", 200)(IMAGES.PNG));
});
describe("blue(99, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "blue", 99)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "blue", 99)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "blue", 99)(IMAGES.PNG));
});