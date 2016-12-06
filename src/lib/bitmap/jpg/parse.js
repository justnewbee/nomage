import decode from "./decode";

import JPEG from "jpeg-js";

/**
 * 
 * @param {Buffer} buffer
 */
export default buffer => JPEG.decode(buffer);