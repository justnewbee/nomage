import {bitShiftL, bitAnd} from "../util";

const DITHER_RGB565_MATRIX = [
	1, 9, 3, 11,
	13, 5, 15, 7,
	4, 12, 2, 10,
	16, 8, 14, 6
];

/**
 * apply a ordered dithering effect
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(x1, y1, x2, y2) {
	const {data} = this;
	
	return this._scan((idx, x, y) => {
		const dither = DITHER_RGB565_MATRIX[bitShiftL(bitAnd(y, 3), 2) + x % 4];
		
		data[idx] = Math.min(data[idx] + dither, 0xff);
		data[idx + 1] = Math.min(data[idx + 1] + dither, 0xff);
		data[idx + 2] = Math.min(data[idx + 2] + dither, 0xff);
	}, x1, y1, x2, y2);
}