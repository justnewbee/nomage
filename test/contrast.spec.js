/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("contrast(0)", () => {
	it("bmp", testOpAndSaveGen("contrast", 0)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("contrast", 0)(IMAGES.JPG));
	it("png", testOpAndSaveGen("contrast", 0)(IMAGES.PNG));
});
describe("contrast(-2)", () => {
	it("bmp", testOpAndSaveGen("contrast", -2)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("contrast", -2)(IMAGES.JPG));
	it("png", testOpAndSaveGen("contrast", -2)(IMAGES.PNG));
});
describe("contrast(2)", () => {
	it("bmp", testOpAndSaveGen("contrast", 2)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("contrast", 2)(IMAGES.JPG));
	it("png", testOpAndSaveGen("contrast", 2)(IMAGES.PNG));
});
describe("contrast(-0.5)", () => {
	it("bmp", testOpAndSaveGen("contrast", -0.5)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("contrast", -0.5)(IMAGES.JPG));
	it("png", testOpAndSaveGen("contrast", -0.5)(IMAGES.PNG));
});
describe("contrast(0.5)", () => {
	it("bmp", testOpAndSaveGen("contrast", 0.5)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("contrast", 0.5)(IMAGES.JPG));
	it("png", testOpAndSaveGen("contrast", 0.5)(IMAGES.PNG));
});
describe("contrast(-0.75, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "contrast", -0.75)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "contrast", -0.75)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "contrast", -0.75)(IMAGES.PNG));
});
describe("contrast(0.75, x1, y1, x2, y2)", () => {
	it("bmp", testOpAndSaveGen(true, "contrast", 0.75)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen(true, "contrast", 0.75)(IMAGES.JPG));
	it("png", testOpAndSaveGen(true, "contrast", 0.75)(IMAGES.PNG));
});