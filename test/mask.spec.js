/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testDrawAndSave} from "./_helper";

describe("mask(anotherPic)", () => {
	it("bmp", testDrawAndSave("mask!png")(IMAGES.BMP));
	it("jpg", testDrawAndSave("mask!png")(IMAGES.JPG));
	it("png", testDrawAndSave("mask")(IMAGES.PNG));
});
describe("mask(anotherPic, x1, y1, x2, y2)", () => {
	it("bmp", testDrawAndSave(true, "mask!png")(IMAGES.BMP));
	it("jpg", testDrawAndSave(true, "mask!png")(IMAGES.JPG));
	it("png", testDrawAndSave(true, "mask")(IMAGES.PNG));
});