import path from "path";
import fs from "fs";

import {MIME} from "../src/lib/const";

const NO_COVER = process.env.NODE_ENV === "test-no-cover"; // 启用覆盖率会导致大图的时候运行特别慢 所以有这个标识

const PREFIX_SAVE = "saved_by_test_";

/**
 * 本地路径图片
 * @param {String} relPath
 * @param {String} mime
 * @return {Object}
 */
function generateLocal(relPath, mime) {
	let [, W, H] = relPath.match(/_(\d+)x(\d+)\.(\w+)$/); // 开发保证一定 match 忽略第一个整体值
	let PATH = path.join(__dirname, "images", relPath);
	
	return {
		MIME: mime,
		W: Number(W),
		H: Number(H),
		PATH,
		PATH_SAVE: path.join(__dirname, "images", PREFIX_SAVE + relPath),
		BUFFER: fs.readFileSync(PATH)
	};
}
/**
 * 远程路径图片
 * @param {String} url
 * @param {String} mime
 * @param {Number} w
 * @param {Number} h
 * @return {{URL: *, W: *, H: *, MIME: *}}
 */
function generateRemote(url, mime, w, h) {
	return {
		MIME: mime,
		W: w,
		H: h,
		PATH: url,
		PATH_SAVE: path.join(__dirname, "images", PREFIX_SAVE + "REMOTE." + mime.replace("image/", ""))
	};
}

export default {
	PATH_TEST_JS: path.join(__dirname, "_helper.js"),
	IMAGES: {
		BMP: generateLocal("test_320x240.bmp", MIME.BMP),
		JPG: generateLocal(NO_COVER ? "test_1280x1920.jpg" : "test_236x364.jpeg", MIME.JPG),
		PNG: generateLocal("test_1000x1460.png", MIME.PNG),
		BMP_REMOTE: generateRemote("http://4.bp.blogspot.com/_WSQQuXJOJsE/SQHinlraiVI/AAAAAAAAB3s/SvWxwDD0IsA/s400/Ingrid.bmp", MIME.BMP, 400, 400),
		JPG_REMOTE: NO_COVER ? generateRemote("http://www.tunescope.com/wp-content/uploads/2015/10/Evanescence-Fallen-Cover.jpg", MIME.JPG, 1000, 1000) : generateRemote("https://s-media-cache-ak0.pinimg.com/564x/be/a0/fb/bea0fbfb3592cea2269a1103019c9330.jpg", MIME.JPG, 500, 500),
		PNG_REMOTE: generateRemote("http://i1094.photobucket.com/albums/i449/Ryannah764/goodbyelullaby.png", MIME.PNG, 500, 500)
	}
};
