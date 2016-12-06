/**
 * JPEG constants
 */
export default {
	SOI: 0xFFD8, // Start of Image
	EOI: 0xFFD9, // End of Image
	DQT: 0xFFDB, // Define Quantization Tables
	SOF0: 0xFFC0, // Start of Frame, Baseline DCT
	SOF1: 0xFFC1, // Start of Frame, Extended DCT
	SOF2: 0xFFC2, // Start of Frame, Progressive DCT
	DHT: 0xFFC4, // Define Huffman Tables
	DRI: 0xFFDD, // Define Restart Interval
	SOS: 0xFFDA, // Start of Scan
	// Application Specific
	APP0: 0xFFE0,
	APP1: 0xFFE1,
	APP2: 0xFFE2,
	APP3: 0xFFE3,
	APP4: 0xFFE4,
	APP5: 0xFFE5,
	APP6: 0xFFE6,
	APP7: 0xFFE7,
	APP8: 0xFFE8,
	APP9: 0xFFE9,
	APP10: 0xFFEA,
	APP11: 0xFFEB,
	APP12: 0xFFEC,
	APP13: 0xFFED,
	APP14: 0xFFEE,
	APP15: 0xFFEF,
	COM: 0xFFFE, // Comment
};