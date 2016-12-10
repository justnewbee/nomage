import BMP from "./bmp";

/**
 * Bmp format decoder, support 1bit 4bit 8bit 24bit bmp.
 */
class BmpDecoder {
	constructor(buffer, withAlpha) {
		this.buffer = buffer;
		
		this.flag = buffer.toString("utf-8", 0, 2);
		if (this.flag != "BM") {
			throw new Error("Invalid BMP File");
		}
		
//		this.parseHeader();
		let header = {
			// file header 0 - 13
			size: buffer.readUInt32LE(2), // 2-5
	//		reserved1: buffer.readUInt16LE(6), // 6 - 7 <- useless
	//		reserved2: buffer.readUInt16LE(6), // 8 - 9 <- useless
			offset: buffer.readUInt32LE(10), // 10 - 13
			headerSize: buffer.readUInt32LE(14), // 14 - 17
			width: buffer.readUInt32LE(18), // 18 - 21
			height: buffer.readUInt32LE(22), // 22 - 25 <-- FIXME cannot get it right when the BMP is generated in mac...
			planes: buffer.readUInt16LE(26), // 26 - 27
			bitPP: buffer.readUInt16LE(28), // 30 - 31
			compress: buffer.readUInt32LE(32), // 32 - 35
			rawSize: buffer.readUInt32LE(36), // 36 - 39
			hr: buffer.readUInt32LE(40), // 40 - 43
			vr: buffer.readUInt32LE(44), // 44 - 47
			colors: buffer.readUInt32LE(48), // 48 - 51
			importantColors: buffer.readUInt32LE(52), // 52 - 55
		};
		
		let {width, height, bitPP} = header;
		
		this.width = width;
		this.height = height;
		
		let pos = BMP.DATA_OFFSET;
		
		if (bitPP === 16 && withAlpha) {
			bitPP = 15;
		}
		
		if (bitPP < 15) {
			let len = header.colors === 0 ? 1 << bitPP : header.colors;
			
			this.palette = new Array(len);
			
			for (let i = 0; i < len; i++) {
				let blue = buffer.readUInt8(pos++);
				let green = buffer.readUInt8(pos++);
				let red = buffer.readUInt8(pos++);
				let quad = buffer.readUInt8(pos++);
				
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
		this.data = new Buffer(width * height * 4);
		
		try {
			this["bit" + bitPP](header.offset);
		} catch (ex) {
			console.log("bit decode error: " + ex);
		}
//		this.parseBGR();
	}
	
	bit1(pos) {
		const {data, buffer, palette, width, height} = this;
		let xlen = Math.ceil(width / 8);
		let mode = xlen % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < xlen; x++) {
				let b = buffer.readUInt8(pos++);
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
				pos += 4 - mode;
			}
		}
	}
	
	bit4(pos) {
		const {data, buffer, palette, width, height} = this;
		let xlen = Math.ceil(width / 2);
		let mode = xlen % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < xlen; x++) {
				let b = buffer.readUInt8(pos++);
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
				pos += 4 - mode;
			}
		}
	}
	
	bit8(pos) {
		let {data, buffer, palette, width, height} = this;
		let mode = width % 4;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let b = buffer.readUInt8(pos++);
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
				pos += 4 - mode;
			}
		}
	}
	
	bit15(pos) {
		const {data, buffer, width, height} = this;
		let dif_w = width % 3;
		let _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let B = buffer.readUInt16LE(pos);
				
				pos += 2;
				
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
			
			pos += dif_w;
		}
	}
	
	bit16(pos) {
		const {data, buffer, width, height} = this;
		let dif_w = width % 3;
		let _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		let _111111 = parseInt("111111", 2);
		let _1_6 = _111111;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let B = buffer.readUInt16LE(pos);
				
				pos += 2;
				
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
			
			pos += dif_w;
		}
	}
	
	bit24(pos) {
		const {data, buffer, width, height} = this;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let blue = buffer.readUInt8(pos++);
				let green = buffer.readUInt8(pos++);
				let red = buffer.readUInt8(pos++);
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = 0xFF;
			}
			
			pos += width % 4;
		}
		
	}
	
	bit32(pos) {
		const {data, buffer, width, height} = this;
		
		for (let y = height - 1; y >= 0; y--) {
			for (let x = 0; x < width; x++) {
				let blue = buffer.readUInt8(pos++);
				let green = buffer.readUInt8(pos++);
				let red = buffer.readUInt8(pos++);
				let alpha = buffer.readUInt8(pos++);
				let location = y * width * 4 + x * 4;
				
				data[location] = red;
				data[location + 1] = green;
				data[location + 2] = blue;
				data[location + 3] = alpha;
			}
			
			pos += width % 4;
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
