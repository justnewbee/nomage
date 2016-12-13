/**
 * masks a source image on to this image using average pixel color.
 * a completely black pixel on the mask will turn a pixel in the image completely transparent.
 * @param {Image} srcImg
 * @param {Integer} x the x position to blit the image
 * @param {Integer} y the y position to blit the image
 */
export default function(srcImg, x, y) {
	x = Math.round(x);
	y = Math.round(y);
	
	let {data} = this;
	let srcData = srcImg.data;
	
	srcImg._scan((idx, sx, sy) => {
		let dstIdx = this._getPixelIndex(x + sx, y + sy);
		let avg = (srcData[idx + 0] + srcData[idx + 1] + srcData[idx + 2]) / 3;
		
		data[dstIdx + 3] *= avg / 255;
	});
	
	return this;
};