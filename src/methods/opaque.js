/**
 * set the alpha channel on every pixel to fully opaque
 * you can give an optional range
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(x1, y1, x2, y2) {
	const {data} = this;
	
	return this._scan(idx => {
		data[idx + 3] = 255;
	}, x1, y1, x2, y2);
}