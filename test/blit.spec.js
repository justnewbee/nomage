/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testDrawAndSave} from "./_helper";

describe("blit(anotherPic)", () => {
	it("bmp", testDrawAndSave("blit")(IMAGES.BMP));
	it("jpg", testDrawAndSave("blit")(IMAGES.JPG));
	it("png", testDrawAndSave("blit")(IMAGES.PNG));
});
describe("blit(anotherPic, x1, y1, x2, y2)", () => {
	it("bmp", testDrawAndSave(true, "blit")(IMAGES.BMP));
	it("jpg", testDrawAndSave(true, "blit")(IMAGES.JPG));
	it("png", testDrawAndSave(true, "blit")(IMAGES.PNG));
});