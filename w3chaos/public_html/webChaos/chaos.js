var initialized = "";
var timestamp = 0;
var firsttimestamp=0;
var points = new Array();
var onswitched=0;
var maxarray=600;
var npoints=0;
var refreshInterval=0;
var request_prefix = "http://localhost:8081/CU?dev="; //"/cgi-bin/cu.cgi?"
var internal_param=new Array();
var excludeInterface=["oldtimestamp","dostate","firsttimestamp","ndk_uid","dev_state","dpck_ds_type","dpck_ats","updating"];
///////
var compatibility = {
	// NodeJS Buffer in v0.5.5 and newer
	NodeBuffer: NODE && 'Buffer' in global,
	DataView: 'DataView' in global,
	ArrayBuffer: 'ArrayBuffer' in global,
	PixelData: BROWSER && 'CanvasPixelArray' in global && !('Uint8ClampedArray' in global) && 'document' in global
};

var TextEncoder = global.TextEncoder;
var TextDecoder = global.TextDecoder;

// we don't want to bother with old Buffer implementation
if (NODE && compatibility.NodeBuffer) {
	(function (buffer) {
		try {
			buffer.writeFloatLE(Infinity, 0);
		} catch (e) {
			compatibility.NodeBuffer = false;
		}
	})(new Buffer(4));
}

if (BROWSER && compatibility.PixelData) {
	var context2d = document.createElement('canvas').getContext('2d');
	var createPixelData = function (byteLength, buffer) {
		var data = context2d.createImageData((byteLength + 3) / 4, 1).data;
		data.byteLength = byteLength;
		if (buffer !== undefined) {
			for (var i = 0; i < byteLength; i++) {
				data[i] = buffer[i];
			}
		}
		return data;
	};
}

var dataTypes = {
	'Int8': 1,
	'Int16': 2,
	'Int32': 4,
	'Uint8': 1,
	'Uint16': 2,
	'Uint32': 4,
	'Float32': 4,
	'Float64': 8
};

function is(obj, Ctor) {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}
	return obj.constructor === Ctor || Object.prototype.toString.call(obj) === '[object ' + Ctor.name + ']';
}

function arrayFrom(arrayLike, forceCopy) {
	return (!forceCopy && is(arrayLike, Array)) ? arrayLike : Array.prototype.slice.call(arrayLike);
}

function defined(value, defaultValue) {
	return value !== undefined ? value : defaultValue;
}

function jDataView(buffer, byteOffset, byteLength, littleEndian) {
	/* jshint validthis:true */

	if (jDataView.is(buffer)) {
		var result = buffer.slice(byteOffset, byteOffset + byteLength);
		result._littleEndian = defined(littleEndian, result._littleEndian);
		return result;
	}

	if (!jDataView.is(this)) {
		return new jDataView(buffer, byteOffset, byteLength, littleEndian);
	}

	this.buffer = buffer = jDataView.wrapBuffer(buffer);

	// Check parameters and existing functionnalities
	this._isArrayBuffer = compatibility.ArrayBuffer && is(buffer, ArrayBuffer);
	this._isPixelData = BROWSER && compatibility.PixelData && is(buffer, CanvasPixelArray);
	this._isDataView = compatibility.DataView && this._isArrayBuffer;
	this._isNodeBuffer = NODE && compatibility.NodeBuffer && Buffer.isBuffer(buffer);

	// Handle Type Errors
	if (!(NODE && this._isNodeBuffer) && !this._isArrayBuffer && !(BROWSER && this._isPixelData) && !is(buffer, Array)) {
		throw new TypeError('jDataView buffer has an incompatible type');
	}

	// Default Values
	this._littleEndian = !!littleEndian;

	var bufferLength = 'byteLength' in buffer ? buffer.byteLength : buffer.length;
	this.byteOffset = byteOffset = defined(byteOffset, 0);
	this.byteLength = byteLength = defined(byteLength, bufferLength - byteOffset);

	this._offset = this._bitOffset = 0;

	if (!this._isDataView) {
		this._checkBounds(byteOffset, byteLength, bufferLength);
	} else {
		this._view = new DataView(buffer, byteOffset, byteLength);
	}

	// Create uniform methods (action wrappers) for the following data types

	this._engineAction =
		this._isDataView
			? this._dataViewAction
		: (NODE && this._isNodeBuffer)
			? this._nodeBufferAction
		: this._isArrayBuffer
			? this._arrayBufferAction
		: this._arrayAction;
}

function getCharCodes(string) {
	if (NODE && compatibility.NodeBuffer) {
		return new Buffer(string, 'binary');
	}

	var Type = compatibility.ArrayBuffer ? Uint8Array : Array,
		codes = new Type(string.length);

	for (var i = 0, length = string.length; i < length; i++) {
		codes[i] = string.charCodeAt(i) & 0xff;
	}
	return codes;
}

// mostly internal function for wrapping any supported input (String or Array-like) to best suitable buffer format
jDataView.wrapBuffer = function (buffer) {
	switch (typeof buffer) {
		case 'number':
			if (NODE && compatibility.NodeBuffer) {
				buffer = new Buffer(buffer);
				buffer.fill(0);
			} else
			if (compatibility.ArrayBuffer) {
				buffer = new Uint8Array(buffer).buffer;
			} else
			if (BROWSER && compatibility.PixelData) {
				buffer = createPixelData(buffer);
			} else {
				buffer = new Array(buffer);
				for (var i = 0; i < buffer.length; i++) {
					buffer[i] = 0;
				}
			}
			return buffer;

		case 'string':
			buffer = getCharCodes(buffer);
			/* falls through */
		default:
			if ('length' in buffer && !(
				(NODE && compatibility.NodeBuffer && Buffer.isBuffer(buffer)) ||
				(compatibility.ArrayBuffer && is(buffer, ArrayBuffer)) ||
				(BROWSER && compatibility.PixelData && is(buffer, CanvasPixelArray))
			)) {
				if (NODE && compatibility.NodeBuffer) {
					buffer = new Buffer(buffer);
				} else
				if (compatibility.ArrayBuffer) {
					if (!is(buffer, ArrayBuffer)) {
						buffer = new Uint8Array(buffer).buffer;
						// bug in Node.js <= 0.8:
						if (!is(buffer, ArrayBuffer)) {
							buffer = new Uint8Array(arrayFrom(buffer, true)).buffer;
						}
					}
				} else
				if (BROWSER && compatibility.PixelData) {
					buffer = createPixelData(buffer.length, buffer);
				} else {
					buffer = arrayFrom(buffer);
				}
			}
			return buffer;
	}
};

function pow2(n) {
	return (n >= 0 && n < 31) ? (1 << n) : (pow2[n] || (pow2[n] = Math.pow(2, n)));
}

jDataView.is = function (view) {
	return view && view.jDataView;
};

jDataView.from = function () {
	return new jDataView(arguments);
};

function Uint64(lo, hi) {
	this.lo = lo;
	this.hi = hi;
}

jDataView.Uint64 = Uint64;

Uint64.prototype.valueOf = function () {
	return this.lo + pow2(32) * this.hi;
};

Uint64.fromNumber = function (number) {
	var hi = Math.floor(number / pow2(32)),
		lo = number - hi * pow2(32);

	return new Uint64(lo, hi);
};

function Int64(lo, hi) {
	Uint64.apply(this, arguments);
}

jDataView.Int64 = Int64;

Int64.prototype = 'create' in Object ? Object.create(Uint64.prototype) : new Uint64();

Int64.prototype.valueOf = function () {
	if (this.hi < pow2(31)) {
		return Uint64.prototype.valueOf.apply(this, arguments);
	}
	return -((pow2(32) - this.lo) + pow2(32) * (pow2(32) - 1 - this.hi));
};

Int64.fromNumber = function (number) {
	var lo, hi;
	if (number >= 0) {
		var unsigned = Uint64.fromNumber(number);
		lo = unsigned.lo;
		hi = unsigned.hi;
	} else {
		hi = Math.floor(number / pow2(32));
		lo = number - hi * pow2(32);
		hi += pow2(32);
	}
	return new Int64(lo, hi);
};

// Helper functions for Uint64.prototype.toString

// e.g. 1234 -> [4, 3, 2, 1]
function numToDigits(num) {
	var digits = num.toString().split('');
	for (var i = 0; i < digits.length; i++) {
		digits[i] = +digits[i];
	}
	digits.reverse();
	return digits;
}

// Adds two digit arrays, returning the result.
function add(x, y) {
	var z = [];
	var n = Math.max(x.length, y.length);
	var carry = 0;
	var i = 0;
	while (i < n || carry) {
		var xi = i < x.length ? x[i] : 0;
		var yi = i < y.length ? y[i] : 0;
		var zi = carry + xi + yi;
		z.push(zi % 10);
		carry = Math.floor(zi / 10);
		i++;
	}
	return z;
}

// Precise versions of toString() for Int64/Uint64

Uint64.prototype.toString = function() {
	// Faster toString() for numbers which can be represented precisely as floats.
	if (this.hi < pow2(19)) {
		return Number.prototype.toString.apply(this.valueOf(), arguments);
	}

	// This converts the numbers to base 10 digit arrays for arbitrary precision toString().
	// See http://www.danvk.org/hex2dec.html


	// Compute result = 2^32 * hi + lo
	var hiArray = numToDigits(this.hi);
	var loArray = numToDigits(this.lo);
	for (var i = 0; i < 32; i++) {
		hiArray = add(hiArray, hiArray, 10);
	}
	var result = add(hiArray, loArray, 10);

	var str = '';
	for (i = result.length - 1; i >= 0; i--) {
		str += result[i];
	}
	return str;
};

Int64.prototype.toString = function() {
	if (this.hi < pow2(31)) {
		return Uint64.prototype.toString.apply(this, arguments);
	}
	if (this.hi > pow2(32) - 1 - pow2(19)) {
		return Number.prototype.toString.apply(this.valueOf(), arguments);
	}
	return '-' + new Uint64((pow2(32) - this.lo), (pow2(32) - 1 - this.hi)).toString();
};


var proto = jDataView.prototype = {
	compatibility: compatibility,
	jDataView: true,

	_checkBounds: function (byteOffset, byteLength, maxLength) {
		// Do additional checks to simulate DataView
		if (typeof byteOffset !== 'number') {
			throw new TypeError('Offset is not a number.');
		}
		if (typeof byteLength !== 'number') {
			throw new TypeError('Size is not a number.');
		}
		if (byteLength < 0) {
			throw new RangeError('Length is negative.');
		}
		if (byteOffset < 0 || byteOffset + byteLength > defined(maxLength, this.byteLength)) {
			throw new RangeError('Offsets are out of bounds.');
		}
	},

	_action: function (type, isReadAction, byteOffset, littleEndian, value) {
		return this._engineAction(
			type,
			isReadAction,
			defined(byteOffset, this._offset),
			defined(littleEndian, this._littleEndian),
			value
		);
	},

	_dataViewAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		// Move the internal offset forward
		this._offset = byteOffset + dataTypes[type];
		return isReadAction ? this._view['get' + type](byteOffset, littleEndian) : this._view['set' + type](byteOffset, value, littleEndian);
	},

	_arrayBufferAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		var size = dataTypes[type], TypedArray = global[type + 'Array'], typedArray;

		littleEndian = defined(littleEndian, this._littleEndian);

		// ArrayBuffer: we use a typed array of size 1 from original buffer if alignment is good and from slice when it's not
		if (size === 1 || ((this.byteOffset + byteOffset) % size === 0 && littleEndian)) {
			typedArray = new TypedArray(this.buffer, this.byteOffset + byteOffset, 1);
			this._offset = byteOffset + size;
			return isReadAction ? typedArray[0] : (typedArray[0] = value);
		} else {
			var bytes = new Uint8Array(isReadAction ? this.getBytes(size, byteOffset, littleEndian, true) : size);
			typedArray = new TypedArray(bytes.buffer, 0, 1);

			if (isReadAction) {
				return typedArray[0];
			} else {
				typedArray[0] = value;
				this._setBytes(byteOffset, bytes, littleEndian);
			}
		}
	},

	_arrayAction: function (type, isReadAction, byteOffset, littleEndian, value) {
		return isReadAction ? this['_get' + type](byteOffset, littleEndian) : this['_set' + type](byteOffset, value, littleEndian);
	},

	// Helpers

	_getBytes: function (length, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);
		length = defined(length, this.byteLength - byteOffset);

		this._checkBounds(byteOffset, length);

		byteOffset += this.byteOffset;

		this._offset = byteOffset - this.byteOffset + length;

		var result = (
			this._isArrayBuffer
			? new Uint8Array(this.buffer, byteOffset, length)
			: (this.buffer.slice || Array.prototype.slice).call(this.buffer, byteOffset, byteOffset + length)
		);

		return littleEndian || length <= 1 ? result : arrayFrom(result).reverse();
	},

	// wrapper for external calls (do not return inner buffer directly to prevent it's modifying)
	getBytes: function (length, byteOffset, littleEndian, toArray) {
		var result = this._getBytes(length, byteOffset, defined(littleEndian, true));
		return toArray ? arrayFrom(result) : result;
	},

	_setBytes: function (byteOffset, bytes, littleEndian) {
		var length = bytes.length;

		// needed for Opera
		if (length === 0) {
			return;
		}

		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		this._checkBounds(byteOffset, length);

		if (!littleEndian && length > 1) {
			bytes = arrayFrom(bytes, true).reverse();
		}

		byteOffset += this.byteOffset;

		if (this._isArrayBuffer) {
			new Uint8Array(this.buffer, byteOffset, length).set(bytes);
		}
		else {
			if (NODE && this._isNodeBuffer) {
				new Buffer(bytes).copy(this.buffer, byteOffset);
			} else {
				for (var i = 0; i < length; i++) {
					this.buffer[byteOffset + i] = bytes[i];
				}
			}
		}

		this._offset = byteOffset - this.byteOffset + length;
	},

	setBytes: function (byteOffset, bytes, littleEndian) {
		this._setBytes(byteOffset, bytes, defined(littleEndian, true));
	},

	getString: function (byteLength, byteOffset, encoding) {
		if (NODE && this._isNodeBuffer) {
			byteOffset = defined(byteOffset, this._offset);
			byteLength = defined(byteLength, this.byteLength - byteOffset);

			this._checkBounds(byteOffset, byteLength);

			this._offset = byteOffset + byteLength;
			return this.buffer.toString(encoding || 'binary', this.byteOffset + byteOffset, this.byteOffset + this._offset);
		}
		var bytes = this._getBytes(byteLength, byteOffset, true);
		// backward-compatibility
		encoding = encoding === 'utf8' ? 'utf-8' : (encoding || 'binary');
		if (TextDecoder && encoding !== 'binary') {
			return new TextDecoder(encoding).decode(this._isArrayBuffer ? bytes : new Uint8Array(bytes));
		}
		var string = '';
		byteLength = bytes.length;
		for (var i = 0; i < byteLength; i++) {
			string += String.fromCharCode(bytes[i]);
		}
		if (encoding === 'utf-8') {
			string = decodeURIComponent(escape(string));
		}
		return string;
	},

	setString: function (byteOffset, subString, encoding) {
		if (NODE && this._isNodeBuffer) {
			byteOffset = defined(byteOffset, this._offset);
			this._checkBounds(byteOffset, subString.length);
			this._offset = byteOffset + this.buffer.write(subString, this.byteOffset + byteOffset, encoding || 'binary');
			return;
		}
		// backward-compatibility
		encoding = encoding === 'utf8' ? 'utf-8' : (encoding || 'binary');
		var bytes;
		if (TextEncoder && encoding !== 'binary') {
			bytes = new TextEncoder(encoding).encode(subString);
		} else {
			if (encoding === 'utf-8') {
				subString = unescape(encodeURIComponent(subString));
			}
			bytes = getCharCodes(subString);
		}
		this._setBytes(byteOffset, bytes, true);
	},

	getChar: function (byteOffset) {
		return this.getString(1, byteOffset);
	},

	setChar: function (byteOffset, character) {
		this.setString(byteOffset, character);
	},

	tell: function () {
		return this._offset;
	},

	seek: function (byteOffset) {
		this._checkBounds(byteOffset, 0);
		/* jshint boss: true */
		return this._offset = byteOffset;
	},

	skip: function (byteLength) {
		return this.seek(this._offset + byteLength);
	},

	slice: function (start, end, forceCopy) {
		function normalizeOffset(offset, byteLength) {
			return offset < 0 ? offset + byteLength : offset;
		}

		start = normalizeOffset(start, this.byteLength);
		end = normalizeOffset(defined(end, this.byteLength), this.byteLength);

		return (
			forceCopy
			? new jDataView(this.getBytes(end - start, start, true, true), undefined, undefined, this._littleEndian)
			: new jDataView(this.buffer, this.byteOffset + start, end - start, this._littleEndian)
		);
	},

	alignBy: function (byteCount) {
		this._bitOffset = 0;
		if (defined(byteCount, 1) !== 1) {
			return this.skip(byteCount - (this._offset % byteCount || byteCount));
		} else {
			return this._offset;
		}
	},

	// Compatibility functions

	_getFloat64: function (byteOffset, littleEndian) {
		var b = this._getBytes(8, byteOffset, littleEndian),

			sign = 1 - (2 * (b[7] >> 7)),
			exponent = ((((b[7] << 1) & 0xff) << 3) | (b[6] >> 4)) - ((1 << 10) - 1),

		// Binary operators such as | and << operate on 32 bit values, using + and Math.pow(2) instead
			mantissa = ((b[6] & 0x0f) * pow2(48)) + (b[5] * pow2(40)) + (b[4] * pow2(32)) +
						(b[3] * pow2(24)) + (b[2] * pow2(16)) + (b[1] * pow2(8)) + b[0];

		if (exponent === 1024) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -1023) { // Denormalized
			return sign * mantissa * pow2(-1022 - 52);
		}

		return sign * (1 + mantissa * pow2(-52)) * pow2(exponent);
	},

	_getFloat32: function (byteOffset, littleEndian) {
		var b = this._getBytes(4, byteOffset, littleEndian),

			sign = 1 - (2 * (b[3] >> 7)),
			exponent = (((b[3] << 1) & 0xff) | (b[2] >> 7)) - 127,
			mantissa = ((b[2] & 0x7f) << 16) | (b[1] << 8) | b[0];

		if (exponent === 128) {
			if (mantissa !== 0) {
				return NaN;
			} else {
				return sign * Infinity;
			}
		}

		if (exponent === -127) { // Denormalized
			return sign * mantissa * pow2(-126 - 23);
		}

		return sign * (1 + mantissa * pow2(-23)) * pow2(exponent);
	},

	_get64: function (Type, byteOffset, littleEndian) {
		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		var parts = littleEndian ? [0, 4] : [4, 0];

		for (var i = 0; i < 2; i++) {
			parts[i] = this.getUint32(byteOffset + parts[i], littleEndian);
		}

		this._offset = byteOffset + 8;

		return new Type(parts[0], parts[1]);
	},

	getInt64: function (byteOffset, littleEndian) {
		return this._get64(Int64, byteOffset, littleEndian);
	},

	getUint64: function (byteOffset, littleEndian) {
		return this._get64(Uint64, byteOffset, littleEndian);
	},

	_getInt32: function (byteOffset, littleEndian) {
		var b = this._getBytes(4, byteOffset, littleEndian);
		return (b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0];
	},

	_getUint32: function (byteOffset, littleEndian) {
		return this._getInt32(byteOffset, littleEndian) >>> 0;
	},

	_getInt16: function (byteOffset, littleEndian) {
		return (this._getUint16(byteOffset, littleEndian) << 16) >> 16;
	},

	_getUint16: function (byteOffset, littleEndian) {
		var b = this._getBytes(2, byteOffset, littleEndian);
		return (b[1] << 8) | b[0];
	},

	_getInt8: function (byteOffset) {
		return (this._getUint8(byteOffset) << 24) >> 24;
	},

	_getUint8: function (byteOffset) {
		return this._getBytes(1, byteOffset)[0];
	},

	_getBitRangeData: function (bitLength, byteOffset) {
		var startBit = (defined(byteOffset, this._offset) << 3) + this._bitOffset,
			endBit = startBit + bitLength,
			start = startBit >>> 3,
			end = (endBit + 7) >>> 3,
			b = this._getBytes(end - start, start, true),
			wideValue = 0;

		/* jshint boss: true */
		if (this._bitOffset = endBit & 7) {
			this._bitOffset -= 8;
		}

		for (var i = 0, length = b.length; i < length; i++) {
			wideValue = (wideValue << 8) | b[i];
		}

		return {
			start: start,
			bytes: b,
			wideValue: wideValue
		};
	},

	getSigned: function (bitLength, byteOffset) {
		var shift = 32 - bitLength;
		return (this.getUnsigned(bitLength, byteOffset) << shift) >> shift;
	},

	getUnsigned: function (bitLength, byteOffset) {
		var value = this._getBitRangeData(bitLength, byteOffset).wideValue >>> -this._bitOffset;
		return bitLength < 32 ? (value & ~(-1 << bitLength)) : value;
	},

	_setBinaryFloat: function (byteOffset, value, mantSize, expSize, littleEndian) {
		var signBit = value < 0 ? 1 : 0,
			exponent,
			mantissa,
			eMax = ~(-1 << (expSize - 1)),
			eMin = 1 - eMax;

		if (value < 0) {
			value = -value;
		}

		if (value === 0) {
			exponent = 0;
			mantissa = 0;
		} else if (isNaN(value)) {
			exponent = 2 * eMax + 1;
			mantissa = 1;
		} else if (value === Infinity) {
			exponent = 2 * eMax + 1;
			mantissa = 0;
		} else {
			exponent = Math.floor(Math.log(value) / Math.LN2);
			if (exponent >= eMin && exponent <= eMax) {
				mantissa = Math.floor((value * pow2(-exponent) - 1) * pow2(mantSize));
				exponent += eMax;
			} else {
				mantissa = Math.floor(value / pow2(eMin - mantSize));
				exponent = 0;
			}
		}

		var b = [];
		while (mantSize >= 8) {
			b.push(mantissa % 256);
			mantissa = Math.floor(mantissa / 256);
			mantSize -= 8;
		}
		exponent = (exponent << mantSize) | mantissa;
		expSize += mantSize;
		while (expSize >= 8) {
			b.push(exponent & 0xff);
			exponent >>>= 8;
			expSize -= 8;
		}
		b.push((signBit << expSize) | exponent);

		this._setBytes(byteOffset, b, littleEndian);
	},

	_setFloat32: function (byteOffset, value, littleEndian) {
		this._setBinaryFloat(byteOffset, value, 23, 8, littleEndian);
	},

	_setFloat64: function (byteOffset, value, littleEndian) {
		this._setBinaryFloat(byteOffset, value, 52, 11, littleEndian);
	},

	_set64: function (Type, byteOffset, value, littleEndian) {
		if (typeof value !== 'object') {
			value = Type.fromNumber(value);
		}

		littleEndian = defined(littleEndian, this._littleEndian);
		byteOffset = defined(byteOffset, this._offset);

		var parts = littleEndian ? {lo: 0, hi: 4} : {lo: 4, hi: 0};

		for (var partName in parts) {
			this.setUint32(byteOffset + parts[partName], value[partName], littleEndian);
		}

		this._offset = byteOffset + 8;
	},

	setInt64: function (byteOffset, value, littleEndian) {
		this._set64(Int64, byteOffset, value, littleEndian);
	},

	setUint64: function (byteOffset, value, littleEndian) {
		this._set64(Uint64, byteOffset, value, littleEndian);
	},

	_setUint32: function (byteOffset, value, littleEndian) {
		this._setBytes(byteOffset, [
			value & 0xff,
			(value >>> 8) & 0xff,
			(value >>> 16) & 0xff,
			value >>> 24
		], littleEndian);
	},

	_setUint16: function (byteOffset, value, littleEndian) {
		this._setBytes(byteOffset, [
			value & 0xff,
			(value >>> 8) & 0xff
		], littleEndian);
	},

	_setUint8: function (byteOffset, value) {
		this._setBytes(byteOffset, [value & 0xff]);
	},

	setUnsigned: function (byteOffset, value, bitLength) {
		var data = this._getBitRangeData(bitLength, byteOffset),
			wideValue = data.wideValue,
			b = data.bytes;

		wideValue &= ~(~(-1 << bitLength) << -this._bitOffset); // clearing bit range before binary "or"
		wideValue |= (bitLength < 32 ? (value & ~(-1 << bitLength)) : value) << -this._bitOffset; // setting bits

		for (var i = b.length - 1; i >= 0; i--) {
			b[i] = wideValue & 0xff;
			wideValue >>>= 8;
		}

		this._setBytes(data.start, b, true);
	}
};

if (NODE) {
	var nodeNaming = {
		'Int8': 'Int8',
		'Int16': 'Int16',
		'Int32': 'Int32',
		'Uint8': 'UInt8',
		'Uint16': 'UInt16',
		'Uint32': 'UInt32',
		'Float32': 'Float',
		'Float64': 'Double'
	};

	proto._nodeBufferAction = function (type, isReadAction, byteOffset, littleEndian, value) {
		// Move the internal offset forward
		this._offset = byteOffset + dataTypes[type];
		var nodeName = nodeNaming[type] + ((type === 'Int8' || type === 'Uint8') ? '' : littleEndian ? 'LE' : 'BE');
		byteOffset += this.byteOffset;
		return isReadAction ? this.buffer['read' + nodeName](byteOffset) : this.buffer['write' + nodeName](value, byteOffset);
	};
}

for (var type in dataTypes) {
	/* jshint loopfunc: true */
	(function (type) {
		proto['get' + type] = function (byteOffset, littleEndian) {
			return this._action(type, true, byteOffset, littleEndian);
		};
		proto['set' + type] = function (byteOffset, value, littleEndian) {
			this._action(type, false, byteOffset, littleEndian, value);
		};
	})(type);
	/* jshint loopfunc: false */
}

proto._setInt32 = proto._setUint32;
proto._setInt16 = proto._setUint16;
proto._setInt8 = proto._setUint8;
proto.setSigned = proto.setUnsigned;

for (var method in proto) {
	/* jshint loopfunc: true */
	if (method.slice(0, 3) === 'set') {
		(function (type) {
			proto['write' + type] = function () {
				Array.prototype.unshift.call(arguments, undefined);
				this['set' + type].apply(this, arguments);
			};
		})(method.slice(3));
	}
	/* jshint loopfunc: false */
}

/////
function CU(name){
    this.name =name;
    this.dostate="";
    
    this.timestamp=0;
    this.oldtimestamp=0;
    this.refresh = 0;
    this.seconds=0; // seconds of life of the interface
    this.dev_status="";
    this.error_status="";
    this.log_status="";
    
    this.firsttimestamp=0; // first time stamp of the interface
    console.log("creating CU:"+name);
    this.updating=0;
    var buildtable=0;
    this.buildInterface = function (parm){
        buildtable=parm;
    }
    this.isbuildInterface = function(){
        return buildtable;
    }
    this.init=function (){
        var request = new XMLHttpRequest();
        
     //   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
        request.open("GET", request_prefix + this.name + "&cmd=init",true);
        request.send();        
        this.dostate = "init";

        
    }
    
     this.run=function (){
        if(this.initialized==0){
            this.init();
        }
        
        this.start();
        this.dostate = "start";
    }
    this.deinit=function (){
        var request = new XMLHttpRequest();
        request.open("GET",  request_prefix + this.name + "&cmd=deinit",true);
        request.send();        
        this.dostate = "deinit";
        
    }
    this.start=function (){
        var request = new XMLHttpRequest();
        
        request.open("GET",  request_prefix + this.name + "&cmd=start",true);
        request.send(); 
        this.dostate = "start";

       
    };
    this.stop=function (){
        var request = new XMLHttpRequest();  
        request.open("GET",  request_prefix + this.name + "&cmd=stop",true);
        request.send();
        this.dostate = "stop";
    };
    // this function should be overloaded by the class object
    // if not it contain exactly what is pushed
    this.processData=function (){
	
        
    };
    this.sendCommand=function (command, parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " command:" + command + " param:" + parm);
        request.open("GET",  request_prefix + this.name + "&cmd="+ command + "&parm=" + parm,true);
        request.send();
    };
    
    this.sendAttr=function (name, val) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set attr:" + name + " param:" + val);
        request.open("GET",  request_prefix + this.name + "&attr="+ command + "&parm=" + val,true);
        request.send();
    };
    
    this.setSched=function (parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set scheduling to:" + parm);
        request.open("GET", request_prefix + this.name + "&cmd=sched&parm=" + parm,true);
        request.send();
    };
    this.update=function (){
       var request = new XMLHttpRequest();
       var my=this;
       request.timeout =30000;
       if(my.updating == 1)
           return;
      // console.log("updating "+my.name + " run:" +dorun)
        if(my.dostate == my.dev_status  ){
            my.dostate = "";
            console.log("device "+my.name + " is in \""+my.dev_status+ " OK"); 

            request.open("GET", request_prefix + this.name + "&cmd=status",true);
            
        } else if(my.dostate!="") { 
           console.log("device "+my.name + " is in \""+my.dev_status+ "\" I should go into \""+ my.dostate+"\""); 

          if(my.dostate == "init") {
            if(my.dev_status  == "start"){
                request.open("GET", request_prefix + this.name + "&cmd=start",true);
            } else if(my.dev_status  == "stop"){
                request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

            } else{
                request.open("GET", request_prefix + this.name + "&cmd=init",true);


            }
          } else if(my.dostate == "start"){
              if(my.dev_status  == "deinit"){
                 request.open("GET", request_prefix + this.name + "&cmd=init",true);

              } else {
                 request.open("GET", request_prefix + this.name + "&cmd=start",true);

              }
          } else if(my.dostate == "stop"){
               if(my.dev_status  == "start"){
                  request.open("GET", request_prefix + this.name + "&cmd=stop",true);

               } else {
                  request.open("GET", request_prefix + this.name + "&cmd=status",true);
         

               } /*else if(my.dev_status  != "") {
                   this.dostate ="";
                   alert("cannot STOP device "+ this.name + " is in state:"+my.dev_status );
               } else {
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name,true);
               }*/
          } else if(my.dostate == "deinit"){
              if(my.dev_status  == "start"){
                  request.open("GET", request_prefix + this.name + "&cmd=stop",true);

               } else {
                  request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

               }
          } else {
              
            request.open("GET", request_prefix + this.name + "&cmd=status",true);

          }
         
        } else {
            request.open("GET", request_prefix + this.name + "&cmd=status",true);
        }
        request.ontimeout = function () { 
            //alert("Timed out!!!"); 
            console.log("TIMEOUT!!");
            my.updating = 0;
        }
        my.updating =1;
        request.send();
        request.onreadystatechange = function() {
	if (request.readyState == 4 && request.status == 200) {
 //       if(request.status==200) {{
	    var json_answer = request.responseText;
	    my.updating = 0;
	    console.log("answer this.dostate:" + my.dostate +" ("+my.name+"):\"" + json_answer+"\"");
	    if (json_answer == "") {
		return;
	    }
	    try {
	    var json = JSON.parse(json_answer);
	    } catch (err){
		console.log("exception parsing " + json_answer);
                  
                  return;
	    }
	    Object.keys(json).forEach(function(key) {
		try {
		    var val = json[key];
		    if (typeof(val) === 'object') {
			if (val.hasOwnProperty('$numberLong')) {
			    val = val['$numberLong'];
			}
		    }
                    
		  //  console.log("processing:"+key+ " val:"+val);
                    if(key == "ndk_uid"){
                        my.name = val;
                    } else if (key == "dpck_ats") {
			
			if(my.firsttimestamp==0){
                            my.firsttimestamp=val;
                        }
                        my.oldtimestamp=my.timestamp;
			my.timestamp = val;
			my.seconds =(val - my.firsttimestamp)/1000.0;
                        if(my.oldtimestamp!=0){
                            my.refresh = (val - my.oldtimestamp)/1000.0;
                        }
		    } else {
			//			console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
                        my[key]=val;
                    }
                    
                    
                } catch(err) {
		    // console.error(key + " does not exist:" + err);
		}
	    });
           my.processData();
	}
    } 
} 
}

 function addRow(tableID) {
 
            var table = document.getElementById(tableID);
 
            var rowCount = table.rows.length;
            var row = table.insertRow(rowCount);
            return row;
            
 /*
            var cell1 = row.insertCell(0);
            var element1 = document.createElement("input");
            element1.type = "checkbox";
            element1.name="chkbox[]";
            cell1.appendChild(element1);
 
            var cell2 = row.insertCell(1);
            cell2.innerHTML = rowCount + 1;
 
            var cell3 = row.insertCell(2);
            var element2 = document.createElement("input");
            element2.type = "text";
            element2.name = "txtbox[]";
            cell3.appendChild(element2);
 
 */
        }
 
        function deleteRow(tableID) {
            try {
            var table = document.getElementById(tableID);
            var rowCount = table.rows.length;
            table.deleteRow(rowCount);
        
            }catch(e) {
            }
        }
function updateInterface(){
    
}
function CULoad(classname,inter){
     var query = window.location.search.substring(1);
     var vars = query.split("=");
     var cus_names=vars[1].split("&");
     if(vars==null || cus_names==null){
         alert("Please specify a valid powersupply in the URL ?<init|deinit|start|stop|run>=cu1_id&cu2_id");
         return;
     }
     for (var i=0;i<cus_names.length;i++) {
          var cu;
          if(classname!=null){
              console.log("Creating class:"+classname + " name: "+cus_names[i])
              cu  = new window[classname](cus_names[i]);
            //  var refreshFunc=classname + "Refresh";
             // refreshInterval=setInterval(refreshFunc,inter);
           


          } else {
              cu = new CU(cus_names[i]);
              console.log("Creating Generic CU name: "+cus_names[i]);
             
        }
         

          cus.push(cu);
          if(vars[0]==="init"){
              console.log("initializing "+cus_names[i]);
              cu.init();
          } else if(vars[0]==="deinit"){
              console.log("deinitalizing "+cus_names[i]);
              cu.deinit();
          } else if(vars[0]==="start"){
              console.log("start "+cus_names[i]);
              cu.start();
          } else if(vars[0]==="stop"){
              console.log("stop "+cus_names[i]);
              cu.stop();
          } else {
              console.log("run "+cus_names[i]);
              cu.run();
          }
     }
     if(classname!=null){
          refreshInterval=setInterval(updateInterface,inter);
     } else {
          refreshInterval=setInterval(CUupdateInterface,inter);
     }
     
    
}

function CUBuildInterface(){
 for(var i=0;i<cus.length;i++){
     cus[i].buildInterface(1);
      for (var key in cus[i]) {
        internal_param.push(key);
      }
 }    
}

function initializeCU(cunames){
     for(var i=0;i<cunames.length;i++){
          var cu = new CU(cunames[i])
          cus.push(cu);
          console.log("initializing "+cunames[i]);
          cu.init();
          
     }
 }
 
 function toExclude(parm){
     for(var x in excludeInterface){
         if(parm==excludeInterface[x])
             return 1;
     }
     return 0;
 }
 function isInternal(parm){
     for(var x in internal_param){
         if(parm==internal_param[x])
             return 1;
     }
     return 0;
 }
 function chaos_create_table(obj,instancen){
    var body=document.getElementsByTagName('body')[0];
    var tbl=document.createElement('table');
    var hr=document.createElement('hr');
    body.appendChild(hr);
    var h=document.createElement('h2');
    var text=document.createTextNode(obj.name);
    h.appendChild(text);
    body.appendChild(h);
    tbl.style.width='100%';
    tbl.setAttribute('border','1');
    tbl.setAttribute("id",obj.name + "_" +instancen);
    var tbdy=document.createElement('tbody');
    
    
    
    tbdy.appendChild(hr);
    for (var key in obj) {
            if(toExclude(key))
                continue;
            
            if((typeof(obj[key]) !== 'function') && (typeof (obj[key]) !== 'object')){
                var tr=document.createElement('tr');
                var td=document.createElement('td');
                //var b=document.createElement('b');
                text=document.createTextNode(key);
                td.appendChild(text);
                if(!isInternal(key)){
                    td.style.fontStyle='bold';
                    td.style.color='green';
                    td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
                }
                tr.appendChild(td);
                td=document.createElement('td');
                td.setAttribute("id",key + "_"+instancen);
                td.setAttribute("class","Indicator");
                text=document.createTextNode(obj[key]);
                td.appendChild(text);
                tr.appendChild(td);
                tbdy.appendChild(tr);
            }
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
        
 }
 
function CUupdateInterface(){
               
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
		    var cu=cus[i];
                    var color="yellow";
                    var tick="normal";
                    if(cu.refresh != 0){
                        tick = "bold";
                    }
                    if(cu.dev_status=="start"){
                        color="green";
                        if(cu.isbuildInterface()){
                            chaos_create_table(cu,i);
                            cu.buildInterface(0);
                        }
                    } else if(cu.dev_status=="stop"){
                        color="black";
                    } else if(cu.dev_status=="init"){
                        color="yellow";
                        if(cu.isbuildInterface()){
                            chaos_create_table(cu,i);
                            cu.buildInterface(0);
                        }
                    } else {
                        color="red";
                    }
                    
                    if(cu.error_status!=""){
                        color="red";
                        console.log("An internal error occurred on device \""+cu.name+"\":\""+cu.error_status+"\"");
                        clearInterval(refreshInterval);
                        alert(cu.error_status);
                    }
                  
                    for (var key in cu) {
			var docelem = key +"_"+i;
			if((typeof(cu[key]) !== 'function') && (typeof (cu[key]) !== 'object')){
			  //  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
			try {
                       
                        var digits = document.getElementById(docelem).getAttribute("digits");
                        if(digits!=null){
                            document.getElementById(docelem).innerHTML=Number(cu[key]).toFixed(digits);
                          

                        } else {
                            document.getElementById(docelem).innerHTML=cu[key];

                        }
                        document.getElementById(docelem).style.color=color;
                        document.getElementById(docelem).style.fontWeight =tick;
                        
			} catch(e){
			  //  console.log("document element:" +docelem+ " not present in page:"+e); 
			}
			}
                }
            }
           
 }

 
