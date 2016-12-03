/**
 * convert stream into a buffer
 * @param {Stream} stream
 * @return {Promise.<Buffer>}
 */
export default stream => new Promise((resolve, reject) => {
	var arr = [];
	
	function onData(doc) {
		arr.push(doc);
	}
	
	function onEnd() {
		resolve(Buffer.concat(arr));
		cleanup();
	}
	
	function cleanup() {
		arr = null;
		
		stream.removeListener("data", onData);
		stream.removeListener("end", onEnd);
		stream.removeListener("error", reject);
		stream.removeListener("error", cleanup);
		stream.removeListener("close", cleanup);
	}
	
	stream.on("data", onData);
	stream.once("end", onEnd);
	stream.once("error", reject);
	stream.once("error", cleanup);
	stream.once("close", cleanup);
});