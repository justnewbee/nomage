/*
 Copyright 2011 notmasteryet
 
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 
 http://www.apache.org/licenses/LICENSE-2.0
 
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)
import JPG from "./const";

const dctZigZag = new Int32Array([
	0,
	1, 8,
	16, 9, 2,
	3, 10, 17, 24,
	32, 25, 18, 11, 4,
	5, 12, 19, 26, 33, 40,
	48, 41, 34, 27, 20, 13, 6,
	7, 14, 21, 28, 35, 42, 49, 56,
	57, 50, 43, 36, 29, 22, 15,
	23, 30, 37, 44, 51, 58,
	59, 52, 45, 38, 31,
	39, 46, 53, 60,
	61, 54, 47,
	55, 62,
	63
]);
const dctCos1 = 4017; // cos(pi/16)
const dctSin1 = 799; // sin(pi/16)
const dctCos3 = 3406; // cos(3*pi/16)
const dctSin3 = 2276; // sin(3*pi/16)
const dctCos6 = 1567; // cos(6*pi/16)
const dctSin6 = 3784; // sin(6*pi/16)
const dctSqrt2 = 5793; // sqrt(2)
const dctSqrt1d2 = 2896; // sqrt(2) / 2

/**
 * 
 * @param {Object} o
 * @param {Function} fn
 */
function each(o, fn) {
	for (let k in o) {
		if (o.hasOwnProperty(k)) {
			fn(o[k], k);
		}
	}
}

function buildHuffmanTable(codeLengths, values) {
	var code = [];
	var length = 16;
	var i;
	var j;
	var k = 0;
	
	while (length > 0 && !codeLengths[length - 1]) {
		length--;
	}
	code.push({
		children: [],
		index: 0
	});
	
	var p = code[0];
	var q;
	
	for (i = 0; i < length; i++) {
		for (j = 0; j < codeLengths[i]; j++) {
			p = code.pop();
			p.children[p.index] = values[k];
			while (p.index > 0) {
				p = code.pop();
			}
			p.index++;
			code.push(p);
			while (code.length <= i) {
				code.push(q = {
					children: [],
					index: 0
				});
				p.children[p.index] = q.children;
				p = q;
			}
			k++;
		}
		if (i + 1 < length) {
			// p here points to last code
			code.push(q = {
				children: [],
				index: 0
			});
			p.children[p.index] = q.children;
			p = q;
		}
	}
	return code[0].children;
}

function decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, successivePrev, successive) {
	var mcusPerLine = frame.mcusPerLine;
	var progressive = frame.progressive;
	var startOffset = offset;
	var bitsData = 0;
	var bitsCount = 0;
	var eobrun = 0;
	var successiveACState = 0;
	var successiveACNextValue;
	var componentsLength = components.length;
	var component;
	var mcu = 0;
	var marker;
	var mcuExpected;
	var decodeFn;
	var i;
	var j;
	var k;
	var n;
	var h;
	var v;
	
	function readBit() {
		if (bitsCount > 0) {
			bitsCount--;
			return shiftR(bitsData, bitsCount) & 1;
		}
		bitsData = data[offset++];
		if (bitsData == 0xFF) {
			var nextByte = data[offset++];
			if (nextByte) {
				throw new Error(`unexpected marker: ${(shiftL(bitsData, 8) | nextByte).toString(16)}`);
			}
		}
		bitsCount = 7;
		return bitsData >>> 7;
	}
	
	function decodeHuffman(tree) {
		var node = tree;
		var bit;
		
		while ((bit = readBit()) !== null) {
			node = node[bit];
			if (typeof node === "number") {
				return node;
			}
			if (typeof node !== "object") {
				throw new Error("invalid huffman sequence");
			}
		}
		return null;
	}
	
	function receive(length) {
		var n = 0;
		while (length > 0) {
			var bit = readBit();
			if (bit === null) {
				return;
			}
			n = shiftL(n, 1) | bit;
			length--;
		}
		return n;
	}
	
	function receiveAndExtend(length) {
		var n = receive(length);
		if (n >= shiftL(1, length - 1)) {
			return n;
		}
		return n + shiftL(-1, length) + 1;
	}
	
	function decodeBaseline(component, zz) {
		var t = decodeHuffman(component.huffmanTableDC);
		var diff = t === 0 ? 0 : receiveAndExtend(t);
		
		zz[0] = (component.pred += diff);
		
		k = 1;
		while (k < 64) {
			var rs = decodeHuffman(component.huffmanTableAC);
			var s = rs & 15;
			var r = shiftR(rs, 4);
			
			if (s === 0) {
				if (r < 15) {
					break;
				}
				k += 16;
				continue;
			}
			k += r;
			
			zz[dctZigZag[k]] = receiveAndExtend(s);
			k++;
		}
	}
	
	function decodeDCFirst(component, zz) {
		var t = decodeHuffman(component.huffmanTableDC);
		var diff = t === 0 ? 0 : shiftL(receiveAndExtend(t), successive);
		
		zz[0] = (component.pred += diff);
	}
	
	function decodeDCSuccessive(component, zz) {
		zz[0] |= shiftL(readBit(), successive);
	}
	
	function decodeACFirst(component, zz) {
		if (eobrun > 0) {
			eobrun--;
			return;
		}
		k = spectralStart;
		
		var e = spectralEnd;
		
		while (k <= e) {
			var rs = decodeHuffman(component.huffmanTableAC);
			var s = rs & 15;
			var r = shiftR(rs, 4);
			
			if (s === 0) {
				if (r < 15) {
					eobrun = receive(r) + shiftL(1, r) - 1;
					break;
				}
				k += 16;
				continue;
			}
			k += r;
			var z = dctZigZag[k];
			zz[z] = receiveAndExtend(s) * shiftL(1, successive);
			k++;
		}
	}
	
	function decodeACSuccessive(component, zz) {
		k = spectralStart;
		var e = spectralEnd;
		
		while (k <= e) {
			var z = dctZigZag[k];
			
			switch (successiveACState) {
			case 0: // initial state
				var rs = decodeHuffman(component.huffmanTableAC);
				var s = rs & 15;
				var r = shiftR(rs, 4);
				
				if (s === 0) {
					if (r < 15) {
						eobrun = receive(r) + shiftL(1, r);
						successiveACState = 4;
					} else {
						r = 16;
						successiveACState = 1;
					}
				} else {
					if (s !== 1) {
						throw new Error("invalid ACn encoding");
					}
					successiveACNextValue = receiveAndExtend(s);
					successiveACState = r ? 2 : 3;
				}
				continue;
			case 1: // skipping r zero items
			case 2:
				if (zz[z]) {
					zz[z] += shiftL(readBit(), successive);
				} else {
					r--;
					if (r === 0) {
						successiveACState = successiveACState == 2 ? 3 : 0;
					}
				}
				break;
			case 3: // set value for a zero item
				if (zz[z]) {
					zz[z] += shiftL(readBit(), successive);
				} else {
					zz[z] = shiftL(successiveACNextValue, successive);
					successiveACState = 0;
				}
				break;
			case 4: // eob
				if (zz[z]) {
					zz[z] += shiftL(readBit(), successive);
				}
				break;
			}
			
			k++;
		}
		if (successiveACState === 4) {
			eobrun--;
			if (eobrun === 0) {
				successiveACState = 0;
			}
		}
	}
	
	function decodeMcu(component, decode, mcu, row, col) {
		var mcuRow = (mcu / mcusPerLine) | 0;
		var mcuCol = mcu % mcusPerLine;
		var blockRow = mcuRow * component.v + row;
		var blockCol = mcuCol * component.h + col;
		decode(component, component.blocks[blockRow][blockCol]);
	}
	
	function decodeBlock(component, decode, mcu) {
		var blockRow = (mcu / component.blocksPerLine) | 0;
		var blockCol = mcu % component.blocksPerLine;
		decode(component, component.blocks[blockRow][blockCol]);
	}
	
	if (progressive) {
		if (spectralStart === 0) {
			decodeFn = successivePrev === 0 ? decodeDCFirst : decodeDCSuccessive;
		} else {
			decodeFn = successivePrev === 0 ? decodeACFirst : decodeACSuccessive;
		}
	} else {
		decodeFn = decodeBaseline;
	}
	
	if (componentsLength === 1) {
		mcuExpected = components[0].blocksPerLine * components[0].blocksPerColumn;
	} else {
		mcuExpected = mcusPerLine * frame.mcusPerColumn;
	}
	if (!resetInterval) {
		resetInterval = mcuExpected;
	}
	
	while (mcu < mcuExpected) {
		// reset interval stuff
		for (i = 0; i < componentsLength; i++) {
			components[i].pred = 0;
		}
		eobrun = 0;
		
		if (componentsLength === 1) {
			component = components[0];
			for (n = 0; n < resetInterval; n++) {
				decodeBlock(component, decodeFn, mcu);
				mcu++;
			}
		} else {
			for (n = 0; n < resetInterval; n++) {
				for (i = 0; i < componentsLength; i++) {
					component = components[i];
					h = component.h;
					v = component.v;
					for (j = 0; j < v; j++) {
						for (k = 0; k < h; k++) {
							decodeMcu(component, decodeFn, mcu, j, k);
						}
					}
				}
				mcu++;
				
				// If we've reached our expected MCU's, stop decoding
				if (mcu === mcuExpected) {
					break;
				}
			}
		}
		
		// find marker
		bitsCount = 0;
		marker = shiftL(data[offset], 8) | data[offset + 1];
		if (marker < 0xFF00) {
			throw new Error("marker was not found");
		}
		
		if (marker >= 0xFFD0 && marker <= 0xFFD7) { // RSTx
			offset += 2;
		} else {
			break;
		}
	}
	
	return offset - startOffset;
}

function buildComponentData(frame, component) {
	var lines = [];
	var blocksPerLine = component.blocksPerLine;
	var blocksPerColumn = component.blocksPerColumn;
	var samplesPerLine = shiftL(blocksPerLine, 3);
	var R = new Int32Array(64);
	var r = new Uint8Array(64);
	var i;
	var j;
	
	// A port of poppler's IDCT method which in turn is taken from:
	//   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
	//   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
	//   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
	//   988-991.
	function quantizeAndInverse(zz, dataOut, dataIn) {
		var qt = component.quantizationTable;
		var v0;
		var v1;
		var v2;
		var v3;
		var v4;
		var v5;
		var v6;
		var v7;
		var t;
		var p = dataIn;
		
		// dequant
		for (i = 0; i < 64; i++) {
			p[i] = zz[i] * qt[i];
		}
		
		// inverse DCT on rows
		for (i = 0; i < 8; ++i) {
			var row = 8 * i;
			
			// check for all-zero AC coefficients
			if (p[row + 1] == 0 && p[row + 2] == 0 && p[row + 3] == 0 && p[row + 4] == 0 && p[row + 5] == 0 && p[row + 6] == 0 && p[row + 7] == 0) {
				t = shiftR(dctSqrt2 * p[row] + 512, 10);
				p[row] = t;
				p[row + 1] = t;
				p[row + 2] = t;
				p[row + 3] = t;
				p[row + 4] = t;
				p[row + 5] = t;
				p[row + 6] = t;
				p[row + 7] = t;
				continue;
			}
			
			// stage 4
			v0 = shiftR(dctSqrt2 * p[row] + 128, 8);
			v1 = shiftR(dctSqrt2 * p[row + 4] + 128, 8);
			v2 = p[row + 2];
			v3 = p[row + 6];
			v4 = shiftR(dctSqrt1d2 * (p[row + 1] - p[row + 7]) + 128, 8);
			v7 = shiftR(dctSqrt1d2 * (p[row + 1] + p[row + 7]) + 128, 8);
			v5 = shiftL(p[row + 3], 4);
			v6 = shiftL(p[row + 5], 4);
			
			// stage 3
			t = shiftR(v0 - v1 + 1, 1);
			v0 = shiftR(v0 + v1 + 1, 1);
			v1 = t;
			t = shiftR(v2 * dctSin6 + v3 * dctCos6 + 128, 8);
			v2 = shiftR(v2 * dctCos6 - v3 * dctSin6 + 128, 8);
			v3 = t;
			t = shiftR(v4 - v6 + 1, 1);
			v4 = shiftR(v4 + v6 + 1, 1);
			v6 = t;
			t = shiftR(v7 + v5 + 1, 1);
			v5 = shiftR(v7 - v5 + 1, 1);
			v7 = t;
			
			// stage 2
			t = shiftR(v0 - v3 + 1, 1);
			v0 = shiftR(v0 + v3 + 1, 1);
			v3 = t;
			t = shiftR(v1 - v2 + 1, 1);
			v1 = shiftR(v1 + v2 + 1, 1);
			v2 = t;
			t = shiftR(v4 * dctSin3 + v7 * dctCos3 + 2048, 12);
			v4 = shiftR(v4 * dctCos3 - v7 * dctSin3 + 2048, 12);
			v7 = t;
			t = shiftR(v5 * dctSin1 + v6 * dctCos1 + 2048, 12);
			v5 = shiftR(v5 * dctCos1 - v6 * dctSin1 + 2048, 12);
			v6 = t;
			
			// stage 1
			p[row] = v0 + v7;
			p[row + 7] = v0 - v7;
			p[row + 1] = v1 + v6;
			p[row + 6] = v1 - v6;
			p[row + 2] = v2 + v5;
			p[row + 5] = v2 - v5;
			p[row + 3] = v3 + v4;
			p[row + 4] = v3 - v4;
		}
		
		// inverse DCT on columns
		for (i = 0; i < 8; ++i) {
			var col = i;
			
			// check for all-zero AC coefficients
			if (p[col + 8] == 0 && p[col + 8 * 2] == 0 && p[col + 8 * 3] == 0 && p[col + 8 * 4] == 0 && p[col + 8 * 5] == 0 && p[col + 8 * 6] == 0 && p[col + 8 * 7] == 0) {
				t = shiftR(dctSqrt2 * dataIn[i] + 8192, 14);
				p[col] = t;
				p[col + 8] = t;
				p[col + 8 * 2] = t;
				p[col + 8 * 3] = t;
				p[col + 8 * 4] = t;
				p[col + 8 * 5] = t;
				p[col + 8 * 6] = t;
				p[col + 8 * 7] = t;
				continue;
			}
			
			// stage 4
			v0 = shiftR(dctSqrt2 * p[col] + 2048, 12);
			v1 = shiftR(dctSqrt2 * p[col + 8 * 4] + 2048, 12);
			v2 = p[col + 8 * 2];
			v3 = p[col + 8 * 6];
			v4 = shiftR(dctSqrt1d2 * (p[col + 8] - p[col + 8 * 7]) + 2048, 12);
			v7 = shiftR(dctSqrt1d2 * (p[col + 8] + p[col + 8 * 7]) + 2048, 12);
			v5 = p[col + 8 * 3];
			v6 = p[col + 8 * 5];
			
			// stage 3
			t = shiftR(v0 - v1 + 1, 1);
			v0 = shiftR(v0 + v1 + 1, 1);
			v1 = t;
			t = shiftR(v2 * dctSin6 + v3 * dctCos6 + 2048, 12);
			v2 = shiftR(v2 * dctCos6 - v3 * dctSin6 + 2048, 12);
			v3 = t;
			t = shiftR(v4 - v6 + 1, 1);
			v4 = shiftR(v4 + v6 + 1, 1);
			v6 = t;
			t = shiftR(v7 + v5 + 1, 1);
			v5 = shiftR(v7 - v5 + 1, 1);
			v7 = t;
			
			// stage 2
			t = shiftR(v0 - v3 + 1, 1);
			v0 = shiftR(v0 + v3 + 1, 1);
			v3 = t;
			t = shiftR(v1 - v2 + 1, 1);
			v1 = shiftR(v1 + v2 + 1, 1);
			v2 = t;
			t = shiftR(v4 * dctSin3 + v7 * dctCos3 + 2048, 12);
			v4 = shiftR(v4 * dctCos3 - v7 * dctSin3 + 2048, 12);
			v7 = t;
			t = shiftR(v5 * dctSin1 + v6 * dctCos1 + 2048, 12);
			v5 = shiftR(v5 * dctCos1 - v6 * dctSin1 + 2048, 12);
			v6 = t;
			
			// stage 1
			p[col] = v0 + v7;
			p[col + 8 * 7] = v0 - v7;
			p[col + 8] = v1 + v6;
			p[col + 8 * 6] = v1 - v6;
			p[col + 8 * 2] = v2 + v5;
			p[col + 8 * 5] = v2 - v5;
			p[col + 8 * 3] = v3 + v4;
			p[col + 8 * 4] = v3 - v4;
		}
		
		// convert to 8-bit integers
		for (i = 0; i < 64; ++i) {
			var sample = 128 + shiftR(p[i] + 8, 4);
			dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
		}
	}
	
	for (var blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
		var scanLine = shiftL(blockRow, 3);
		for (i = 0; i < 8; i++) {
			lines.push(new Uint8Array(samplesPerLine));
		}
		for (var blockCol = 0; blockCol < blocksPerLine; blockCol++) {
			quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);
			
			var offset = 0;
			var sample = shiftL(blockCol, 3);
			
			for (j = 0; j < 8; j++) {
				var line = lines[scanLine + j];
				for (i = 0; i < 8; i++) {
					line[sample + i] = r[offset++];
				}
			}
		}
	}
	
	return lines;
}

function clampTo8bit(a) {
	return a < 0 ? 0 : a > 255 ? 255 : a;
}

function prepareComponents(frame) {
	let maxH = 0;
	let maxV = 0;
	let i;
	let j;
	
	each(frame.components, v => {
		if (maxH < v.h) {
			maxH = v.h;
		}
		if (maxV < v.v) {
			maxV = v.v;
		}
	});
	
	var mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
	var mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
	
	each(frame.components, v => {
		let blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * v.h / maxH);
		let blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines / 8) * v.v / maxV);
		let blocksPerLineForMcu = mcusPerLine * v.h;
		let blocksPerColumnForMcu = mcusPerColumn * v.v;
		let blocks = [];
		
		for (i = 0; i < blocksPerColumnForMcu; i++) {
			var row = [];
			for (j = 0; j < blocksPerLineForMcu; j++) {
				row.push(new Int32Array(64));
			}
			blocks.push(row);
		}
		
		v.blocksPerLine = blocksPerLine;
		v.blocksPerColumn = blocksPerColumn;
		v.blocks = blocks;
	});
	
	frame.maxH = maxH;
	frame.maxV = maxV;
	frame.mcusPerLine = mcusPerLine;
	frame.mcusPerColumn = mcusPerColumn;
}

/**
 * bitwise left shift
 * @param {Integer} num
 * @param {Integer} n
 */
function shiftL(num, n) {
	return num << n;
}
/**
 * bitwise right shift
 * @param {Integer} num
 * @param {Integer} n
 * @return {Integer}
 */
function shiftR(num, n) {
	return num >> n;
}
/**
 * 从 Uint8Array 的 offset 开始读取两个字节
 * @param {Uint8Array} arrUInt8
 * @param {Integer} offset
 * @return {Integer}
 */
function getUInit16(arrUInt8, offset) {
	return shiftL(arrUInt8[offset], 8) | arrUInt8[offset + 1];
}
/**
 * 
 * @param {Uint8Array} arrUInt8
 * @param {Integer} offset
 * @return {Uint8Array}
 */
function getDataBlock(arrUInt8, offset) {
	let len = getUInit16(arrUInt8, offset);
	return arrUInt8.subarray(offset + 2, offset + len);
}

/**
 * 
 * @param {Uint8Array} arrAppData
 * @param {Integer} fileMarker
 */
function parseAppData(arrAppData, fileMarker) {
	if (fileMarker === JPG.APP0) {
		if (arrAppData[0] === 0x4A && arrAppData[1] === 0x46 && arrAppData[2] === 0x49 && arrAppData[3] === 0x46 && arrAppData[4] === 0) { // 'JFIF\x00'
			return ["JFIF", { // JPEG File Interchange Format - https://www.w3.org/Graphics/JPEG/jfif3.pdf
				version: {
					major: arrAppData[5],
					minor: arrAppData[6]
				},
				densityUnits: arrAppData[7],
				xDensity: shiftL(arrAppData[8], 8) | arrAppData[9],
				yDensity: shiftL(arrAppData[10], 8) | arrAppData[11],
				thumbWidth: arrAppData[12],
				thumbHeight: arrAppData[13],
				thumbData: arrAppData.subarray(14, 14 + 3 * arrAppData[12] * arrAppData[13])
			}];
		}
	}
	
	// TODO APP1 - Exif
	
	if (fileMarker === JPG.APP14) {
		if (arrAppData[0] === 0x41 && arrAppData[1] === 0x64 && arrAppData[2] === 0x6F && arrAppData[3] === 0x62 && arrAppData[4] === 0x65 && arrAppData[5] === 0) { // 'Adobe\x00'
			return ["ADOBE", {
				version: arrAppData[6],
				flags0: shiftL(arrAppData[7], 8) | arrAppData[8],
				flags1: shiftL(arrAppData[9], 8) | arrAppData[10],
				transformCode: arrAppData[11]
			}];
		}
	}
}

class JpegImage {
	constructor(buffer) {
		let data = new Uint8Array(buffer);
		
		let jfif = null;
		let adobe = null;
		var offset = 0;
		let frame;
		let resetInterval;
		let quantizationTables = [];
		let frames = [];
		let huffmanTablesAC = [];
		let huffmanTablesDC = [];
		let fileMarker;
		let i;
		let j;
		
		// if NOT assigned to a variable means skipping the data
		function readUInt16() {
			let value = shiftL(data[offset], 8) | data[offset + 1];
			
			offset += 2;
			return value;
		}
		function readDataBlock() {
			let length = readUInt16();
			let array = data.subarray(offset, offset + length - 2);
			
			offset += array.length;
			
			return array;
		}
		
		fileMarker = readUInt16();
		
		if (fileMarker !== JPG.SOI) {
			throw new Error("no SOI found");
		}
		
		fileMarker = readUInt16();
		
		while (fileMarker !== JPG.EOI) {
			switch (fileMarker) {
			case 0xFF00:
				break;
			case JPG.APP0:
			case JPG.APP1:
			case JPG.APP2:
			case JPG.APP3:
			case JPG.APP4:
			case JPG.APP5:
			case JPG.APP6:
			case JPG.APP7:
			case JPG.APP8:
			case JPG.APP9:
			case JPG.APP10:
			case JPG.APP11:
			case JPG.APP12:
			case JPG.APP13:
			case JPG.APP14:
			case JPG.APP15:
			case JPG.CMT:
				var appData = readDataBlock();
				
				if (fileMarker === JPG.APP0) {
					if (appData[0] === 0x4A && appData[1] === 0x46 && appData[2] === 0x49 && appData[3] === 0x46 && appData[4] === 0) { // 'JFIF\x00'
						jfif = {
							version: {
								major: appData[5],
								minor: appData[6]
							},
							densityUnits: appData[7],
							xDensity: shiftL(appData[8], 8) | appData[9],
							yDensity: shiftL(appData[10], 8) | appData[11],
							thumbWidth: appData[12],
							thumbHeight: appData[13],
							thumbData: appData.subarray(14, 14 + 3 * appData[12] * appData[13])
						};
					}
				}
				
				// TODO APP1 - Exif
				
				if (fileMarker === JPG.APP14) {
					if (appData[0] === 0x41 && appData[1] === 0x64 && appData[2] === 0x6F && appData[3] === 0x62 && appData[4] === 0x65 && appData[5] === 0) { // 'Adobe\x00'
						adobe = {
							version: appData[6],
							flags0: shiftL(appData[7], 8) | appData[8],
							flags1: shiftL(appData[9], 8) | appData[10],
							transformCode: appData[11]
						};
					}
				}
				break;
			case JPG.DQT:
				var quantizationTablesLength = readUInt16();
				var quantizationTablesEnd = quantizationTablesLength + offset - 2;
				
				while (offset < quantizationTablesEnd) {
					var quantizationTableSpec = data[offset++];
					var tableData = new Int32Array(64);
					if (shiftR(quantizationTableSpec, 4) === 0) { // 8 bit values
						for (j = 0; j < 64; j++) {
							tableData[dctZigZag[j]] = data[offset++];
						}
					} else if (shiftR(quantizationTableSpec, 4) === 1) { // 16 bit
						for (j = 0; j < 64; j++) {
							tableData[dctZigZag[j]] = readUInt16();
						}
					} else {
						throw new Error("DQT: invalid table spec");
					}
					quantizationTables[quantizationTableSpec & 15] = tableData;
				}
				break;
			case JPG.SOF0:
			case JPG.SOF1:
			case JPG.SOF2:
				readUInt16(); // skip data length
				
				frame = {
					extended: fileMarker === 0xFFC1,
					progressive: fileMarker === 0xFFC2,
					precision: data[offset++],
					scanLines: readUInt16(),
					samplesPerLine: readUInt16(),
					components: {},
					componentsOrder: []
				};
				
				var componentsCount = data[offset++];
				var componentId;
				
				for (i = 0; i < componentsCount; i++) {
					componentId = data[offset];
					var h = shiftR(data[offset + 1], 4);
					var v = data[offset + 1] & 15;
					var qId = data[offset + 2];
					frame.componentsOrder.push(componentId);
					frame.components[componentId] = {
						h: h,
						v: v,
						quantizationIdx: qId
					};
					offset += 3;
				}
				prepareComponents(frame);
				frames.push(frame);
				break;
			case JPG.DHT:
				var huffmanLength = readUInt16();
				for (i = 2; i < huffmanLength;) {
					var huffmanTableSpec = data[offset++];
					var codeLengths = new Uint8Array(16);
					var codeLengthSum = 0;
					for (j = 0; j < 16; j++, offset++) {
						codeLengthSum += (codeLengths[j] = data[offset]);
					}
					var huffmanValues = new Uint8Array(codeLengthSum);
					for (j = 0; j < codeLengthSum; j++, offset++) {
						huffmanValues[j] = data[offset];
					}
					i += 17 + codeLengthSum;
					
					(shiftR(huffmanTableSpec, 4) === 0 ? huffmanTablesDC : huffmanTablesAC)[huffmanTableSpec & 15] = buildHuffmanTable(codeLengths, huffmanValues);
				}
				break;
			case JPG.DRI:
				readUInt16();
				
				resetInterval = readUInt16();
				break;
			case JPG.SOS: // FIXME performance bottleneck here
				readUInt16();
				
				var selectorsCount = data[offset++];
				var components = [];
				var component;
				
				for (i = 0; i < selectorsCount; i++) {
					component = frame.components[data[offset++]];
					var tableSpec = data[offset++];
					component.huffmanTableDC = huffmanTablesDC[shiftR(tableSpec, 4)];
					component.huffmanTableAC = huffmanTablesAC[tableSpec & 15];
					components.push(component);
				}
				
				var spectralStart = data[offset++];
				var spectralEnd = data[offset++];
				var successiveApproximation = data[offset++];
				var processed = decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, shiftR(successiveApproximation, 4), successiveApproximation & 15);
				
				offset += processed;
				break;
			default:
				if (data[offset - 3] === 0xFF && data[offset - 2] >= 0xC0 && data[offset - 2] <= 0xFE) {
					// could be incorrect encoding -- last 0xFF byte of the previous block was eaten by the encoder
					offset -= 3;
					break;
				}
				
				throw new Error(`unknown JPEG marker ${fileMarker.toString(16)}`);
			}
			
			fileMarker = readUInt16();
		}
		
		if (frames.length !== 1) {
			throw new Error("only single frame JPEG is supported");
		}
		
		// set each frame's components quantization table
		for (i = 0; i < frames.length; i++) {
			var cp = frames[i].components;
			
			each(cp, v => {
				v.quantizationTable = quantizationTables[v.quantizationIdx];
				delete v.quantizationIdx;
			});
//			for (j in cp) {
//				cp[j].quantizationTable = quantizationTables[cp[j].quantizationIdx];
//				delete cp[j].quantizationIdx;
//			}
		}
		
		this.width = frame.samplesPerLine;
		this.height = frame.scanLines;
		this.jfif = jfif;
		this.adobe = adobe;
		this.components = [];
		
		for (i = 0; i < frame.componentsOrder.length; i++) {
			var component = frame.components[frame.componentsOrder[i]];
			this.components.push({
				lines: buildComponentData(frame, component),
				scaleX: component.h / frame.maxH,
				scaleY: component.v / frame.maxV
			});
		}
	}
	
	_getData(width, height) {
		let components = this.components;
		let scaleX = this.width / width;
		let scaleY = this.height / height;
		let data = new Uint8Array(width * height * components.length);
		let [component1, component2, component3, component4] = components;
		let component1Line;
		let component2Line;
		let component3Line;
		let component4Line;
		let x;
		let y;
		let offset = 0;
		let Y;
		let Cb;
		let Cr;
		let K;
		let C;
		let M;
		let Ye;
		let R;
		let G;
		let B;
		let colorTransform;
		
		switch (components.length) {
		case 1:
			for (y = 0; y < height; y++) {
				component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
				for (x = 0; x < width; x++) {
					Y = component1Line[0 | (x * component1.scaleX * scaleX)];
					
					data[offset++] = Y;
				}
			}
			break;
		case 2: // PDF might compress two component data in custom color space
			for (y = 0; y < height; y++) {
				component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
				component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
				for (x = 0; x < width; x++) {
					Y = component1Line[0 | (x * component1.scaleX * scaleX)];
					data[offset++] = Y;
					Y = component2Line[0 | (x * component2.scaleX * scaleX)];
					data[offset++] = Y;
				}
			}
			break;
		case 3: // the default transform for three components is true
			colorTransform = true;
			// The adobe transform marker overrides any previous setting
			if (this.adobe && this.adobe.transformCode) {
				colorTransform = true;
			} else if (typeof this.colorTransform !== "undefined") {
				colorTransform = !!this.colorTransform;
			}
			
			for (y = 0; y < height; y++) {
				component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
				component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
				component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
				for (x = 0; x < width; x++) {
					if (!colorTransform) {
						R = component1Line[0 | (x * component1.scaleX * scaleX)];
						G = component2Line[0 | (x * component2.scaleX * scaleX)];
						B = component3Line[0 | (x * component3.scaleX * scaleX)];
					} else {
						Y = component1Line[0 | (x * component1.scaleX * scaleX)];
						Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
						Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
						
						R = clampTo8bit(Y + 1.402 * (Cr - 128));
						G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
						B = clampTo8bit(Y + 1.772 * (Cb - 128));
					}
					
					data[offset++] = R;
					data[offset++] = G;
					data[offset++] = B;
				}
			}
			break;
		case 4:
			if (!this.adobe) {
				throw new Error("unsupported color mode (4 components)");
			}
			// the default transform for four components is false
			colorTransform = false;
			// the adobe transform marker overrides any previous setting
			if (this.adobe && this.adobe.transformCode) {
				colorTransform = true;
			} else if (typeof this.colorTransform !== "undefined") {
				colorTransform = !!this.colorTransform;
			}
			
			for (y = 0; y < height; y++) {
				component1Line = component1.lines[0 | (y * component1.scaleY * scaleY)];
				component2Line = component2.lines[0 | (y * component2.scaleY * scaleY)];
				component3Line = component3.lines[0 | (y * component3.scaleY * scaleY)];
				component4Line = component4.lines[0 | (y * component4.scaleY * scaleY)];
				for (x = 0; x < width; x++) {
					if (!colorTransform) {
						C = component1Line[0 | (x * component1.scaleX * scaleX)];
						M = component2Line[0 | (x * component2.scaleX * scaleX)];
						Ye = component3Line[0 | (x * component3.scaleX * scaleX)];
						K = component4Line[0 | (x * component4.scaleX * scaleX)];
					} else {
						Y = component1Line[0 | (x * component1.scaleX * scaleX)];
						Cb = component2Line[0 | (x * component2.scaleX * scaleX)];
						Cr = component3Line[0 | (x * component3.scaleX * scaleX)];
						K = component4Line[0 | (x * component4.scaleX * scaleX)];
						
						C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
						M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
						Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
					}
					data[offset++] = 255 - C;
					data[offset++] = 255 - M;
					data[offset++] = 255 - Ye;
					data[offset++] = 255 - K;
				}
			}
			break;
		default:
			throw new Error("unsupported color mode");
		}
		
		return data;
	}
	
	getData() {
		let {components, width, height} = this;
		let imageDataArray = new Buffer(width * height * 4);
		let data = this._getData(width, height);
		let i = 0;
		let j = 0;
		let x;
		let y;
		let Y;
		let K;
		let C;
		let M;
		let R;
		let G;
		let B;
		
		switch (components.length) {
		case 1:
			for (y = 0; y < height; y++) {
				for (x = 0; x < width; x++) {
					Y = data[i++];
					
					imageDataArray[j++] = Y;
					imageDataArray[j++] = Y;
					imageDataArray[j++] = Y;
					imageDataArray[j++] = 255;
				}
			}
			break;
		case 3:
			for (y = 0; y < height; y++) {
				for (x = 0; x < width; x++) {
					R = data[i++];
					G = data[i++];
					B = data[i++];
					
					imageDataArray[j++] = R;
					imageDataArray[j++] = G;
					imageDataArray[j++] = B;
					imageDataArray[j++] = 255;
				}
			}
			break;
		case 4:
			for (y = 0; y < height; y++) {
				for (x = 0; x < width; x++) {
					C = data[i++];
					M = data[i++];
					Y = data[i++];
					K = data[i++];
					
					R = 255 - clampTo8bit(C * (1 - K / 255) + K);
					G = 255 - clampTo8bit(M * (1 - K / 255) + K);
					B = 255 - clampTo8bit(Y * (1 - K / 255) + K);
					
					imageDataArray[j++] = R;
					imageDataArray[j++] = G;
					imageDataArray[j++] = B;
					imageDataArray[j++] = 255;
				}
			}
			break;
		default:
			throw new Error("Unsupported color mode");
		}
		
		return imageDataArray;
	}
}

export default buffer => {
	let decoder = new JpegImage(buffer);
	
	return {
		width: decoder.width,
		height: decoder.height,
		data: decoder.getData()
	};
};
