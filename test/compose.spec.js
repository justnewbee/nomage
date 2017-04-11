/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testDrawAndSave} from "./_helper";

describe("compose(anotherPic)", () => {
	it("bmp", testDrawAndSave("compose")(IMAGES.BMP));
	it("jpg", testDrawAndSave("compose")(IMAGES.JPG));
	it("png", testDrawAndSave("compose")(IMAGES.PNG));
});
describe("compose(anotherPic, x1, y1, x2, y2)", () => {
	it("bmp", testDrawAndSave(true, "compose")(IMAGES.BMP));
	it("jpg", testDrawAndSave(true, "compose")(IMAGES.JPG));
	it("png", testDrawAndSave(true, "compose")(IMAGES.PNG));
});