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
		this.parseHeader();
		this.parseBGR();
	}
	
	parseHeader() {
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
			var len = this.colors === 0 ? 1 << this.bitPP : this.colors;
			this.palette = new Array(len);
			for (var i = 0; i < len; i++) {
				var blue = this.buffer.readUInt8(this.pos++);
				var green = this.buffer.readUInt8(this.pos++);
				var red = this.buffer.readUInt8(this.pos++);
				var quad = this.buffer.readUInt8(this.pos++);
				this.palette[i] = {
					red: red,
					green: green,
					blue: blue,
					quad: quad
				};
			}
		}
	}
	
	parseBGR() {
		this.pos = this.offset;
		try {
			var bitN = "bit" + this.bitPP;
			var len = this.width * this.height * 4;
			this.data = new Buffer(len);
			
			this[bitN]();
		} catch (ex) {
			console.log("bit decode error: " + ex);
		}
		
	}
	
	bit1() {
		var xlen = Math.ceil(this.width / 8);
		var mode = xlen % 4;
		
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < xlen; x++) {
				var b = this.buffer.readUInt8(this.pos++);
				var location = y * this.width * 4 + x * 8 * 4;
				for (var i = 0; i < 8; i++) {
					if (x * 8 + i < this.width) {
						var rgb = this.palette[b >> (7 - i) & 0x1];
						this.data[location + i * 4] = rgb.blue;
						this.data[location + i * 4 + 1] = rgb.green;
						this.data[location + i * 4 + 2] = rgb.red;
						this.data[location + i * 4 + 3] = 0xFF;
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
		var xlen = Math.ceil(this.width / 2);
		var mode = xlen % 4;
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < xlen; x++) {
				var b = this.buffer.readUInt8(this.pos++);
				var location = y * this.width * 4 + x * 2 * 4;
				
				var before = b >> 4;
				var after = b & 0x0F;
				
				var rgb = this.palette[before];
				this.data[location] = rgb.blue;
				this.data[location + 1] = rgb.green;
				this.data[location + 2] = rgb.red;
				this.data[location + 3] = 0xFF;
				
				if (x * 2 + 1 >= this.width) {
					break;
				}
				
				rgb = this.palette[after];
				this.data[location + 4] = rgb.blue;
				this.data[location + 4 + 1] = rgb.green;
				this.data[location + 4 + 2] = rgb.red;
				this.data[location + 4 + 3] = 0xFF;
			}
			
			if (mode != 0) {
				this.pos += 4 - mode;
			}
		}
	}
	
	bit8() {
		var mode = this.width % 4;
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < this.width; x++) {
				var b = this.buffer.readUInt8(this.pos++);
				var location = y * this.width * 4 + x * 4;
				if (b < this.palette.length) {
					var rgb = this.palette[b];
					this.data[location] = rgb.blue;
					this.data[location + 1] = rgb.green;
					this.data[location + 2] = rgb.red;
					this.data[location + 3] = 0xFF;
				} else {
					this.data[location] = 0xFF;
					this.data[location + 1] = 0xFF;
					this.data[location + 2] = 0xFF;
					this.data[location + 3] = 0xFF;
				}
			}
			if (mode != 0) {
				this.pos += 4 - mode;
			}
		}
	}
	
	bit15() {
		var dif_w = this.width % 3;
		var _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < this.width; x++) {
				var B = this.buffer.readUInt16LE(this.pos);
				this.pos += 2;
				var blue = (B & _1_5) / _1_5 * 255 | 0;
				var green = (B >> 5 & _1_5 ) / _1_5 * 255 | 0;
				var red = (B >> 10 & _1_5) / _1_5 * 255 | 0;
				var alpha = B >> 15 ? 0xFF : 0x00;
				
				var location = y * this.width * 4 + x * 4;
				this.data[location] = red;
				this.data[location + 1] = green;
				this.data[location + 2] = blue;
				this.data[location + 3] = alpha;
			}
			
			this.pos += dif_w;
		}
	}
	
	bit16() {
		let dif_w = this.width % 3;
		let _11111 = parseInt("11111", 2);
		let _1_5 = _11111;
		let _111111 = parseInt("111111", 2);
		let _1_6 = _111111;
		
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < this.width; x++) {
				var B = this.buffer.readUInt16LE(this.pos);
				this.pos += 2;
				var alpha = 0xFF;
				var blue = (B & _1_5) / _1_5 * 255 | 0;
				var green = (B >> 5 & _1_6 ) / _1_6 * 255 | 0;
				var red = (B >> 11) / _1_5 * 255 | 0;
				
				var location = y * this.width * 4 + x * 4;
				this.data[location] = red;
				this.data[location + 1] = green;
				this.data[location + 2] = blue;
				this.data[location + 3] = alpha;
			}
			
			this.pos += dif_w;
		}
	}
	
	bit24() {
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < this.width; x++) {
				var blue = this.buffer.readUInt8(this.pos++);
				var green = this.buffer.readUInt8(this.pos++);
				var red = this.buffer.readUInt8(this.pos++);
				var location = y * this.width * 4 + x * 4;
				this.data[location] = red;
				this.data[location + 1] = green;
				this.data[location + 2] = blue;
				this.data[location + 3] = 0xFF;
			}
			
			this.pos += this.width % 4;
		}
		
	}
	
	bit32() {
		for (var y = this.height - 1; y >= 0; y--) {
			for (var x = 0; x < this.width; x++) {
				var blue = this.buffer.readUInt8(this.pos++);
				var green = this.buffer.readUInt8(this.pos++);
				var red = this.buffer.readUInt8(this.pos++);
				var alpha = this.buffer.readUInt8(this.pos++);
				var location = y * this.width * 4 + x * 4;
				
				this.data[location] = red;
				this.data[location + 1] = green;
				this.data[location + 2] = blue;
				this.data[location + 3] = alpha;
			}
			
			this.pos += this.width % 4;
		}
		
	}
	
	getData() {
		return this.data;
	}
}

function decode(buffer) {
	var decoder = new BmpDecoder(buffer);
	
	return {
		data: decoder.getData(),
		width: decoder.width,
		height: decoder.height
	};
}

function parseHeader(buffer, withAlpha) {
	// 0-2 signature
	if (buffer.toString("utf-8", 0, 2) !== "BM") {
		return null;
	}
	
	let header = {
		// file header 0 - 13
		size: buffer.readUInt32LE(2), // 2-5
//		reserved1: buffer.readUInt16LE(6), // 6 - 7 <- useless
//		reserved2: buffer.readUInt16LE(6), // 8 - 9 <- useless
		offset: buffer.readUInt32LE(10), // 10 - 13
		// info header
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
	
	if (withAlpha && header.bitPP === 16) {
		header.bitPP = 15;
	}
	
	if (header.bitPP < 15) {
		let len = header.colors === 0 ? 1 << header.bitPP : header.colors;
		
		this.palette = new Array(len);
		for (var i = 0; i < len; i++) {
			var blue = buffer.readUInt8(this.pos++);
			var green = buffer.readUInt8(this.pos++);
			var red = buffer.readUInt8(this.pos++);
			var quad = buffer.readUInt8(this.pos++);
			this.palette[i] = {
				red: red,
				green: green,
				blue: blue,
				quad: quad
			};
		}
	}
	
	return header;
}

decode.fuck = buffer => {
	let header = parseHeader(buffer);
	console.info(header);
};

export default decode;
