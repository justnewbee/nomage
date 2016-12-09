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
	
	let {width, height, data} = this;
	let rs = Math.ceil(r * 2.57); // significant radius
	
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			let red = 0;
			let green = 0;
			let blue = 0;
			let alpha = 0;
			let wsum = 0;
			
			for (let iy = y - rs; iy < y + rs + 1; iy++) {
				for (let ix = x - rs; ix < x + rs + 1; ix++) {
					let x1 = Math.min(width - 1, Math.max(0, ix));
					let y1 = Math.min(height - 1, Math.max(0, iy));
					let dsq = (ix - x) * (ix - x) + (iy - y) * (iy - y);
					let wght = Math.exp(-dsq / (2 * r * r)) / (Math.PI * 2 * r * r);
					let idx = bitShiftL(y1 * width + x1, 2);
					
					red += data[idx] * wght;
					green += data[idx + 1] * wght;
					blue += data[idx + 2] * wght;
					alpha += data[idx + 3] * wght;
					wsum += wght;
				}
				
				let idx = bitShiftL(y * width + x, 2);
				
				data[idx] = Math.round(red / wsum);
				data[idx + 1] = Math.round(green / wsum);
				data[idx + 2] = Math.round(blue / wsum);
				data[idx + 3] = Math.round(alpha / wsum);
			}
		}
	}
	
	return this;
};