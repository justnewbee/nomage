/**
 * apply a posterize effect
 * @param {Number} [amount=2] adjust over 2
 * @param {Integer} [x1]
 * @param {Integer} [y1]
 * @param {Integer} [x2]
 * @param {Integer} [y2]
 */
export default function(amount = 2, x1, y1, x2, y2) {
	if (amount < 2) { // minimize 2 levels
		amount = 2;
	}
	
	let {data} = this;
	
	return this._scan(idx => {
		data[idx] = Math.floor(data[idx] / 255 * (amount - 1)) / (amount - 1) * 255;
		data[idx + 1] = Math.floor(data[idx + 1] / 255 * (amount - 1)) / (amount - 1) * 255;
		data[idx + 2] = Math.floor(data[idx + 2] / 255 * (amount - 1)) / (amount - 1) * 255;
	}, x1, y1, x2, y2);
};