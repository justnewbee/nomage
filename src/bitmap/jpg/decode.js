// - The JPEG specification can be found in the ITU CCITT Recommendation T.81
//   (www.w3.org/Graphics/JPEG/itu-t81.pdf)
// - The JFIF specification can be found in the JPEG File Interchange Format
//   (www.w3.org/Graphics/JPEG/jfif3.pdf)
// - The Adobe Application-Specific JPEG markers in the Supporting the DCT Filters
//   in PostScript Level 2, Technical Note #5116
//   (partners.adobe.com/public/developer/en/ps/sdk/5116.DCT_Filter.pdf)
import JPG from "./jpg";
import {each, bitShiftL, bitShiftR, bitAnd, bitOr} from "../../util/bit";

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
 * 从 Uint8Array 的 offset 开始读取两个字节
 * @param {Uint8Array} arrUInt8
 * @param {int} offset
 * @return {int}
 */
function getUInit16(arrUInt8, offset) {
	return bitOr(bitShiftL(arrUInt8[offset], 8), arrUInt8[offset + 1]);
}
/**
 * 
 * @param {Uint8Array} arrUInt8
 * @param {int} offset
 * @return {Uint8Array}
 */
function getDataBlock(arrUInt8, offset) {
	const len = getUInit16(arrUInt8, offset);
	return arrUInt8.subarray(offset + 2, offset + len);
}

function buildHuffmanTable(codeLengths, values) {
	const code = [];
	let length = 16;
	let i;
	let j;
	let k = 0;
	
	while (length > 0 && !codeLengths[length - 1]) {
		length--;
	}
	code.push({
		children: [],
		index: 0
	});
	
	let p = code[0];
	let q;
	
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
	const mcusPerLine = frame.mcusPerLine;
	const progressive = frame.progressive;
	const startOffset = offset;
	const componentsLength = components.length;
	let bitsData = 0;
	let bitsCount = 0;
	let eobrun = 0;
	let successiveACState = 0;
	let successiveACNextValue;
	let component;
	let mcu = 0;
	let marker;
	let mcuExpected;
	let decodeFn;
	let i;
	let j;
	let k;
	let n;
	let h;
	let v;
	
	function readBit() {
		if (bitsCount > 0) {
			bitsCount--;
			return bitAnd(bitShiftR(bitsData, bitsCount), 1);
		}
		bitsData = data[offset++];
		if (bitsData == 0xFF) {
			const nextByte = data[offset++];
			if (nextByte) {
				throw new Error(`unexpected marker: ${bitOr(bitShiftL(bitsData, 8), nextByte).toString(16)}`);
			}
		}
		bitsCount = 7;
		return bitsData >>> 7;
	}
	
	function decodeHuffman(tree) {
		let node = tree;
		let bit;
		
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
		let n = 0;
		while (length > 0) {
			const bit = readBit();
			if (bit === null) {
				return;
			}
			n = bitOr(bitShiftL(n, 1), bit);
			length--;
		}
		return n;
	}
	
	function receiveAndExtend(length) {
		const n = receive(length);
		if (n >= bitShiftL(1, length - 1)) {
			return n;
		}
		return n + bitShiftL(-1, length) + 1;
	}
	
	function decodeBaseline(component, zz) {
		const t = decodeHuffman(component.huffmanTableDC);
		const diff = t === 0 ? 0 : receiveAndExtend(t);
		
		zz[0] = component.pred += diff;
		
		k = 1;
		while (k < 64) {
			const rs = decodeHuffman(component.huffmanTableAC);
			const s = bitAnd(rs, 15);
			const r = bitShiftR(rs, 4);
			
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
		const t = decodeHuffman(component.huffmanTableDC);
		const diff = t === 0 ? 0 : bitShiftL(receiveAndExtend(t), successive);
		
		zz[0] = component.pred += diff;
	}
	
	function decodeDCSuccessive(component, zz) {
		zz[0] |= bitShiftL(readBit(), successive);
	}
	
	function decodeACFirst(component, zz) {
		if (eobrun > 0) {
			eobrun--;
			return;
		}
		k = spectralStart;
		
		const e = spectralEnd;
		
		while (k <= e) {
			const rs = decodeHuffman(component.huffmanTableAC);
			const s = bitAnd(rs, 15);
			const r = bitShiftR(rs, 4);
			
			if (s === 0) {
				if (r < 15) {
					eobrun = receive(r) + bitShiftL(1, r) - 1;
					break;
				}
				k += 16;
				continue;
			}
			k += r;
			
			zz[dctZigZag[k]] = receiveAndExtend(s) * bitShiftL(1, successive);
			
			k++;
		}
	}
	
	function decodeACSuccessive(component, zz) {
		k = spectralStart;
		const e = spectralEnd;
		
		while (k <= e) {
			const z = dctZigZag[k];
			
			switch (successiveACState) {
			case 0: // initial state
				const rs = decodeHuffman(component.huffmanTableAC);
				const s = bitAnd(rs, 15);
				
				let r = bitShiftR(rs, 4);
				
				if (s === 0) {
					if (r < 15) {
						eobrun = receive(r) + bitShiftL(1, r);
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
					zz[z] += bitShiftL(readBit(), successive);
				} else {
					r--;
					if (r === 0) {
						successiveACState = successiveACState == 2 ? 3 : 0;
					}
				}
				break;
			case 3: // set value for a zero item
				if (zz[z]) {
					zz[z] += bitShiftL(readBit(), successive);
				} else {
					zz[z] = bitShiftL(successiveACNextValue, successive);
					successiveACState = 0;
				}
				break;
			case 4: // eob
				if (zz[z]) {
					zz[z] += bitShiftL(readBit(), successive);
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
		const mcuRow = bitOr(mcu / mcusPerLine, 0);
		const mcuCol = mcu % mcusPerLine;
		const blockRow = mcuRow * component.v + row;
		const blockCol = mcuCol * component.h + col;
		
		decode(component, component.blocks[blockRow][blockCol]);
	}
	
	function decodeBlock(component, decode, mcu) {
		const blockRow = bitOr(mcu / component.blocksPerLine, 0);
		const blockCol = mcu % component.blocksPerLine;
		
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
		marker = bitOr(bitShiftL(data[offset], 8), data[offset + 1]);
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

function buildComponentData(component) {
	const lines = [];
	const blocksPerLine = component.blocksPerLine;
	const blocksPerColumn = component.blocksPerColumn;
	const samplesPerLine = bitShiftL(blocksPerLine, 3);
	const R = new Int32Array(64);
	const r = new Uint8Array(64);
	let i;
	let j;
	
	// A port of poppler's IDCT method which in turn is taken from:
	//   Christoph Loeffler, Adriaan Ligtenberg, George S. Moschytz,
	//   "Practical Fast 1-D DCT Algorithms with 11 Multiplications",
	//   IEEE Intl. Conf. on Acoustics, Speech & Signal Processing, 1989,
	//   988-991.
	function quantizeAndInverse(zz, dataOut, dataIn) {
		const qt = component.quantizationTable;
		const p = dataIn;
		
		let v0;
		let v1;
		let v2;
		let v3;
		let v4;
		let v5;
		let v6;
		let v7;
		let t;
		
		// dequant
		for (i = 0; i < 64; i++) {
			p[i] = zz[i] * qt[i];
		}
		
		// inverse DCT on rows
		for (i = 0; i < 8; ++i) {
			const row = 8 * i;
			
			// check for all-zero AC coefficients
			if (p[row + 1] == 0 && p[row + 2] == 0 && p[row + 3] == 0 && p[row + 4] == 0 && p[row + 5] == 0 && p[row + 6] == 0 && p[row + 7] == 0) {
				t = bitShiftR(dctSqrt2 * p[row] + 512, 10);
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
			v0 = bitShiftR(dctSqrt2 * p[row] + 128, 8);
			v1 = bitShiftR(dctSqrt2 * p[row + 4] + 128, 8);
			v2 = p[row + 2];
			v3 = p[row + 6];
			v4 = bitShiftR(dctSqrt1d2 * (p[row + 1] - p[row + 7]) + 128, 8);
			v7 = bitShiftR(dctSqrt1d2 * (p[row + 1] + p[row + 7]) + 128, 8);
			v5 = bitShiftL(p[row + 3], 4);
			v6 = bitShiftL(p[row + 5], 4);
			
			// stage 3
			t = bitShiftR(v0 - v1 + 1, 1);
			v0 = bitShiftR(v0 + v1 + 1, 1);
			v1 = t;
			t = bitShiftR(v2 * dctSin6 + v3 * dctCos6 + 128, 8);
			v2 = bitShiftR(v2 * dctCos6 - v3 * dctSin6 + 128, 8);
			v3 = t;
			t = bitShiftR(v4 - v6 + 1, 1);
			v4 = bitShiftR(v4 + v6 + 1, 1);
			v6 = t;
			t = bitShiftR(v7 + v5 + 1, 1);
			v5 = bitShiftR(v7 - v5 + 1, 1);
			v7 = t;
			
			// stage 2
			t = bitShiftR(v0 - v3 + 1, 1);
			v0 = bitShiftR(v0 + v3 + 1, 1);
			v3 = t;
			t = bitShiftR(v1 - v2 + 1, 1);
			v1 = bitShiftR(v1 + v2 + 1, 1);
			v2 = t;
			t = bitShiftR(v4 * dctSin3 + v7 * dctCos3 + 2048, 12);
			v4 = bitShiftR(v4 * dctCos3 - v7 * dctSin3 + 2048, 12);
			v7 = t;
			t = bitShiftR(v5 * dctSin1 + v6 * dctCos1 + 2048, 12);
			v5 = bitShiftR(v5 * dctCos1 - v6 * dctSin1 + 2048, 12);
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
			const col = i;
			
			// check for all-zero AC coefficients
			if (p[col + 8] == 0 && p[col + 8 * 2] == 0 && p[col + 8 * 3] == 0 && p[col + 8 * 4] == 0 && p[col + 8 * 5] == 0 && p[col + 8 * 6] == 0 && p[col + 8 * 7] == 0) {
				t = bitShiftR(dctSqrt2 * dataIn[i] + 8192, 14);
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
			v0 = bitShiftR(dctSqrt2 * p[col] + 2048, 12);
			v1 = bitShiftR(dctSqrt2 * p[col + 8 * 4] + 2048, 12);
			v2 = p[col + 8 * 2];
			v3 = p[col + 8 * 6];
			v4 = bitShiftR(dctSqrt1d2 * (p[col + 8] - p[col + 8 * 7]) + 2048, 12);
			v7 = bitShiftR(dctSqrt1d2 * (p[col + 8] + p[col + 8 * 7]) + 2048, 12);
			v5 = p[col + 8 * 3];
			v6 = p[col + 8 * 5];
			
			// stage 3
			t = bitShiftR(v0 - v1 + 1, 1);
			v0 = bitShiftR(v0 + v1 + 1, 1);
			v1 = t;
			t = bitShiftR(v2 * dctSin6 + v3 * dctCos6 + 2048, 12);
			v2 = bitShiftR(v2 * dctCos6 - v3 * dctSin6 + 2048, 12);
			v3 = t;
			t = bitShiftR(v4 - v6 + 1, 1);
			v4 = bitShiftR(v4 + v6 + 1, 1);
			v6 = t;
			t = bitShiftR(v7 + v5 + 1, 1);
			v5 = bitShiftR(v7 - v5 + 1, 1);
			v7 = t;
			
			// stage 2
			t = bitShiftR(v0 - v3 + 1, 1);
			v0 = bitShiftR(v0 + v3 + 1, 1);
			v3 = t;
			t = bitShiftR(v1 - v2 + 1, 1);
			v1 = bitShiftR(v1 + v2 + 1, 1);
			v2 = t;
			t = bitShiftR(v4 * dctSin3 + v7 * dctCos3 + 2048, 12);
			v4 = bitShiftR(v4 * dctCos3 - v7 * dctSin3 + 2048, 12);
			v7 = t;
			t = bitShiftR(v5 * dctSin1 + v6 * dctCos1 + 2048, 12);
			v5 = bitShiftR(v5 * dctCos1 - v6 * dctSin1 + 2048, 12);
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
			const sample = 128 + bitShiftR(p[i] + 8, 4);
			dataOut[i] = sample < 0 ? 0 : sample > 0xFF ? 0xFF : sample;
		}
	}
	
	for (let blockRow = 0; blockRow < blocksPerColumn; blockRow++) {
		const scanLine = bitShiftL(blockRow, 3);
		for (i = 0; i < 8; i++) {
			lines.push(new Uint8Array(samplesPerLine));
		}
		for (let blockCol = 0; blockCol < blocksPerLine; blockCol++) {
			quantizeAndInverse(component.blocks[blockRow][blockCol], r, R);
			
			const sample = bitShiftL(blockCol, 3);
			let offset = 0;
			
			for (j = 0; j < 8; j++) {
				const line = lines[scanLine + j];
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
	
	const mcusPerLine = Math.ceil(frame.samplesPerLine / 8 / maxH);
	const mcusPerColumn = Math.ceil(frame.scanLines / 8 / maxV);
	
	each(frame.components, v => {
		const blocksPerLine = Math.ceil(Math.ceil(frame.samplesPerLine / 8) * v.h / maxH);
		const blocksPerColumn = Math.ceil(Math.ceil(frame.scanLines / 8) * v.v / maxV);
		const blocksPerLineForMcu = mcusPerLine * v.h;
		const blocksPerColumnForMcu = mcusPerColumn * v.v;
		const blocks = [];
		
		for (i = 0; i < blocksPerColumnForMcu; i++) {
			const row = [];
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
 * when the marker is JPG.APP0, do it
 * JFIF = // JPEG File Interchange Format - https://www.w3.org/Graphics/JPEG/jfif3.pdf
 * @param {Uint8Array} arrAppData
 * @return {Object} or undefined
 */
function parseAppJFIF(arrAppData) {
	if (arrAppData[0] === 0x4A && arrAppData[1] === 0x46 && arrAppData[2] === 0x49 && arrAppData[3] === 0x46 && arrAppData[4] === 0) { // 'JFIF\x00'
		return { 
			version: {
				major: arrAppData[5],
				minor: arrAppData[6]
			},
			densityUnits: arrAppData[7],
			xDensity: bitOr(bitShiftL(arrAppData[8], 8), arrAppData[9]),
			yDensity: bitOr(bitShiftL(arrAppData[10], 8), arrAppData[11]),
			thumbWidth: arrAppData[12],
			thumbHeight: arrAppData[13],
			thumbData: arrAppData.subarray(14, 14 + 3 * arrAppData[12] * arrAppData[13])
		};
	}
}
/**
 * do it when marker is JPG.APP14
 * adobe info
 * @param {Uint8Array} arrAppData
 * @return {Object} or undefined
 */
function parseAppADOBE(arrAppData) {
	if (arrAppData[0] === 0x41 && arrAppData[1] === 0x64 && arrAppData[2] === 0x6F && arrAppData[3] === 0x62 && arrAppData[4] === 0x65 && arrAppData[5] === 0) { // 'Adobe\x00'
		return {
			version: arrAppData[6],
			flags0: bitOr(bitShiftL(arrAppData[7], 8), arrAppData[8]),
			flags1: bitOr(bitShiftL(arrAppData[9], 8), arrAppData[10]),
			transformCode: arrAppData[11]
		};
	}
}

function parseComponentData(buffer) {
	const o = {};
	const quantizationTables = [];
	const frames = [];
	const huffmanTablesAC = [];
	const huffmanTablesDC = [];
	const data = new Uint8Array(buffer);
	let offset = 0;
	let frame;
	let resetInterval;
	let fileMarker;
	let i;
	let j;
	
	// if NOT assigned to a variable means skipping the data
	function readUInt16() {
		const value = getUInit16(data, offset);
		
		offset += 2;
		return value;
	}
	function readDataBlock() {
		const arr = getDataBlock(data, offset);
		
		offset += arr.length + 2;
		
		return arr;
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
		case JPG.APP15:
		case JPG.CMT:
			readDataBlock(); // read and ignore TODO APP1 - Exif
			break;
		case JPG.APP0:
			// JFIF is NOT used anywhere yet, however you have to read the data block
			o.JFIF = parseAppJFIF(readDataBlock());
			break;
		case JPG.APP14:
			o.ADOBE = parseAppADOBE(readDataBlock());
			break;
		case JPG.DQT:
			const quantizationTablesLength = readUInt16();
			const quantizationTablesEnd = quantizationTablesLength + offset - 2;
			
			while (offset < quantizationTablesEnd) {
				const quantizationTableSpec = data[offset++];
				const tableData = new Int32Array(64);
				if (bitShiftR(quantizationTableSpec, 4) === 0) { // 8 bit values
					for (j = 0; j < 64; j++) {
						tableData[dctZigZag[j]] = data[offset++];
					}
				} else if (bitShiftR(quantizationTableSpec, 4) === 1) { // 16 bit
					for (j = 0; j < 64; j++) {
						tableData[dctZigZag[j]] = readUInt16();
					}
				} else {
					throw new Error("DQT: invalid table spec");
				}
				quantizationTables[bitAnd(quantizationTableSpec, 15)] = tableData;
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
			
			const componentsCount = data[offset++];
			let componentId;
			
			for (i = 0; i < componentsCount; i++) {
				componentId = data[offset];
				const h = bitShiftR(data[offset + 1], 4);
				const v = bitAnd(data[offset + 1], 15);
				const qId = data[offset + 2];
				
				frame.componentsOrder.push(componentId);
				frame.components[componentId] = {
					h, v,
					quantizationIdx: qId
				};
				offset += 3;
			}
			prepareComponents(frame);
			frames.push(frame);
			break;
		case JPG.DHT:
			const huffmanLength = readUInt16();
			for (i = 2; i < huffmanLength;) {
				const huffmanTableSpec = data[offset++];
				const codeLengths = new Uint8Array(16);
				let codeLengthSum = 0;
				
				for (j = 0; j < 16; j++, offset++) {
					codeLengthSum += codeLengths[j] = data[offset];
				}
				
				const huffmanValues = new Uint8Array(codeLengthSum);
				for (j = 0; j < codeLengthSum; j++, offset++) {
					huffmanValues[j] = data[offset];
				}
				i += 17 + codeLengthSum;
				
				(bitShiftR(huffmanTableSpec, 4) === 0 ? huffmanTablesDC : huffmanTablesAC)[bitAnd(huffmanTableSpec, 15)] = buildHuffmanTable(codeLengths, huffmanValues);
			}
			break;
		case JPG.DRI:
			readUInt16();
			
			resetInterval = readUInt16();
			break;
		case JPG.SOS: // FIXME performance bottleneck here
			readUInt16();
			
			const selectorsCount = data[offset++];
			const components = [];
			let component;
			
			for (i = 0; i < selectorsCount; i++) {
				component = frame.components[data[offset++]];
				const tableSpec = data[offset++];
				component.huffmanTableDC = huffmanTablesDC[bitShiftR(tableSpec, 4)];
				component.huffmanTableAC = huffmanTablesAC[bitAnd(tableSpec, 15)];
				components.push(component);
			}
			
			const spectralStart = data[offset++];
			const spectralEnd = data[offset++];
			const successiveApproximation = data[offset++];
			const processed = decodeScan(data, offset, frame, components, resetInterval, spectralStart, spectralEnd, bitShiftR(successiveApproximation, 4), bitAnd(successiveApproximation, 15));
			
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
	each(frames[0].components, val => {
		val.quantizationTable = quantizationTables[val.quantizationIdx];
		delete val.quantizationIdx;
	});
	
	return {
		width: frame.samplesPerLine,
		height: frame.scanLines,
		components: frame.componentsOrder.map(val => {
			const com = frame.components[val];
			
			return {
				lines: buildComponentData(com),
				scaleX: com.h / frame.maxH,
				scaleY: com.v / frame.maxV
			};
		})
	};
}

function getMiddleData(componentData) {
	const {ADOBE, components, width, height} = componentData;
	const [component1, component2, component3, component4] = components;
	const data = new Uint8Array(width * height * components.length);
	let offset = 0;
	let component1Line;
	let component2Line;
	let component3Line;
	let component4Line;
	let x;
	let y;
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
			component1Line = component1.lines[bitOr(0, y * component1.scaleY)];
			for (x = 0; x < width; x++) {
				Y = component1Line[bitOr(0, x * component1.scaleX)];
				data[offset++] = Y;
			}
		}
		break;
	case 2: // PDF might compress two component data in custom color space
		for (y = 0; y < height; y++) {
			component1Line = component1.lines[bitOr(0, y * component1.scaleY)];
			component2Line = component2.lines[bitOr(0, y * component2.scaleY)];
			for (x = 0; x < width; x++) {
				Y = component1Line[bitOr(0, x * component1.scaleX)];
				data[offset++] = Y;
				Y = component2Line[bitOr(0, x * component2.scaleX)];
				data[offset++] = Y;
			}
		}
		break;
	case 3:
		colorTransform = true; // the default transform for three components is true
		// the adobe transform marker overrides any previous setting
		if (ADOBE && ADOBE.transformCode) {
			colorTransform = true;
		}
		
		for (y = 0; y < height; y++) {
			component1Line = component1.lines[bitOr(0, y * component1.scaleY)];
			component2Line = component2.lines[bitOr(0, y * component2.scaleY)];
			component3Line = component3.lines[bitOr(0, y * component3.scaleY)];
			for (x = 0; x < width; x++) {
				if (colorTransform) {
					Y = component1Line[bitOr(0, x * component1.scaleX)];
					Cb = component2Line[bitOr(0, x * component2.scaleX)];
					Cr = component3Line[bitOr(0, x * component3.scaleX)];
					
					R = clampTo8bit(Y + 1.402 * (Cr - 128));
					G = clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
					B = clampTo8bit(Y + 1.772 * (Cb - 128));
				} else {
					R = component1Line[bitOr(0, x * component1.scaleX)];
					G = component2Line[bitOr(0, x * component2.scaleX)];
					B = component3Line[bitOr(0, x * component3.scaleX)];
				}
				
				data[offset++] = R;
				data[offset++] = G;
				data[offset++] = B;
			}
		}
		break;
	case 4:
		if (!ADOBE) {
			throw new Error("unsupported color mode (4 components)");
		}
		colorTransform = false; // the default transform for four components is false
		// the adobe transform marker overrides any previous setting
		if (ADOBE && ADOBE.transformCode) {
			colorTransform = true;
		}
		
		for (y = 0; y < height; y++) {
			component1Line = component1.lines[bitOr(0, y * component1.scaleY)];
			component2Line = component2.lines[bitOr(0, y * component2.scaleY)];
			component3Line = component3.lines[bitOr(0, y * component3.scaleY)];
			component4Line = component4.lines[bitOr(0, y * component4.scaleY)];
			for (x = 0; x < width; x++) {
				if (colorTransform) {
					Y = component1Line[bitOr(0, x * component1.scaleX)];
					Cb = component2Line[bitOr(0, x * component2.scaleX)];
					Cr = component3Line[bitOr(0, x * component3.scaleX)];
					K = component4Line[bitOr(0, x * component4.scaleX)];
					
					C = 255 - clampTo8bit(Y + 1.402 * (Cr - 128));
					M = 255 - clampTo8bit(Y - 0.3441363 * (Cb - 128) - 0.71413636 * (Cr - 128));
					Ye = 255 - clampTo8bit(Y + 1.772 * (Cb - 128));
				} else {
					C = component1Line[bitOr(0, x * component1.scaleX)];
					M = component2Line[bitOr(0, x * component2.scaleX)];
					Ye = component3Line[bitOr(0, x * component3.scaleX)];
					K = component4Line[bitOr(0, x * component4.scaleX)];
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

export default buffer => {
	const componentData = parseComponentData(buffer);
	const {components, width, height} = componentData;
	const data = new Buffer(width * height * 4);
	const middleData = getMiddleData(componentData);
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
				Y = middleData[i++];
				
				data[j++] = Y;
				data[j++] = Y;
				data[j++] = Y;
				data[j++] = 255;
			}
		}
		break;
	case 3:
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				R = middleData[i++];
				G = middleData[i++];
				B = middleData[i++];
				
				data[j++] = R;
				data[j++] = G;
				data[j++] = B;
				data[j++] = 255;
			}
		}
		break;
	case 4:
		for (y = 0; y < height; y++) {
			for (x = 0; x < width; x++) {
				C = middleData[i++];
				M = middleData[i++];
				Y = middleData[i++];
				K = middleData[i++];
				
				R = 255 - clampTo8bit(C * (1 - K / 255) + K);
				G = 255 - clampTo8bit(M * (1 - K / 255) + K);
				B = 255 - clampTo8bit(Y * (1 - K / 255) + K);
				
				data[j++] = R;
				data[j++] = G;
				data[j++] = B;
				data[j++] = 255;
			}
		}
		break;
	default:
		throw new Error("Unsupported color mode");
	}
	
	return {
		data, width, height
	};
};