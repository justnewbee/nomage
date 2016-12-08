/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import image from "../src/lib/image";

import {IMAGES, composeSavePath} from "./_helper";

describe("image", function() {
	describe("getter", function() {
		function test(what) {
			return image(what.PATH).then(img => {
				img.width.should.equal(what.W);
				img.height.should.equal(what.H);
				img.mime.should.equal(what.MIME);
				Buffer.isBuffer(img.data).should.equal(true);
				img.data.length.should.equal(img.width * img.height * 4);
				
				return img.save(what.PATH_SAVE);
			}).should.be.fulfilled();
		}
		
		describe("getter-local", () => {
			it("bmp", () => test(IMAGES.BMP));
			it("jpg", () => test(IMAGES.JPG));
			it("png", () => test(IMAGES.PNG));
		});
		describe("getter-remote", () => {
			it("bmp - remote", () => test(IMAGES.BMP_REMOTE));
			it("jpg - remote", () => test(IMAGES.JPG_REMOTE));
			it("png - remote", () => test(IMAGES.PNG_REMOTE));
		});
	});
	describe("brightness-lower", () => {
		function test(what) {
			return image(what.PATH).then(img => img.brightness(-0.75).save(composeSavePath(what.PATH_SAVE, "brightness-lower"))).should.be.fulfilled();
		}
		
		it("bmp brightness", () => test(IMAGES.BMP));
		it("jpg brightness", () => test(IMAGES.JPG));
		it("png brightness", () => test(IMAGES.PNG));
	});
	describe("brightness", () => {
		function test(what) {
			return image(what.PATH).then(img => img.brightness(0.75).save(composeSavePath(what.PATH_SAVE, "brightness"))).should.be.fulfilled();
		}
		
		it("bmp brightness", () => test(IMAGES.BMP));
		it("jpg brightness", () => test(IMAGES.JPG));
		it("png brightness", () => test(IMAGES.PNG));
	});
	describe("contrast - lower", () => {
		function test(what) {
			return image(what.PATH).then(img => img.contrast(-0.75).save(composeSavePath(what.PATH_SAVE, "contrast-lower"))).should.be.fulfilled();
		}
		
		it("bmp contrast", () => test(IMAGES.BMP));
		it("jpg contrast", () => test(IMAGES.JPG));
		it("png contrast", () => test(IMAGES.PNG));
	});
	describe("contrast - higher", () => {
		function test(what) {
			return image(what.PATH).then(img => img.contrast(0.75).save(composeSavePath(what.PATH_SAVE, "contrast-higher"))).should.be.fulfilled();
		}
		
		it("bmp contrast", () => test(IMAGES.BMP));
		it("jpg contrast", () => test(IMAGES.JPG));
		it("png contrast", () => test(IMAGES.PNG));
	});
	describe("posterize", () => {
		function test(what) {
			return image(what.PATH).then(img => img.posterize().save(composeSavePath(what.PATH_SAVE, "posterize"))).should.be.fulfilled();
		}
		
		it("bmp posterize", () => test(IMAGES.BMP));
		it("jpg posterize", () => test(IMAGES.JPG));
		it("png posterize", () => test(IMAGES.PNG));
	});
	describe("normalize", () => {
		function test(what) {
			return image(what.PATH).then(img => img.normalize().save(composeSavePath(what.PATH_SAVE, "normalize"))).should.be.fulfilled();
		}
		
		it("bmp normalize", () => test(IMAGES.BMP));
		it("jpg normalize", () => test(IMAGES.JPG));
		it("png normalize", () => test(IMAGES.PNG));
	});
	
	describe("gaussian", () => {
		function test(what) {
			return image(what.PATH).then(img => img.gaussian(3).save(composeSavePath(what.PATH_SAVE, "gaussian"))).should.be.fulfilled();
		}
		
		it("bmp gaussian", () => test(IMAGES.BMP));
		it("jpg gaussian", () => test(IMAGES.JPG));
		it("png gaussian", () => test(IMAGES.PNG));
	});
	describe("blur", () => {
		function test(what) {
			return image(what.PATH).then(img => img.blur(3).save(composeSavePath(what.PATH_SAVE, "blur"))).should.be.fulfilled();
		}
		
		it("bmp blur", () => test(IMAGES.BMP));
		it("jpg blur", () => test(IMAGES.JPG));
		it("png blur", () => test(IMAGES.PNG));
	});
	describe("flip horizontal", () => {
		function test(what) {
			return image(what.PATH).then(img => img.flip().save(composeSavePath(what.PATH_SAVE, "flip-horizontal"))).should.be.fulfilled();
		}
		
		it("bmp flip horizontal", () => test(IMAGES.BMP));
		it("jpg flip horizontal", () => test(IMAGES.JPG));
		it("png flip horizontal", () => test(IMAGES.PNG));
	});
	describe("flip vertical", () => {
		function test(what) {
			return image(what.PATH).then(img => img.flip(false, true).save(composeSavePath(what.PATH_SAVE, "flip-vertical"))).should.be.fulfilled();
		}
		
		it("bmp flip vertical", () => test(IMAGES.BMP));
		it("jpg flip vertical", () => test(IMAGES.JPG));
		it("png flip vertical", () => test(IMAGES.PNG));
	});
	describe("flip both", () => {
		function test(what) {
			return image(what.PATH).then(img => img.flip(true, true).save(composeSavePath(what.PATH_SAVE, "flip-both"))).should.be.fulfilled();
		}
		
		it("bmp flip both", () => test(IMAGES.BMP));
		it("jpg flip both", () => test(IMAGES.JPG));
		it("png flip both", () => test(IMAGES.PNG));
	});
	describe("opacity", () => {
		function test(what) {
			return image(what.PATH).then(img => img.opacity(0.667).save(composeSavePath(what.PATH_SAVE, "opacity"))).should.be.fulfilled();
		}
		
		it("bmp opacity", () => test(IMAGES.BMP));
		it("jpg opacity", () => test(IMAGES.JPG));
		it("png opacity", () => test(IMAGES.PNG));
	});
	describe("opaque", () => {
		function test(what) {
			return image(what.PATH).then(img => img.opaque().save(composeSavePath(what.PATH_SAVE, "opaque"))).should.be.fulfilled();
		}
		
		it("bmp opaque", () => test(IMAGES.BMP));
		it("jpg opaque", () => test(IMAGES.JPG));
		it("png opaque", () => test(IMAGES.PNG));
	});
	
	describe("color manipulation", () => {
		describe("mix", () => {
			function test(what) {
				return image(what.PATH).then(img => img.mix("red").save(composeSavePath(what.PATH_SAVE, "mix"))).should.be.fulfilled();
			}
			
			it("bmp mix", () => test(IMAGES.BMP));
			it("jpg mix", () => test(IMAGES.JPG));
			it("png mix", () => test(IMAGES.PNG));
		});
		describe("tint", () => {
			function test(what) {
				return image(what.PATH).then(img => img.tint(33).save(composeSavePath(what.PATH_SAVE, "tint"))).should.be.fulfilled();
			}
			
			it("bmp tint", () => test(IMAGES.BMP));
			it("jpg tint", () => test(IMAGES.JPG));
			it("png tint", () => test(IMAGES.PNG));
		});
		describe("shade", () => {
			function test(what) {
				return image(what.PATH).then(img => img.shade(33).save(composeSavePath(what.PATH_SAVE, "shade"))).should.be.fulfilled();
			}
			
			it("bmp shade", () => test(IMAGES.BMP));
			it("jpg shade", () => test(IMAGES.JPG));
			it("png shade", () => test(IMAGES.PNG));
		});
		describe("xor", () => {
			function test(what) {
				return image(what.PATH).then(img => img.xor("#123456").save(composeSavePath(what.PATH_SAVE, "xor"))).should.be.fulfilled();
			}
			
			it("bmp xor", () => test(IMAGES.BMP));
			it("jpg xor", () => test(IMAGES.JPG));
			it("png xor", () => test(IMAGES.PNG));
		});
		describe("red", () => {
			function test(what) {
				return image(what.PATH).then(img => img.red(125).save(composeSavePath(what.PATH_SAVE, "red"))).should.be.fulfilled();
			}
			
			it("bmp red", () => test(IMAGES.BMP));
			it("jpg red", () => test(IMAGES.JPG));
			it("png red", () => test(IMAGES.PNG));
		});
		describe("green", () => {
			function test(what) {
				return image(what.PATH).then(img => img.green(125).save(composeSavePath(what.PATH_SAVE, "green"))).should.be.fulfilled();
			}
			
			it("bmp green", () => test(IMAGES.BMP));
			it("jpg green", () => test(IMAGES.JPG));
			it("png green", () => test(IMAGES.PNG));
		});
		describe("blue", () => {
			function test(what) {
				return image(what.PATH).then(img => img.blue(125).save(composeSavePath(what.PATH_SAVE, "blue"))).should.be.fulfilled();
			}
			
			it("bmp blue", () => test(IMAGES.BMP));
			it("jpg blue", () => test(IMAGES.JPG));
			it("png blue", () => test(IMAGES.PNG));
		});
		describe("spin - SLOW", () => {
			function test(what) {
				return image(what.PATH).then(img => img.spin(234).save(composeSavePath(what.PATH_SAVE, "spin"))).should.be.fulfilled();
			}
			
			it("bmp spin", () => test(IMAGES.BMP));
			it("jpg spin", () => test(IMAGES.JPG));
			it("png spin", () => test(IMAGES.PNG));
		});
	});
	
	describe("filters - predefined color manipulation", () => {
		describe("invert", () => {
			function test(what) {
				return image(what.PATH).then(img => img.invert().save(composeSavePath(what.PATH_SAVE, "invert"))).should.be.fulfilled();
			}
			
			it("bmp invert", () => test(IMAGES.BMP));
			it("jpg invert", () => test(IMAGES.JPG));
			it("png invert", () => test(IMAGES.PNG));
		});
		describe("greyscale", () => {
			function test(what) {
				return image(what.PATH).then(img => img.greyscale().save(composeSavePath(what.PATH_SAVE, "greyscale"))).should.be.fulfilled();
			}
			
			it("bmp greyscale", () => test(IMAGES.BMP));
			it("jpg greyscale", () => test(IMAGES.JPG));
			it("png greyscale", () => test(IMAGES.PNG));
		});
		describe("sepia", () => {
			function test(what) {
				return image(what.PATH).then(img => img.sepia().save(composeSavePath(what.PATH_SAVE, "sepia"))).should.be.fulfilled();
			}
			
			it("bmp sepia", () => test(IMAGES.BMP));
			it("jpg sepia", () => test(IMAGES.JPG));
			it("png sepia", () => test(IMAGES.PNG));
		});
		describe("dither", () => {
			function test(what) {
				return image(what.PATH).then(img => img.dither().save(composeSavePath(what.PATH_SAVE, "dither"))).should.be.fulfilled();
			}
			
			it("bmp dither", () => test(IMAGES.BMP));
			it("jpg dither", () => test(IMAGES.JPG));
			it("png dither", () => test(IMAGES.PNG));
		});
	});
	
	describe("sizing", () => {
		describe("crop", () => {
			function test(what) {
				let savedPath = composeSavePath(what.PATH_SAVE, "crop");
				let x1 = Math.floor(what.W / 4);
				let x2 = Math.floor(what.W / 4 * 3);
				let y1 = Math.floor(what.H / 4);
				let y2 = Math.floor(what.H / 4 * 3);
				
				return image(what.PATH).then(img => img.crop(x1, y1, x2, y2).save(savedPath).then(() => image(savedPath).then(savedImg => {
					savedImg.width.should.equal(x2 - x1 + 1);
					savedImg.height.should.equal(y2 - y1 + 1);
				}))).should.be.fulfilled();
			}
			
			it("bmp crop", () => test(IMAGES.BMP));
			it("jpg crop", () => test(IMAGES.JPG));
			it("png crop", () => test(IMAGES.PNG));
		});
	});
});