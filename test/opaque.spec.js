/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("opaque()", () => {
	it("bmp", testOpAndSaveGen("opaque")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("opaque")(IMAGES.JPG));
	it("png", testOpAndSaveGen("opaque")(IMAGES.PNG));
});
describe("opaque(x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "opaque")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "opaque")(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "opaque")(IMAGES.PNG));
});