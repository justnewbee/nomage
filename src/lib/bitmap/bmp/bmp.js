export default {
	/* 
	 * see https://en.wikipedia.org/wiki/BMP_file_format for detailed bmp structure
	 * TODO 整理一下
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
	/*
	 *  http://www.onicos.com/staff/iz/formats/bmp.html
	 * # BMP - Microsoft Windows bitmap image file
	 * ## Byte Order: Little-endian
	 * Offset   Length   Contents
	 * 0      2 bytes  "BM"
	 * 2      4 bytes  Total size included "BM" magic (s)
	  * 6      2 bytes  Reserved1
	  * 8      2 bytes  Reserved2
	 * 10      4 bytes  Offset bits
	 * 14      4 bytes  Header size (n)
	 * 18    n-4 bytes  Header (See bellow)
	 14+n .. s-1      Image data
	
	Header: n==12 (Old BMP image file format, Used OS/2)
	
	Offset   Length   Contents
	 18      2 bytes  Width
	 20      2 bytes  Height
	 22      2 bytes  Planes
	 24      2 bytes  Bits per Pixel
	
	Header: n>12 (Microsoft Windows BMP image file)
	
	Offset   Length   Contents
	 18      4 bytes  Width
	 22      4 bytes  Height
	 26      2 bytes  Planes
	 28      2 bytes  Bits per Pixel
	 30      4 bytes  Compression
	 34      4 bytes  Image size
	 38      4 bytes  X Pixels per meter
	 42      4 bytes  Y Pixels per meter
	 46      4 bytes  Number of Colors
	 50      4 bytes  Colors Important
	 54 (n-40) bytes  OS/2 new extensional fields??
	*/
	FLAG: "BM",
	INFO_SIZE: 40,
	DATA_OFFSET: 54
};