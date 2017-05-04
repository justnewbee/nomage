import path from "path";
import fs from "fs";

import nomageAlias from "../src/index";
import fileMime from "../src/file/mime";

const NO_COVER = process.env.NODE_ENV === "test-no-cover"; // 启用覆盖率会导致大图的时候运行特别慢 所以有这个标识

const SAVED_BY_TEST = "saved_by_test";

/**
 * 本地路径图片
 * @param {String} relPath
 * @param {String} MIME
 * @return {Object}
 */
function generateLocal(relPath, MIME) {
	const [, W, H] = relPath.match(/_(\d+)x(\d+)\.(\w+)$/); // 开发保证一定 match 忽略第一个整体值
	const PATH = path.join(__dirname, "images", relPath);
	
	return {
		MIME,
		W: Number(W),
		H: Number(H),
		PATH,
		PATH_SAVE: path.join(__dirname, "images", SAVED_BY_TEST, relPath),
		BUFFER: fs.readFileSync(PATH)
	};
}
/**
 * 远程路径图片
 * @param {String} PATH
 * @param {String} MIME
 * @param {Number} W
 * @param {Number} H
 * @return {Object} {URL: *, W: *, H: *, MIME: *}
 */
function generateRemote(PATH, MIME, W, H) {
	return {
		MIME, W, H, PATH,
		PATH_SAVE: path.join(__dirname, "images", SAVED_BY_TEST, `remote.${MIME.replace("image/", "")}`)
	};
}

export const nomage = nomageAlias;

export const IMAGES = {
	BMP: generateLocal("test_320x240.bmp", fileMime.BMP),
	JPG: generateLocal(NO_COVER ? "test_1280x1920.jpg" : "test_236x364.jpeg", fileMime.JPG),
	PNG: generateLocal("test_1000x1460.png", fileMime.PNG),
	BMP_REMOTE: generateRemote("http://thejasminebrand.com/wp-content/uploads/2011/10/rihanna-esquire-1.bmp", fileMime.BMP, 430, 575),
	JPG_REMOTE: NO_COVER ? generateRemote("http://www.tunescope.com/wp-content/uploads/2015/10/Evanescence-Fallen-Cover.jpg", fileMime.JPG, 1000, 1000) : generateRemote("https://s-media-cache-ak0.pinimg.com/564x/be/a0/fb/bea0fbfb3592cea2269a1103019c9330.jpg", fileMime.JPG, 500, 500),
	PNG_REMOTE: generateRemote("http://i1094.photobucket.com/albums/i449/Ryannah764/goodbyelullaby.png", fileMime.PNG, 500, 500),
	// for composing
	LOGO_LACRIMOSA: generateLocal("logo_lacrimosa_245x220.png", fileMime.PNG)
};

export function composeSavePath(originalSavePath, testSpecific) {
	return originalSavePath.replace(/\.(\w+)$/, `_${testSpecific}\.$1`);
}

/**
 * generate a test function on op and args and then save
 * @return {Function} the test function that take only the what object
 */
export function testOpAndSaveGen(op, ...args) {
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
	return (what, fn) => () => nomageAlias(what.PATH).then(img => {
		if (partial) {
			args.push(what.W / 4, what.H / 4, what.W / 4 * 3, what.H / 4 * 3);
		}
		
		const opFn = img[op];
		const savePath = composeSavePath(what.PATH_SAVE, `${op}(${args.join(", ")})`) + (saveExt ? "." + saveExt : "");
		const opRtn = opFn.apply(img, args);
		
		opRtn.should.be.exactly(img); // test for chaining
		
		return img.save(savePath).then(() => fn ? nomageAlias(savePath).then(savedImg => fn(savedImg, args, what)) : null);
	}).should.be.fulfilled();
}

export function testDrawAndSave(op) {
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