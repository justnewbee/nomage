/**
 * Bmp format decoder, support 1bit 4bit 8bit 24bit bmp.
 */
class BmpDecoder {
	constructor(buffer, withAlpha) {
		this.pos = 0;
		this.buffer = buffer;
		this.withAlpha = !!withAlpha;
		
		this.flag = this.buffer.toString("utf-8", 0, 2);
		if (this.flag != "BM") {
			throw new Error("Invalid BMP File");
		}
		
//		this.parseHeader();
		this.pos += 2;
		this.fileSize = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.reserved = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.offset = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.headerSize = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.width = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.height = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.planes = this.buffer.readUInt16LE(this.pos);
		this.pos += 2;
		this.bitPP = this.buffer.readUInt16LE(this.pos);
		this.pos += 2;
		this.compress = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.rawSize = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.hr = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.vr = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.colors = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		this.importantColors = this.buffer.readUInt32LE(this.pos);
		this.pos += 4;
		
		if (this.bitPP === 16 && this.withAlpha) {
			this.bitPP = 15;
		}
		
		if (this.bitPP < 15) {
			let len = this.colors === 0 ? 1 << this.bitPP : this.colors;
			this.palette = new Array(len);
			for (let i = 0; i < len; i++) {
				let blue = this.buffer.readUInt8(this.pos++);
				let green = this.buffer.readUInt8(this.pos++);
				let red = this.buffer.readUInt8(this.pos++);
				let quad = this.buffer.readUInt8(this.pos++);
				
				this.palette[i] = {
					red: red,
					green: green,
					blue: blue,
					quad: quad
				};
			}
		}
//		this.parseHeader();
		
//		this.parseBGR();
		this.pos = this.offset;
		this.data = new Buffer(this.width * this.height * 4);
		
		try {
			this["bit" + this.bitPP]();
		} catch (ex) {
			console.log("bit decode error: " + ex);
		}
//		this.parseBGR();
	}
	
	bit1() {
		const {data, buffer, palette, width, height} = this;
		let xlen = Math.ceil(width / 8);
		let mode = xlen % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < xlen; x++) {
				let b = buffer.readUInt8(this.pos++);
				let location = y * width * 4 + x * 8 * 4;
				for (let i = 0; i < 8; i++) {
					if (x * 8 + i < width) {
						let rgb = palette[b >> (7 - i) & 0x1];
						
						data[location + i * 4] = rgb.blue;
						data[location + i * 4 + 1] = rgb.green;
						data[location + i * 4 + 2] = rgb.red;
						data[location + i * 4 + 3] = 0xFF;
					} else {
						break;
					}
				}
			}
			
			if (mode != 0) {
				this.pos += 4 - mode;
			}
		}
	}
	
	bit4() {
		const {data, buffer, palette, width, height} = this;
		let xlen = Math.ceil(width / 2);
		let mode = xlen % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < xlen; x++) {
				let b = buffer.readUInt8(this.pos++);
				let location = y * width * 4 + x * 2 * 4;
				let before = b >> 4;
				let after = b & 0x0F;
				let rgb = palette[before];
				
				data[location] = rgb.blue;
				data[location + 1] = rgb.green;
				data[location + 2] = rgb.red;
				data[location + 3] = 0xFF;
				
				if (x * 2 + 1 >= width) {
					break;
				}
				
				rgb = palette[after];
				data[location + 4] = rgb.blue;
				data[location + 4 + 1] = rgb.green;
				data[location + 4 + 2] = rgb.red;
				data[location + 4 + 3] = 0xFF;
			}
			
			if (mode != 0) {
				this.pos += 4 - mode;
			}
		}
	}
	
	bit8() {
		let {data, buffer, palette, width, height} = this;
		let mode = width % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let b = buffer.readUInt8(this.pos++);
				let location = y * width * 4 + x * 4;
				
				if (b < palette.length) {
					let rgb = palette[b];
					
					data[location] = rgb.blue;
					data[location + 1] = rgb.green;
					data[location + 2] = rgb.red;
					data[location + 3] = 0xFF;
				} else {
					data[location] = 0xFF;
					data[location + 1] = 0xFF;
					data[location + 2] = 0xFF;
					data[location + 3] = 0xFF;
				}
			}
			if (mode != 0) {
				this.pos += 4 - mode;
			}
		}
	}
	
	bit15() {
		const {data, buffer, width, height} = this;
		let dif_w = width % 3;
		let _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let B = buffer.readUInt16LE(this.pos);
				
				this.pos += 2;
				
				let blue = (B & _1_5) / _1_5 * 255 | 0;
				let green = (B >> 5 & _1_5 ) / _1_5 * 255 | 0;
				let red = (B >> 10 & _1_5) / _1_5 * 255 | 0;
				let alpha = B >> 15 ? 0xFF : 0x00;
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = alpha;
			}
			
			this.pos += dif_w;
		}
	}
	
	bit16() {
		const {data, buffer, width, height} = this;
		let dif_w = width % 3;
		let _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		let _111111 = parseInt("111111", 2);
		let _1_6 = _111111;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let B = buffer.readUInt16LE(this.pos);
				
				this.pos += 2;
				
				let alpha = 0xFF;
				let blue = (B & _1_5) / _1_5 * 255 | 0;
				let green = (B >> 5 & _1_6 ) / _1_6 * 255 | 0;
				let red = (B >> 11) / _1_5 * 255 | 0;
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = alpha;
			}
			
			this.pos += dif_w;
		}
	}
	
	bit24() {
		const {data, buffer, width, height} = this;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let blue = buffer.readUInt8(this.pos++);
				let green = buffer.readUInt8(this.pos++);
				let red = buffer.readUInt8(this.pos++);
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = 0xFF;
			}
			
			this.pos += width % 4;
		}
		
	}
	
	bit32() {
		const {data, buffer, width, height} = this;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let blue = buffer.readUInt8(this.pos++);
				let green = buffer.readUInt8(this.pos++);
				let red = buffer.readUInt8(this.pos++);
				let alpha = buffer.readUInt8(this.pos++);
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = alpha;
			}
			
			this.pos += width % 4;
		}
		
	}
}

function decode(buffer) {
	let decoder = new BmpDecoder(buffer);
	
	return {
		data: decoder.data,
		width: decoder.width,
		height: decoder.height
	};
}

export default decode;
