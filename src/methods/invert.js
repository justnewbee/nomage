/**
 * invert color
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(x1, y1, x2, y2) {
	const {data} = this;
	
	return this._scan(idx => {
		data[idx] = 255 - data[idx];
		data[idx + 1] = 255 - data[idx + 1];
		data[idx + 2] = 255 - data[idx + 2];
	}, x1, y1, x2, y2);
}