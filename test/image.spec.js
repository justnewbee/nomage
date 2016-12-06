/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import {MIME} from "../src/lib/const";
import Image from "../src/lib/image";

import {IMAGES} from "./_helper";

describe("image", function() {
	describe("width height mime data", function() {
		function test(what, mime) {
			let image = new Image(what.PATH);
			
			image.width.should.equal(what.W);
			image.height.should.equal(what.H);
			image.mime.should.equal(mime);
			Buffer.isBuffer(image.data).should.equal(true);
		}
		
		it("bmp", () => test(IMAGES.BMP, MIME.BMP));
		it("jpg", () => test(IMAGES.JPG, MIME.JPG));
		it("png", () => test(IMAGES.PNG, MIME.PNG));
	});
});