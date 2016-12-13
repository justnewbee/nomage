import {bitShiftL} from "../util";

/**
 * WARNING: VERY slow
 * applies a true Gaussian blur to the image
 * http://blog.ivank.net/fastest-gaussian-blur.html
 * @param {Number} r the pixel radius of the blur
 */
export default function(r) {
	if ("number" !== typeof r) {
		throw new Error("r must be a number");
	}
	if (r < 1) {
		throw new Error("r must be greater than 1");
	}
	
	const {width, height, data} = this;
	const rs = Math.ceil(r * 2.57); // significant radius
	
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let red = 0;
			let green = 0;
			let blue = 0;
			let alpha = 0;
			let wsum = 0;
			let idx;
			
			for (let iy = y - rs; iy < y + rs + 1; iy++) {
				for (let ix = x - rs; ix < x + rs + 1; ix++) {
					const x1 = Math.min(width - 1, Math.max(0, ix));
					const y1 = Math.min(height - 1, Math.max(0, iy));
					const dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
					const wght = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
					
					idx = bitShiftL(y1 * width + x1, 2);
					
					red += data[idx] * wght;
					green += data[idx + 1] * wght;
					blue += data[idx + 2] * wght;
					alpha += data[idx + 3] * wght;
					wsum += wght;
				}
				
				idx = bitShiftL(y * width + x, 2);
				
				data[idx] = Math.round(red / wsum);
				data[idx + 1] = Math.round(green / wsum);
				data[idx + 2] = Math.round(blue / wsum);
				data[idx + 3] = Math.round(alpha / wsum);
			}
		}
	}
	
	return this;
};