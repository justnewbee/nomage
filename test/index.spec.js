/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import nomage from "../src/index";

import {IMAGES, composeSavePath} from "./_helper";

describe("nomage", function() {
	/**
	 * generate a test function on op and args and then save
	 * @return {Function} the test function that take only the what object
	 */
	function testOpAndSaveGen(op, ...args) {
		let partial = false;
		let saveExt;
		
		if (op === true) { // for partial
			partial = true;
			op = args.shift();
		}
		
		const arr = op.split("!"); // add `!ext` in op to determine what type should be saved
		
		// add `!ext` in op to determine what type should be saved
		if (arr[1]) {
			op = arr[0];
			saveExt = arr[1];
		}
		
		/**
		 * @param {Object} what
		 * @param {Function} [fn] you can provide a additional function to further test on the savedImg, the fn takes (savedImg, args, what) as parameters
		 * @return {Function}
		 */
		return (what, fn) => () => nomage(what.PATH).then(img => {
			if (partial) {
				args.push(what.W / 4, what.H / 4, what.W / 4 * 3, what.H / 4 * 3);
			}
			
			const opFn = img[op];
			const savePath = composeSavePath(what.PATH_SAVE, `${op}(${args.join(", ")})`) + (saveExt ? "." + saveExt : "");
			const opRtn = opFn.apply(img, args);
			
			opRtn.should.be.exactly(img); // test for chaining
			
			return img.save(savePath).then(() => fn ? nomage(savePath).then(savedImg => fn(savedImg, args, what)) : null);
		}).should.be.fulfilled();
	}
	
	describe("getter", function() {
		function test(what) {
			return () => nomage(what.PATH).then(img => {
				img.width.should.equal(what.W);
				img.height.should.equal(what.H);
				img.mime.should.equal(what.MIME);
				Buffer.isBuffer(img.data).should.equal(true);
				img.data.length.should.equal(img.width * img.height * 4);
				img.getPixelColorHex(img.width / 2, img.height / 2).should.belowOrEqual(0xffffffff);
				
				const rgba = img.getPixelColorRGBA(img.width, img.height);
				rgba.should.have.keys("r", "g", "b", "a");
				rgba.r.should.be.within(0, 255);
				rgba.g.should.be.within(0, 255);
				rgba.b.should.be.within(0, 255);
				rgba.a.should.be.within(0, 255);
			}).should.be.fulfilled();
		}
		
		describe("getter-local", () => {
			it("bmp", test(IMAGES.BMP));
			it("jpg", test(IMAGES.JPG));
			it("png", test(IMAGES.PNG));
		});
		describe("getter-remote", () => {
			it("bmp-remote", test(IMAGES.BMP_REMOTE));
			it("jpg-remote", test(IMAGES.JPG_REMOTE));
			it("png-remote", test(IMAGES.PNG_REMOTE));
		});
	});
	
	describe("base64", function() {
		function test(what) {
			return () => nomage(what.PATH).then(img => img.toBase64()).then(base64 => {
				base64.should.startWith(`data:${what.MIME};base64,`);
			}).should.be.fulfilled();
		}
		
		it("bmp", test(IMAGES.BMP));
		it("jpg", test(IMAGES.JPG));
		it("png", test(IMAGES.PNG));
	});
	
	describe("clone", () => {
		function test(what) {
			return nomage(what.PATH).then(img => {
				const imgClone = img.clone();
				
				imgClone.width.should.equal(img.width);
				imgClone.height.should.equal(img.height);
				imgClone.mime.should.equal(img.mime);
				imgClone.data.length.should.equal(img.data.length);
				
				return imgClone.save(composeSavePath(what.PATH_SAVE, "clone"));
			}).should.be.fulfilled();
		}
		it("bmp", () => test(IMAGES.BMP));
		it("jpg", () => test(IMAGES.JPG));
		it("png", () => test(IMAGES.PNG));
	});
	
	describe("save", function() {
		function test(what) {
			return nomage(what.PATH).then(img => img.save(what.PATH_SAVE)).should.be.fulfilled();
		}
		
		describe("save", () => {
			it("bmp", () => test(IMAGES.BMP));
			it("jpg", () => test(IMAGES.JPG));
			it("png", () => test(IMAGES.PNG));
		});
	});
	describe("saveAs", function() {
		function test(what, ext) {
			return nomage(what.PATH).then(img => img.save(`${what.PATH_SAVE}.${ext}`)).should.be.fulfilled();
		}
		describe("save as bmp", () => {
			it("jpg", () => test(IMAGES.JPG, "bmp"));
			it("png", () => test(IMAGES.PNG, "bmp"));
		});
		describe("save as jpg", () => {
			it("bmp", () => test(IMAGES.BMP, "jpg"));
			it("png", () => test(IMAGES.PNG, "jpg"));
		});
		describe("save as png", () => {
			it("bmp", () => test(IMAGES.BMP, "png"));
			it("jpg", () => test(IMAGES.JPG, "png"));
		});
	});
	describe("saveQ", function() { // can only be saved as jpg
		function test(what, q) {
			return () => nomage(what.PATH).then(img => img.save(composeSavePath(what.PATH_SAVE, `q${q}`) + ".jpg", { quality: q })).should.be.fulfilled();
		}
		describe("save with quality, can only be saved as jpg", () => {
			it("bmp", test(IMAGES.BMP, 25));
			it("jpg", test(IMAGES.JPG, 25));
			it("png", test(IMAGES.PNG, 25));
			
			it("bmp", test(IMAGES.BMP, 50));
			it("jpg", test(IMAGES.JPG, 50));
			it("png", test(IMAGES.PNG, 50));
			
			it("bmp", test(IMAGES.BMP, 75));
			it("jpg", test(IMAGES.JPG, 75));
			it("png", test(IMAGES.PNG, 75));
		});
	});
	
	describe("flipping", () => {
		describe("horizontal", () => {
			it("bmp", testOpAndSaveGen("flip")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("flip")(IMAGES.JPG));
			it("png", testOpAndSaveGen("flip")(IMAGES.PNG));
		});
		describe("vertical", () => {
			it("bmp", testOpAndSaveGen("flip", false, true)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("flip", false, true)(IMAGES.JPG));
			it("png", testOpAndSaveGen("flip", false, true)(IMAGES.PNG));
		});
		describe("both", () => {
			it("bmp", testOpAndSaveGen("flip", true, true)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("flip", true, true)(IMAGES.JPG));
			it("png", testOpAndSaveGen("flip", true, true)(IMAGES.PNG));
		});
	});
	
	describe("alpha-full", () => {
		describe("opacity", () => {
			it("bmp", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.JPG));
			it("png", testOpAndSaveGen("opacity", 0.667)(IMAGES.PNG));
		});
		describe("opaque", () => {
			it("bmp", testOpAndSaveGen("opaque")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("opaque")(IMAGES.JPG));
			it("png", testOpAndSaveGen("opaque")(IMAGES.PNG));
		});
	});
	describe("alpha-partial", () => {
		describe("opacity", () => {
			it("bmp", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "opacity", 0.3)(IMAGES.PNG));
		});
		describe("opaque", () => {
			it("bmp", testOpAndSaveGen(true, "opaque")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "opaque")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "opaque")(IMAGES.PNG));
		});
	});
	
	describe("color-full", () => {
		describe("brightness lower", () => {
			it("bmp", testOpAndSaveGen("brightness", -0.6)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("brightness", -0.6)(IMAGES.JPG));
			it("png", testOpAndSaveGen("brightness", -0.6)(IMAGES.PNG));
		});
		describe("brightness higher", () => {
			it("bmp", testOpAndSaveGen("brightness", 0.6)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("brightness", 0.6)(IMAGES.JPG));
			it("png", testOpAndSaveGen("brightness", 0.6)(IMAGES.PNG));
		});
		describe("contrast lower", () => {
			it("bmp", testOpAndSaveGen("contrast", -0.5)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("contrast", -0.5)(IMAGES.JPG));
			it("png", testOpAndSaveGen("contrast", -0.5)(IMAGES.PNG));
		});
		describe("contrast higher", () => {
			it("bmp", testOpAndSaveGen("contrast", 0.5)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("contrast", 0.5)(IMAGES.JPG));
			it("png", testOpAndSaveGen("contrast", 0.5)(IMAGES.PNG));
		});
		describe("mix", () => {
			it("bmp", testOpAndSaveGen("mix", "red")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("mix", "red")(IMAGES.JPG));
			it("png", testOpAndSaveGen("mix", "red")(IMAGES.PNG));
		});
		describe("tint", () => {
			it("bmp", testOpAndSaveGen("tint", 33)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("tint", 33)(IMAGES.JPG));
			it("png", testOpAndSaveGen("tint", 33)(IMAGES.PNG));
		});
		describe("shade", () => {
			it("bmp", testOpAndSaveGen("shade", 33)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("shade", 33)(IMAGES.JPG));
			it("png", testOpAndSaveGen("shade", 33)(IMAGES.PNG));
		});
		describe("xor", () => {
			it("bmp", testOpAndSaveGen("xor", "#123456")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("xor", "#123456")(IMAGES.JPG));
			it("png", testOpAndSaveGen("xor", "#123456")(IMAGES.PNG));
		});
		describe("red", () => {
			it("bmp", testOpAndSaveGen("red", 125)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("red", 125)(IMAGES.JPG));
			it("png", testOpAndSaveGen("red", 125)(IMAGES.PNG));
		});
		describe("green", () => {
			it("bmp", testOpAndSaveGen("green", 156)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("green", 156)(IMAGES.JPG));
			it("png", testOpAndSaveGen("green", 156)(IMAGES.PNG));
		});
		describe("blue", () => {
			it("bmp", testOpAndSaveGen("blue", 200)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("blue", 200)(IMAGES.JPG));
			it("png", testOpAndSaveGen("blue", 200)(IMAGES.PNG));
		});
		describe("spin-SLOW", () => {
			it("bmp", testOpAndSaveGen("spin", 234)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("spin", 234)(IMAGES.JPG));
			it("png", testOpAndSaveGen("spin", 234)(IMAGES.PNG));
		});
	});
	
	describe("color-partial", () => {
		describe("brightness lower", () => {
			it("bmp", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.PNG));
		});
		describe("brightness higher", () => {
			it("bmp", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.PNG));
		});
		describe("contrast lower", () => {
			it("bmp", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.PNG));
		});
		describe("contrast higher", () => {
			it("bmp", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.PNG));
		});
		describe("mix", () => {
			it("bmp", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.PNG));
		});
		describe("tint", () => {
			it("bmp", testOpAndSaveGen(true, "tint", 25)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "tint", 25)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "tint", 25)(IMAGES.PNG));
		});
		describe("shade", () => {
			it("bmp", testOpAndSaveGen(true, "shade", 47)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "shade", 47)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "shade", 47)(IMAGES.PNG));
		});
		describe("xor", () => {
			it("bmp", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.PNG));
		});
		describe("red", () => {
			it("bmp", testOpAndSaveGen(true, "red", 125)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "red", 125)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "red", 125)(IMAGES.PNG));
		});
		describe("green", () => {
			it("bmp", testOpAndSaveGen(true, "green", 200)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "green", 200)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "green", 200)(IMAGES.PNG));
		});
		describe("blue", () => {
			it("bmp", testOpAndSaveGen(true, "blue", 99)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "blue", 99)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "blue", 99)(IMAGES.PNG));
		});
		describe("spin-SLOW", () => {
			it("bmp", testOpAndSaveGen(true, "spin", 123)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "spin", 123)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "spin", 123)(IMAGES.PNG));
		});
	});
	
	describe("filters-full", () => {
		describe("invert()", () => {
			it("bmp", testOpAndSaveGen("invert")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("invert")(IMAGES.JPG));
			it("png", testOpAndSaveGen("invert")(IMAGES.PNG));
		});
		describe("greyscale()", () => {
			it("bmp", testOpAndSaveGen("greyscale")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("greyscale")(IMAGES.JPG));
			it("png", testOpAndSaveGen("greyscale")(IMAGES.PNG));
		});
		describe("sepia()", () => {
			it("bmp", testOpAndSaveGen("sepia")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("sepia")(IMAGES.JPG));
			it("png", testOpAndSaveGen("sepia")(IMAGES.PNG));
		});
		describe("dither()", () => {
			it("bmp", testOpAndSaveGen("dither")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("dither")(IMAGES.JPG));
			it("png", testOpAndSaveGen("dither")(IMAGES.PNG));
		});
		describe("posterize(10)", () => {
			it("bmp", testOpAndSaveGen("posterize", 10)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("posterize", 10)(IMAGES.JPG));
			it("png", testOpAndSaveGen("posterize", 10)(IMAGES.PNG));
		});
	});
	
	describe("filters-partial", () => {
		describe("invert(x1, y1, x2, y2)", () => {
			it("bmp", testOpAndSaveGen(true, "invert")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "invert")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "invert")(IMAGES.PNG));
		});
		describe("greyscale(x1, y1, x2, y2)", () => {
			it("bmp", testOpAndSaveGen(true, "greyscale")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "greyscale")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "greyscale")(IMAGES.PNG));
		});
		describe("sepia(x1, y1, x2, y2)", () => {
			it("bmp", testOpAndSaveGen(true, "sepia")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "sepia")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "sepia")(IMAGES.PNG));
		});
		describe("dither(x1, y1, x2, y2)", () => {
			it("bmp", testOpAndSaveGen(true, "dither")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "dither")(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "dither")(IMAGES.PNG));
		});
		describe("posterize(5, x1, y1, x2, y2)", () => {
			it("bmp", testOpAndSaveGen(true, "posterize", 5)(IMAGES.BMP));
			it("jpg", testOpAndSaveGen(true, "posterize", 5)(IMAGES.JPG));
			it("png", testOpAndSaveGen(true, "posterize", 5)(IMAGES.PNG));
		});
	});
	
	describe("blurring", () => {
		describe("blur(3)", () => {
			it("bmp blur", testOpAndSaveGen("blur", 3)(IMAGES.BMP));
			it("jpg blur", testOpAndSaveGen("blur", 3)(IMAGES.JPG));
			it("png blur", testOpAndSaveGen("blur", 3)(IMAGES.PNG));
		});
		describe("gaussian(3)", () => {
			it("bmp gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.BMP));
			it("jpg gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.JPG));
			it("png gaussian", testOpAndSaveGen("gaussian", 2)(IMAGES.PNG));
		});
	});
	
	describe("draw on images", () => {
		function test(op) {
			const toTheMiddleAndPartial = op === true;
			let saveExt;
			
			if (toTheMiddleAndPartial) {
				op = arguments[1];
			}
			const arr = op.split("!"); // add `!ext` in op to determine what type should be saved
			
			// add `!ext` in op to determine what type should be saved
			if (arr[1]) {
				op = arr[0];
				saveExt = arr[1];
			}
			
			return what => () => Promise.all([nomage(what.PATH), nomage(IMAGES.LOGO_LACRIMOSA.PATH)]).then(resultArr => {
				const [imgToDrawOn, imgLogo] = resultArr;
				const args = toTheMiddleAndPartial ? [
					imgToDrawOn.width / 2, imgToDrawOn.height / 2,
					imgLogo.width / 5, imgLogo.height / 5, imgLogo.width * 4 / 5, imgLogo.height * 4 / 5
				].map(v => Math.floor(v)) : [];
				
				return imgToDrawOn[op](imgLogo, ...args).save(composeSavePath(what.PATH_SAVE, `${op}(another${args.length ? `, ${args.join(", ")}` : ""})`) + (saveExt ? `.${saveExt}` : ""));
			}).should.be.fulfilled();
		}
		
		describe("blit", () => {
			it("bmp", test("blit")(IMAGES.BMP));
			it("jpg", test("blit")(IMAGES.JPG));
			it("png", test("blit")(IMAGES.PNG));
			it("bmp", test(true, "blit")(IMAGES.BMP));
			it("jpg", test(true, "blit")(IMAGES.JPG));
			it("png", test(true, "blit")(IMAGES.PNG));
		});
		describe("compose", () => {
			it("bmp", test("compose")(IMAGES.BMP));
			it("jpg", test("compose")(IMAGES.JPG));
			it("png", test("compose")(IMAGES.PNG));
			it("bmp", test(true, "compose")(IMAGES.BMP));
			it("jpg", test(true, "compose")(IMAGES.JPG));
			it("png", test(true, "compose")(IMAGES.PNG));
		});
		describe("mask", () => {
			it("bmp", test("mask!png")(IMAGES.BMP));
			it("jpg", test("mask!png")(IMAGES.JPG));
			it("png", test("mask")(IMAGES.PNG));
			it("bmp", test(true, "mask!png")(IMAGES.BMP));
			it("jpg", test(true, "mask!png")(IMAGES.JPG));
			it("png", test(true, "mask")(IMAGES.PNG));
		});
	});
	
	describe("sizing", () => {
		describe("crop", () => {
			function testOnSaved(savedImg, args) {
				const [x1, y1, x2, y2] = args;
				
				savedImg.width.should.equal(x2 - x1 + 1);
				savedImg.height.should.equal(y2 - y1 + 1);
			}
			
			it("bmp", testOpAndSaveGen(true, "crop")(IMAGES.BMP, testOnSaved));
			it("jpg", testOpAndSaveGen(true, "crop")(IMAGES.JPG, testOnSaved));
			it("png", testOpAndSaveGen(true, "crop")(IMAGES.PNG, testOnSaved));
		});
		describe("resize", () => {
			it("bmp", testOpAndSaveGen("resize", "175%", "100%")(IMAGES.BMP));
			it("jpg", testOpAndSaveGen("resize", "85%")(IMAGES.JPG));
			it("png", testOpAndSaveGen("resize", "50%", "100%")(IMAGES.PNG));
		});
	});
	
	describe("rotate", () => {
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
	});
});