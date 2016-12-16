/**
 * blits a source image on to this image
 * @param {Image} srcImg
 * @param {Integer} [x=1] the x position to blit
 * @param {Integer} [y=1] the y position to blit
 * @param {Integer} [srcX1=1] the x position from which to blit
 * @param {Integer} [srcY1=1] the y position from which to blit
 * @param {Integer} [srcX2] the width to which to blit
 * @param {Integer} [srcY2] the height to which to blit
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
		
		data[dstIdx] = srcData[idx];
		data[dstIdx + 1] = srcData[idx + 1];
		data[dstIdx + 2] = srcData[idx + 2];
		data[dstIdx + 3] = srcData[idx + 3];
	}, srcX1, srcY1, srcX2, srcY2);
	
	return this;
}