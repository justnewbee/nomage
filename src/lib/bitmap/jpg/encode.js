import JPG from "./jpg";
import {bitShiftL, bitShiftR, bitAnd, bitOr} from "../../util";

const ZIG_ZAG = [
	0, 1, 5, 6, 14, 15, 27, 28,
	2, 4, 7, 13, 16, 26, 29, 42,
	3, 8, 12, 17, 25, 30, 41, 43,
	9, 11, 18, 24, 31, 40, 44, 53,
	10, 19, 23, 32, 39, 45, 52, 54,
	20, 22, 33, 38, 46, 51, 55, 60,
	21, 34, 37, 47, 50, 56, 59, 61,
	35, 36, 48, 49, 57, 58, 62, 63
];
const UVQT = [
	17, 18, 24, 47, 99, 99, 99, 99,
	18, 21, 26, 66, 99, 99, 99, 99,
	24, 26, 56, 99, 99, 99, 99, 99,
	47, 66, 99, 99, 99, 99, 99, 99,
	99, 99, 99, 99, 99, 99, 99, 99,
	99, 99, 99, 99, 99, 99, 99, 99,
	99, 99, 99, 99, 99, 99, 99, 99,
	99, 99, 99, 99, 99, 99, 99, 99
];
const YQT = [
	16, 11, 10, 16, 24, 40, 51, 61,
	12, 12, 14, 19, 26, 58, 60, 55,
	14, 13, 16, 24, 40, 57, 69, 56,
	14, 17, 22, 29, 51, 87, 80, 62,
	18, 22, 37, 56, 68, 109, 103, 77,
	24, 35, 55, 64, 81, 104, 113, 92,
	49, 64, 78, 87, 103, 121, 120, 101,
	72, 92, 95, 98, 112, 100, 103, 99
];
const STD_DC_LUMINANCE_NR_CODES = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
const STD_DC_LUMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_LUMINANCE_NR_CODES = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const STD_AC_LUMINANCE_VALUES = [
	0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12,
	0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
	0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08,
	0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0,
	0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16,
	0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28,
	0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39,
	0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
	0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59,
	0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
	0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79,
	0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
	0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98,
	0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7,
	0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6,
	0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5,
	0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4,
	0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2,
	0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea,
	0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
	0xf9, 0xfa
];
const STD_DC_CHROMINANCE_NR_CODES = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
const STD_DC_CHROMINANCE_VALUES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const STD_AC_CHROMINANCE_NR_CODES = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
const STD_AC_CHROMINANCE_VALUES = [
	0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21,
	0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71,
	0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91,
	0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0,
	0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34,
	0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26,
	0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38,
	0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48,
	0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58,
	0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68,
	0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78,
	0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87,
	0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96,
	0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5,
	0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4,
	0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3,
	0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2,
	0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda,
	0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9,
	0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8,
	0xf9, 0xfa
];

function JPEGEncoder(quality) {
	let YTable = new Array(64);
	let UVTable = new Array(64);
	let fdtblY = new Array(64);
	let fdtblUV = new Array(64);
	let YDC_HT;
	let UVDC_HT;
	let YAC_HT;
	let UVAC_HT;
	
	let bitcode = new Array(65535);
	let category = new Array(65535);
	let outputfDCTQuant = new Array(64);
	let DU = new Array(64);
	let byteout = [];
	let bytenew = 0;
	let bytepos = 7;
	
	let YDU = new Array(64);
	let UDU = new Array(64);
	let VDU = new Array(64);
	let clt = new Array(256);
	let RGB_YUV_TABLE = new Array(2048);
	let currentQuality;
	
	function initQuantTables(sf) {
		for (let i = 0; i < 64; i++) {
			let t = Math.floor((YQT[i] * sf + 50) / 100);
			if (t < 1) {
				t = 1;
			} else if (t > 255) {
				t = 255;
			}
			YTable[ZIG_ZAG[i]] = t;
		}
		
		for (let j = 0; j < 64; j++) {
			let u = Math.floor((UVQT[j] * sf + 50) / 100);
			if (u < 1) {
				u = 1;
			} else if (u > 255) {
				u = 255;
			}
			UVTable[ZIG_ZAG[j]] = u;
		}
		let aasf = [
			1.0, 1.387039845, 1.306562965, 1.175875602,
			1.0, 0.785694958, 0.541196100, 0.275899379
		];
		let k = 0;
		for (let row = 0; row < 8; row++) {
			for (let col = 0; col < 8; col++) {
				fdtblY[k] = 1.0 / (YTable [ZIG_ZAG[k]] * aasf[row] * aasf[col] * 8.0);
				fdtblUV[k] = 1.0 / (UVTable[ZIG_ZAG[k]] * aasf[row] * aasf[col] * 8.0);
				k++;
			}
		}
	}
	
	function computeHuffmanTbl(nrcodes, stdTable) {
		let codeValue = 0;
		let posInTable = 0;
		let HT = [];
		
		for (let k = 1; k <= 16; k++) {
			for (let j = 1; j <= nrcodes[k]; j++) {
				HT[stdTable[posInTable]] = [];
				HT[stdTable[posInTable]][0] = codeValue;
				HT[stdTable[posInTable]][1] = k;
				posInTable++;
				codeValue++;
			}
			codeValue *= 2;
		}
		return HT;
	}
	
	function initHuffmanTbl() {
		YDC_HT = computeHuffmanTbl(STD_DC_LUMINANCE_NR_CODES, STD_DC_LUMINANCE_VALUES);
		UVDC_HT = computeHuffmanTbl(STD_DC_CHROMINANCE_NR_CODES, STD_DC_CHROMINANCE_VALUES);
		YAC_HT = computeHuffmanTbl(STD_AC_LUMINANCE_NR_CODES, STD_AC_LUMINANCE_VALUES);
		UVAC_HT = computeHuffmanTbl(STD_AC_CHROMINANCE_NR_CODES, STD_AC_CHROMINANCE_VALUES);
	}
	
	function initCategoryNumber() {
		let nrLower = 1;
		let nrUpper = 2;
		for (let cat = 1; cat <= 15; cat++) {
			// positive numbers
			for (let nr = nrLower; nr < nrUpper; nr++) {
				category[32767 + nr] = cat;
				bitcode[32767 + nr] = [];
				bitcode[32767 + nr][1] = cat;
				bitcode[32767 + nr][0] = nr;
			}
			// negative numbers
			for (let nrNeg = -(nrUpper - 1); nrNeg <= -nrLower; nrNeg++) {
				category[32767 + nrNeg] = cat;
				bitcode[32767 + nrNeg] = [];
				bitcode[32767 + nrNeg][1] = cat;
				bitcode[32767 + nrNeg][0] = nrUpper - 1 + nrNeg;
			}
			
			nrLower <<= 1;
			nrUpper <<= 1;
		}
	}
	
	function initRGBYUVTable() {
		for (let i = 0; i < 256; i++) {
			RGB_YUV_TABLE[i] = 19595 * i;
			RGB_YUV_TABLE[i + 256] = 38470 * i;
			RGB_YUV_TABLE[i + 512] = 7471 * i + 0x8000;
			RGB_YUV_TABLE[i + 768] = -11059 * i;
			RGB_YUV_TABLE[i + 1024] = -21709 * i;
			RGB_YUV_TABLE[i + 1280] = 32768 * i + 0x807FFF;
			RGB_YUV_TABLE[i + 1536] = -27439 * i;
			RGB_YUV_TABLE[i + 1792] = -5329 * i;
		}
	}
	
	// IO functions
	function writeBits(bs) {
		let value = bs[0];
		let posval = bs[1] - 1;
		
		while (posval >= 0) {
			if (bitAnd(value, bitShiftL(1, posval))) {
				bytenew |= bitShiftL(1, bytepos);
			}
			posval--;
			bytepos--;
			if (bytepos < 0) {
				if (bytenew == 0xFF) {
					writeByte(0xFF);
					writeByte(0);
				} else {
					writeByte(bytenew);
				}
				bytepos = 7;
				bytenew = 0;
			}
		}
	}
	
	function writeByte(value) {
		byteout.push(value);
	}
	
	function writeWord(value) {
		writeByte(bitAnd(bitShiftR(value, 8), 0xFF));
		writeByte(bitAnd(value, 0xFF));
	}
	
	// DCT & quantization core
	function fDCTQuantize(data, fdtbl) {
		let d0;
		let d1;
		let d2;
		let d3;
		let d4;
		let d5;
		let d6;
		let d7;
		// pass 1: process rows
		let dataOff = 0;
		let i;
		
		const I8 = 8;
		const I64 = 64;
		
		for (i = 0; i < I8; ++i) {
			d0 = data[dataOff];
			d1 = data[dataOff + 1];
			d2 = data[dataOff + 2];
			d3 = data[dataOff + 3];
			d4 = data[dataOff + 4];
			d5 = data[dataOff + 5];
			d6 = data[dataOff + 6];
			d7 = data[dataOff + 7];
			
			let tmp0 = d0 + d7;
			let tmp7 = d0 - d7;
			let tmp1 = d1 + d6;
			let tmp6 = d1 - d6;
			let tmp2 = d2 + d5;
			let tmp5 = d2 - d5;
			let tmp3 = d3 + d4;
			let tmp4 = d3 - d4;
			
			/* Even part */
			let tmp10 = tmp0 + tmp3;
			/* phase 2 */
			let tmp13 = tmp0 - tmp3;
			let tmp11 = tmp1 + tmp2;
			let tmp12 = tmp1 - tmp2;
			
			data[dataOff] = tmp10 + tmp11;
			/* phase 3 */
			data[dataOff + 4] = tmp10 - tmp11;
			
			let z1 = (tmp12 + tmp13) * 0.707106781;
			/* c4 */
			data[dataOff + 2] = tmp13 + z1;
			/* phase 5 */
			data[dataOff + 6] = tmp13 - z1;
			
			/* Odd part */
			tmp10 = tmp4 + tmp5;
			/* phase 2 */
			tmp11 = tmp5 + tmp6;
			tmp12 = tmp6 + tmp7;
			
			/* The rotator is modified from fig 4-8 to avoid extra negations. */
			let z5 = (tmp10 - tmp12) * 0.382683433;
			/* c6 */
			let z2 = 0.541196100 * tmp10 + z5;
			/* c2-c6 */
			let z4 = 1.306562965 * tmp12 + z5;
			/* c2+c6 */
			let z3 = tmp11 * 0.707106781;
			/* c4 */
			
			let z11 = tmp7 + z3;
			/* phase 5 */
			let z13 = tmp7 - z3;
			
			data[dataOff + 5] = z13 + z2;
			/* phase 6 */
			data[dataOff + 3] = z13 - z2;
			data[dataOff + 1] = z11 + z4;
			data[dataOff + 7] = z11 - z4;
			
			dataOff += 8;
			/* advance pointer to next row */
		}
		
		/* Pass 2: process columns. */
		dataOff = 0;
		for (i = 0; i < I8; ++i) {
			d0 = data[dataOff];
			d1 = data[dataOff + 8];
			d2 = data[dataOff + 16];
			d3 = data[dataOff + 24];
			d4 = data[dataOff + 32];
			d5 = data[dataOff + 40];
			d6 = data[dataOff + 48];
			d7 = data[dataOff + 56];
			
			let tmp0p2 = d0 + d7;
			let tmp7p2 = d0 - d7;
			let tmp1p2 = d1 + d6;
			let tmp6p2 = d1 - d6;
			let tmp2p2 = d2 + d5;
			let tmp5p2 = d2 - d5;
			let tmp3p2 = d3 + d4;
			let tmp4p2 = d3 - d4;
			
			/* Even part */
			let tmp10p2 = tmp0p2 + tmp3p2;
			/* phase 2 */
			let tmp13p2 = tmp0p2 - tmp3p2;
			let tmp11p2 = tmp1p2 + tmp2p2;
			let tmp12p2 = tmp1p2 - tmp2p2;
			
			data[dataOff] = tmp10p2 + tmp11p2;
			/* phase 3 */
			data[dataOff + 32] = tmp10p2 - tmp11p2;
			
			let z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
			/* c4 */
			data[dataOff + 16] = tmp13p2 + z1p2;
			/* phase 5 */
			data[dataOff + 48] = tmp13p2 - z1p2;
			
			/* Odd part */
			tmp10p2 = tmp4p2 + tmp5p2;
			/* phase 2 */
			tmp11p2 = tmp5p2 + tmp6p2;
			tmp12p2 = tmp6p2 + tmp7p2;
			
			/* The rotator is modified from fig 4-8 to avoid extra negations. */
			let z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
			/* c6 */
			let z2p2 = 0.541196100 * tmp10p2 + z5p2;
			/* c2-c6 */
			let z4p2 = 1.306562965 * tmp12p2 + z5p2;
			/* c2+c6 */
			let z3p2 = tmp11p2 * 0.707106781;
			/* c4 */
			
			let z11p2 = tmp7p2 + z3p2;
			/* phase 5 */
			let z13p2 = tmp7p2 - z3p2;
			
			data[dataOff + 40] = z13p2 + z2p2;
			/* phase 6 */
			data[dataOff + 24] = z13p2 - z2p2;
			data[dataOff + 8] = z11p2 + z4p2;
			data[dataOff + 56] = z11p2 - z4p2;
			
			dataOff++;
			/* advance pointer to next column */
		}
		
		// Quantize/descale the coefficients
		let fDCTQuantize;
		for (i = 0; i < I64; ++i) {
			// Apply the quantization and scaling factor & Round to nearest integer
			fDCTQuantize = data[i] * fdtbl[i];
			outputfDCTQuant[i] = fDCTQuantize > 0.0 ? bitOr(fDCTQuantize + 0.5, 0) : bitOr(fDCTQuantize - 0.5, 0);
		}
		
		return outputfDCTQuant;
	}
	
	function writeAPP0() {
		writeWord(JPG.APP0);
		writeWord(16); // length
		writeByte(0x4A); // J
		writeByte(0x46); // F
		writeByte(0x49); // I
		writeByte(0x46); // F
		writeByte(0); // = "JFIF",'\0'
		writeByte(1); // versionhi
		writeByte(1); // versionlo
		writeByte(0); // xyunits
		writeWord(1); // xdensity
		writeWord(1); // ydensity
		writeByte(0); // thumbnwidth
		writeByte(0); // thumbnheight
	}
	
	function writeSOF0(width, height) {
		writeWord(JPG.SOF0);
		writeWord(17); // length, truecolor YUV JPG
		writeByte(8); // precision
		writeWord(height);
		writeWord(width);
		writeByte(3); // nrofcomponents
		writeByte(1); // IdY
		writeByte(0x11); // HVY
		writeByte(0); // QTY
		writeByte(2); // IdU
		writeByte(0x11); // HVU
		writeByte(1); // QTU
		writeByte(3); // IdV
		writeByte(0x11); // HVV
		writeByte(1); // QTV
	}
	
	function writeDQT() {
		writeWord(JPG.DQT);
		writeWord(132);
		writeByte(0);
		
		for (let i = 0; i < 64; i++) {
			writeByte(YTable[i]);
		}
		writeByte(1);
		for (let j = 0; j < 64; j++) {
			writeByte(UVTable[j]);
		}
	}
	
	function writeDHT() {
		writeWord(JPG.DHT);
		writeWord(0x01A2); // length
		
		writeByte(0); // HTYDCinfo
		for (let i = 0; i < 16; i++) {
			writeByte(STD_DC_LUMINANCE_NR_CODES[i + 1]);
		}
		for (let j = 0; j <= 11; j++) {
			writeByte(STD_DC_LUMINANCE_VALUES[j]);
		}
		
		writeByte(0x10); // HTYACinfo
		for (let k = 0; k < 16; k++) {
			writeByte(STD_AC_LUMINANCE_NR_CODES[k + 1]);
		}
		for (let l = 0; l <= 161; l++) {
			writeByte(STD_AC_LUMINANCE_VALUES[l]);
		}
		
		writeByte(1); // HTUDCinfo
		for (let m = 0; m < 16; m++) {
			writeByte(STD_DC_CHROMINANCE_NR_CODES[m + 1]);
		}
		for (let n = 0; n <= 11; n++) {
			writeByte(STD_DC_CHROMINANCE_VALUES[n]);
		}
		
		writeByte(0x11); // HTUACinfo
		for (let o = 0; o < 16; o++) {
			writeByte(STD_AC_CHROMINANCE_NR_CODES[o + 1]);
		}
		for (let p = 0; p <= 161; p++) {
			writeByte(STD_AC_CHROMINANCE_VALUES[p]);
		}
	}
	
	function writeSOS() {
		writeWord(JPG.SOS);
		writeWord(12); // length
		writeByte(3); // nrofcomponents
		writeByte(1); // IdY
		writeByte(0); // HTY
		writeByte(2); // IdU
		writeByte(0x11); // HTU
		writeByte(3); // IdV
		writeByte(0x11); // HTV
		writeByte(0); // Ss
		writeByte(0x3f); // Se
		writeByte(0); // Bf
	}
	
	function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
		let EOB = HTAC[0x00];
		let M16zeroes = HTAC[0xF0];
		let pos;
		
		const I16 = 16;
		const I63 = 63;
		const I64 = 64;
		
		let DU_DCT = fDCTQuantize(CDU, fdtbl);
		// ZigZag reorder
		for (let j = 0; j < I64; ++j) {
			DU[ZIG_ZAG[j]] = DU_DCT[j];
		}
		let Diff = DU[0] - DC;
		DC = DU[0];
		// Encode DC
		if (Diff == 0) {
			writeBits(HTDC[0]); // Diff might be 0
		} else {
			pos = 32767 + Diff;
			writeBits(HTDC[category[pos]]);
			writeBits(bitcode[pos]);
		}
		// Encode ACs
		let end0pos = 63; // was const... which is crazy
		for (; end0pos > 0 && DU[end0pos] === 0; end0pos--) {}
		
		// end0pos = first element in reverse order !=0
		if (end0pos == 0) {
			writeBits(EOB);
			return DC;
		}
		
		let i = 1;
		let len;
		
		while (i <= end0pos) {
			let startPos = i;
			for (; DU[i] === 0 && i <= end0pos; ++i) {}
			
			let nrZeroes = i - startPos;
			if (nrZeroes >= I16) {
				len = bitShiftR(nrZeroes, 4);
				for (let nrmarker = 1; nrmarker <= len; ++nrmarker) {
					writeBits(M16zeroes);
				}
				nrZeroes = bitAnd(nrZeroes, 0xF);
			}
			pos = 32767 + DU[i];
			writeBits(HTAC[bitShiftL(nrZeroes, 4) + category[pos]]);
			writeBits(bitcode[pos]);
			i++;
		}
		if (end0pos != I63) {
			writeBits(EOB);
		}
		return DC;
	}
	
	function initCharLookupTable() {
		let sfcc = String.fromCharCode;
		for (let i = 0; i < 256; i++) { // ACHTUNG // 255
			clt[i] = sfcc(i);
		}
	}
	
	this.encode = function(image, quality) {// image data object
		if (quality) {
			setQuality(quality);
		}
		
		// Initialize bit writer
		byteout = [];
		bytenew = 0;
		bytepos = 7;
		
		// Add JPEG headers
		writeWord(JPG.SOI);
		writeAPP0();
		writeDQT();
		writeSOF0(image.width, image.height);
		writeDHT();
		writeSOS();
		
		// Encode 8x8 macroblocks
		let DCY = 0;
		let DCU = 0;
		let DCV = 0;
		
		bytenew = 0;
		bytepos = 7;
		
		this.encode.displayName = "_encode_";
		
		let imageData = image.data;
		let width = image.width;
		let height = image.height;
		let quadWidth = width * 4;
		
		let x;
		let y = 0;
		let r;
		let g;
		let b;
		let start;
		let p;
		let col;
		let row;
		let pos;
		
		while (y < height) {
			x = 0;
			while (x < quadWidth) {
				start = quadWidth * y + x;
				p = start;
				col = -1;
				row = 0;
				
				for (pos = 0; pos < 64; pos++) {
					row = bitShiftR(pos, 3);// /8
					col = bitAnd(pos, 7) * 4; // %8
					p = start + row * quadWidth + col;
					
					if (y + row >= height) { // padding bottom
						p -= quadWidth * (y + 1 + row - height);
					}
					
					if (x + col >= quadWidth) { // padding right
						p -= x + col - quadWidth + 4;
					}
					
					r = imageData[p++];
					g = imageData[p++];
					b = imageData[p++];
					
					/* // calculate YUV values dynamically
					 YDU[pos]=((( 0.29900)*r+( 0.58700)*g+( 0.11400)*b))-128; //-0x80
					 UDU[pos]=(((-0.16874)*r+(-0.33126)*g+( 0.50000)*b));
					 VDU[pos]=((( 0.50000)*r+(-0.41869)*g+(-0.08131)*b));
					 */
					
					// use lookup table (slightly faster)
					YDU[pos] = bitShiftR(RGB_YUV_TABLE[r] + RGB_YUV_TABLE[g + 256] + RGB_YUV_TABLE[b + 512], 16) - 128;
					UDU[pos] = bitShiftR(RGB_YUV_TABLE[r + 768] + RGB_YUV_TABLE[g + 1024] + RGB_YUV_TABLE[b + 1280], 16) - 128;
					VDU[pos] = bitShiftR(RGB_YUV_TABLE[r + 1280] + RGB_YUV_TABLE[g + 1536] + RGB_YUV_TABLE[b + 1792], 16) - 128;
					
				}
				
				DCY = processDU(YDU, fdtblY, DCY, YDC_HT, YAC_HT);
				DCU = processDU(UDU, fdtblUV, DCU, UVDC_HT, UVAC_HT);
				DCV = processDU(VDU, fdtblUV, DCV, UVDC_HT, UVAC_HT);
				x += 32;
			}
			y += 8;
		}
		
		// Do the bit alignment of the EOI marker
		if (bytepos >= 0) {
			let fillBits = [];
			fillBits[1] = bytepos + 1;
			fillBits[0] = bitShiftL(1, bytepos + 1) - 1;
			writeBits(fillBits);
		}
		
		writeWord(JPG.EOI);
		
		return new Buffer(byteout);
	};
	
	function setQuality(quality) {
		if (quality <= 0) {
			quality = 1;
		}
		if (quality > 100) {
			quality = 100;
		}
		
		if (currentQuality == quality) {
			return;
		} // don't recalculate if unchanged
		
		let sf = 0;
		if (quality < 50) {
			sf = Math.floor(5000 / quality);
		} else {
			sf = Math.floor(200 - quality * 2);
		}
		
		initQuantTables(sf);
		currentQuality = quality;
	}
	
	function init() {
		if (!quality) {
			quality = 50;
		}
		// create tables
		initCharLookupTable();
		initHuffmanTbl();
		initCategoryNumber();
		initRGBYUVTable();
		
		setQuality(quality);
	}
	
	init();
}

export default (imgData, quality = 100) => {
	let encoder = new JPEGEncoder(quality);
	return encoder.encode(imgData, quality);
};