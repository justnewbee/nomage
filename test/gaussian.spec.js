/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("gaussian(2)", () => {
	it("bmp gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.BMP));
	it("jpg gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.JPG));
	it("png gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.PNG));
});