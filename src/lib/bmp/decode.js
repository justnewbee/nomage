/**
 * Bmp format decoder, support 1bit 4bit 8bit 24bit bmp.
 * see https://en.wikipedia.org/wiki/BMP_file_format for detailed bmp structure
 */
function BmpDecoder(buffer, withAlpha) {
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

BmpDecoder.prototype.parseHeader = function() {
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
};

BmpDecoder.prototype.parseBGR = function() {
	this.pos = this.offset;
	try {
		var bitN = "bit" + this.bitPP;
		var len = this.width * this.height * 4;
		this.data = new Buffer(len);
		
		this[bitN]();
	} catch (ex) {
		console.log("bit decode error: " + ex);
	}
	
};

BmpDecoder.prototype.bit1 = function() {
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
};

BmpDecoder.prototype.bit4 = function() {
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
};

BmpDecoder.prototype.bit8 = function() {
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
};

BmpDecoder.prototype.bit15 = function() {
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
};

BmpDecoder.prototype.bit16 = function() {
	var dif_w = this.width % 3;
	var _11111 = parseInt("11111", 2);
	let _1_5 = _11111;
	var _111111 = parseInt("111111", 2);
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
};

BmpDecoder.prototype.bit24 = function() {
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
	
};

/**
 * add 32bit decode func
 * @author soubok
 */
BmpDecoder.prototype.bit32 = function() {
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
	
};

BmpDecoder.prototype.getData = function() {
	return this.data;
};

function decode(buffer) {
	var decoder = new BmpDecoder(buffer);
	
	return {
		data: decoder.getData(),
		width: decoder.width,
		height: decoder.height
	};
}

/*
 * BMP header
 * offset | size | purpose
 * 0 | 2 bytes | 「signature」 identify the BMP and DIB file is `\u0042\u004D` in hexadecimal, same as `BM` in ASCII, possible values:
 *                 `BM` – Windows 3.1x, 95, NT, ... etc.
 *                 `BA` – OS/2 struct bitmap array
 *                 `CI` – OS/2 struct color icon
 *                 `CP` – OS/2 const color pointer
 *                 `IC` – OS/2 struct icon
 *                 `PT` – OS/2 pointer
 * 2 | 4 bytes | 「fileSize」 file size in bytes
 * 6 | 2 bytes | 「reserved 1」 actual value depends on the application that creates the image
 * 8 | 2 bytes | 「reserved 2」 actual value depends on the application that creates the image
 * 10 | 4 bytes | 「offset」 i.e. starting address, of the byte where the bitmap image data (pixel array) can be found.
 */

function parseHeader(buffer, that) {
	// 0-2 signature
	if (buffer.toString("utf-8", 0, 2) !== "BM") {
		return null;
	}
	
	let header = {
		size: buffer.readUInt32LE(2), // 2-5
		reserved: buffer.readUInt32LE(6), // 6 - 9
		offset: buffer.readUInt32LE(10), // 10 - 13
		headerSize: buffer.readUInt32LE(14), // 14 - 17
		width: buffer.readUInt32LE(18), // 18 - 21
		height: buffer.readUInt32LE(22),
	};
	
//	pos += 4
//	height: buffer.readUInt32LE(pos),
//	pos += 4
//	planes: buffer.readUInt16LE(pos),
//	pos += 2
//	bitPP: buffer.readUInt16LE(pos),
//	pos += 2
//	compress: buffer.readUInt32LE(pos),
//	pos += 4
//	rawSize: buffer.readUInt32LE(pos),
//	pos += 4
//	hr: buffer.readUInt32LE(pos),
//	pos += 4
//	vr: buffer.readUInt32LE(pos),
//	pos += 4
//	colors: buffer.readUInt32LE(pos),
//	pos += 4
//	importantColors: buffer.readUInt32LE(pos),
//	pos += 4
//	
//	if (this.bitPP === 16 && this.withAlpha) {
//		this.bitPP = 15;
//	}
//	
//	if (this.bitPP < 15) {
//		var len = this.colors === 0 ? 1 << this.bitPP : this.colors;
//		this.palette = new Array(len);
//		for (var i = 0; i < len; i++) {
//			var blue = buffer.readUInt8(this.pos++);
//			var green = buffer.readUInt8(this.pos++);
//			var red = buffer.readUInt8(this.pos++);
//			var quad = buffer.readUInt8(this.pos++);
//			this.palette[i] = {
//				red: red,
//				green: green,
//				blue: blue,
//				quad: quad
//			};
//		}
//	}
	
	return header;
}

decode.fuck = buffer => {
	let header = parseHeader(buffer);
	console.info(header);
};

export default decode;
