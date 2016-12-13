/**
 * crops the image at a given point to a give size FIXME not working
 * note that the numbers can be negative, as long as they cover a range on the canvas
 * @param {Integer} x1 start coordinate x
 * @param {Integer} y1 start coordinate y
 * @param {Integer} x2 end coordinate x
 * @param {Integer} y2 end coordinate y
 */
export default function(x1, y1, x2, y2) {
	const range = this._getRange(x1, y1, x2, y2);
	
	if (!range) { // cropped nothing
		return this;
	}
	
	[x1, y1, x2, y2] = range;
	if (x1 === 1 && y1 == 1 && x2 === this.width && y2 === this.height) { // cropped everything
		return this;
	}
	
	const {data} = this;
	const w = x2 - x1 + 1;
	const h = y2 - y1 + 1;
	const buffer = new Buffer(w * h * 4);
	
	let offset = 0;
	
	this._scan(idx => {
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), offset, true);
		offset += 4;
	}, x1, y1, x2, y2);
	
	this._bitmap.data = new Buffer(buffer);
	this._bitmap.width = w;
	this._bitmap.height = h;
	
	return this;
};