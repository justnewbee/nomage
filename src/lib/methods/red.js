/**
 * adjust red chanel
 * @param {Integer} amount [-255, 255]
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(amount, x1, y1, x2, y2) {
	let {data} = this;
	
	return this._scan(idx => {
		data[idx] = Math.max(0, Math.min(data[idx] + amount, 255));
	}, x1, y1, x2, y2);
};