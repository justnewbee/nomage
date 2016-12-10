import {PNG} from "pngjs";

//import streamToBuffer from "../../stream-to-buffer";

//export default (bitmap, {
//	bitDepth = 8,
//	deflateLevel = 9,
//	deflateStrategy = 3,
//	filterType = -1, // AUTO = -1, NONE = 0, SUB = 1, UP = 2, AVERAGE = 3, PATH = 4
//	rgba = true
//} = {}) => {
//	let png = new PNG({
//		width: bitmap.width,
//		height: bitmap.height,
//		bitDepth,
//		deflateLevel,
//		deflateStrategy,
//		filterType,
//		colorType: rgba ? 6 : 2,
//		inputHasAlpha: true,
//		data: Buffer.from(bitmap.data) // TODO !rgba 需要调用 compositeBitmapOverBackground
//	});
//	
//	return streamToBuffer(png.pack());
//};


export default bitmap => PNG.sync.write(bitmap);