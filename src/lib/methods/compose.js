/**
 * composites a source image over to this image respecting alpha channels
 * http://stackoverflow.com/questions/7438263/alpha-compositing-algorithm-blend-modes
 * @param {Image} srcImage
 * @param {Integer} x the x position to blit the image
 * @param {Integer} y the y position to blit the image
 */
export default function(srcImage, x = 1, y = 1) {
	x = Math.round(x);
	y = Math.round(y);
	
	const {data} = this;
	const srcData = srcImage.data;
	
	srcImage._scan((idx, sx, sy) => {
		const dstIdx = this._getPixelIndex(x + sx, y + sy);
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
	});
	
	return this;
};