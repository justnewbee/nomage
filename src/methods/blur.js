import {bitShiftL, bitShiftRU} from "../util/bit";

const BLUR_MUL_TABLE = [
	1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39,
	137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81,
	151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153,
	73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177,
	171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231,
	224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79,
	155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115,
	113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175,
	43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67,
	33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213,
	105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43,
	85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145,
	143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61,
	121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207,
	205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179,
	178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5,
	79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137,
	17, 135, 134, 133, 66, 131, 65, 129, 1
];
const BLUR_SHG_TABLE = [
	0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17,
	17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20,
	20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22,
	21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22,
	21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23,
	21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24,
	24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24,
	20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24,
	24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25,
	25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25,
	25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25,
	25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18
];

/**
 * A fast blur algorithm that produces similar effect to a gaussian blur - but MUCH quicker
 * @param {Number} r the pixel radius of the blur
 */
export default function(r) {
	if ("number" != typeof r) {
		throw new Error("r must be a number");
	}
	if (r < 1) {
		throw new Error("r must be greater than 0");
	}
	
	const {data, width, height} = this;
	const wm = width - 1;
	const hm = height - 1;
	const rad1 = r + 1;
	const mulSum = BLUR_MUL_TABLE[r];
	const shgSum = BLUR_SHG_TABLE[r];
	const red = [];
	const green = [];
	const blue = [];
	const alpha = [];
	const vmin = [];
	const vmax = [];
	
	let sumR;
	let sumG;
	let sumB;
	let sumA;
	let x;
	let y;
	let i;
	let p;
	let p1;
	let p2;
	let yp;
	let yi;
	let yw;
	let pa;
	let iterations = 2;
	
	while (iterations-- > 0) {
		yw = yi = 0;
		
		for (y = 0; y < height; y++) {
			sumR = data[yw] * rad1;
			sumG = data[yw + 1] * rad1;
			sumB = data[yw + 2] * rad1;
			sumA = data[yw + 3] * rad1;
			
			for (i = 1; i <= r; i++) {
				p = yw + bitShiftL(i > wm ? wm : i, 2);
				sumR += data[p++];
				sumG += data[p++];
				sumB += data[p++];
				sumA += data[p];
			}
			
			for (x = 0; x < width; x++) {
				red[yi] = sumR;
				green[yi] = sumG;
				blue[yi] = sumB;
				alpha[yi] = sumA;
				
				if (y == 0) {
					vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
					vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
				}
				
				p1 = yw + vmin[x];
				p2 = yw + vmax[x];
				
				sumR += data[p1++] - data[p2++];
				sumG += data[p1++] - data[p2++];
				sumB += data[p1++] - data[p2++];
				sumA += data[p1] - data[p2];
				
				yi++;
			}
			yw += bitShiftL(width, 2);
		}
		
		for (x = 0; x < width; x++) {
			yp = x;
			sumR = red[yp] * rad1;
			sumG = green[yp] * rad1;
			sumB = blue[yp] * rad1;
			sumA = alpha[yp] * rad1;
			
			for (i = 1; i <= r; i++) {
				yp += i > hm ? 0 : width;
				sumR += red[yp];
				sumG += green[yp];
				sumB += blue[yp];
				sumA += alpha[yp];
			}
			
			yi = bitShiftL(x, 2);
			for (y = 0; y < height; y++) {
				data[yi + 3] = pa = bitShiftRU(sumA * mulSum, shgSum);
				if (pa > 255) { // normalise alpha
					data[yi + 3] = 255;
				}
				if (pa > 0) {
					pa = 255 / pa;
					data[yi] = bitShiftRU(sumR * mulSum, shgSum) * pa;
					data[yi + 1] = bitShiftRU(sumG * mulSum, shgSum) * pa;
					data[yi + 2] = bitShiftRU(sumB * mulSum, shgSum) * pa;
				} else {
					data[yi] = data[yi + 1] = data[yi + 2] = 0;
				}
				if (x == 0) {
					vmin[y] = ((p = y + rad1) < hm ? p : hm) * width;
					vmax[y] = (p = y - r) > 0 ? p * width : 0;
				}
				
				p1 = x + vmin[y];
				p2 = x + vmax[y];
				
				sumR += red[p1] - red[p2];
				sumG += green[p1] - green[p2];
				sumB += blue[p1] - blue[p2];
				sumA += alpha[p1] - alpha[p2];
				
				yi += bitShiftL(width, 2);
			}
		}
	}
	
	return this;
}