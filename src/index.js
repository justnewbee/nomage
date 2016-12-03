import bitmapParse from "./lib/bitmap/parse";
import bitmapUnarse from "./lib/bitmap/unparse";
import fileSave from "./lib/file/save";

let bmBMP = bitmapParse("test.bmp");
let bmJPG = bitmapParse("test.jpeg");
let bmPNG = bitmapParse("test.png");

console.info({
	bmBMP, bmJPG, bmPNG
});

Promise.all([
	bitmapUnarse(bmBMP),
	bitmapUnarse(bmJPG),
	bitmapUnarse(bmPNG)
]).then(arr => {
	let [bufBMP, bufJPG, bufPNG] = arr;

	console.info({
		bufBMP, bufJPG, bufPNG
	});

	fileSave(bufBMP, "another.bmp");
	fileSave(bufJPG, "another.jpg");
	fileSave(bufPNG, "another.png");
});

export default {};