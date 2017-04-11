/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("resize", () => {
	it("bmp", testOpAndSaveGen("resize", "175%", "100%")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("resize", "85%")(IMAGES.JPG));
	it("png", testOpAndSaveGen("resize", "50%", "100%")(IMAGES.PNG));
});