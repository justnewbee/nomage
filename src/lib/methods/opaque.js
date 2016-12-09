/**
 * set the alpha channel on every pixel to fully opaque
 * you can give an optional range
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(x1, y1, x2, y2) {
	let {data} = this;
	
	return this._scan(idx => {
		data[idx + 3] = 255;
	}, x1, y1, x2, y2);
};