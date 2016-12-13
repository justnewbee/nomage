import {PNG} from "pngjs";

/**
 * 
 * @param {Buffer} buffer
 */
export default buffer => {
	const {width, height, data} = PNG.sync.read(buffer); // the original one has other info
	
	return {width, height, data};
};