/**
 * flip the image horizontally
 * @param {Boolean} [horizontal = true]
 * @param {Boolean} [vertical = false]
 */
export default function(horizontal = true, vertical = false) {
	const {data} = this;
	const buffer = new Buffer(data.length);
	
	let scanMode = "none";
	if (horizontal && vertical) {
		scanMode = "BT-RL";
	} else if (horizontal) {
		scanMode = "TB-RL";
	} else if (vertical) {
		scanMode = "BT-LR";
	} else {
		return;
	}
	
	let loopIndex = 0;
	
	this._scan(scanMode, idx => {
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), loopIndex++ * 4, true);
	});
	
	this._bitmap.data = new Buffer(buffer);
	
	return this;
}