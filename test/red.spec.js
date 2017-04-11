/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("red(125)", () => {
	it("bmp", testOpAndSaveGen("red", 125)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("red", 125)(IMAGES.JPG));
	it("png", testOpAndSaveGen("red", 125)(IMAGES.PNG));
});
describe("red(125, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "red", 125)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "red", 125)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "red", 125)(IMAGES.PNG));
});