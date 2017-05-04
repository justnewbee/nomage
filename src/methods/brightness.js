/**
 * adjusts the brightness of the image
 * you can give an optional range
 * @param {Number} [amount=0] adjust between [-1, 1]
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(amount = 0, x1, y1, x2, y2) {
	if (amount === 0 || amount < -1 || amount > +1) {
		return this;
	}
	
	const {data} = this;
	const multiplier = amount > 0 ? 1 - amount : 1 + amount;
	const adjustment = amount > 0 ? 255 * amount : 0;
	
	return this._scan(idx => {
		data[idx] = data[idx] * multiplier + adjustment;
		data[idx + 1] = data[idx + 1] * multiplier + adjustment;
		data[idx + 2] = data[idx + 2] * multiplier + adjustment;
	}, x1, y1, x2, y2);
}