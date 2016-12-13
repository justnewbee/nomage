import {bitShiftL} from "../util";

/**
 * flip the image horizontally
 * @param {Boolean} [horizontal = true]
 * @param {Boolean} [vertical = false]
 */
export default function(horizontal = true, vertical = false) {
	const {data, width, height} = this;
	const buffer = new Buffer(data.length);
	
	this._scan((idx, x, y) => {
		const xFlipped = horizontal ? width - 1 - x : x;
		const yFlipped = vertical ? height - 1 - y : y;
		const idxFlipped = bitShiftL(width * yFlipped + xFlipped, 2);
		
		buffer.writeUInt32BE(data.readUInt32BE(idx, true), idxFlipped, true);
	});
	
	this._bitmap.data = new Buffer(buffer);
	
	return this;
};