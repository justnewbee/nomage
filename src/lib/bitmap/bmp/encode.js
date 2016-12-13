import BMP from "./bmp";

/**
 * BMP format encoder, encode 24bit BMP
 * not support quality compression
 */
export default bitmap => {
	const {data, width, height} = bitmap;
	const extraBytes = width % 4;
	const rgbSize = height * (3 * width + extraBytes);
	const rowBytes = 3 * width + extraBytes;
	
	let buffer = new Buffer(BMP.DATA_OFFSET + rgbSize);
	// header
	buffer.write(BMP.FLAG, 0, 2);
	buffer.writeUInt32LE(BMP.DATA_OFFSET + rgbSize, 2);
	buffer.writeUInt32LE(0, 6);
	buffer.writeUInt32LE(BMP.DATA_OFFSET, 10);
	buffer.writeUInt32LE(BMP.INFO_SIZE, 14);
	buffer.writeUInt32LE(width, 18);
	buffer.writeUInt32LE(height, 22);
	buffer.writeUInt16LE(1, 26);
	buffer.writeUInt16LE(24, 28);
	buffer.writeUInt32LE(0, 30);
	buffer.writeUInt32LE(rgbSize, 34);
	buffer.writeUInt32LE(0, 38);
	buffer.writeUInt32LE(0, 42);
	buffer.writeUInt32LE(0, 46);
	buffer.writeUInt32LE(0, 50);
	
	let i = 0;
	// data
	for (let y = height - 1; y >= 0; y--) {
		for (let x = 0; x < width; x++) {
			let p = 54 + y * rowBytes + x * 3;
			buffer[p + 2] = data[i++]; // r
			buffer[p + 1] = data[i++]; // g
			buffer[p] = data[i++]; // b
			i++;
		}
		if (extraBytes > 0) {
			const fillOffset = 54 + y * rowBytes + width * 3;
			buffer.fill(0, fillOffset, fillOffset + extraBytes);
		}
	}
	
	return buffer;
};