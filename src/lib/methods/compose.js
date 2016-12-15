/**
 * composites a source image over to this image respecting alpha channels
 * @param {Image} srcImg
 * @param {Integer} [x=1] the x position to compose
 * @param {Integer} [y=1] the y position to compose
 * @param {Integer} [srcX=1] the x position from which to compose
 * @param {Integer} [srcY=1] the y position from which to compose
 * @param {Integer} [srcW] the width to which to compose
 * @param {Integer} [srcH] the height to which to compose
 */
export default function(srcImg, x = 1, y = 1, srcX = 1, srcY = 1, srcW = srcImg.width, srcH = srcImg.height) {
	x = Math.round(x);
	y = Math.round(y);
	srcX = Math.round(srcX);
	srcY = Math.round(srcY);
	srcW = Math.round(srcW);
	srcH = Math.round(srcH);
	
	const {data} = this;
	const srcData = srcImg.data;
	
	srcImg._scan((idx, sx, sy) => {
		const dstIdx = this._getPixelIndex(x + sx - srcX, y + sy - srcY);
		const bgR = data[dstIdx + 0] / 255;
		const bgG = data[dstIdx + 1] / 255;
		const bgB = data[dstIdx + 2] / 255;
		const bgA = data[dstIdx + 3] / 255;
		const fgR = srcData[idx + 0] / 255;
		const fgG = srcData[idx + 1] / 255;
		const fgB = srcData[idx + 2] / 255;
		const fgA = srcData[idx + 3] / 255;
		const a = bgA + fgA - bgA * fgA;
		
		data[dstIdx] = (fgR * fgA + bgR * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 1] = (fgG * fgA + bgG * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 2] = (fgB * fgA + bgB * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 3] = a * 255;
	}, srcX, srcY, srcW, srcH);
	
	return this;
}