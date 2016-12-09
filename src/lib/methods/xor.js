import {getRGB} from "../util";

/**
 * perform XOR on each color
 * you can give an optional range
 * @param {String|Array} color
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(color, x1, y1, x2, y2) {
	let {data} = this;
	let [r2, g2, b2] = getRGB(color);
	
	return this._scan(idx => {
		let r = data[idx];
		let g = data[idx + 1];
		let b = data[idx + 2];
		
		data[idx] = r ^ r2;
		data[idx + 1] = g ^ g2;
		data[idx + 2] = b ^ b2;
	}, x1, y1, x2, y2);
};