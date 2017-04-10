/**
 * adjust red chanel
 * @param {int} amount [-255, 255]
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(amount, x1, y1, x2, y2) {
	const {data} = this;
	
	return this._scan(idx => {
		data[idx] = Math.max(0, Math.min(data[idx] + amount, 255));
	}, x1, y1, x2, y2);
}