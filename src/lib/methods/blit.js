/**
 * blits a source image on to this image
 * @param {Image} srcImg
 * @param {Integer} x the x position to blit the image
 * @param {Integer} y the y position to blit the image
 * @param {Integer} srcX (optional) the x position from which to crop the source image
 * @param {Integer} srcY (optional) the y position from which to crop the source image
 * @param {Integer} srcW (optional) the width to which to crop the source image
 * @param {Integer} srcH (optional) the height to which to crop the source image
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
		
		data[dstIdx] = srcData[idx];
		data[dstIdx + 1] = srcData[idx + 1];
		data[dstIdx + 2] = srcData[idx + 2];
		data[dstIdx + 3] = srcData[idx + 3];
	}, srcX, srcY, srcW, srcH);
	
	return this;
};