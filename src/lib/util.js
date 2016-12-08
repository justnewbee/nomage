export default {
	/**
	 * 
	 * @param {Object} o
	 * @param {Function} fn
	 */
	each(o, fn) {
		for (let k in o) {
			if (o.hasOwnProperty(k)) {
				fn(o[k], k);
			}
		}
	},
	/**
	 * bitwise left shift
	 * @param {Integer} num
	 * @param {Integer} n
	 */
	bitShiftL(num, n) {
		return num << n;
	},
	/**
	 * bitwise right shift
	 * @param {Integer} num
	 * @param {Integer} n
	 * @return {Integer}
	 */
	bitShiftR(num, n) {
		return num >> n;
	},
	/**
	 * bitwise right shift unsigned
	 * @param {Integer} num
	 * @param {Integer} n
	 * @return {Integer}
	 */
	bitShiftRU(num, n) {
		return num >>> n;
	},
	/**
	 * bit and
	 * @param {Integer} n1
	 * @param {Integer} n2
	 * @return {Integer}
	 */
	bitAnd(n1, n2) {
		return n1 & n2;
	},
	/**
	 * bit or
	 * @param {Integer} n1
	 * @param {Integer} n2
	 * @return {Integer}
	 */
	bitOr(n1, n2) {
		return n1 | n2;
	}
};