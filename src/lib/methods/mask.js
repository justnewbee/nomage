/**
 * masks a source image on to this image using average pixel color.
 * a completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param {Image} srcImg
 * @param {Integer} [x=1] the x position to mask
 * @param {Integer} [y=1] the y position to mask
 * @param {Integer} [srcX=1] the x position from which to mask
 * @param {Integer} [srcY=1] the y position from which to mask
 * @param {Integer} [srcW] the width to which to mask
 * @param {Integer} [srcH] the height to which to mask
 */
export default function(srcImg, x = 1, y = 1, srcX = 1, srcY = 1, srcW = srcImg.width, srcH = srcImg.height) {
	x = Math.round(x);
	y = Math.round(y);
	
	const {data} = this;
	const srcData = srcImg.data;
	
	srcImg._scan((idx, sx, sy) => {
		const dstIdx = this._getPixelIndex(x + sx - srcX, y + sy - srcY);
		const avg = (srcData[idx] + srcData[idx + 1] + srcData[idx + 2]) / 3;
		
		data[dstIdx + 3] *= avg / 255;
	}, srcX, srcY, srcW, srcH);
	
	return this;
};