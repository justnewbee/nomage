/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("blur(3)", () => {
	it("bmp blur", testOpAndSaveGen("blur", 3)(IMAGES.BMP));
	it("jpg blur", testOpAndSaveGen("blur", 3)(IMAGES.JPG));
	it("png blur", testOpAndSaveGen("blur", 3)(IMAGES.PNG));
});