/**
 * masks a source image on to this image using average pixel color.
 * a completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param {Image} srcImg
 * @param {int} [x=1] the x position to mask
 * @param {int} [y=1] the y position to mask
 * @param {int} [srcX1=1] the x position from which to mask
 * @param {int} [srcY1=1] the y position from which to mask
 * @param {int} [srcX2] the width to which to mask
 * @param {int} [srcY2] the height to which to mask
 */
export default function(srcImg, x = 1, y = 1, srcX1 = 1, srcY1 = 1, srcX2 = srcImg.width, srcY2 = srcImg.height) {
	x = Math.round(x);
	y = Math.round(y);
	
	const {data} = this;
	const srcData = srcImg.data;
	
	srcImg._scan((idx, sx, sy) => {
		const dstIdx = this._getPixelIndex(x + sx - srcX1, y + sy - srcY1);
		const avg = (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / 3;
		
		data[dstIdx + 3] *= avg / 255;
	}, srcX1, srcY1, srcX2, srcY2);
	
	return this;
}