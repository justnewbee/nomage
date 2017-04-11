/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("mix('red')", () => {
	it("bmp", testOpAndSaveGen("mix", "red")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("mix", "red")(IMAGES.JPG));
	it("png", testOpAndSaveGen("mix", "red")(IMAGES.PNG));
});
describe("mix([50, 75, 150], 33, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.PNG));
});