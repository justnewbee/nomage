import {bitShiftL} from "../util";

/**
 * flip the image horizontally
 * @param {Boolean} [horizontal = true]
 * @param {Boolean} [vertical = false]
 */
export default function(horizontal = true, vertical = false) {
	let {data, width, height} = this;
	let buffer = new Buffer(data.length);
	
	this._scan((idx, x, y) => {
		let xFlipped = horizontal ? width - 1 - x : x;
		let yFlipped = vertical ? height - 1 - y : y;
		let idxFlipped = bitShiftL(width * yFlipped + xFlipped, 2);
		
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), idxFlipped, true);
	});
	
	this._bitmap.data = new Buffer(buffer);
	
	return this;
};