import JPEG from "jpeg-js";

/**
 * convert bitmap object's data (which is image data buffer) back into file data buffer - so that it can be saved
 * @param {Object} bitmap
 * @param {Number} [quality=100]
 */
export default (bitmap, quality = 100) => JPEG.encode(bitmap, quality).data;