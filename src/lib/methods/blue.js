/**
 * adjust blue chanel
 * @param {Number} amount [-255, 255]
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(amount, x1, y1, x2, y2) {
	const {data} = this;
	
	return this._scan(idx => {
		data[idx + 2] = Math.max(0, Math.min(data[idx + 2] + amount, 255));
	}, x1, y1, x2, y2);
}