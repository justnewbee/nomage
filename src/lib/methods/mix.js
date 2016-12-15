import {getRGB} from "../util";

/**
 * mix with another color
 * you can give an optional range
 * @param {Array|String|Color} color
 * @param {Number} [percentage=50] 1-100
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(color, percentage = 50, x1, y1, x2, y2) {
	const {data} = this;
	const [r2, g2, b2] = getRGB(color);
	const p = percentage / 100;
	
	return this._scan(idx => {
		const r = data[idx];
		const g = data[idx + 1];
		const b = data[idx + 2];
		
		data[idx] = (r2 - r) * p + r;
		data[idx + 1] = (g2 - g) * p + g;
		data[idx + 2] = (b2 - b) * p + b;
	}, x1, y1, x2, y2);
}