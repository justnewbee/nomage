/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {IMAGES, testOpAndSaveGen} from "./_helper";

describe("rotate()", () => {
	it("bmp", testOpAndSaveGen("rotate")(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate")(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate")(IMAGES.PNG));
});
describe("rotate(90)", () => {
	it("bmp", testOpAndSaveGen("rotate", 90)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", 90)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", 90)(IMAGES.PNG));
});
describe("rotate(180)", () => {
	it("bmp", testOpAndSaveGen("rotate", 180)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", 180)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", 180)(IMAGES.PNG));
});
describe("rotate(270)", () => {
	it("bmp", testOpAndSaveGen("rotate", 270)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", 270)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", 270)(IMAGES.PNG));
});
describe("rotate(-90)", () => {
	it("bmp", testOpAndSaveGen("rotate", -90)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", -90)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", -90)(IMAGES.PNG));
});
describe("rotate(-180)", () => {
	it("bmp", testOpAndSaveGen("rotate", -180)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", -180)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", -180)(IMAGES.PNG));
});
describe("rotate(-270)", () => {
	it("bmp", testOpAndSaveGen("rotate", -270)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", -270)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", -270)(IMAGES.PNG));
});
describe("rotate(-360)", () => {
	it("bmp", testOpAndSaveGen("rotate", -360)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", -360)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", -360)(IMAGES.PNG));
});
describe("rotate(45)", () => {
	it("bmp", testOpAndSaveGen("rotate", 45)(IMAGES.BMP));
	it("jpg", testOpAndSaveGen("rotate", 45)(IMAGES.JPG));
	it("png", testOpAndSaveGen("rotate", 45)(IMAGES.PNG));
});