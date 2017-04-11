/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("spin(234)", () => {
	it("bmp", testOpAndSaveGen("spin", 234)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("spin", 234)(IMAGES.JPG));
	it("png", testOpAndSaveGen("spin", 234)(IMAGES.PNG));
});
describe("spin(123, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "spin", 123)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "spin", 123)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "spin", 123)(IMAGES.PNG));
});