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
		
		[op, saveExt = ""] = op.split("!"); // add `!ext` in op to determine what type should be saved
		
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
			return nomage(what.PATH).then(img => {
				img.width.should.equal(what.W);
				img.height.should.equal(what.H);
				img.mime.should.equal(what.MIME);
				Buffer.isBuffer(img.data).should.equal(true);
				img.data.length.should.equal(img.width * img.height * 4);
			}).should.be.fulfilled();
		}
		
		describe("getter-local", () => {
			it("bmp", () => test(IMAGES.BMP));
			it("jpg", () => test(IMAGES.JPG));
			it("png", () => test(IMAGES.PNG));
		});
		describe("getter-remote", () => {
			it("bmp-remote", () => test(IMAGES.BMP_REMOTE));
			it("jpg-remote", () => test(IMAGES.JPG_REMOTE));
			it("png-remote", () => test(IMAGES.PNG_REMOTE));
		});
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
			return nomage(what.PATH).then(img => img.save(composeSavePath(what.PATH_SAVE, `q${q}`) + ".jpg", { quality: q })).should.be.fulfilled();
		}
		describe("save with quality, can only be saved as jpg", () => {
			it("bmp", () => test(IMAGES.BMP, 25));
			it("jpg", () => test(IMAGES.JPG, 25));
			it("png", () => test(IMAGES.PNG, 25));
			
			it("bmp", () => test(IMAGES.BMP, 50));
			it("jpg", () => test(IMAGES.JPG, 50));
			it("png", () => test(IMAGES.PNG, 50));
			
			it("bmp", () => test(IMAGES.BMP, 75));
			it("jpg", () => test(IMAGES.JPG, 75));
			it("png", () => test(IMAGES.PNG, 75));
		});
	});
	
	describe("flipping", () => {
		describe("horizontal", () => {
			it("bmp horizontal", testOpAndSaveGen("flip")(IMAGES.BMP));
			it("jpg horizontal", testOpAndSaveGen("flip")(IMAGES.JPG));
			it("png horizontal", testOpAndSaveGen("flip")(IMAGES.PNG));
		});
		describe("vertical", () => {
			it("bmp vertical", testOpAndSaveGen("flip", false, true)(IMAGES.BMP));
			it("jpg vertical", testOpAndSaveGen("flip", false, true)(IMAGES.JPG));
			it("png vertical", testOpAndSaveGen("flip", false, true)(IMAGES.PNG));
		});
		describe("both", () => {
			it("bmp both", testOpAndSaveGen("flip", true, true)(IMAGES.BMP));
			it("jpg both", testOpAndSaveGen("flip", true, true)(IMAGES.JPG));
			it("png both", testOpAndSaveGen("flip", true, true)(IMAGES.PNG));
		});
	});
	
	describe("alpha-full", () => {
		describe("opacity", () => {
			it("bmp opacity", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.BMP));
			it("jpg opacity", testOpAndSaveGen("opacity!png", 0.667)(IMAGES.JPG));
			it("png opacity", testOpAndSaveGen("opacity", 0.667)(IMAGES.PNG));
		});
		describe("opaque", () => {
			it("bmp opaque", testOpAndSaveGen("opaque")(IMAGES.BMP));
			it("jpg opaque", testOpAndSaveGen("opaque")(IMAGES.JPG));
			it("png opaque", testOpAndSaveGen("opaque")(IMAGES.PNG));
		});
	});
	describe("alpha-partial", () => {
		describe("opacity", () => {
			it("bmp opacity", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.BMP));
			it("jpg opacity", testOpAndSaveGen(true, "opacity!png", 0.3)(IMAGES.JPG));
			it("png opacity", testOpAndSaveGen(true, "opacity", 0.3)(IMAGES.PNG));
		});
		describe("opaque", () => {
			it("bmp opaque", testOpAndSaveGen(true, "opaque")(IMAGES.BMP));
			it("jpg opaque", testOpAndSaveGen(true, "opaque")(IMAGES.JPG));
			it("png opaque", testOpAndSaveGen(true, "opaque")(IMAGES.PNG));
		});
	});
	
	describe("color-full", () => {
		describe("brightness lower", () => {
			it("bmp brightness lower", testOpAndSaveGen("brightness", -0.6)(IMAGES.BMP));
			it("jpg brightness lower", testOpAndSaveGen("brightness", -0.6)(IMAGES.JPG));
			it("png brightness lower", testOpAndSaveGen("brightness", -0.6)(IMAGES.PNG));
		});
		describe("brightness higher", () => {
			it("bmp brightness higher", testOpAndSaveGen("brightness", 0.6)(IMAGES.BMP));
			it("jpg brightness higher", testOpAndSaveGen("brightness", 0.6)(IMAGES.JPG));
			it("png brightness higher", testOpAndSaveGen("brightness", 0.6)(IMAGES.PNG));
		});
		describe("contrast lower", () => {
			it("bmp contrast lower", testOpAndSaveGen("contrast", -0.5)(IMAGES.BMP));
			it("jpg contrast lower", testOpAndSaveGen("contrast", -0.5)(IMAGES.JPG));
			it("png contrast lower", testOpAndSaveGen("contrast", -0.5)(IMAGES.PNG));
		});
		describe("contrast higher", () => {
			it("bmp contrast higher", testOpAndSaveGen("contrast", 0.5)(IMAGES.BMP));
			it("jpg contrast higher", testOpAndSaveGen("contrast", 0.5)(IMAGES.JPG));
			it("png contrast higher", testOpAndSaveGen("contrast", 0.5)(IMAGES.PNG));
		});
		describe("mix", () => {
			it("bmp mix", testOpAndSaveGen("mix", "red")(IMAGES.BMP));
			it("jpg mix", testOpAndSaveGen("mix", "red")(IMAGES.JPG));
			it("png mix", testOpAndSaveGen("mix", "red")(IMAGES.PNG));
		});
		describe("tint", () => {
			it("bmp tint", testOpAndSaveGen("tint", 33)(IMAGES.BMP));
			it("jpg tint", testOpAndSaveGen("tint", 33)(IMAGES.JPG));
			it("png tint", testOpAndSaveGen("tint", 33)(IMAGES.PNG));
		});
		describe("shade", () => {
			it("bmp shade", testOpAndSaveGen("shade", 33)(IMAGES.BMP));
			it("jpg shade", testOpAndSaveGen("shade", 33)(IMAGES.JPG));
			it("png shade", testOpAndSaveGen("shade", 33)(IMAGES.PNG));
		});
		describe("xor", () => {
			it("bmp xor", testOpAndSaveGen("xor", "#123456")(IMAGES.BMP));
			it("jpg xor", testOpAndSaveGen("xor", "#123456")(IMAGES.JPG));
			it("png xor", testOpAndSaveGen("xor", "#123456")(IMAGES.PNG));
		});
		describe("red", () => {
			it("bmp red", testOpAndSaveGen("red", 125)(IMAGES.BMP));
			it("jpg red", testOpAndSaveGen("red", 125)(IMAGES.JPG));
			it("png red", testOpAndSaveGen("red", 125)(IMAGES.PNG));
		});
		describe("green", () => {
			it("bmp green", testOpAndSaveGen("green", 156)(IMAGES.BMP));
			it("jpg green", testOpAndSaveGen("green", 156)(IMAGES.JPG));
			it("png green", testOpAndSaveGen("green", 156)(IMAGES.PNG));
		});
		describe("blue", () => {
			it("bmp blue", testOpAndSaveGen("blue", 200)(IMAGES.BMP));
			it("jpg blue", testOpAndSaveGen("blue", 200)(IMAGES.JPG));
			it("png blue", testOpAndSaveGen("blue", 200)(IMAGES.PNG));
		});
		describe("spin-SLOW", () => {
			it("bmp spin", testOpAndSaveGen("spin", 234)(IMAGES.BMP));
			it("jpg spin", testOpAndSaveGen("spin", 234)(IMAGES.JPG));
			it("png spin", testOpAndSaveGen("spin", 234)(IMAGES.PNG));
		});
	});
	
	describe("color-partial", () => {
		describe("brightness lower", () => {
			it("bmp brightness lower", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.BMP));
			it("jpg brightness lower", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.JPG));
			it("png brightness lower", testOpAndSaveGen(true, "brightness", -0.5)(IMAGES.PNG));
		});
		describe("brightness higher", () => {
			it("bmp brightness higher", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.BMP));
			it("jpg brightness higher", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.JPG));
			it("png brightness higher", testOpAndSaveGen(true, "brightness", 0.75)(IMAGES.PNG));
		});
		describe("contrast lower", () => {
			it("bmp contrast lower", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.BMP));
			it("jpg contrast lower", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.JPG));
			it("png contrast lower", testOpAndSaveGen(true, "contrast", -0.5)(IMAGES.PNG));
		});
		describe("contrast higher", () => {
			it("bmp contrast higher", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.BMP));
			it("jpg contrast higher", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.JPG));
			it("png contrast higher", testOpAndSaveGen(true, "contrast", 0.8)(IMAGES.PNG));
		});
		describe("mix", () => {
			it("bmp mix", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.BMP));
			it("jpg mix", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.JPG));
			it("png mix", testOpAndSaveGen(true, "mix", [50, 75, 150], 33)(IMAGES.PNG));
		});
		describe("tint", () => {
			it("bmp tint", testOpAndSaveGen(true, "tint", 25)(IMAGES.BMP));
			it("jpg tint", testOpAndSaveGen(true, "tint", 25)(IMAGES.JPG));
			it("png tint", testOpAndSaveGen(true, "tint", 25)(IMAGES.PNG));
		});
		describe("shade", () => {
			it("bmp shade", testOpAndSaveGen(true, "shade", 47)(IMAGES.BMP));
			it("jpg shade", testOpAndSaveGen(true, "shade", 47)(IMAGES.JPG));
			it("png shade", testOpAndSaveGen(true, "shade", 47)(IMAGES.PNG));
		});
		describe("xor", () => {
			it("bmp xor", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.BMP));
			it("jpg xor", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.JPG));
			it("png xor", testOpAndSaveGen(true, "xor", "#fc9630")(IMAGES.PNG));
		});
		describe("red", () => {
			it("bmp red", testOpAndSaveGen(true, "red", 125)(IMAGES.BMP));
			it("jpg red", testOpAndSaveGen(true, "red", 125)(IMAGES.JPG));
			it("png red", testOpAndSaveGen(true, "red", 125)(IMAGES.PNG));
		});
		describe("green", () => {
			it("bmp green", testOpAndSaveGen(true, "green", 200)(IMAGES.BMP));
			it("jpg green", testOpAndSaveGen(true, "green", 200)(IMAGES.JPG));
			it("png green", testOpAndSaveGen(true, "green", 200)(IMAGES.PNG));
		});
		describe("blue", () => {
			it("bmp blue", testOpAndSaveGen(true, "blue", 99)(IMAGES.BMP));
			it("jpg blue", testOpAndSaveGen(true, "blue", 99)(IMAGES.JPG));
			it("png blue", testOpAndSaveGen(true, "blue", 99)(IMAGES.PNG));
		});
		describe("spin-SLOW", () => {
			it("bmp spin", testOpAndSaveGen(true, "spin", 123)(IMAGES.BMP));
			it("jpg spin", testOpAndSaveGen(true, "spin", 123)(IMAGES.JPG));
			it("png spin", testOpAndSaveGen(true, "spin", 123)(IMAGES.PNG));
		});
	});
	
	describe("filters-full", () => {
		describe("invert()", () => {
			it("bmp invert", testOpAndSaveGen("invert")(IMAGES.BMP));
			it("jpg invert", testOpAndSaveGen("invert")(IMAGES.JPG));
			it("png invert", testOpAndSaveGen("invert")(IMAGES.PNG));
		});
		describe("greyscale()", () => {
			it("bmp greyscale", testOpAndSaveGen("greyscale")(IMAGES.BMP));
			it("jpg greyscale", testOpAndSaveGen("greyscale")(IMAGES.JPG));
			it("png greyscale", testOpAndSaveGen("greyscale")(IMAGES.PNG));
		});
		describe("sepia()", () => {
			it("bmp sepia", testOpAndSaveGen("sepia")(IMAGES.BMP));
			it("jpg sepia", testOpAndSaveGen("sepia")(IMAGES.JPG));
			it("png sepia", testOpAndSaveGen("sepia")(IMAGES.PNG));
		});
		describe("dither()", () => {
			it("bmp dither", testOpAndSaveGen("dither")(IMAGES.BMP));
			it("jpg dither", testOpAndSaveGen("dither")(IMAGES.JPG));
			it("png dither", testOpAndSaveGen("dither")(IMAGES.PNG));
		});
		describe("posterize(10)", () => {
			it("bmp posterize", testOpAndSaveGen("posterize", 10)(IMAGES.BMP));
			it("jpg posterize", testOpAndSaveGen("posterize", 10)(IMAGES.JPG));
			it("png posterize", testOpAndSaveGen("posterize", 10)(IMAGES.PNG));
		});
	});
	
	describe("filters-partial", () => {
		describe("invert(x1, y1, x2, y2)", () => {
			it("bmp invert", testOpAndSaveGen(true, "invert")(IMAGES.BMP));
			it("jpg invert", testOpAndSaveGen(true, "invert")(IMAGES.JPG));
			it("png invert", testOpAndSaveGen(true, "invert")(IMAGES.PNG));
		});
		describe("greyscale(x1, y1, x2, y2)", () => {
			it("bmp greyscale", testOpAndSaveGen(true, "greyscale")(IMAGES.BMP));
			it("jpg greyscale", testOpAndSaveGen(true, "greyscale")(IMAGES.JPG));
			it("png greyscale", testOpAndSaveGen(true, "greyscale")(IMAGES.PNG));
		});
		describe("sepia(x1, y1, x2, y2)", () => {
			it("bmp sepia", testOpAndSaveGen(true, "sepia")(IMAGES.BMP));
			it("jpg sepia", testOpAndSaveGen(true, "sepia")(IMAGES.JPG));
			it("png sepia", testOpAndSaveGen(true, "sepia")(IMAGES.PNG));
		});
		describe("dither(x1, y1, x2, y2)", () => {
			it("bmp dither", testOpAndSaveGen(true, "dither")(IMAGES.BMP));
			it("jpg dither", testOpAndSaveGen(true, "dither")(IMAGES.JPG));
			it("png dither", testOpAndSaveGen(true, "dither")(IMAGES.PNG));
		});
		describe("posterize(5, x1, y1, x2, y2)", () => {
			it("bmp posterize", testOpAndSaveGen(true, "posterize", 5)(IMAGES.BMP));
			it("jpg posterize", testOpAndSaveGen(true, "posterize", 5)(IMAGES.JPG));
			it("png posterize", testOpAndSaveGen(true, "posterize", 5)(IMAGES.PNG));
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
			
			if (toTheMiddleAndPartial) {
				op = arguments[1];
			}
			
			return function(what) {
				return Promise.all([nomage(what.PATH), nomage(IMAGES.LOGO_LACRIMOSA.PATH)]).then(arr => {
					const [imgToDrawOn, imgLogo] = arr;
					const args = toTheMiddleAndPartial ? [
						imgToDrawOn.width / 2, imgToDrawOn.height / 2,
						imgLogo.width / 3, imgLogo.height / 3, imgLogo.width * 2 / 3, imgLogo.height * 2 / 3
					].map(v => Math.floor(v)) : [];
					
					
					return imgToDrawOn[op](imgLogo, ...args).save(composeSavePath(what.PATH_SAVE, `${op}(another${args.length ? `, ${args.join(", ")}` : ""})`));
				}).should.be.fulfilled();
			};
		}
		
		describe("blit", () => {
			it("bmp", () => test("blit")(IMAGES.BMP));
			it("jpg", () => test("blit")(IMAGES.JPG));
			it("png", () => test("blit")(IMAGES.PNG));
			it("bmp", () => test(true, "blit")(IMAGES.BMP));
			it("jpg", () => test(true, "blit")(IMAGES.JPG));
			it("png", () => test(true, "blit")(IMAGES.PNG));
//			it("bmp on to jpg", () => Promise.all([nomage(IMAGES.JPG.PATH), nomage(IMAGES.BMP.PATH)]).then(arr => {
//				const [imgJpg, imgBmp] = arr;
//				
//				return imgJpg.blit(imgBmp,
//						imgJpg.width / 2, imgJpg.height / 2,
//						imgBmp.width / 3, imgBmp.height / 3, imgBmp.width * 2 / 3, imgBmp.height * 2 / 3)
//					.save(composeSavePath(IMAGES.JPG.PATH_SAVE, "blit_part_of_bmp"));
//			}).should.be.fulfilled());
		});
		describe("compose", () => {
			it("bmp", () => test("compose")(IMAGES.BMP));
			it("jpg", () => test("compose")(IMAGES.JPG));
			it("png", () => test("compose")(IMAGES.PNG));
			it("bmp", () => test(true, "compose")(IMAGES.BMP));
			it("jpg", () => test(true, "compose")(IMAGES.JPG));
			it("png", () => test(true, "compose")(IMAGES.PNG));
		});
		describe("mask", () => {
			it("bmp", () => test("mask")(IMAGES.BMP));
			it("jpg", () => test("mask")(IMAGES.JPG));
			it("png", () => test("mask")(IMAGES.PNG));
			it("bmp", () => test(true, "mask")(IMAGES.BMP));
			it("jpg", () => test(true, "mask")(IMAGES.JPG));
			it("png", () => test(true, "mask")(IMAGES.PNG));
		});
	});
	
	describe("sizing", () => {
		describe("crop", () => {
			function testOnSaved(savedImg, args) {
				const [x1, y1, x2, y2] = args;
				
				savedImg.width.should.equal(x2 - x1 + 1);
				savedImg.height.should.equal(y2 - y1 + 1);
			}
			
			it("bmp crop", testOpAndSaveGen(true, "crop")(IMAGES.BMP, testOnSaved));
			it("jpg crop", testOpAndSaveGen(true, "crop")(IMAGES.JPG, testOnSaved));
			it("png crop", testOpAndSaveGen(true, "crop")(IMAGES.PNG, testOnSaved));
		});
		describe("resize", () => {
			it("bmp resize", testOpAndSaveGen("resize", "175%", "100%")(IMAGES.BMP));
			it("jpg resize", testOpAndSaveGen("resize", "85%")(IMAGES.JPG));
			it("png resize", testOpAndSaveGen("resize", "50%", "100%")(IMAGES.PNG));
		});
	});
});