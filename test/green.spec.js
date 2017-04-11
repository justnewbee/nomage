/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("green(156)", () => {
	it("bmp", testOpAndSaveGen("green", 156)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("green", 156)(IMAGES.JPG));
	it("png", testOpAndSaveGen("green", 156)(IMAGES.PNG));
});
describe("green(200, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "green", 200)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "green", 200)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "green", 200)(IMAGES.PNG));
});