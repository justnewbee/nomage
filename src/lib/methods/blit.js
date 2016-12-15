/**
 * blits a source image on to this image
 * @param {Image} srcImg
 * @param {Integer} [x=1] the x position to blit
 * @param {Integer} [y=1] the y position to blit
 * @param {Integer} [srcX=1] the x position from which to blit
 * @param {Integer} [srcY=1] the y position from which to blit
 * @param {Integer} [srcW] the width to which to blit
 * @param {Integer} [srcH] the height to which to blit
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
}