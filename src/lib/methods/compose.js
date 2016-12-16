/**
 * composites a source image over to this image respecting alpha channels
 * @param {Image} srcImg
 * @param {Integer} [x=1] the x position to compose
 * @param {Integer} [y=1] the y position to compose
 * @param {Integer} [srcX1=1] the x position from which to compose
 * @param {Integer} [srcY1=1] the y position from which to compose
 * @param {Integer} [srcX2] the width to which to compose
 * @param {Integer} [srcY2] the height to which to compose
 */
export default function(srcImg, x = 1, y = 1, srcX1 = 1, srcY1 = 1, srcX2 = srcImg.width, srcY2 = srcImg.height) {
	x = Math.round(x);
	y = Math.round(y);
	srcX1 = Math.round(srcX1);
	srcY1 = Math.round(srcY1);
	srcX2 = Math.round(srcX2);
	srcY2 = Math.round(srcY2);
	
	const {data} = this;
	const srcData = srcImg.data;
	
	srcImg._scan((idx, sx, sy) => {
		const dstIdx = this._getPixelIndex(x + sx - srcX1, y + sy - srcY1);
		const bgR = data[dstIdx] / 255;
		const bgG = data[dstIdx + 1] / 255;
		const bgB = data[dstIdx + 2] / 255;
		const bgA = data[dstIdx + 3] / 255;
		const fgR = srcData[idx] / 255;
		const fgG = srcData[idx + 1] / 255;
		const fgB = srcData[idx + 2] / 255;
		const fgA = srcData[idx + 3] / 255;
		const a = bgA + fgA - bgA * fgA;
		
		
		fgR * fgA + bgR * bgA -  bgR * bgA * fgA
		
		
		
		data[dstIdx] = (fgR * fgA + bgR * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 1] = (fgG * fgA + bgG * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 2] = (fgB * fgA + bgB * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 3] = a * 255;
	}, srcX1, srcY1, srcX2, srcY2);
	
	return this;
}