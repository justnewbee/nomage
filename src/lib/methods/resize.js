// JavaScript Image Resizer (c) 2012 - Grant Galitz
// Released to public domain 29 July 2013: https://github.com/grantgalitz/JS-Image-Resizer/issues/4

function bypassResizer(buffer) {
	// just return the buffer passsed:
	return buffer;
}
function generateFloatBuffer(bufferLength) {
	// generate a float32 typed array buffer:
	try {
		return new Float32Array(bufferLength);
	} catch (error) {
		return [];
	}
}
function generateFloat64Buffer(bufferLength) {
	// generate a float64 typed array buffer:
	try {
		return new Float64Array(bufferLength);
	} catch (error) {
		return [];
	}
}
function generateUint8Buffer(bufferLength) {
	// Generate a uint8 typed array buffer:
	try {
		return new Uint8Array(bufferLength);
	} catch (error) {
		return [];
	}
}

class Resize {
	constructor(buffer, widthOriginal, heightOriginal, targetWidth, targetHeight, blendAlpha, interpolationPass) {
		this.widthOriginal = Math.abs(parseInt(widthOriginal) || 0);
		this.heightOriginal = Math.abs(parseInt(heightOriginal) || 0);
		this.targetWidth = Math.abs(parseInt(targetWidth) || 0);
		this.targetHeight = Math.abs(parseInt(targetHeight) || 0);
		this.colorChannels = !!blendAlpha ? 4 : 3;
		this.interpolationPass = !!interpolationPass;
		
		this.targetWidthMultipliedByChannels = this.targetWidth * this.colorChannels;
		this.originalWidthMultipliedByChannels = this.widthOriginal * this.colorChannels;
		this.originalHeightMultipliedByChannels = this.heightOriginal * this.colorChannels;
		this.widthPassResultSize = this.targetWidthMultipliedByChannels * this.heightOriginal;
		this.finalResultSize = this.targetWidthMultipliedByChannels * this.targetHeight;
		
		if (this.widthOriginal !== this.targetWidth) {
			this.ratioWeightWidthPass = this.widthOriginal / this.targetWidth;
			if (this.ratioWeightWidthPass < 1 && this.interpolationPass) {
				this.initializeFirstPassBuffers(true);
				this.resizeWidth = this.colorChannels == 4 ? this.resizeWidthInterpolatedRGBA : this.resizeWidthInterpolatedRGB;
			} else {
				this.initializeFirstPassBuffers(false);
				this.resizeWidth = this.colorChannels == 4 ? this.resizeWidthRGBA : this.resizeWidthRGB;
			}
			
			buffer = this.resizeWidth(buffer);
		}
		
		if (this.heightOriginal !== this.targetHeight) {
			this.ratioWeightHeightPass = this.heightOriginal / this.targetHeight;
			if (this.ratioWeightHeightPass < 1 && this.interpolationPass) {
				this.initializeSecondPassBuffers(true);
				this.resizeHeight = this.resizeHeightInterpolated;
			} else {
				this.initializeSecondPassBuffers(false);
				this.resizeHeight = this.colorChannels == 4 ? this.resizeHeightRGBA : this.resizeHeightRGB;
			}
			
			buffer = this.resizeHeight(buffer);
		}
		
		this.FUCK = new Buffer(buffer);
	}
	
	_resizeWidthInterpolatedRGBChannels(buffer, fourthChannel) {
		let channelsNum = fourthChannel ? 4 : 3;
		let ratioWeight = this.ratioWeightWidthPass;
		let weight = 0;
		let finalOffset = 0;
		let pixelOffset = 0;
		let firstWeight = 0;
		let secondWeight = 0;
		let outputBuffer = this.widthBuffer;
		let targetPosition;
		let interpolationWidthSourceReadStop;
		
		// Handle for only one interpolation input being valid for start calculation:
		for (targetPosition = 0; weight < 1 / 3; targetPosition += channelsNum, weight += ratioWeight) {
			for (finalOffset = targetPosition, pixelOffset = 0; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = buffer[pixelOffset];
				outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
				outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
				if (!fourthChannel) {
					continue;
				}
				outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
			}
		}
		// Adjust for overshoot of the last pass's counter:
		weight -= 1 / 3;
		for (interpolationWidthSourceReadStop = this.widthOriginal - 1; weight < interpolationWidthSourceReadStop; targetPosition += channelsNum, weight += ratioWeight) {
			// Calculate weightings:
			secondWeight = weight % 1;
			firstWeight = 1 - secondWeight;
			// Interpolate:
			for (finalOffset = targetPosition, pixelOffset = Math.floor(weight) * channelsNum; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = buffer[pixelOffset] * firstWeight + buffer[pixelOffset + channelsNum] * secondWeight;
				outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1] * firstWeight + buffer[pixelOffset + channelsNum + 1] * secondWeight;
				outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2] * firstWeight + buffer[pixelOffset + channelsNum + 2] * secondWeight;
				if (!fourthChannel) {
					continue;
				}
				outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3] * firstWeight + buffer[pixelOffset + channelsNum + 3] * secondWeight;
			}
		}
		// Handle for only one interpolation input being valid for end calculation:
		for (interpolationWidthSourceReadStop = this.originalWidthMultipliedByChannels - channelsNum; targetPosition < this.targetWidthMultipliedByChannels; targetPosition += channelsNum) {
			for (finalOffset = targetPosition, pixelOffset = interpolationWidthSourceReadStop; finalOffset < this.widthPassResultSize; pixelOffset += this.originalWidthMultipliedByChannels, finalOffset += this.targetWidthMultipliedByChannels) {
				outputBuffer[finalOffset] = buffer[pixelOffset];
				outputBuffer[finalOffset + 1] = buffer[pixelOffset + 1];
				outputBuffer[finalOffset + 2] = buffer[pixelOffset + 2];
				if (!fourthChannel) {
					continue;
				}
				outputBuffer[finalOffset + 3] = buffer[pixelOffset + 3];
			}
		}
		return outputBuffer;
	}
	
	_resizeWidthRGBChannels(buffer, fourthChannel) {
		let channelsNum = fourthChannel ? 4 : 3;
		let ratioWeight = this.ratioWeightWidthPass;
		let ratioWeightDivisor = 1 / ratioWeight;
		let weight = 0;
		let amountToNext = 0;
		let actualPosition = 0;
		let currentPosition = 0;
		let line = 0;
		let pixelOffset = 0;
		let outputOffset = 0;
		let nextLineOffsetOriginalWidth = this.originalWidthMultipliedByChannels - channelsNum + 1;
		let nextLineOffsetTargetWidth = this.targetWidthMultipliedByChannels - channelsNum + 1;
		let output = this.outputWidthWorkBench;
		let outputBuffer = this.widthBuffer;
		let trustworthyColorsCount = this.outputWidthWorkBenchOpaquePixelsCount;
		let multiplier = 1;
		let r = 0;
		let g = 0;
		let b = 0;
		let a = 0;
		
		do {
			for (line = 0; line < this.originalHeightMultipliedByChannels;) {
				output[line++] = 0;
				output[line++] = 0;
				output[line++] = 0;
				if (!fourthChannel) {
					continue;
				}
				output[line++] = 0;
				trustworthyColorsCount[line / channelsNum - 1] = 0;
			}
			weight = ratioWeight;
			do {
				amountToNext = 1 + actualPosition - currentPosition;
				multiplier = Math.min(weight, amountToNext);
				for (line = 0, pixelOffset = actualPosition; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetOriginalWidth) {
					r = buffer[pixelOffset];
					g = buffer[++pixelOffset];
					b = buffer[++pixelOffset];
					a = fourthChannel ? buffer[++pixelOffset] : 255;
					// Ignore RGB values if pixel is completely transparent
					output[line++] += (a ? r : 0) * multiplier;
					output[line++] += (a ? g : 0) * multiplier;
					output[line++] += (a ? b : 0) * multiplier;
					
					if (!fourthChannel) {
						continue;
					}
					output[line++] += a * multiplier;
					trustworthyColorsCount[line / channelsNum - 1] += a ? multiplier : 0;
				}
				if (weight >= amountToNext) {
					currentPosition = actualPosition = actualPosition + channelsNum;
					weight -= amountToNext;
				} else {
					currentPosition += weight;
					break;
				}
			} while (weight > 0 && actualPosition < this.originalWidthMultipliedByChannels);
			for (line = 0, pixelOffset = outputOffset; line < this.originalHeightMultipliedByChannels; pixelOffset += nextLineOffsetTargetWidth) {
				weight = fourthChannel ? trustworthyColorsCount[line / channelsNum] : 1;
				multiplier = fourthChannel ? weight ? 1 / weight : 0 : ratioWeightDivisor;
				outputBuffer[pixelOffset] = output[line++] * multiplier;
				outputBuffer[++pixelOffset] = output[line++] * multiplier;
				outputBuffer[++pixelOffset] = output[line++] * multiplier;
				if (!fourthChannel) {
					continue;
				}
				outputBuffer[++pixelOffset] = output[line++] * ratioWeightDivisor;
			}
			outputOffset += channelsNum;
		} while (outputOffset < this.targetWidthMultipliedByChannels);
		
		return outputBuffer;
	}
	_resizeHeightRGBChannels(buffer, fourthChannel) {
		let ratioWeight = this.ratioWeightHeightPass;
		let ratioWeightDivisor = 1 / ratioWeight;
		let weight = 0;
		let amountToNext = 0;
		let actualPosition = 0;
		let currentPosition = 0;
		let pixelOffset = 0;
		let outputOffset = 0;
		let output = this.outputHeightWorkBench;
		let outputBuffer = this.heightBuffer;
		let trustworthyColorsCount = this.outputHeightWorkBenchOpaquePixelsCount;
		let caret = 0;
		let multiplier = 1;
		let r = 0;
		let g = 0;
		let b = 0;
		let a = 0;
		
		do {
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				output[pixelOffset++] = 0;
				output[pixelOffset++] = 0;
				output[pixelOffset++] = 0;
				if (!fourthChannel) {
					continue;
				}
				output[pixelOffset++] = 0;
				trustworthyColorsCount[pixelOffset / 4 - 1] = 0;
			}
			weight = ratioWeight;
			do {
				amountToNext = 1 + actualPosition - currentPosition;
				multiplier = Math.min(weight, amountToNext);
				caret = actualPosition;
				for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
					r = buffer[caret++];
					g = buffer[caret++];
					b = buffer[caret++];
					a = fourthChannel ? buffer[caret++] : 255;
					// Ignore RGB values if pixel is completely transparent
					output[pixelOffset++] += (a ? r : 0) * multiplier;
					output[pixelOffset++] += (a ? g : 0) * multiplier;
					output[pixelOffset++] += (a ? b : 0) * multiplier;
					if (!fourthChannel) {
						continue;
					}
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
			} while (weight > 0 && actualPosition < this.widthPassResultSize);
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				weight = fourthChannel ? trustworthyColorsCount[pixelOffset / 4] : 1;
				multiplier = fourthChannel ? weight ? 1 / weight : 0 : ratioWeightDivisor;
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * multiplier);
				if (!fourthChannel) {
					continue;
				}
				outputBuffer[outputOffset++] = Math.round(output[pixelOffset++] * ratioWeightDivisor);
			}
		} while (outputOffset < this.finalResultSize);
		
		return outputBuffer;
	}
	
	resizeWidthInterpolatedRGB(buffer) {
		return this._resizeWidthInterpolatedRGBChannels(buffer, false);
	}
	
	resizeWidthInterpolatedRGBA(buffer) {
		return this._resizeWidthInterpolatedRGBChannels(buffer, true);
	}
	
	resizeWidthRGB(buffer) {
		return this._resizeWidthRGBChannels(buffer, false);
	}
	
	resizeWidthRGBA(buffer) {
		return this._resizeWidthRGBChannels(buffer, true);
	}
	
	resizeHeightInterpolated(buffer) {
		let ratioWeight = this.ratioWeightHeightPass;
		let weight = 0;
		let finalOffset = 0;
		let pixelOffset = 0;
		let pixelOffsetAccumulated = 0;
		let pixelOffsetAccumulated2 = 0;
		let firstWeight = 0;
		let secondWeight = 0;
		let outputBuffer = this.heightBuffer;
		let interpolationHeightSourceReadStop;
		
		// Handle for only one interpolation input being valid for start calculation:
		for (; weight < 1 / 3; weight += ratioWeight) {
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels;) {
				outputBuffer[finalOffset++] = Math.round(buffer[pixelOffset++]);
			}
		}
		// Adjust for overshoot of the last pass's counter:
		weight -= 1 / 3;
		for (interpolationHeightSourceReadStop = this.heightOriginal - 1; weight < interpolationHeightSourceReadStop; weight += ratioWeight) {
			// Calculate weightings:
			secondWeight = weight % 1;
			firstWeight = 1 - secondWeight;
			// Interpolate:
			pixelOffsetAccumulated = Math.floor(weight) * this.targetWidthMultipliedByChannels;
			pixelOffsetAccumulated2 = pixelOffsetAccumulated + this.targetWidthMultipliedByChannels;
			for (pixelOffset = 0; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
				outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++] * firstWeight + buffer[pixelOffsetAccumulated2++] * secondWeight);
			}
		}
		// Handle for only one interpolation input being valid for end calculation:
		while (finalOffset < this.finalResultSize) {
			for (pixelOffset = 0, pixelOffsetAccumulated = interpolationHeightSourceReadStop * this.targetWidthMultipliedByChannels; pixelOffset < this.targetWidthMultipliedByChannels; ++pixelOffset) {
				outputBuffer[finalOffset++] = Math.round(buffer[pixelOffsetAccumulated++]);
			}
		}
		return outputBuffer;
	}
	
	resizeHeightRGB(buffer) {
		return this._resizeHeightRGBChannels(buffer, false);
	}
	
	resizeHeightRGBA(buffer) {
		return this._resizeHeightRGBChannels(buffer, true);
	}
	
	initializeFirstPassBuffers(BILINEARAlgo) {
		// initialize the internal width pass buffers:
		this.widthBuffer = generateFloatBuffer(this.widthPassResultSize);
		
		if (!BILINEARAlgo) {
			this.outputWidthWorkBench = generateFloatBuffer(this.originalHeightMultipliedByChannels);
			if (this.colorChannels > 3) {
				this.outputWidthWorkBenchOpaquePixelsCount = generateFloat64Buffer(this.heightOriginal);
			}
		}
	}
	
	initializeSecondPassBuffers(BILINEARAlgo) {
		this.heightBuffer = generateUint8Buffer(this.finalResultSize);
		
		if (!BILINEARAlgo) {
			this.outputHeightWorkBench = generateFloatBuffer(this.targetWidthMultipliedByChannels);
			if (this.colorChannels > 3) {
				this.outputHeightWorkBenchOpaquePixelsCount = generateFloat64Buffer(this.targetWidth);
			}
		}
	}
}







/**
 * 
 * @param {Number|String} w absolute size if number, string as `33.4%` for percentage
 * @param {Number|String} [h] if not provided it will be the same ratio as width
 */
export default function(w, h) {
	let {width, height, _bitmap: bitmap} = this;
	
	if (/\d+(\.\d+)?%/.test(w)) {
		w = Math.round(parseFloat(w) * width / 100);
	} else {
		w = Math.round(w);
	}
	
	if (h) {
		if (/\d+(\.\d+)?%/.test(h)) {
			h = Math.round(parseFloat(h) * width / 100);
		} else {
			h = Math.round(h);
		}
	} else {
		h = Math.round(height * w / width);
	}
	
	if (!w || !h) {
		return this;
	}
	
	bitmap.data = new Resize(bitmap.data, width, height, w, h, true, true).FUCK;
	bitmap.width = w;
	bitmap.height = h;
	
	return this;
};