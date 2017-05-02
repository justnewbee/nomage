/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("brightness(0)", () => {
	it("bmp", testOpAndSaveGen("brightness", 0)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("brightness", 0)(IMAGES.JPG));
	it("png", testOpAndSaveGen("brightness", 0)(IMAGES.PNG));
});
describe("brightness(-2)", () => {
	it("bmp", testOpAndSaveGen("brightness", -2)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("brightness", -2)(IMAGES.JPG));
	it("png", testOpAndSaveGen("brightness", -2)(IMAGES.PNG));
});
describe("brightness(2)", () => {
	it("bmp", testOpAndSaveGen("brightness", 2)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("brightness", 2)(IMAGES.JPG));
	it("png", testOpAndSaveGen("brightness", 2)(IMAGES.PNG));
});

describe("brightness(-0.6)", () => {
	it("bmp", testOpAndSaveGen("brightness", -0.6)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("brightness", -0.6)(IMAGES.JPG));
	it("png", testOpAndSaveGen("brightness", -0.6)(IMAGES.PNG));
});
describe("brightness(0.6)", () => {
	it("bmp", testOpAndSaveGen("brightness", 0.6)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("brightness", 0.6)(IMAGES.JPG));
	it("png", testOpAndSaveGen("brightness", 0.6)(IMAGES.PNG));
});
describe("brightness(-0.5, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.PNG));
});
describe("brightness(0.75, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.PNG));
});