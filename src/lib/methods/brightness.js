/**
 * adjusts the brightness of the image
 * you can give an optional range
 * @param {Number} [amount=0] adjust between [-1, 1]
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(amount = 0, x1, y1, x2, y2) {
	if (amount === 0 || amount < -1 || amount > +1) {
		return this;
	}
	
	const {data} = this;
	
	return this._scan(idx => {
		if (amount < 0) {
			data[idx] = data[idx] * (1 + amount);
			data[idx + 1] = data[idx + 1] * (1 + amount);
			data[idx + 2] = data[idx + 2] * (1 + amount);
		} else {
			data[idx] = data[idx] + (255 - data[idx]) * amount;
			data[idx + 1] = data[idx + 1] + (255 - data[idx + 1]) * amount;
			data[idx + 2] = data[idx + 2] + (255 - data[idx + 2]) * amount;
		}
	}, x1, y1, x2, y2);
}