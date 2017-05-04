export default function(watermark, opts) {
//	const offsetRatio = WATERMARK_REPORT.offsetRatio;
//	const maxRatioW = WATERMARK_REPORT.maxRatioW;
//	const minW = WATERMARK_REPORT.minW;
//	
//	let srcImg = images(imgBuffer);
//	let srcW = srcImg.width();
//	let srcH = srcImg.height();
//	let wmImg = WATERMARK_REPORT.img;
//	let wmW = WATERMARK_REPORT.w;
//	let wmH = WATERMARK_REPORT.h;
//	
//	let tempW = Math.round(srcW * maxRatioW - wmH * offsetRatio * 2);
//	if (wmW > tempW) { // 需要缩小水印
//		wmW = tempW;
//		
//		if (wmW < minW) { // 缩放后过小
//			wmW = minW;
//		}
//		
//		// 重新计算缩放后的高度
//		wmH = WATERMARK_REPORT.h * wmW / WATERMARK_REPORT.w;
//		
//		// 水印宽度加上两边填充大于图片宽度 再缩小以保证能填充满
//		tempW = Math.round(srcW - wmH * offsetRatio * 2);
//		if (wmW > tempW) {
//			wmW = tempW;
//		}
//		
//		wmH = WATERMARK_REPORT.h * wmW / WATERMARK_REPORT.w; // 再次重新计算缩放后的高度
//		
//		wmImg = images(wmImg).resize(wmW, wmH);
//	}
//	
//	// 「NOTE」这里能保证宽度可以放下水印 但不能保证高度可以 但由于宽高比例悬殊 一般不会发生高度容不下水印的问题
//	let wmX = srcW - wmW - wmH * offsetRatio;
//	let wmY = srcH - wmH * (1 + offsetRatio);
//	
//	srcImg.draw(wmImg, wmX, wmY < 0 ? 0 : wmY);
//	imgBuffer = srcImg.encode(file.type);
}