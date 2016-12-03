export default {
	// supported mime types
	MIME: {
		PNG: "image/png",
		JPEG: "image/jpeg",
		BMP: "image/bmp",
		GIF: "image/gif" // 未支持
	},
	
	// PNG filter types
	PNG_FILTER_AUTO: -1,
	PNG_FILTER_NONE: 0,
	PNG_FILTER_SUB: 1,
	PNG_FILTER_UP: 2,
	PNG_FILTER_AVERAGE: 3,
	PNG_FILTER_PAETH: 4,
	
	RESIZE_NEAREST_NEIGHBOR: "nearestNeighbor",
	RESIZE_BILINEAR: "bilinearInterpolation",
	RESIZE_BICUBIC: "bicubicInterpolation",
	RESIZE_HERMITE: "hermiteInterpolation",
	RESIZE_BEZIER: "bezierInterpolation",
	
	// Align modes for cover, contain, bit masks
	HORIZONTAL_ALIGN_LEFT: 1,
	HORIZONTAL_ALIGN_CENTER: 2,
	HORIZONTAL_ALIGN_RIGHT: 4,
	
	VERTICAL_ALIGN_TOP: 8,
	VERTICAL_ALIGN_MIDDLE: 16,
	VERTICAL_ALIGN_BOTTOM: 32
};