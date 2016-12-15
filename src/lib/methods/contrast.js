/**
 * adjusts the contrast of the image
 * you can give an optional range
 * @param {Number} [amount=0] adjust between[-1, +1]
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
	
	function adjust(n) {
		let x;
		
		if (amount < 0) {
			x = n > 127 ? 1 - n / 255 : n / 255;
			if (x < 0) {
				x = 0;
			}
			x = 0.5 * Math.pow(x * 2, 1 + amount);
			return n > 127 ? (1.0 - x) * 255 : x * 255;
		}
		
		x = n > 127 ? 1 - n / 255 : n / 255;
		if (x < 0) {
			x = 0;
		}
		x = 0.5 * Math.pow(2 * x, amount === 1 ? 127 : 1 / (1 - amount));
		return n > 127 ? (1 - x) * 255 : x * 255;
	}
	
	return this._scan(idx => {
		data[idx] = adjust(data[idx]);
		data[idx + 1] = adjust(data[idx + 1]);
		data[idx + 2] = adjust(data[idx + 2]);
	}, x1, y1, x2, y2);
}