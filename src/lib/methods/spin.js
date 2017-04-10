import tinyColor from "tinycolor2";

/**
 * WARN: slow as tinyColor is used on each pixel
 * spin the HSL color plate
 * @param {Number} amount [-360, 360]
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(amount = 0, x1, y1, x2, y2) {
	const {data} = this;
	
	if (amount % 360 === 0) {
		return this;
	}
	
	return this._scan(idx => {
		const {r, g, b} = tinyColor({
			r: data[idx],
			g: data[idx + 1],
			b: data[idx + 2]
		}).spin(amount).toRgb();
		
		data[idx] = r;
		data[idx + 1] = g;
		data[idx + 2] = b;
	}, x1, y1, x2, y2);
}