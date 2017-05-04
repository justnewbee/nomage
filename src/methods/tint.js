/**
 * tint
 * you can give an optional range
 * @param {Number} percentage
 * @param {int} [x1]
 * @param {int} [y1]
 * @param {int} [x2]
 * @param {int} [y2]
 */
export default function(percentage, x1, y1, x2, y2) {
	return this.mix([255, 255, 255], percentage, x1, y1, x2, y2);
}