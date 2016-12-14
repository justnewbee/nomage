/**
 * composites a source image over to this image respecting alpha channels
 * http://stackoverflow.com/questions/7438263/alpha-compositing-algorithm-blend-modes
 * @param {Image} srcImg
 * @param {Integer} x the x position to blit the image
 * @param {Integer} y the y position to blit the image
 * @param {Integer} [srcX]
 * @param {Integer} [srcY]
 * @param {Integer} [srcW]
 * @param {Integer} [srcH]
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
};