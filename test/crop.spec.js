/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("crop(x1, y1, x2, y2)", () => {
	function testOnSaved(savedImg, args) {
		const [x1, y1, x2, y2] = args;
		
		savedImg.width.should.equal(x2 - x1 + 1);
		savedImg.height.should.equal(y2 - y1 + 1);
	}
	
	it("bmp", testOpAndSaveGen(true, "crop")(IMAGES.BMP, testOnSaved));
	it("jpg", testOpAndSaveGen(true, "crop")(IMAGES.JPG, testOnSaved));
	it("png", testOpAndSaveGen(true, "crop")(IMAGES.PNG, testOnSaved));
});