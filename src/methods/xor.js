import {getRGB} from "../util/bit";

/**
 * perform XOR on each color
 * you can give an optional range
 * @param {String|Array} color
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(color, x1, y1, x2, y2) {
	const {data} = this;
	const [r2, g2, b2] = getRGB(color);
	
	return this._scan(idx => {
		const r = data[idx];
		const g = data[idx + 1];
		const b = data[idx + 2];
		
		data[idx] = r ^ r2;
		data[idx + 1] = g ^ g2;
		data[idx + 2] = b ^ b2;
	}, x1, y1, x2, y2);
}