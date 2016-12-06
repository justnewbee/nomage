import path from "path";
import fs from "fs";

const NO_COVER = process.env.NODE_ENV === "test-no-cover"; // 启用覆盖率会导致大图的时候运行特别慢 所以有这个标识

function generateTestImageData(relPath) {
	let [, W, H] = relPath.match(/_(\d+)x(\d+)\.(\w+)$/); // 开发保证一定 match 忽略第一个整体值
	let PATH = path.join(__dirname, "images", relPath);
	let PATH_SAVE = path.join(__dirname, "images", "saved_by_test" + relPath);
	
	return {
		W: Number(W),
		H: Number(H),
		PATH,
		PATH_SAVE,
		BUFFER: fs.readFileSync(PATH)
	};
}

export default {
	PATH_TEST_JS: path.join(__dirname, "_helper.js"),
	IMAGES: {
		BMP: generateTestImageData("test_320x240.bmp"),
		JPG: generateTestImageData(NO_COVER ? "test_1280x1920.jpg" : "test_236x364.jpeg"),
		PNG: generateTestImageData("test_1000x1460.png")
	}
};
