// JavaScript Image Resizer (c) 2012 - Grant Galitz
// Released to public domain 29 July 2013: https://github.com/grantgalitz/JS-Image-Resizer/issues/4

function generateFloatBuffer(bufferLength) {
	try {
		return new Float32Array(bufferLength);
	} catch (error) {
		return [];
	}
}
function generateFloat64Buffer(bufferLength) {
	try {
		return new Float64Array(bufferLength);
	} catch (error) {
		return [];
	}
}
function generateUint8Buffer(bufferLength) {
	try {
		return new Uint8Array(bufferLength);
	} catch (error) {
		return [];
	}
}

function resizeWidthInterpolated(buffer, sizing) {
	const {width, height, widthRatio, widthBy4, toWidthBy4} = sizing;
	const widthPassResultSize = toWidthBy4 * height;
	const outputBuffer = generateFloatBuffer(widthPassResultSize);
	
	let weight = 0;
	let finalOffset = 0;
	let pixelOffset = 0;
	let firstWeight = 0;
	let secondWeight = 0;
	let targetPosition;
	let interpolationWidthSourceReadStop;
	
	// handle for only one interpolation input being valid for start calculation
	for (targetPosition = 0; weight < 1 / 3; targetPosition += 4, weight += widthRatio) {
		for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < widthPassResultSize; pixelOffset += widthBy4, finalOffset += toWidthBy4) {
			outputBuffer[finalOffset] = buffer[pixelOffset];
			outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
			outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
			outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
		}
	}
	// adjust for overshoot of the last pass's counter
	weight -= 1 / 3;
	
	for (interpolationWidthSourceReadStop = width - 1; weight < interpolationWidthSourceReadStop; targetPosition += 4, weight += widthRatio) {
		// calculate weightings
		secondWeight = weight % 1;
		firstWeight = 1 - secondWeight;
		// interpolate
		for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * 4; finalOffset < widthPassResultSize; pixelOffset += widthBy4, finalOffset += toWidthBy4) {
			outputBuffer[finalOffset] = buffer[pixelOffset] * firstWeight + buffer[pixelOffset + 4] * secondWeight;
			outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1] * firstWeight + buffer[pixelOffset + 5] * secondWeight;
			outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2] * firstWeight + buffer[pixelOffset + 6] * secondWeight;
			outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3] * firstWeight + buffer[pixelOffset + 7] * secondWeight;
		}
	}
	// handle for only one interpolation input being valid for end calculation:
	for (interpolationWidthSourceReadStop = widthBy4 - 4; targetPosition < toWidthBy4; targetPosition += 4) {
		for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < widthPassResultSize; pixelOffset += widthBy4, finalOffset += toWidthBy4) {
			outputBuffer[finalOffset] = buffer[pixelOffset];
			outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
			outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
			outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
		}
	}
	
	return outputBuffer;
}

function resizeWidthRGB(buffer, sizing) {
	const {height, widthRatio, widthBy4, toWidthBy4} = sizing;
	const output = generateFloatBuffer(height * 4);
	const outputBuffer = generateFloatBuffer(toWidthBy4 * height);
	const trustworthyColorsCount = generateFloat64Buffer(height);
	const nextLineOffset = widthBy4 - 3;
	const nextLineOffset2 = toWidthBy4 - 3;
	
	let weight = 0;
	let amountToNext = 0;
	let actualPosition = 0;
	let currentPosition = 0;
	let line = 0;
	let pixelOffset = 0;
	let outputOffset = 0;
	let multiplier = 1;
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 0;
	
	do {
		for (line = 0; line < height * 4; ) {
			output[line++] = 0;
			output[line++] = 0;
			output[line++] = 0;
			output[line++] = 0;
			trustworthyColorsCount[line / 4 - 1] = 0;
		}
		
		weight = widthRatio;
		
		do {
			amountToNext = 1 + actualPosition - currentPosition;
			multiplier = Math.min(weight, amountToNext);
			
			for (line = 0, pixelOffset = actualPosition; line < height * 4; pixelOffset += nextLineOffset) {
				r = buffer[pixelOffset];
				g = buffer[++pixelOffset];
				b = buffer[++pixelOffset];
				a = buffer[++pixelOffset];
				
				// ignore RGB values if pixel is completely transparent
				
				output[line++] += (a ? r : 0) * multiplier;
				output[line++] += (a ? g : 0) * multiplier;
				output[line++] += (a ? b : 0) * multiplier;
				output[line++] += a * multiplier;
				
				trustworthyColorsCount[line / 4 - 1] += a ? multiplier : 0;
			}
			if (weight >= amountToNext) {
				currentPosition = actualPosition = actualPosition + 4;
				weight -= amountToNext;
			} else {
				currentPosition += weight;
				break;
			}
		} while (weight > 0 && actualPosition < widthBy4);
		
		for (line = 0, pixelOffset = outputOffset; line < height * 4; pixelOffset += nextLineOffset2) {
			weight = trustworthyColorsCount[line / 4];
			multiplier = weight ? 1 / weight : 0;
			outputBuffer[pixelOffset] = output[line++] * multiplier;
			outputBuffer[++pixelOffset] = output[line++] * multiplier;
			outputBuffer[++pixelOffset] = output[line++] * multiplier;
			outputBuffer[++pixelOffset] = output[line++] / widthRatio;
		}
		outputOffset += 4;
	} while (outputOffset < toWidthBy4);
	
	return outputBuffer;
}
function resizeHeightRGB(buffer, sizing) {
	const {height, toWidth, heightRatio, toWidthBy4, finalResultSize} = sizing;
	const widthPassResultSize = toWidthBy4 * height;
	const outputBuffer = generateUint8Buffer(finalResultSize);
	const output = generateFloatBuffer(toWidthBy4);
	const trustworthyColorsCount = generateFloat64Buffer(toWidth);
	
	let weight = 0;
	let amountToNext = 0;
	let actualPosition = 0;
	let currentPosition = 0;
	let pixelOffset = 0;
	let outputOffset = 0;
	let caret = 0;
	let multiplier = 1;
	let r = 0;
	let g = 0;
	let b = 0;
	let a = 0;
	
	do {
		for (pixelOffset = 0; pixelOffset < toWidthBy4;) {
			output[pixelOffset++] = 0;
			output[pixelOffset++] = 0;
			output[pixelOffset++] = 0;
			output[pixelOffset++] = 0;
			trustworthyColorsCount[pixelOffset / 4 - 1] = 0;
		}
		
		weight = heightRatio;
		
		do {
			amountToNext = 1 + actualPosition - currentPosition;
			multiplier = Math.min(weight, amountToNext);
			caret = actualPosition;
			for (pixelOffset = 0; pixelOffset < toWidthBy4; ) {
				r = buffer[caret++];
				g = buffer[caret++];
				b = buffer[caret++];
				a = buffer[caret++];
				// ignore RGB values if pixel is completely transparent
				output[pixelOffset++] += (a ? r : 0) * multiplier;
				output[pixelOffset++] += (a ? g : 0) * multiplier;
				output[pixelOffset++] += (a ? b : 0) * multiplier;
				output[pixelOffset++] += a * multiplier;
				trustworthyColorsCount[pixelOffset / 4 - 1] += a ? multiplier : 0;
			}
			if (weight >= amountToNext) {
				currentPosition = actualPosition = caret;
				weight -= amountToNext;
			} else {
				currentPosition += weight;
				break;
			}
		} while (weight > 0 && actualPosition < widthPassResultSize);
		
		for (pixelOffset = 0; pixelOffset < toWidthBy4; ) {
			weight = trustworthyColorsCount[pixelOffset / 4];
			multiplier = weight ? 1 / weight : 0;
			outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
			outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
			outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
			outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] / heightRatio);
		}
	} while (outputOffset < finalResultSize);
	
	return outputBuffer;
}
function resizeHeightInterpolated(buffer, sizing) {
	const {height, heightRatio, toWidthBy4, finalResultSize} = sizing;
	const outputBuffer = generateUint8Buffer(finalResultSize);
	
	let weight = 0;
	let finalOffset = 0;
	let pixelOffset = 0;
	let pixelOffsetAccumulated = 0;
	let pixelOffsetAccumulated2 = 0;
	let firstWeight = 0;
	let secondWeight = 0;
	let interpolationHeightSourceReadStop;
	
	// handle for only one interpolation input being valid for start calculation:
	for (; weight < 1 / 3; weight += heightRatio) {
		for (pixelOffset = 0; pixelOffset < toWidthBy4; ) {
			outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
		}
	}
	// adjust for overshoot of the last pass's counter:
	weight -= 1 / 3;
	
	for (interpolationHeightSourceReadStop = height - 1; weight < interpolationHeightSourceReadStop; weight += heightRatio) {
		// calculate weightings
		secondWeight = weight % 1;
		firstWeight = 1 - secondWeight;
		// interpolate
		pixelOffsetAccumulated = Math.floor(weight) * toWidthBy4;
		pixelOffsetAccumulated2 = pixelOffsetAccumulated + toWidthBy4;
		
		for (pixelOffset = 0; pixelOffset < toWidthBy4; ++pixelOffset) {
			outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++] * firstWeight + buffer[pixelOffsetAccumulated2++] * secondWeight);
		}
	}
	// handle for only one interpolation input being valid for end calculation:
	while (finalOffset < finalResultSize) {
		for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * toWidthBy4; pixelOffset < toWidthBy4; ++pixelOffset) {
			outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
		}
	}
	
	return outputBuffer;
}

/**
 * resize the image
 * @param {Number|String} toWidth absolute size if number, string as `33.4%` for percentage
 * @param {Number|String} [toHeight] if not provided it will be the same ratio as width
 */
export default function(toWidth, toHeight) {
	const {width, height, _bitmap: bitmap} = this;
	
	if (/\d+(\.\d+)?%/.test(toWidth)) {
		toWidth = Math.round(parseFloat(toWidth) * width / 100);
	} else {
		toWidth = Math.round(toWidth);
	}
	
	if (toHeight) {
		if (/\d+(\.\d+)?%/.test(toHeight)) {
			toHeight = Math.round(parseFloat(toHeight) * width / 100);
		} else {
			toHeight = Math.round(toHeight);
		}
	} else {
		toHeight = Math.round(height * toWidth / width);
	}
	
	if (!toWidth || !toHeight) {
		return this;
	}
	
	const widthRatio = width / toWidth;
	const heightRatio = height / toHeight;
	
	if (widthRatio === 1 && heightRatio === 1) {
		return this;
	}
	
	const sizing = {
		width,
		height,
		toWidth,
		toHeight,
		// the value belows will be used repeatedly to save time
		widthRatio,
		heightRatio,
		widthBy4: width * 4,
		toWidthBy4: toWidth * 4,
		heightBy4: height * 4,
		toHeightBy4: toHeight * 4,
		finalResultSize: toWidth * toHeight * 4
	};
	let buffer = bitmap.data;
	
	if (widthRatio > 1) {
		buffer = resizeWidthRGB(buffer, sizing);
	} else if (widthRatio < 1) { // && interpolationPass
		buffer = resizeWidthInterpolated(buffer, sizing);
	} // else == 1 ignore 
	
	if (heightRatio > 1) {
		buffer = resizeHeightRGB(buffer, sizing);
	} else if (heightRatio < 1) { //  && interpolationPass
		buffer = resizeHeightInterpolated(buffer, sizing);
	} // else === 1 ignore
	
	bitmap.data = new Buffer(buffer);
	bitmap.width = toWidth;
	bitmap.height = toHeight;
	
	return this;
}