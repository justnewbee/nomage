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
	
	let {data} = this;
	let srcData = srcImage.data;
	
	srcImage._scan((idx, sx, sy) => {
		let dstIdx = this._getPixelIndex(x + sx, y + sy);
		
		let bgR = data[dstIdx + 0] / 255;
		let bgG = data[dstIdx + 1] / 255;
		let bgB = data[dstIdx + 2] / 255;
		let bgA = data[dstIdx + 3] / 255;
		let fgR = srcData[idx + 0] / 255;
		let fgG = srcData[idx + 1] / 255;
		let fgB = srcData[idx + 2] / 255;
		let fgA = srcData[idx + 3] / 255;
		
		let a = bgA + fgA - bgA * fgA;
		
		data[dstIdx] = (fgR * fgA + bgR * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 1] = (fgG * fgA + bgG * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 2] = (fgB * fgA + bgB * bgA * (1 - fgA)) / a * 255;
		data[dstIdx + 3] = a * 255;
	});
	
	return this;
};