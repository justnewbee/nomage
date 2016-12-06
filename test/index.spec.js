/* global describe, it, before, bafter, beforeEach, afterEach */
import "should";

import path from "path";
import fs from "fs";

import CONST from "../src/lib/const";
import fileMime from "../src/lib/file/mime";
import fileSave from "../src/lib/file/save";
import bitmapParse from "../src/lib/bitmap/parse";
import bitmapUnparse from "../src/lib/bitmap/unparse";

const PATH_TEST_JS = path.join(__dirname, "./index.spec.js");

function generateTestImageData(relPath) {
	let [, W, H, EXT] = relPath.match(/_(\d+)x(\d+)\.(\w+)$/); // 开发保证一定 match 忽略第一个整体值
	let PATH = path.join(__dirname, "images", relPath);
	
	return {
		W: Number(W),
		H: Number(H),
		EXT,
		PATH,
		PATH_SAVE: `${PATH.replace(/\.\w+$/, "")}_save\.${EXT}`,
		BUFFER: fs.readFileSync(PATH)
	};
}

const IMAGES = {
	BMP: generateTestImageData("test_320x240.bmp"),
	JPG: generateTestImageData("test_236x364.jpeg"),
	PNG: generateTestImageData("test_1000x1460.png")
};

describe("file mime", function() {
	describe("get image mime from file path", function() {
		it("bmp", function() {
			fileMime(IMAGES.BMP.PATH).should.equal(CONST.MIME.BMP);
		});
		it("jpg", function() {
			fileMime(IMAGES.JPG.PATH).should.equal(CONST.MIME.JPG);
		});
		it("png", function() {
			fileMime(IMAGES.PNG.PATH).should.equal(CONST.MIME.PNG);
		});
	});
	
	describe("get image mime from file buffer", function() {
		it("bmp", function() {
			fileMime(IMAGES.BMP.BUFFER).should.equal(CONST.MIME.BMP);
		});
		it("jpg", function() {
			fileMime(IMAGES.JPG.BUFFER).should.equal(CONST.MIME.JPG);
		});
		it("png", function() {
			fileMime(IMAGES.PNG.BUFFER).should.equal(CONST.MIME.PNG);
		});
	});
	
	describe("handle exception, throw or return an empty string", function() {
		it("throw when provided param that is NOT a file buffer or path", function() {
			(function() {
				fileMime();
			}).should.throw();
			(function() {
				fileMime(null);
			}).should.throw();
			(function() {
				fileMime(true);
			}).should.throw();
			(function() {
				fileMime(123);
			}).should.throw();
			(function() {
				fileMime({});
			}).should.throw();
			(function() {
				fileMime([]);
			}).should.throw();
		});
		it("throw when provided a file path that does not exist", function() {
			(function() {
				fileMime("hello/i/do/NOT.exist");
			}).should.throw();
		});
		it("return an empty string when the file does NOT have mime type", function() {
			fileMime(PATH_TEST_JS).should.equal("");
		});
	});
});

describe("bitmap parse", function() {
	describe("parse from image file path into a bitmap", function() {
		it("bmp", function() {
			let what = IMAGES.BMP;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.BMP);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("jpg", function() {
			let what = IMAGES.JPG;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.JPG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("png", function() {
			let what = IMAGES.PNG;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.PNG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
	});
	
	describe("parse from image file buffer into a bitmap", function() {
		it("bmp", function() {
			let what = IMAGES.BMP;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.BMP);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("jpg", function() {
			let what = IMAGES.JPG;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.JPG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
		it("png", function() {
			let what = IMAGES.PNG;
			let bitmap = bitmapParse(what.PATH);
			
			bitmap.width.should.equal(what.W);
			bitmap.height.should.equal(what.H);
			bitmap.mime.should.equal(CONST.MIME.PNG);
			Buffer.isBuffer(bitmap.data).should.equal(true);
		});
	});
	
	describe("handle errors", function() {
		it("throw error trying to parse anything other than bmp/jpg/png", function() {
			(function() {
				bitmapParse(PATH_TEST_JS);
			}).should.throw();
		});
	});
});

describe("bitmap unparse - promise", function() {
	describe("unparse from bitmap to file buffer which can be saved", function() {
		it("bmp", done => {
			let what = IMAGES.BMP;
			
			bitmapUnparse(bitmapParse(what.BUFFER)).then(buffer => {
				Buffer.isBuffer(buffer).should.equal(true);
				fileSave(buffer, what.PATH_SAVE);
				done();
			}, done);
		});
		it("jpg", done => {
			let what = IMAGES.JPG;
			
			bitmapUnparse(bitmapParse(what.BUFFER)).then(buffer => {
				Buffer.isBuffer(buffer).should.equal(true);
				fileSave(buffer, what.PATH_SAVE);
				done();
			}, done);
		});
		it("png", done => {
			let what = IMAGES.PNG;
			
			bitmapUnparse(bitmapParse(what.BUFFER)).then(buffer => {
				Buffer.isBuffer(buffer).should.equal(true);
				fileSave(buffer, what.PATH_SAVE);
				done();
			}, done);
		});
	});
});