import tinyColor from "tinycolor2";

export default {
	/**
	 * 
	 * @param {Object} o
	 * @param {Function} fn
	 */
	each(o, fn) {
		for (const k in o) {
			if (o.hasOwnProperty(k)) {
				fn(o[k], k);
			}
		}
	},
	/**
	 * bitwise left shift
	 * @param {int} num
	 * @param {int} n
	 */
	bitShiftL(num, n) {
		return num << n;
	},
	/**
	 * bitwise right shift
	 * @param {int} num
	 * @param {int} n
	 * @return {int}
	 */
	bitShiftR(num, n) {
		return num >> n;
	},
	/**
	 * bitwise right shift unsigned
	 * @param {int} num
	 * @param {int} n
	 * @return {int}
	 */
	bitShiftRU(num, n) {
		return num >>> n;
	},
	/**
	 * bit and
	 * @param {int} n1
	 * @param {int} n2
	 * @return {int}
	 */
	bitAnd(n1, n2) {
		return n1 & n2;
	},
	/**
	 * bit or
	 * @param {int} n1
	 * @param {int} n2
	 * @return {int}
	 */
	bitOr(n1, n2) {
		return n1 | n2;
	},
	/**
	 * tinyColor has quite a performance issue when doing a big loop
	 * @param {Array|String|Color} color
	 * @return {Number[]} the RGB values
	 */
	getRGB(color = [0, 0, 0]) {
		if (Array.isArray(color)) {
			const [r = 0, g = 0, b = 0] = color;
			return [r, g, b];
		}
		
		const {r, g, b} = tinyColor(color).toRgb();
		return [r, g, b];
	}
	
};