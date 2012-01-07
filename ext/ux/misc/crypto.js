/**
 *
 * Crypto: OpenSSL compatible cryptographic classes & functions
 *
 * @author		Bert Moorthaemer
 *
 * @license		TBD
 *
 * @requires	Fast Javascript engine (like Chrome's V8, WebKits SquirrelFish)
 *				ExtJS/CORE 3.x framework
 *
 * @credits		Tom Wu, Chris Veness, Ron Rivest and associates, Bruce Schneier, RSA Security, NIST,
 *
 *
 * This library implements the following cryptographic classes & functions:
 * ========================================================================
 * Ciphers:
 * - RSA (PKI)
 * - AES, DES, DESX, 3DES, BlowFish, RC5 & RC6 (block ciphers)
 * - Rabbit, ARC4 & MARC4 (stream ciphers)
 *
 * Block cipher modes:
 * - ECB, CBC, PCBC, OFB, CFB & CTR
 *
 * Hashes:
 * - MD5, SHA1 & SHA256
 *
 * Padding functions:
 * - PKCS1 & PKCS5 padding
 *
 * Key derivation functions:
 * - PBKDF1 & PBKDF2
 *
 * MAC functions:
 * - HMAC, CMAC, OMAC1 & OMAC2
 *
 * Other:
 * - SecureRandom generator class
 * - String & Array prototype extensions
 *
 */

// TODO: Add/extend documentation ...
// TODO: Streamline classes, add more events/functions/options to block and stream ciphers ...
// TODO: Implement ASN.1

Ext.ns('Crypto', 'Crypto.hash', 'Crypto.math', 'Crypto.util', 'Crypto.errors');

/**
 * @class Crypto
 * Crypto core classes and functions
 * @singleton
 */

Crypto.version = '1.0.1';

// =========================================================================================================== Exceptions

Ext.apply(Crypto.errors, {
	AbstractErrorText: 'Abstract function ({0}) called',
	NotImplementedErrorText: 'Function "{0}" is not yet implemented. But feel free to do so :-)',
	NotABigIntegerErrorText: 'Parameter "{0}" is not a big integer',
	IVRequiredErrorText: 'An IV is required in {0} mode',
	EncryptionErrorText: 'Encryption error',
	DecryptionErrorText: 'Decryption error',
	NotABlockCipherErrorText: '"{0}" is not a block cipher',
	WrongKeyLengthErrorText: '{0}: A key length of {1} bits is not supported',
	BlockSizeNotSupportedErrorText: '{0}: A block size of {1} bits is not supported',
	WeakKeyErrorText: '{0}: A weak key has been detected ({1})',
	DataTooLongErrorText: 'The supplied data is too long for this operation',

	AbstractError: function(callerName) {
		return String.format(this.AbstractErrorText, callerName || '??');
	},

	NotImplementedError: function(callerName) {
		return String.format(this.NotImplementedErrorText, callerName || '??');
	},

	NotABigIntegerError: function(param) {
		return String.format(this.NotABigIntegerErrorText, param || '??');
	},

	IVRequiredError: function(modeName) {
		return String.format(this.IVRequiredErrorText, modeName || '??');
	},

	EncryptionError: function() {
		return this.EncryptionErrorText;
	},

	DecryptionError: function() {
		return this.DecryptionErrorText;
	},

	NotABlockCipherError: function(cipher) {
		cipher = cipher || {};
		return String.format(this.NotABlockCipherErrorText, cipher.cipherID || '??');
	},

	WrongKeyLengthError: function(callerName, keyLen) {
		return String.format(this.WrongKeyLengthErrorText, callerName || '??', keyLen || 0);
	},

	BlockSizeNotSupportedError: function(callerName, blockSize) {
		return String.format(this.BlockSizeNotSupportedErrorText, callerName || '??', blockSize || 0);
	},

	WeakKeyError: function(cipher, key) {
		cipher = cipher || {}; key = key || [0];
		return String.format(this.WeakKeyErrorText, cipher.cipherID || '??', key.bytesToHex());
	},

	DataTooLongError: function() {
		return this.DataTooLongErrorText;
	}
});

// =========================================================================================================== Utilities

/**
 * @class Crypto.util
 * <p>TODO</p>
 * @singleton
 */
Ext.apply(Crypto.util, {
	/**
	 * Rotates the bits of a 32 bit integer to the left
	 * @param {Number} n The integer to be rotated
	 * @param {Number} bits The number of bit positions to rotate with
	 * @return {Number} returns the rotated integer
	 * @member Crypto.util rotr
	 */
	rotl: function(n, b) {
		if ((b &= 0x1f) === 0) {
			return n;
		}
		return ((n << b) | (n >>> (32 - b))) & 0xffffffff;
	},

	/**
	 * Rotates the bits of a 32 bit integer to the right
	 * @param {Number} n The integer to be rotated
	 * @param {Number} bits The number of bit positions to rotate with
	 * @return {Number} returns the rotated integer
	 * @member Crypto.util rotl
	 */
	rotr: function(n, b) {
		if ((b &= 0x1f) === 0) {
			return n;
		}
		return ((n << (32 - b)) | (n >>> b)) & 0xffffffff;
	},

	/**
	 * Changes the byte order from 'Big Endian' to 'Little Endian' or vice versa
	 * @param {Number} n The integer to be re-ordered
	 * @return {Number} returns the re-ordered integer
	 * @member Crypto.util endian
	 */
	endian: function(n) {
		if (Ext.isNumber(n)) {
			return Crypto.util.rotl(n, 8) & 0x00ff00ff | Crypto.util.rotl(n, 24) & 0xff00ff00;
		}

		for (var i = 0, l = n.length; i < l; i++) {
			n[i] = Crypto.util.endian(n[i]);
		}
		return n;
	}
});

// =========================================================================================================== Hashes

/**
 * @class Crypto.hash
 * Cryptographic hash functions
 * @singleton
 */
Ext.apply(Crypto.hash, function() {
	var UTIL = Crypto.util;

	// MD5
	var _ff = function(a, b, c, d, x, s, t) {
		var n = a + (b & c | ~b & d) + (x >>> 0) + t;
		return ((n << s) | (n >>> (32 - s))) + b;
	};

	var _gg = function(a, b, c, d, x, s, t) {
		var n = a + (b & d | c & ~d) + (x >>> 0) + t;
		return ((n << s) | (n >>> (32 - s))) + b;
	};

	var _hh = function(a, b, c, d, x, s, t) {
		var n = a + (b ^ c ^ d) + (x >>> 0) + t;
		return ((n << s) | (n >>> (32 - s))) + b;
	};

	var _ii = function(a, b, c, d, x, s, t) {
		var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
		return ((n << s) | (n >>> (32 - s))) + b;
	};

	// SHA256
	var _K = [
		0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
		0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
		0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
		0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
		0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
		0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
		0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
		0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
		0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
	];

	return {
		/**
		 * Calculates and returns the MD5 hash of a string or an array of bytes
		 * @param {Array|String} data The data to calculate the hash from
		 * @param {Object} options The following options are supported:
		 * <ul>
		 * <li><b>asBytes</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as an array of bytes
		 * (defaults to undefined)</div></li>
		 * <li><b>asString</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as a string
		 * (defaults to undefined)</div></li>
		 * </ul>
		 * Example usage:
		 * <pre><code>
	var hash = Crypto.hash.md5('Hash me!', { asBytes: true });
	</code></pre>
		 * @return {Array|String} hash
		 * @member Crypto.hash md5
		 */
		md5: function(s, options) {
			options = options || {};

			var m = (Ext.isArray(s) ? s.bytesToWords() : s.stringToWords()),
				l = s.length * 8,
				a = 1732584193,
				b = -271733879,
				c = -1732584194,
				d = 271733878,
				i, k;

			for (i = 0, k = m.length; i < k; i++) {
				m[i] = ((m[i] << 8) | (m[i] >>> 24)) & 0x00ff00ff | ((m[i] << 24) | (m[i] >>> 8)) & 0xff00ff00;
			}

			m[l >>> 5] |= 0x80 << (l % 32);
			m[(((l + 64) >>> 9) << 4) + 14] = l;

			for (i = 0, k = m.length; i < k; i += 26) {
				var aa = a, bb = b, cc = c, dd = d;

				a = _ff(a, b, c, d, m[i + 0], 7, -680876936);
				d = _ff(d, a, b, c, m[i + 1], 12, -389564586);
				c = _ff(c, d, a, b, m[i + 2], 17, 606105819);
				b = _ff(b, c, d, a, m[i + 3], 22, -1044525330);
				a = _ff(a, b, c, d, m[i + 4], 7, -176418897);
				d = _ff(d, a, b, c, m[i + 5], 12, 1200080426);
				c = _ff(c, d, a, b, m[i + 6], 17, -1473231341);
				b = _ff(b, c, d, a, m[i + 7], 22, -45705983);
				a = _ff(a, b, c, d, m[i + 8], 7, 1770035416);
				d = _ff(d, a, b, c, m[i + 9], 12, -1958414417);
				c = _ff(c, d, a, b, m[i + 10], 17, -42063);
				b = _ff(b, c, d, a, m[i + 11], 22, -1990404162);
				a = _ff(a, b, c, d, m[i + 12], 7, 1804603682);
				d = _ff(d, a, b, c, m[i + 13], 12, -40341101);
				c = _ff(c, d, a, b, m[i + 14], 17, -1502002290);
				b = _ff(b, c, d, a, m[i + 15], 22, 1236535329);

				a = _gg(a, b, c, d, m[i + 1], 5, -165796510);
				d = _gg(d, a, b, c, m[i + 6], 9, -1069501632);
				c = _gg(c, d, a, b, m[i + 11], 14, 643717713);
				b = _gg(b, c, d, a, m[i + 0], 20, -373897302);
				a = _gg(a, b, c, d, m[i + 5], 5, -701558691);
				d = _gg(d, a, b, c, m[i + 10], 9, 38016083);
				c = _gg(c, d, a, b, m[i + 15], 14, -660478335);
				b = _gg(b, c, d, a, m[i + 4], 20, -405537848);
				a = _gg(a, b, c, d, m[i + 9], 5, 568446438);
				d = _gg(d, a, b, c, m[i + 14], 9, -1019803690);
				c = _gg(c, d, a, b, m[i + 3], 14, -187363961);
				b = _gg(b, c, d, a, m[i + 8], 20, 1163531501);
				a = _gg(a, b, c, d, m[i + 13], 5, -1444681467);
				d = _gg(d, a, b, c, m[i + 2], 9, -51403784);
				c = _gg(c, d, a, b, m[i + 7], 14, 1735328473);
				b = _gg(b, c, d, a, m[i + 12], 20, -1926607734);

				a = _hh(a, b, c, d, m[i + 5], 4, -378558);
				d = _hh(d, a, b, c, m[i + 8], 11, -2022574463);
				c = _hh(c, d, a, b, m[i + 11], 16, 1839030562);
				b = _hh(b, c, d, a, m[i + 14], 23, -35309556);
				a = _hh(a, b, c, d, m[i + 1], 4, -1530992060);
				d = _hh(d, a, b, c, m[i + 4], 11, 1272893353);
				c = _hh(c, d, a, b, m[i + 7], 16, -155497632);
				b = _hh(b, c, d, a, m[i + 10], 23, -1094730640);
				a = _hh(a, b, c, d, m[i + 13], 4, 681279174);
				d = _hh(d, a, b, c, m[i + 0], 11, -358537222);
				c = _hh(c, d, a, b, m[i + 3], 16, -722521979);
				b = _hh(b, c, d, a, m[i + 6], 23, 76029189);
				a = _hh(a, b, c, d, m[i + 9], 4, -640364487);
				d = _hh(d, a, b, c, m[i + 12], 11, -421815835);
				c = _hh(c, d, a, b, m[i + 15], 16, 530742520);
				b = _hh(b, c, d, a, m[i + 2], 23, -995338651);

				a = _ii(a, b, c, d, m[i + 0], 6, -198630844);
				d = _ii(d, a, b, c, m[i + 7], 10, 1126891415);
				c = _ii(c, d, a, b, m[i + 14], 15, -1416354905);
				b = _ii(b, c, d, a, m[i + 5], 21, -57434055);
				a = _ii(a, b, c, d, m[i + 12], 6, 1700485571);
				d = _ii(d, a, b, c, m[i + 3], 10, -1894986606);
				c = _ii(c, d, a, b, m[i + 10], 15, -1051523);
				b = _ii(b, c, d, a, m[i + 1], 21, -2054922799);
				a = _ii(a, b, c, d, m[i + 8], 6, 1873313359);
				d = _ii(d, a, b, c, m[i + 15], 10, -30611744);
				c = _ii(c, d, a, b, m[i + 6], 15, -1560198380);
				b = _ii(b, c, d, a, m[i + 13], 21, 1309151649);
				a = _ii(a, b, c, d, m[i + 4], 6, -145523070);
				d = _ii(d, a, b, c, m[i + 11], 10, -1120210379);
				c = _ii(c, d, a, b, m[i + 2], 15, 718787259);
				b = _ii(b, c, d, a, m[i + 9], 21, -343485551);

				a += aa;
				b += bb;
				c += cc;
				d += dd;
			}

			var r = UTIL.endian([a, b, c, d]).wordsToBytes();
			return (options.asBytes ? r : options.asString ? r.bytesToString() : r.bytesToHex());
		},

		/**
		 * Calculates and returns the SHA1 hash of a string or an array of bytes
		 * @param {Array|String} data The data to calculate the hash from
		 * @param {Object} options The following options are supported:
		 * <ul>
		 * <li><b>asBytes</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as an array of bytes
		 * (defaults to undefined)</div></li>
		 * <li><b>asString</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as a string
		 * (defaults to undefined)</div></li>
		 * </ul>
		 * Example usage:
		 * <pre><code>
	var hash = Crypto.hash.sha1('Hash me!', { asBytes: true });
	</code></pre>
		 * @return {Array|String} hash
		 * @member Crypto.hash sha1
		 */
		sha1: function(s, options) {
			options = options || {};

			var m = (Ext.isArray(s) ? s.bytesToWords() : s.stringToWords()),
				l = s.length * 8;
				w = [],
				H0 = 1732584193,
				H1 = -271733879,
				H2 = -1732584194,
				H3 = 271733878,
				H4 = -1009589776;

			m[l >>> 5] |= 0x80 << (24 - l % 32);
			m[((l + 64 >>> 9) << 4) + 15] = l;

			for (var i = 0, k = m.length; i < k; i += 16) {
				var a = H0, b = H1, c = H2, d = H3, e = H4;

				for (var j = 0; j < 80; j++) {
					if (j < 16) {
						w[j] = m[i + j];
					} else {
						var n = w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16];
						w[j] = (n << 1) | (n >>> 31);
					}

					var t = ((H0 << 5) | (H0 >>> 27)) + H4 + (w[j] >>> 0) +
							(j < 20 ? (H1 & H2 | ~H1 & H3) + 1518500249 :
							 j < 40 ? (H1 ^ H2 ^ H3) + 1859775393 :
							 j < 60 ? (H1 & H2 | H1 & H3 | H2 & H3) - 1894007588 :
							 (H1 ^ H2 ^ H3) - 899497514);

					H4 = H3;
					H3 = H2;
					H2 = (H1 << 30) | (H1 >>> 2);
					H1 = H0;
					H0 = t;
				}

				H0 += a;
				H1 += b;
				H2 += c;
				H3 += d;
				H4 += e;
			}

			var r = [H0, H1, H2, H3, H4].wordsToBytes();
			return (options.asBytes ? r : options.asString ? r.bytesToString() : r.bytesToHex());
		},

		/**
		 * Calculates and returns the SHA256 hash of a string or an array of bytes
		 * @param {Array|String} data The data to calculate the hash from
		 * @param {Object} options The following options are supported:
		 * <ul>
		 * <li><b>asBytes</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as an array of bytes
		 * (defaults to undefined)</div></li>
		 * <li><b>asString</b> : Boolean<div class="sub-desc">When set to true, it will return the hash as a string
		 * (defaults to undefined)</div></li>
		 * </ul>
		 * Example usage:
		 * <pre><code>
	var hash = Crypto.hash.sha256('Hash me!', { asBytes: true });
	</code></pre>
		 * @return {Array|String} hash
		 * @member Crypto.hash sha256
		 */
		sha256: function(s, options) {
			options = options || {};

			var m = (Ext.isArray(s) ? s.bytesToWords() : s.stringToWords()),
				l = s.length * 8,
				H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19],
				w  = [], a, b, c, d, e, f, g, h, t1, t2;

			m[l >> 5] |= 0x80 << (24 - l % 32);
			m[((l + 64 >> 9) << 4) + 15] = l;

			for (var i = 0, k = m.length; i < k; i += 16) {
				a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

				for (var j = 0; j < 64; j++) {
					if (j < 16) {
						w[j] = m[j + i];
					} else {
						var $G0x = w[j - 15],
							$G1x = w[j - 2],
							$G0 = (($G0x << 25) | ($G0x >>> 7)) ^ (($G0x << 14) | ($G0x >>> 18)) ^ ($G0x >>> 3),
							$G1 = (($G1x << 15) | ($G1x >>> 17)) ^ (($G1x << 13) | ($G1x >>> 19)) ^ ($G1x >>> 10);

						w[j] = $G0 + (w[j - 7] >>> 0) + $G1 + (w[j - 16] >>> 0);
					}

					var ch  = e & f ^ ~e & g,
						maj = a & b ^ a & c ^ b & c,
						$S0 = ((a << 30) | (a >>>  2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22)),
						$S1 = ((e << 26) | (e >>>  6)) ^ ((e << 21) | (e >>> 11)) ^ ((e <<  7) | (e >>> 25));

					t1 = (h >>> 0) + $S1 + ch + (_K[j]) + (w[j] >>> 0);
					t2 = $S0 + maj;

					h = g;
					g = f;
					f = e;
					e = d + t1;
					d = c;
					c = b;
					b = a;
					a = t1 + t2;
				}

				H[0] += a;
				H[1] += b;
				H[2] += c;
				H[3] += d;
				H[4] += e;
				H[5] += f;
				H[6] += g;
				H[7] += h;
			}

			var r = H.wordsToBytes();
			return (options.asBytes ? r : options.asString ? r.bytesToString() : r.bytesToHex());
		}
	};
}());

Crypto.hash.md5.OCTETS = 16;
Crypto.hash.sha1.OCTETS = 20;
Crypto.hash.sha256.OCTETS = 32;

// =========================================================================================================== Math
// Big integer math

/**
 * @class Crypto.math.BigInteger
 * 
 * @constructor
 * @param {Mixed} a The (big) integer as an integer, string or an array of bytes
 * @param {Mixed} b ??
 * @param {Mixed} c ??
 */
Crypto.math.BigInteger = function(a, b, c) {
	if (!Ext.isEmpty(a)) {
		if (Ext.isNumber(a)) {
			this.fromNumber(a, b, c);
		} else if (Ext.isEmpty(b) && !Ext.isString(a)) {
			if (Ext.isArray(a)) {
				this.fromBytes(a);
			} else {
				this.fromString(a, 256);
			}
		} else {
			this.fromString(a, b);
		}
	}
};

// =========================================================================================================== Utilities

/**
 * @class Crypto.util.SecureRandom
 * <p>TODO</p>
 * @constructor
 */
Crypto.util.SecureRandom = function() {};

Ext.apply(Crypto.util, function() {
	var ERRORS = Crypto.errors;
	var HASH = Crypto.hash;
	var BIGINT = Crypto.math.BigInteger;

	var rng = new Crypto.util.SecureRandom();

	var prf = function(hf, data, salt) {
		salt = salt || [];
		return Crypto.HMAC(hf, data, salt, { asBytes: true });
	};

	return {
		/**
		 * @class Crypto.util.PKCS1PAD1
		 * <p>TODO: PKCS1 Padding 1</p>
		 * @singleton
		 */
		PKCS1PAD1: function() {
			return {
				RESERVED_OCTETS: 11,

				/**
				 * Pads data according to the PKCS1 Pad #1 specification
				 * @param {Array} data The data to be padded
				 * @param {Number} blockSize ??
				 * @return {Crypto.math.BigInteger} ??
				 * @member Crypto.util.PKCS1PAD1 pad
				 */
				pad: function(m, bs) {
					if (bs < m.length + this.RESERVED_OCTETS) {
						throw new Error(ERRORS.DataTooLongError());
					}

					var bytes = m.slice(0), c,
						n = bs - bytes.length - 3;

					bytes.unshift(0x00);
					while (n > 0) {
						bytes.unshift(0xff);
						n--;
					}
					bytes.unshift(0x01);
					bytes.unshift(0x00);

					return bytes;
				},

				/**
				 * Removes the padding from data according to the PKCS1 Pad #1 specification
				 * @param {Array} data The data to be un-padded
				 * @param {Number} blockSize ??
				 * @return {String} ??
				 * @member Crypto.util.PKCS1PAD1 unpad
				 */
				unpad: function(m, bs) {
					var bytes = m.slice(0), i = 0;

					while (i < bytes.length && bytes[i] === 0x00) {
						++i;
					} 
					if ((bytes.length - i) != (bs - 1) || bytes[i] != 0x01) {
						throw new Error(ERRORS.DecryptionError()); 
					}
					while (bytes[++i] !== 0x00) {
						if (i >= bytes.length) {
							throw new Error(ERRORS.DecryptionError()); 
						}
					}
					return bytes.slice(++i);
				}
			};
		}(),

		/**
		 * @class Crypto.util.PKCS1PAD2
		 * <p>TODO: PKCS1 Padding 2 (Used with RSA)</p>
		 * @singleton
		 */
		PKCS1PAD2: function() {
			return {
				RESERVED_OCTETS: 11,

				/**
				 * Pads data according to the PKCS1 Pad #2 specification
				 * @param {Array} data The data to be padded
				 * @param {Number} blockSize ??
				 * @return {Crypto.math.BigInteger} ??
				 * @member Crypto.util.PKCS1PAD2 pad
				 */
				pad: function(m, bs) {
					if (bs < m.length + this.RESERVED_OCTETS) {
						throw new Error(ERRORS.DataTooLongError());
					}

					var bytes = m.slice(0), c,
						n = bs - bytes.length - 3;

					bytes.unshift(0x00);
					while (n > 0) {
						do {
							c = rng.nextByte();
						} while (c === 0);
						bytes.unshift(c);
						n--;
					}
					bytes.unshift(0x02);
					bytes.unshift(0x00);

					return bytes;
				},

				/**
				 * Removes the padding from data according to the PKCS1 Pad #2 specification
				 * @param {Array} data The data to be un-padded
				 * @param {Number} blockSize ??
				 * @return {String} ??
				 * @member Crypto.util.PKCS1PAD2 unpad
				 */
				unpad: function(m, bs) {
					var bytes = m.slice(0), i = 0;

					while (i < bytes.length && bytes[i] === 0x00) {
						++i;
					} 
					if ((bytes.length - i) != (bs - 1) || bytes[i] != 0x02) {
						throw new Error(ERRORS.DecryptionError()); 
					}
					while (bytes[++i] !== 0x00) {
						if (i >= bytes.length) {
							throw new Error(ERRORS.DecryptionError()); 
						}
					}
					bytes = bytes.slice(++i);
					return bytes;
				}
			};
		}(),

		/**
		 * @class Crypto.util.PKCS5PAD
		 * <p>TODO: PKCS5 Padding (used with symmetric block ciphers like AES)</p>
		 * @singleton
		 */
		PKCS5PAD: function() {
			return {
				/**
				 * Pads data according to the PKCS5 specification
				 * @param {Array} data The data to be padded
				 * @param {Number} blockSize ??
				 * @member Crypto.util.PKCS5PAD pad
				 */
				pad: function(m, bs) {
					var i, l = m.length, n = Math.ceil(l / bs);

					if (l % bs !== 0) {
						l = (n * bs) - l;
						for (i = 0; i < l; i++) {
							m.push(l);
						}
					} else {
						for (i = 0; i < bs; i++) {
							m.push(bs);
						}
					}
				},

				/**
				 * Removes padding from data according to the PKCS5 specification
				 * @param {Array} data The data to be unpadded
				 * @param {Number} blockSize ??
				 * @member Crypto.util.PKCS5PAD unpad
				 */
				unpad: function(c, bs) {
					var p = c.pop();

					if (p > bs) {
						throw new Error(ERRORS.DecryptionError());
					} else {
						for (var i = 1; i < p; i++) {
							if (c.pop() != p) {
								throw new Error(ERRORS.DecryptionError());
							}
						}
					}
				}
			};
		}(),

		/**
		 * Returns a key and an IV according to the PBKDF1 Specification (OpenSSL compatible)
		 * @param {Array} pwdBytes An array of bytes containing the 'password'
		 * @param {Array} salt An array of bytes with a salt to be applied to the 'password'
		 * @param {Number} keyLen Length of the requested key in 32 bit words
		 * @param {Number} ivLen Length of the requested IV in 32 bit words
		 * @param {Object} options Options ??
		 * @return {Object} ???
		 * @member Crypto.util PBKDF1
		 */
		PBKDF1: function(pwdBytes, salt, keyLen, ivLen, options) {
			options = options || {};

			var i = 1, d = pwdBytes.concat(salt),
				l = Math.floor(keyLen * 4), bs = ivLen * 4,
				h = [], r = [],
				hf = options.hasher || HASH.md5,
				n = options.iterations || 0,
				r = h[0] = hf(d, { asBytes : true });

			for (;;) {
				h[i] = hf(h[i - 1].concat(d), { asBytes : true });
				r = r.concat(h[i++]);

				if (!n || (n && i > n)) {
					// check for enough key/iv material ..
					if (r.length >= (l + bs)) {
						break;
					}
				}
			}

			return {
				key: r.slice(0, l),
				iv: (bs > 0 ? r.slice(l, l + bs) : [])
			};
		},

		/**
		 * Returns a key and an IV according to the PBKDF2 Specification
		 * @param {Array} pwdBytes An array of bytes containing the 'password'
		 * @param {Array} salt An array of bytes with a salt to be applied to the 'password'
		 * @param {Number} keyLen Length of the requested key in 32 bit words
		 * @param {Number} ivLen Length of the requested IV in 32 bit words
		 * @param {Object} options Options ??
		 * @return {Object} ???
		 * @member Crypto.util PBKDF2
		 */
		PBKDF2: function(pwdBytes, salt, keyLen, ivLen, options) {
			options = options || {};

			var i, j, k = 1, b, t,
				l = Math.floor(keyLen * 4), bs = ivLen * 4,
				hf = options.hasher || HASH.sha1,
				n = options.iterations || 1,
				r = [];

			for (;;) {
				b = prf(hf, pwdBytes, salt.concat([k++].wordsToBytes()));
				for (i = 1; i < n; i++) {
					t = prf(hf, b);
					for (j = 0; j < b.length; j++) {
						b[j] ^= t[j];
					}
				}
				r = r.concat(b);
				if (r.length >= (l + bs)) {
					break;
				}
			}

			return {
				key: r.slice(0, l),
				iv: (bs > 0 ? r.slice(l, l + bs) : [])
			};
		}
	};
}());

// =========================================================================================================== Cipher primitives
/**
 * @class Crypto.Cipher
 * <p>TODO</p>
 * @constructor
 */
Crypto.Cipher = function() {
	// TODO: Add events ...
	Crypto.Cipher.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.SymmetricCipher
 * <p>TODO</p>
 * @constructor
 * extends Crypto.Cipher
 */
Crypto.SymmetricCipher = function() {
	Crypto.SymmetricCipher.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.AsymmetricCipher
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.Cipher
 */
Crypto.AsymmetricCipher = function() {
	Crypto.AsymmetricCipher.superclass.constructor.apply(this, arguments);
};

// =========================================================================================================== PKI ciphers
/**
 * @class Crypto.RSA
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.AsymmetricCipher
 */
Crypto.RSA = function() {
	this.n = null;
	this.e = 0;
	this.d = null;
	this.p = null;
	this.q = null;
	this.dmp1 = null;
	this.dmq1 = null;
	this.coeff = null;

	Crypto.RSA.superclass.constructor.apply(this, arguments);
};

// =========================================================================================================== Block ciphers
/**
 * @class Crypto.BlockCipher
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.SymmetricCipher
 */
Crypto.BlockCipher = function() {
	Crypto.BlockCipher.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.BlockCipher.mode
 * <p>TODO</p>
 * @singleton
 */
Crypto.BlockCipher.mode = function() {
	var ERRORS = Crypto.errors;
	var UTIL = Crypto.util;

	return {
		/**
		 * @class Crypto.BlockCipher.mode.ECB
		 * <p>TODO: ECB: Electronic Code Book</p>
		 * @singleton
		 */
		ECB: function() {
			return {
				encrypt: function(cipher, m, iv) {
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4;
					UTIL.PKCS5PAD.pad(m, bs);
					for (var i = 0, l = m.length; i < l; i += bs) {
						cipher.encryptBlock(m, i);
					}
				},

				decrypt: function(cipher, c, iv) {
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4;
					for (var i = 0, l = c.length; i < l; i += bs) {
						cipher.decryptBlock(c, i);
					}
					UTIL.PKCS5PAD.unpad(c, bs);
				}
			};
		}(),

		/**
		 * @class Crypto.BlockCipher.mode.OFB
		 * <p>TODO: OFB: Output Feedback</p>
		 * @singleton
		 */
		OFB: function() {
			var OFB = function(cipher, m, iv) {
				if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
					throw new Error(ERRORS.IVRequiredError('OFB'));
				}
				if (!(cipher instanceof Crypto.BlockCipher)) {
					throw new Error(ERRORS.NotABlockCipherError(cipher));
				}

				var bs = cipher.Nb * 4, ks = iv.slice(0);
				for (var i = 0, l = m.length; i < l; i++) {
					if (i % bs === 0) {
						cipher.encryptBlock(ks, 0);
					}
					m[i] ^= ks[i % bs];
				}
			};

			return {
				encrypt: OFB,
				decrypt: OFB
			};
		}(),

		/**
		 * @class Crypto.BlockCipher.mode.CTR
		 * <p>TODO: CTR: Counter</p>
		 * @singleton
		 */
		CTR: function() {
			var CTR_INIT = [0, 0, 0, 0, 0, 0, 0, 0];

			var CTR = function(cipher, m, iv) {
				if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
					throw new Error(ERRORS.IVRequiredError('CTR'));
				}
				if (!(cipher instanceof Crypto.BlockCipher)) {
					throw new Error(ERRORS.NotABlockCipherError(cipher));
				}

				var bs = cipher.Nb * 4,
					nonce = iv.slice(0, bs - 8),
					ctr = nonce.concat(CTR_INIT),
					i, j, l, n, c;

				for (i = 0, l = m.length; i < l; i++) {
					if (i % bs === 0) {
						n = i / bs;
						for (j = 0; j < 4; j++) {
							ctr[(bs - 1) - j] = (n >>> j * 8) & 0xff;
							ctr[(bs - 1) - j - 4] = (n / 0x100000000 >>> j * 8);
						}
						c = ctr.slice(0);
						cipher.encryptBlock(c, 0);
					}
					m[i] ^= c[i % bs];
				}
			};

			return {
				encrypt: CTR,
				decrypt: CTR
			};
		}(),

		/**
		 * @class Crypto.BlockCipher.mode.CBC
		 * <p>TODO: CBC: Cipher Block Chaining</p>
		 * @singleton
		 */
		CBC: function() {
			return {
				encrypt: function(cipher, m, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('CBC'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l;
					UTIL.PKCS5PAD.pad(m, bs);
					for (i = 0, l = m.length; i < l; i += bs) {
						if (i === 0) {
							for (j = 0; j < bs; j++) {
								m[j] ^= iv[j];
							}
						} else {
							for (j = 0; j < bs; j++) {
								m[i + j] ^= m[i + j - bs];
							}
						}
						cipher.encryptBlock(m, i);
					}
				},

				decrypt: function(cipher, c, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('CBC'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l, b, p;
					for (i = 0, l = c.length; i < l; i += bs) {
						b = c.slice(i, i + bs);
						cipher.decryptBlock(c, i);
						if (i === 0) {
							for (j = 0; j < bs; j++) {
								c[j] ^= iv[j];
							}
						} else {
							for (j = 0; j < bs; j++) {
								c[i + j] ^= p[j];
							}
						}
						p = b;
					}
					UTIL.PKCS5PAD.unpad(c, bs);
				}
			};
		}(),

		/**
		 * @class Crypto.BlockCipher.mode.PCBC
		 * <p>TODO: PCBC: Propagating (or Plain Text) Cipher Block Chaining</p>
		 * @singleton
		 */
		PCBC: function() {
			return {
				encrypt: function(cipher, m, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('PCBC'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l, b, p;
					UTIL.PKCS5PAD.pad(m, bs);
					for (i = 0, l = m.length; i < l; i += bs) {
						b = m.slice(i, i + bs);

						if (i === 0) {
							for (j = 0; j < bs; j++) {
								m[j] ^= iv[j];
							}
						} else {
							for (j = 0; j < bs; j++) {
								m[i + j] ^= (m[i + j - bs] ^ p[j]);
							}
						}
						cipher.encryptBlock(m, i);
						p = b;
					}
				},

				decrypt: function(cipher, c, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('PCBC'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l, b, p, t;
					for (i = 0, l = c.length; i < l; i += bs) {
						b = c.slice(i, i + bs);
						cipher.decryptBlock(c, i);
						if (i === 0) {
							for (j = 0; j < bs; j++) {
								c[j] ^= iv[j];
							}
						} else {
							for (j = 0; j < bs; j++) {
								c[i + j] ^= (p[j] ^ t[j]);
							}
						}
						t = c.slice(i, i + bs);
						p = b;
					}
					UTIL.PKCS5PAD.unpad(c, bs);
				}
			};
		}(),

		/**
		 * @class Crypto.BlockCipher.mode.CFB
		 * <p>TODO: CFB: Cipher Feedback</p>
		 * @singleton
		 */
		CFB: function() {
			return {
				encrypt: function(cipher, m, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('CFB'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l, b;
					for (i = 0, l = m.length; i < l; i++) {
						if (i % bs === 0) {
							b = (i === 0 ? iv.slice(0) : m.slice(i - bs, i));
							cipher.encryptBlock(b, 0);
						}
						m[i] ^= b[i % bs];
					}
				},

				decrypt: function(cipher, c, iv) {
					if (!Ext.isArray(iv) || Ext.isEmpty(iv)) {
						throw new Error(ERRORS.IVRequiredError('CFB'));
					}
					if (!(cipher instanceof Crypto.BlockCipher)) {
						throw new Error(ERRORS.NotABlockCipherError(cipher));
					}

					var bs = cipher.Nb * 4, i, j, l, b, p;
					for (i = 0, l = c.length; i < l; i++) {
						if (i % bs === 0) {
							b = (i === 0 ? iv.slice(0) : p);
							cipher.encryptBlock(b, 0);
							p = c.slice(i, i + bs);
						}
						c[i] ^= b[i % bs];
					}
				}
			};
		}()
	};
}();

/**
 * @class Crypto.AES
 * <p>TODO: Advanced Encryption Standard (e.g. Rijndahl)</p>
 * @constructor
 * @extends Crypto.BlockCipher
 */
Crypto.AES = function() {
	Crypto.AES.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.DES
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.BlockCipher
 */
Crypto.DES = function() {
	Crypto.DES.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.DESX
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.BlockCipher
 */
Crypto.DESX = function() {
	Crypto.DESX.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.TripleDES
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.DES
 */
Crypto.TripleDES = function() {
	Crypto.TripleDES.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.BlowFish
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.BlockCipher
 */
Crypto.BlowFish = function() {
	Crypto.BlowFish.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.RC5
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.BlockCipher
 */
Crypto.RC5 = function() {
	Crypto.RC5.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.RC6
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.RC5
 */
Crypto.RC6 = function() {
	Crypto.RC6.superclass.constructor.apply(this, arguments);
};

// =========================================================================================================== Stream ciphers
/**
 * @class Crypto.StreamCipher
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.SymmetricCipher
 */
Crypto.StreamCipher = function() {
	Crypto.StreamCipher.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.ARC4
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.StreamCipher
 */
Crypto.ARC4 = function() {
	Crypto.ARC4.superclass.constructor.apply(this, arguments);
};

Crypto.RC4 = Crypto.ARC4;

/**
 * @class Crypto.MARC4
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.ARC4
 */
Crypto.MARC4 = function() {
	Crypto.MARC4.superclass.constructor.apply(this, arguments);
};

/**
 * @class Crypto.Rabbit
 * <p>TODO</p>
 * @constructor
 * @extends Crypto.StreamCipher
 */
Crypto.Rabbit = function() {
	Crypto.Rabbit.superclass.constructor.apply(this, arguments);
};

// =========================================================================================================== MAC's
Ext.apply(Crypto, function() {
	var ERRORS = Crypto.errors;
	var UTIL = Crypto.util;
	var HASH = Crypto.hash;

	var C1 = [
		[0x00000000, 0x00000000, 0x00000000, 0x00000087],
		[0x00000000, 0x0000001b]
	];

	var C2 = [
		[0x80000000, 0x00000000, 0x00000000, 0x00000043],
		[0x80000000, 0x0000000d]
	];

	var Lshr = function(n, b) {
		var i, l, r = [];

		r[0] = n[0] >>> b;
		for (i = 1, l = n.length; i < l; i++) {
			r[i] = n[i] >>> b;
			r[i] |= UTIL.rotr(n[i - 1], b) & (0x80000000 >> (b - 1));
		}
		return r;
	};

	var Lshl = function(n, b) {
		var i, l, r = [];

		for (i = 0, l = n.length - 1; i < l; i++) {
			r[i] = (n[i] << b) & 0xffffffff;
			r[i] |= UTIL.rotl(n[i + 1], b) & UTIL.rotl(0x80000000 >> (b - 1), b);
		}
		r[l] = (n[l] << b) & 0xffffffff;
		return r;
	};

	var Lxor = function(n1, n2) {
		var i, l, r = [];

		for (i = 0, l = n1.length; i < l; i++) {
			r[i] = n1[i] ^ n2[i];
		}
		return r;
	};

	return {
		HMAC: function(hf, key, s, options) {
			options = options || {};

			hasher = hasher || HASH.sha1;
			key = (Ext.isString(key) ? key.stringToBytes() : key || []);

			// TODO: is this right ??
			key = key.length > hasher.OCTETS ? hasher(key, { asBytes : true } ) : key;

			var	m = (!Ext.isArray(s) ? s.stringToBytes() : s || []),
				i, r, okey = key.slice(0), ikey = key.slice(0);

			for (i = 0; i < hasher.OCTETS; i++) {
				okey[i] ^= 0x5c;
				ikey[i] ^= 0x36;
			}

			r = hasher(okey.concat(hasher(ikey.concat(m), { asBytes : true } )), { asBytes : true });

			return (options.asBytes ? r : options.asString ? r.bytesToString() : r.bytesToHex());
		},

		OMAC: function(cipher, key, s, options) {
			options = options || {};
			cipher = cipher || new Crypto.AES();
			key = (Ext.isString(key) ? key.stringToBytes() : key || []);

			if (!(cipher instanceof Crypto.BlockCipher)) {
				throw new Error(ERRORS.NotABlockCipherError(cipher));
			}

			cipher.init({ keyLen: options.keyLen || cipher.Nk * 32 });

			if (key.length != cipher.Nk * 4) {
				throw new Error(ERRORS.WrongKeyLengthError('OMAC', key.length << 3));
			}
			if (!(cipher.Nb == 2 || cipher.Nb == 4)) {
				throw new Error(ERRORS.BlockSizeNotSupportedError('OMAC', cipher.Nb * 32));
			}

			cipher.keyExpansion({ key: key, iv: [] });

			var	m = (!Ext.isArray(s) ? s.stringToBytes() : s || []),
				l = m.length, bs = cipher.Nb * 4,
				L = Array.fillBytes(bs, 0), c = bs >>> 4, k1, k2, kx, r;

			cipher.encryptBlock(L, 0);

			k1 = Lshl(L.bytesToWords(), 1);
			if ((L[0] >>> 7) !== 0) {
				k1 = Lxor(k1, (c > 0 ? C1[0] : C1[1]));
			}

			k2 = (options.v2 ? Lshr(k1, 1) : Lshl(k1, 1));
			k1 = k1.wordsToBytes();

			if (options.v2) {
				if ((L[bs - 1] & 0x1) !== 0) {
					k2 = Lxor(k2, (c > 0 ? C2[0] : C2[1]));
				}
			} else {
				if ((k1[0] >>> 7) !== 0) {
					k2 = Lxor(k2, (c > 0 ? C1[0] : C1[1]));
				}
			}

			k2 = k2.wordsToBytes();

			if (l > 0 && l % bs === 0) {
				kx = k1;	
			} else {
				m = m.concat(Array.fillBytes(bs - (l % bs), 0));
				m[l] = 0x80; l += bs - (l % bs);
				kx = k2;
			}

			for (i = l - bs, j = 0; i < l; i++, j++) {
				m[i] ^= kx[j];
			}

			r = Array.fillBytes(bs, 0);
			for (i = bs; i < l + bs; i += bs) {
				for (j = 0; j < bs; j++) {
					r[i + j] = r[(i - bs) + j] ^ m[(i - bs) + j];
				}
				cipher.encryptBlock(r, i);
			}

			r = r.slice(l, l + (options.tagLen || bs));

			return (options.asBytes ? r : options.asString ? r.bytesToString() : r.bytesToHex());
		},

		CMAC: function(cipher, key, s, options) {
			options = options || {};
			return Crypto.OMAC(cipher, key, s, Ext.apply(options, { v2: false }));
		}
	};
}());

// =========================================================================================================== Init
// NOTE: this functions initializes the library, but also defines most of the functions/methods & properties
//		 of the classes .. Please do not tamper with it if you don't know what you're doing
(function() {
	// Shortcuts ...
	var ERRORS = Crypto.errors;
	var MATH = Crypto.math;
	var BIGINT = MATH.BigInteger;
	var UTIL = Crypto.util;
	var HASH = Crypto.hash;

	// For block and stream ciphers ...
	var SALTBLOCK = [83, 97, 108, 116, 101, 100, 95, 95];

	// Support functions
	var nbi = function() {
		return new BIGINT(null);
	};

	var nbv = function(i) {
		var r = nbi();
		r.fromInt(i);
		return r;
	};

	Ext.apply(BIGINT.prototype, function() {
		var dbits, am,
			BI_FP = 52,
			BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz",
			BI_RC = [];

		var lowprimes = [
			2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103,
			107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211,
			223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331,
			337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449,
			457, 461, 463, 467, 479, 487, 491, 499, 503, 509
		];
		var lplen = lowprimes.length;
		var lplim = (1 << 26) / lowprimes[lplen - 1];

		var am1 = function(i, x, w, j, c, n) {
			var v;

			while (--n >= 0) {
				v = x * this[i++] + w[j] + c;
				c = Math.floor(v / 0x4000000);
				w[j++] = v & 0x3ffffff;
			}
			return c;
		};

		var am2 = function(i, x, w, j, c, n) {
			var l, h, m;

			while (--n >= 0) {
				l = this[i] & 0x7fff;
				h = this[i++] >> 15;
				m = xh * l + h * xl;
				l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
				c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
				w[j++] = l & 0x3fffffff;
			}
			return c;
		};

		var am3 = function(i, x, w, j, c, n) {
			var l, h, m;
			var xl = x & 0x3fff, xh = x >> 14;
			while (--n >= 0) {
				l = this[i] & 0x3fff;
				h = this[i++] >> 14;
				m = xh * l + h * xl;
				l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
				c = (l >> 28) + (m >> 14) + xh * h;
				w[j++] = l & 0xfffffff;
			}
			return c;
		};

		// JavaScript engine analysis ...
		// TODO: Does this the right job for all engines?
		var canary = 0xdeadbeefcafe;
		var j_lm = ((canary & 0xffffff) == 0xfecafe);

		if (j_lm && Ext.isIE) {
			am = am2;
			dbits = 30;
		} else if (j_lm) {
			am = am1;
			dbits = 26;
		} else {
			am = am3;
			dbits = 28;
		}

		var rr, vv;

		rr = "0".charCodeAt(0);
		for (vv = 0; vv <= 9; ++vv) {
			BI_RC[rr++] = vv;
		}

		rr = "a".charCodeAt(0);
		for (vv = 10; vv < 36; ++vv) {
			BI_RC[rr++] = vv;
		}

		rr = "A".charCodeAt(0);
		for (vv = 10; vv < 36; ++vv) {
			BI_RC[rr++] = vv;
		}

		// Methods
		var op_and = function(x, y) {
			return x & y;
		};

		var op_or = function(x, y) {
			return x | y;
		};

		var op_xor = function(x, y) {
			return x ^ y;
		};

		var op_andnot = function(x, y) {
			return x & ~y;
		};

		var lbit = function(x) {
			if (x === 0) {
				return -1;
			}
			var r = 0;
			if ((x & 0xffff) === 0) {
				x >>= 16; r += 16;
			}
			if ((x & 0xff) === 0) {
				x >>= 8; r += 8;
			}
			if ((x & 0xf) === 0) {
				x >>= 4; r += 4;
			}
			if ((x & 3) === 0) {
				x >>= 2; r += 2;
			}
			if ((x & 1) === 0) {
				++r;
			}
			return r;
		};

		var cbit = function(x) {
			var r = 0;
			while (x !== 0) {
				x &= x-1; ++r;
			}
			return r;
		};

		var intAt = function(s, i) {
			var c = BI_RC[s.charCodeAt(i)];
			return (c === undefined || c === null) ? -1 : c;
		};

		var nbits = function(x) {
			var r = 1, t;

			if ((t = x >>> 16) !== 0) {
				x = t; r += 16;
			}
			if ((t = x >> 8) !== 0) {
				x = t; r += 8;
			}
			if ((t = x >> 4) !== 0) {
				x = t; r += 4;
			}
			if ((t = x >> 2) !== 0) {
				x = t; r += 2;
			}
			if ((t = x >> 1) !== 0) {
				x = t; r += 1;
			}
			return r;
		};

		return {
			// constants
			DB: dbits,
			DM: ((1 << dbits) - 1),
			DV: (1 << dbits),
			FV: Math.pow(2, BI_FP),
			F1: BI_FP - dbits,
			F2: 2 * dbits - BI_FP,

			// functions
			am: am,

			copyTo: function(r) {
				for (var i = this.t - 1; i >= 0; --i) {
					r[i] = this[i];
				}
				r.t = this.t;
				r.s = this.s;
			},

			fromInt: function(x) {
				this.t = 1;
				this.s = (x < 0) ? -1 : 0;
				if (x > 0) {
					this[0] = x;
				} else if (x < -1) {
					this[0] = x + this.DV;
				} else {
					this.t = 0;
				}
			},

			fromBytes: function(s) {
				var k = 4;
				this.t = 0;
				this.s = 0;
				var i = s.length, sh = 0;

				while (--i >= 0) {
					for (var j = 0; j < 2; j++) {
						var x = (j === 0 ? s[i] & 0xf : s[i] >>> k);
						if (sh === 0) {
							this[this.t++] = x;
						} else if (sh + k > this.DB) {
							this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
							this[this.t++] = (x >> (this.DB - sh));
						} else {
							this[this.t - 1] |= x << sh;
						}
						sh += k;
						if (sh >= this.DB) {
							sh -= this.DB;
						}
					}
				}
				this.clamp();
			},

			fromString: function(s, b) {
				var k;
				if (b == 16) {
					k = 4;
				} else if (b == 8) {
					k = 3;
				} else if (b == 256) {
					k = 8;
				} else if (b == 2) {
					k = 1;
				} else if (b == 32) {
					k = 5;
				} else if (b == 4) {
					k = 2;
				} else {
					this.fromRadix(s, b);
					return;
				}

				this.t = 0;
				this.s = 0;
				var i = s.length, mi = false, sh = 0;

				while (--i >= 0) {
					var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
					if (x < 0) {
						if (s.charAt(i) == "-") {
							mi = true;
						}
						continue;
					}
					mi = false;
					if (sh === 0) {
						this[this.t++] = x;
					} else if (sh + k > this.DB) {
						this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
						this[this.t++] = (x >> (this.DB - sh));
					} else {
						this[this.t - 1] |= x << sh;
					}
					sh += k;
					if (sh >= this.DB) {
						sh -= this.DB;
					}
				}
				if (k == 8 && (s[0] & 0x80) !== 0) {
					this.s = -1;
					if (sh > 0) {
						this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
					}
				}
				this.clamp();
				if (mi) {
					BIGINT.ZERO.subTo(this, this);
				}
			},

			clamp: function() {
				var c = this.s & this.DM;
				while (this.t > 0 && this[this.t - 1] == c) {
					--this.t;
				}
			},

			dlShiftTo: function(n, r) {
				var i;
				for (i = this.t - 1; i >= 0; --i) {
					r[i + n] = this[i];
				}
				for (i = n - 1; i >= 0; --i) {
					r[i] = 0;
				}
				r.t = this.t + n;
				r.s = this.s;
			},

			drShiftTo: function(n, r) {
				for (var i = n; i < this.t; ++i) {
					r[i - n] = this[i];
				}
				r.t = Math.max(this.t - n,0);
				r.s = this.s;
			},

			lShiftTo: function(n, r) {
				var bs = n % this.DB;
				var cbs = this.DB - bs;
				var bm = (1 << cbs) - 1;
				var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
				for (i = this.t - 1; i >= 0; --i) {
					r[i + ds + 1] = (this[i] >> cbs) | c;
					c = (this[i] & bm) << bs;
				}
				for (i = ds - 1; i >= 0; --i) {
					r[i] = 0;
				}
				r[ds] = c;
				r.t = this.t + ds + 1;
				r.s = this.s;
				r.clamp();
			},

			rShiftTo: function(n, r) {
				r.s = this.s;
				var ds = Math.floor(n / this.DB);
				if (ds >= this.t) {
					r.t = 0;
					return;
				}
				var bs = n % this.DB;
				var cbs = this.DB - bs;
				var bm = (1 << bs) - 1;
				r[0] = this[ds] >> bs;
				for (var i = ds + 1; i < this.t; ++i) {
					r[i - ds - 1] |= (this[i] & bm) << cbs;
					r[i - ds] = this[i] >> bs;
				}
				if (bs > 0) {
					r[this.t - ds - 1] |= (this.s & bm) << cbs;
				}
				r.t = this.t - ds;
				r.clamp();
			},

			subTo: function(a, r) {
				var i = 0, c = 0, m = Math.min(a.t, this.t);
				while (i < m) {
					c += this[i] - a[i];
					r[i++] = c & this.DM;
					c >>= this.DB;
				}
				if (a.t < this.t) {
					c -= a.s;
					while (i < this.t) {
						c += this[i];
						r[i++] = c & this.DM;
						c >>= this.DB;
					}
					c += this.s;
				} else {
					c += this.s;
					while (i < a.t) {
						c -= a[i];
						r[i++] = c & this.DM;
						c >>= this.DB;
					}
					c -= a.s;
				}
				r.s = (c<0) ? -1 : 0;
				if (c < -1) {
					r[i++] = this.DV + c;
				} else if (c > 0) {
					r[i++] = c;
				}
				r.t = i;
				r.clamp();
			},

			multiplyTo: function(a, r) {
				var x = this.abs(), y = a.abs();
				var i = x.t;
				r.t = i + y.t;
				while (--i >= 0) {
					r[i] = 0;
				}
				for (i = 0; i < y.t; ++i) {
					r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
				}
				r.s = 0;
				r.clamp();
				if (this.s != a.s) {
					BIGINT.ZERO.subTo(r, r);
				}
			},

			squareTo: function(r) {
				var x = this.abs();
				var i = r.t = 2 * x.t;
				while (--i >= 0) {
					r[i] = 0;
				}
				for (i = 0; i < x.t - 1; ++i) {
					var c = x.am(i, x[i], r, 2 * i, 0, 1);
					if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
						r[i + x.t] -= x.DV;
						r[i + x.t + 1] = 1;
					}
				}
				if (r.t > 0) {
					r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
				}
				r.s = 0;
				r.clamp();
			},

			divRemTo: function(m, q, r) {
				var pm = m.abs();
				if (pm.t <= 0) {
					return;
				}
				var pt = this.abs();
				if (pt.t < pm.t) {
					if (q && q !== null) {
						q.fromInt(0);
					}
					if (r && r !== null) {
						this.copyTo(r);
					}
					return;
				}
				if ((r === undefined || r === null)) {
					r = nbi();
				}
				var y = nbi(), ts = this.s, ms = m.s;
				var nsh = this.DB - nbits(pm[pm.t - 1]);
				if (nsh > 0) {
					pm.lShiftTo(nsh, y);
					pt.lShiftTo(nsh, r);
				} else {
					pm.copyTo(y);
					pt.copyTo(r);
				}
				var ys = y.t;
				var y0 = y[ys - 1];
				if (y0 === 0) {
					return;
				}
				var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
				var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
				var i = r.t, j = i - ys, t = ((q === undefined || q === null)) ? nbi() : q;
				y.dlShiftTo(j, t);
				if (r.compareTo(t) >= 0) {
					r[r.t++] = 1;
					r.subTo(t, r);
				}
				BIGINT.ONE.dlShiftTo(ys, t);
				t.subTo(y, y);
				while (y.t < ys) {
					y[y.t++] = 0;
				}
				while (--j >= 0) {
					var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
					if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) {
						y.dlShiftTo(j, t);
						r.subTo(t, r);
						while (r[i] < --qd) {
							r.subTo(t, r);
						}
					}
				}
				if (q && q !== null) {
					r.drShiftTo(ys, q);
					if (ts != ms) {
						BIGINT.ZERO.subTo(q, q);
					}
				}
				r.t = ys;
				r.clamp();
				if (nsh > 0) {
					r.rShiftTo(nsh,r);
				}
				if (ts < 0) {
					BIGINT.ZERO.subTo(r,r);
				}
			},

			invDigit: function() {
				if (this.t < 1) {
					return 0;
				}
				var x = this[0];
				if ((x & 1) === 0) {
					return 0;
				}
				var y = x & 3;
				y = (y * (2 - (x & 0xf) * y)) & 0xf;
				y = (y * (2 - (x & 0xff) * y)) & 0xff;
				y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff;
				y = (y * (2 - x * y % this.DV)) % this.DV;
				return (y>0) ? this.DV - y : -y;
			},

			isEven: function() {
				return ((this.t > 0) ? (this[0] & 1) : this.s) === 0;
			},

			exp: function(e, z) {
				if (e > 0xffffffff || e < 1) {
					return BIGINT.ONE;
				}
				var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
				g.copyTo(r);
				while (--i >= 0) {
					z.sqrTo(r, r2);
					if ((e & (1 << i)) > 0) {
						z.mulTo(r2, g, r);
					} else {
						var t = r; r = r2; r2 = t;
					}
				}
				return z.revert(r);
			},

			chunkSize: function(r) {
				return Math.floor(Math.LN2 * this.DB / Math.log(r));
			},

			toRadix: function(b) {
				if (b === undefined || b === null) {
					b = 10;
				}
				if (this.signum() === 0 || b < 2 || b > 36) {
					return "0";
				}
				var cs = this.chunkSize(b);
				var a = Math.pow(b, cs);
				var d = nbv(a), y = nbi(), z = nbi(), r = [];
				this.divRemTo(d, y, z);
				while (y.signum() > 0) {
					r.push((a + z.intValue()).toString(b).substring(1));
					y.divRemTo(d, y, z);
				}
				r.push(z.intValue().toString(b));
				r.reverse();

				return r.join('');
			},

			fromRadix: function(s, b) {
				this.fromInt(0);
				if (b === undefined || b === null) {
					b = 10;
				}
				var cs = this.chunkSize(b);
				var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
				for (var i = 0, l = s.length; i < l; ++i) {
					var x = intAt(s, i);
					if (x < 0) {
						if (s.charAt(i) == "-" && this.signum() === 0) {
							mi = true;
						}
						continue;
					}
					w = b * w + x;
					if (++j >= cs) {
						this.dMultiply(d);
						this.dAddOffset(w, 0);
						j = 0;
						w = 0;
					}
				}
				if (j > 0) {
					this.dMultiply(Math.pow(b, j));
					this.dAddOffset(w, 0);
				}
				if (mi) {
					BIGINT.ZERO.subTo(this, this);
				}
			},

			fromNumber: function(a, b, c) {
				if (Ext.isNumber(b)) {
					if (a < 2) {
						this.fromInt(1);
					} else {
						this.fromNumber(a, c);
						if (!this.testBit(a - 1)) {
							this.bitwiseTo(BIGINT.ONE.shiftLeft(a - 1), op_or, this);
						}
						if (this.isEven()) {
							this.dAddOffset(1, 0);
						}
						while (!this.isProbablePrime(b)) {
							this.dAddOffset(2, 0);
							if (this.bitLength() > a) {
								this.subTo(BIGINT.ONE.shiftLeft(a - 1), this);
							}
						}
					}
				} else {
					var x = [], t = a & 7;
					x.length = (a >> 3) + 1;
					b.nextBytes(x);
					if (t > 0) {
						x[0] &= ((1 << t) - 1);
					} else {
						x[0] = 0;
					}
					this.fromString(x, 256);
				}
			},

			bitwiseTo: function(a, op, r) {
				var i, f, m = Math.min(a.t, this.t);
				for (i = 0; i < m; ++i) {
					r[i] = op(this[i], a[i]);
				}
				if (a.t < this.t) {
					f = a.s & this.DM;
					for (i = m; i < this.t; ++i) {
						r[i] = op(this[i], f);
					}
					r.t = this.t;
				} else {
					f = this.s & this.DM;
					for (i = m; i < a.t; ++i) {
						r[i] = op(f, a[i]);
					}
					r.t = a.t;
				}
				r.s = op(this.s, a.s);
				r.clamp();
			},

			changeBit: function(n, op) {
				var r = BIGINT.ONE.shiftLeft(n);
				this.bitwiseTo(r, op, r);
				return r;
			},

			addTo: function(a, r) {
				var i = 0, c = 0, m = Math.min(a.t, this.t);
				while (i < m) {
					c += this[i] + a[i];
					r[i++] = c & this.DM;
					c >>= this.DB;
				}
				if (a.t < this.t) {
					c += a.s;
					while (i < this.t) {
						c += this[i];
						r[i++] = c & this.DM;
						c >>= this.DB;
					}
					c += this.s;
				} else {
					c += this.s;
					while (i < a.t) {
						c += a[i];
						r[i++] = c & this.DM;
						c >>= this.DB;
					}
					c += a.s;
				}
				r.s = (c < 0) ? -1 : 0;
				if (c > 0) {
					r[i++] = c;
				} else if (c < -1) {
					r[i++] = this.DV + c;
				}
				r.t = i;
				r.clamp();
			},

			dMultiply: function(n) {
				this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
				++this.t;
				this.clamp();
			},

			dAddOffset: function(n, w) {
				while (this.t <= w) {
					this[this.t++] = 0;
				}
				this[w] += n;
				while (this[w] >= this.DV) {
					this[w] -= this.DV;
					if (++w >= this.t) {
						this[this.t++] = 0;
					}
					++this[w];
				}
			},

			multiplyLowerTo: function(a, n, r) {
				var i = Math.min(this.t + a.t, n);
				r.s = 0;
				r.t = i;
				while (i > 0) {
					r[--i] = 0;
				}
				var j;
				for (j = r.t - this.t; i < j; ++i) {
					r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
				}
				for (j = Math.min(a.t, n); i < j; ++i) {
					this.am(0, a[i], r, i, 0, n - i);
				}
				r.clamp();
			},

			multiplyUpperTo: function(a, n, r) {
				--n;
				var i = r.t = this.t + a.t - n;
				r.s = 0;
				while (--i >= 0) {
					r[i] = 0;
				}
				for (i = Math.max(n - this.t, 0); i < a.t; ++i) {
					r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
				}
				r.clamp();
				r.drShiftTo(1, r);
			},

			modInt: function(n) {
				if (n <= 0) {
					return 0;
				}
				var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
				if (this.t > 0) {
					if (d === 0) {
						r = this[0] % n;
					} else {
						for (var i = this.t - 1; i >= 0; --i) {
							r = (d * r + this[i]) % n;
						}
					}
				}
				return r;
			},

			millerRabin: function(t) {
				var n1 = this.subtract(BIGINT.ONE);
				var k = n1.getLowestSetBit();
				if (k <= 0) {
					return false;
				}
				var r = n1.shiftRight(k);
				t = (t + 1) >> 1;
				if (t > lplen) {
					t = lplen;
				}
				var a = nbi();
				for (var i = 0; i < t; ++i) {
					a.fromInt(lowprimes[i]);
					var y = a.modPow(r, this);
					if (y.compareTo(BIGINT.ONE) !== 0 && y.compareTo(n1) !== 0) {
						var j = 1;
						while (j++ < k && y.compareTo(n1) !== 0) {
							y = y.modPowInt(2, this);
							if (y.compareTo(BIGINT.ONE) === 0) {
								return false;
							}
						}
						if (y.compareTo(n1) !== 0) {
							return false;
						}
					}
				}
				return true;
			},

			toBytes: function() {
				var k = 4, km = (1 << k) - 1, d,
					m = false, r = [], i = this.t,
					p = this.DB - (i * this.DB % k);

				if (i-- > 0) {
					if (p < this.DB && (d = this[i] >> p) > 0) {
						m = true; r.push(d);
					}
					while (i >= 0) {
						if (p < k) {
							d = (this[i] & ((1 << p) - 1)) << (k - p);
							d |= this[--i] >> (p += this.DB - k);
						} else {
							d = (this[i] >> (p -= k)) & km;
							if (p <= 0) {
								p += this.DB; --i;
							}
						}
						if (d > 0) {
							m = true;
						}
						if (m) {
							r.push(d);
						}
					}
				}
				if (m) {
					if (r.length & 0x1 > 0) {
						r = [0].concat(r);
					}
					for (i = 0, j = 0, l = r.length; i < l; i += 2, j++) {
						r[j] = r[i] << k | r[i + 1];
					}
					return r.slice(0, j);
				}
				return [0];
			},

			toString: function(b) {
				if (this.s < 0) {
					return ["-", this.negate().toString(b)].join('');
				}

				var k;
				if (b == 16) {
					k = 4;
				} else if (b == 8) {
					k = 3;
				} else if (b == 2) {
					k = 1;
				} else if (b == 32) {
					k = 5;
				} else if (b == 4) {
					k = 2;
				} else {
					return this.toRadix(b);
				}
				var km = (1 << k) - 1, d, m = false, r = [], i = this.t;
				var p = this.DB - (i * this.DB) % k;
				if (i-- > 0) {
					if (p < this.DB && (d = this[i] >> p) > 0) {
						m = true; r.push(BI_RM.charAt(d));
					}
					while (i >= 0) {
						if (p < k) {
							d = (this[i] & ((1 << p) - 1)) << (k - p);
							d |= this[--i] >> (p += this.DB - k);
						} else {
							d = (this[i] >> (p -= k)) & km;
							if (p <= 0) {
								p += this.DB; --i;
							}
						}
						if (d > 0) {
							m = true;
						}
						if (m) {
							r.push(BI_RM.charAt(d));
						}
					}
				}
				return m ? r.join('') : "0";
			},

			negate: function() {
				var r = nbi();
				BIGINT.ZERO.subTo(this, r);

				return r;
			},

			abs: function() {
				return (this.s < 0) ? this.negate() : this;
			},

			compareTo: function(a) {
				var r = this.s - a.s;
				if (r !== 0) {
					return r;
				}
				var i = this.t;
				r = i - a.t;
				if (r !== 0) {
					return r;
				}
				while (--i >= 0) {
					if ((r = this[i] - a[i]) !== 0) {
						return r;
					}
				}
				return 0;
			},

			bitLength: function() {
				if (this.t <= 0) {
					return 0;
				}
				return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
			},

			mod: function(a) {
				var r = nbi();
				this.abs().divRemTo(a, null, r);
				if (this.s < 0 && r.compareTo(BIGINT.ZERO) > 0) {
					a.subTo(r,r);
				}
				return r;
			},

			modPowInt: function(e, m) {
				var z;
				if (e < 256 || m.isEven()) {
					z = new MATH.ClassicReduction(m);
				} else {
					z = new MATH.MontgomeryReduction(m);
				}
				return this.exp(e, z);
			},

			clone: function () {
				var r = nbi();
				this.copyTo(r);
				return r;
			},

			intValue: function() {
				if (this.s < 0) {
					if (this.t == 1) {
						return this[0] - this.DV;
					} else if (this.t === 0) {
						return -1;
					}
				} else if (this.t == 1) {
					return this[0];
				} else if (this.t === 0) {
					return 0;
				}
				return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
			},

			byteValue: function() {
				return (this.t === 0) ? this.s : (this[0] << 24) >> 24;
			},

			shortValue: function() {
				return (this.t === 0) ? this.s : (this[0] << 16) >> 16;
			},

			signum: function() {
				if (this.s < 0) {
					return -1;
				} else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) {
					return 0;
				} else {
					return 1;
				}
			},

			toRawBytes: function() {
				var i = this.t, r = [];
				r[0] = this.s;
				var p = this.DB - (i * this.DB) % 8, d, k = 0;
				if (i-- > 0) {
					if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p) {
						r[k++] = d | (this.s << (this.DB - p));
					}
					while (i >= 0) {
						if (p < 8) {
							d = (this[i] & ((1 << p) - 1)) << (8 - p);
							d |= this[--i] >> (p += this.DB - 8);
						} else {
							d = (this[i] >> (p -= 8)) & 0xff;
							if (p <= 0) {
								p += this.DB; --i;
							}
						}
						if ((d & 0x80) !== 0) {
							d |= -256;
						}
						if (k === 0 && (this.s & 0x80) != (d & 0x80)) {
							++k;
						}
						if (k > 0 || d != this.s) {
							r[k++] = d;
						}
					}
				}
				return r;
			},

			equals: function(a) {
				return (this.compareTo(a) === 0);
			},

			min: function(a) {
				return (this.compareTo(a) < 0) ? this : a;
			},

			max: function(a) {
				return (this.compareTo(a) > 0) ? this : a;
			},

			and: function(a) {
				var r = nbi();
				this.bitwiseTo(a, op_and, r);
				return r;
			},

			or: function(a) {
				var r = nbi();
				this.bitwiseTo(a, op_or, r);
				return r;
			},

			xor: function(a) {
				var r = nbi();
				this.bitwiseTo(a, op_xor, r);
				return r;
			},

			andNot: function(a) {
				var r = nbi();
				this.bitwiseTo(a, op_andnot, r);
				return r;
			},

			not: function() {
				var r = nbi();
				for (var i = 0; i < this.t; ++i) {
					r[i] = this.DM & ~this[i];
				}
				r.t = this.t;
				r.s = ~this.s;
				return r;
			},

			shiftLeft: function(n) {
				var r = nbi();
				if (n < 0) {
					this.rShiftTo(-n, r);
				} else {
					this.lShiftTo(n, r);
				}
				return r;
			},

			shiftRight: function(n) {
				var r = nbi();
				if (n < 0) {
					this.lShiftTo(-n, r);
				} else {
					this.rShiftTo(n, r);
				}
				return r;
			},

			getLowestSetBit: function() {
				for (var i = 0; i < this.t; ++i) {
					if (this[i] !== 0) {
						return i * this.DB + lbit(this[i]);
					}
				}
				if (this.s < 0) {
					return this.t * this.DB;
				}
				return -1;
			},

			bitCount: function() {
				var r = 0, x = this.s & this.DM;
				for (var i = 0; i < this.t; ++i) {
					r += cbit(this[i] ^ x);
				}
				return r;
			},

			testBit: function(n) {
				var j = Math.floor(n / this.DB);
				if (j >= this.t) {
					return (this.s !== 0);
				}
				return ((this[j] & (1 << (n % this.DB))) !== 0);
			},

			setBit: function(n) {
				return this.changeBit(n, op_or);
			},

			clearBit: function(n) {
				return this.changeBit(n, op_andnot);
			},

			flipBit: function(n) {
				return this.changeBit(n, op_xor);
			},

			add: function(a) {
				var r = nbi();
				this.addTo(a, r);
				return r;
			},

			subtract: function(a) {
				var r = nbi();
				this.subTo(a, r);
				return r;
			},

			multiply: function(a) {
				var r = nbi();
				this.multiplyTo(a, r);
				return r;
			},

			divide: function(a) {
				var r = nbi();
				this.divRemTo(a, r, null);
				return r;
			},

			remainder: function(a) {
				var r = nbi();
				this.divRemTo(a, null, r);
				return r;
			},

			divideAndRemainder: function(a) {
				var q = nbi(), r = nbi();
				this.divRemTo(a, q, r);
				return [q, r];
			},

			modPow: function(e, m) {
				var i = e.bitLength(), k, r = nbv(1), z;
				if (i <= 0) {
					return r;
				} else if (i < 18) {
					k = 1;
				} else if (i < 48) {
					k = 3;
				} else if (i < 144) {
					k = 4;
				} else if (i < 768) {
					k = 5;
				} else { 
					k = 6;
				}
				if (i < 8) {
					z = new MATH.ClassicReduction(m);
				} else if (m.isEven()) {
					z = new MATH.BarrettReduction(m);
				} else {
					z = new MATH.MontgomeryReduction(m);
				}

				var g = [], n = 3, k1 = k-1, km = (1 << k) - 1;
				g[1] = z.convert(this);
				if (k > 1) {
					var g2 = nbi();
					z.sqrTo(g[1], g2);
					while (n <= km) {
						g[n] = nbi();
						z.mulTo(g2, g[n - 2], g[n]);
						n += 2;
					}
				}

				var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
				i = nbits(e[j]) - 1;
				while (j >= 0) {
					if (i >= k1) {
						w = (e[j] >> (i - k1)) & km;
					} else {
						w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
						if (j > 0) {
							w |= e[j - 1] >> (this.DB + i - k1);
						}
					}

					n = k;
					while ((w &1) === 0) {
						w >>= 1; --n;
					}
					if ((i -= n) < 0) {
						i += this.DB; --j;
					}
					if (is1) {
						g[w].copyTo(r);
						is1 = false;
					} else {
						while (n > 1) {
							z.sqrTo(r, r2);
							z.sqrTo(r2, r);
							n -= 2;
						}
						if (n > 0) {
							z.sqrTo(r,r2);
						} else {
							t = r; r = r2; r2 = t;
						}
						z.mulTo(r2, g[w], r);
					}

					while (j >= 0 && (e[j] & (1 << i)) === 0) {
						z.sqrTo(r, r2); t = r; r = r2; r2 = t;
						if (--i < 0) {
							i = this.DB-1; --j;
						}
					}
				}
				return z.revert(r);
			},

			modInverse: function(m) {
				var ac = m.isEven();
				if ((this.isEven() && ac) || m.signum() === 0) {
					return BIGINT.ZERO;
				}
				var u = m.clone(), v = this.clone();
				var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
				while (u.signum() !== 0) {
					while (u.isEven()) {
						u.rShiftTo(1, u);
						if (ac) {
							if (!a.isEven() || !b.isEven()) {
								a.addTo(this, a); b.subTo(m, b);
							}
							a.rShiftTo(1, a);
						} else if (!b.isEven()) {
							b.subTo(m, b);
						}
						b.rShiftTo(1, b);
					}
					while (v.isEven()) {
						v.rShiftTo(1, v);
						if (ac) {
							if (!c.isEven() || !d.isEven()) {
								c.addTo(this, c); d.subTo(m, d);
							}
							c.rShiftTo(1, c);
						} else if (!d.isEven()) {
							d.subTo(m, d);
						}
						d.rShiftTo(1, d);
					}
					if (u.compareTo(v) >= 0) {
						u.subTo(v, u);
						if (ac) {
							a.subTo(c, a);
						}
						b.subTo(d, b);
					} else {
						v.subTo(u, v);
						if (ac) {
							c.subTo(a, c);
						}
						d.subTo(b, d);
					}
				}
				if (v.compareTo(BIGINT.ONE) !== 0) {
					return BIGINT.ZERO;
				}
				if (d.compareTo(m) >= 0) {
					return d.subtract(m);
				}
				if (d.signum() < 0) {
					d.addTo(m, d);
				} else {
					return d;
				}
				if (d.signum() < 0) {
					return d.add(m);
				} else {
					return d;
				}
			},

			pow: function(e) {
				return this.exp(e, new MATH.NullReduction());
			},

			gcd: function(a) {
				var x = (this.s < 0) ? this.negate() : this.clone();
				var y = (a.s < 0) ? a.negate(): a.clone();
				if (x.compareTo(y) < 0) {
					var t = x; x = y; y = t;
				}
				var i = x.getLowestSetBit(), g = y.getLowestSetBit();
				if (g < 0) {
					return x;
				}
				if (i < g) {
					g = i;
				}
				if (g > 0) {
					x.rShiftTo(g, x);
					y.rShiftTo(g, y);
				}
				while (x.signum() > 0) {
					if ((i = x.getLowestSetBit()) > 0) {
						x.rShiftTo(i, x);
					}
					if ((i = y.getLowestSetBit()) > 0) {
						y.rShiftTo(i, y);
					}
					if (x.compareTo(y) >= 0) {
						x.subTo(y, x);
						x.rShiftTo(1, x);
					} else {
						y.subTo(x, y);
						y.rShiftTo(1, y);
					}
				}
				if (g > 0) {
					y.lShiftTo(g, y);
				}
				return y;
			},

			isProbablePrime: function(t) {
				var i, x = this.abs();
				if (x.t == 1 && x[0] <= lowprimes[lplen - 1]) {
					for (i = 0; i < lplen; ++i) {
						if (x[0] == lowprimes[i]) {
							return true;
						}
					}
					return false;
				}
				if (x.isEven()) {
					return false;
				}
				i = 1;
				while (i < lplen) {
					var m = lowprimes[i], j = i + 1;
					while (j < lplen && m < lplim) {
						m *= lowprimes[j++];
					}
					m = x.modInt(m);
					while (i < j) {
						if (m % lowprimes[i++] === 0) {
							return false;
						}
					}
				}
				return x.millerRabin(t);
			}
		};
	}());

	BIGINT.ZERO = nbv(0);
	BIGINT.ONE = nbv(1);

	MATH.parseBigInt = function(s, r) {
		r = r || 16;
		var x = Ext.isArray(s) ? new BIGINT(s) : new BIGINT(s, r);
		if (x === undefined || x === null) {
			throw new Error(ERRORS.NotABigIntegerError());
		}
		return x;
	};

	// Modular reducers
	MATH.AbstractReduction = function(m) {
		this.m = m;
	};

	Ext.apply(MATH.AbstractReduction.prototype, {
		convert: function(x) {
			throw new Error(ERRORS.AbstractError('AbstractReduction::convert'));
		},

		revert: function(x) {
			return x;
		},

		reduce: function(x) {
			throw new Error(ERRORS.AbstractError('AbstractReduction::reduce'));
		},

		mulTo: function(x, y, r) {
			x.multiplyTo(y, r);
			this.reduce(r);
		},

		sqrTo: function(x, r) {
			x.squareTo(r);
			this.reduce(r);
		}
	});

	MATH.NullReduction = function() {
		// Empty constructor
	};

	Ext.extend(MATH.NullReduction, MATH.AbstractReduction, {
		convert: function(x) {
			return x;
		}
	});

	MATH.ClassicReduction = function(m) {
		MATH.ClassicReduction.superclass.constructor.apply(this, arguments);
	};

	Ext.extend(MATH.ClassicReduction, MATH.AbstractReduction, {
		convert: function(x) {
			if (x.s < 0 || x.compareTo(this.m) >= 0) {
				return x.mod(this.m);
			} else {
				return x;
			}
		},

		reduce: function(x) {
			x.divRemTo(this.m, null, x);
		}
	});

	MATH.BarrettReduction = function(m) {
		this.r2 = nbi();
		this.q3 = nbi();

		BIGINT.ONE.dlShiftTo(2 * m.t, this.r2);
		this.mu = this.r2.divide(m);

		MATH.BarrettReduction.superclass.constructor.apply(this, arguments);
	};

	Ext.extend(MATH.BarrettReduction, MATH.AbstractReduction, {
		convert: function(x) {
			if (x.s < 0 || x.t > 2 * this.m.t) {
				return x.mod(this.m);
			} else if (x.compareTo(this.m) < 0) {
				return x;
			} else {
				var r = nbi();
				x.copyTo(r);
				this.reduce(r);
				return r;
			}
		},

		reduce: function(x) {
			x.drShiftTo(this.m.t-1, this.r2);
			if (x.t > this.m.t+1) {
				x.t = this.m.t + 1; x.clamp();
			}
			this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
			this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
			while (x.compareTo(this.r2) < 0) {
				x.dAddOffset(1, this.m.t + 1);
			}
			x.subTo(this.r2, x);
			while (x.compareTo(this.m) >= 0) {
				x.subTo(this.m, x);
			}
		}
	});

	MATH.MontgomeryReduction = function(m) {
		MATH.MontgomeryReduction.superclass.constructor.apply(this, arguments);

		this.mp = m.invDigit();
		this.mpl = this.mp & 0x7fff;
		this.mph = this.mp >> 15;
		this.um = (1 << (m.DB - 15)) - 1;
		this.mt2 = 2 * m.t;
	};

	Ext.extend(MATH.MontgomeryReduction, MATH.AbstractReduction, {
		convert: function(x) {
			var r = nbi();

			x.abs().dlShiftTo(this.m.t, r);
			r.divRemTo(this.m, null, r);
			if (x.s < 0 && r.compareTo(BIGINT.ZERO) > 0) {
				this.m.subTo(r, r);
			}
			return r;
		},

		revert: function(x) {
			var r = nbi();

			x.copyTo(r);
			this.reduce(r);
			return r;
		},

		reduce: function(x) {
			while (x.t <= this.mt2) {
				x[x.t++] = 0;
			}
			for (var i = 0; i < this.m.t; ++i) {
				var j = x[i] & 0x7fff;
				var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
				j = i + this.m.t;
				x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
				while (x[j] >= x.DV) {
					x[j] -= x.DV; x[++j]++;
				}
			}
			x.clamp();
			x.drShiftTo(this.m.t, x);
			if (x.compareTo(this.m) >= 0) {
				x.subTo(this.m, x);
			}
		}
	});

	// SecureRandom
	Ext.apply(UTIL.SecureRandom.prototype, function() {
		var rng_pool = [],
			rng_pptr = 0,
			rng_psize = 256;

		var rndSeedInt = function(n) {
			rng_pool[rng_pptr++] ^= n & 0xff; rng_pptr %= rng_psize;
			rng_pool[rng_pptr++] ^= (n >> 8) & 0xff; rng_pptr %= rng_psize;
			rng_pool[rng_pptr++] ^= (n >> 16) & 0xff; rng_pptr %= rng_psize;
			rng_pool[rng_pptr++] ^= (n >> 24) & 0xff; rng_pptr %= rng_psize;
		};

		var rngSeedTime = function() {
			rndSeedInt(new Date().getTime());
		};

		// Pre-initialize the RNG pool ...
		var i, n;

		try {
			// Let's see if we can use the browsers random() function to add some more entropy ...
			if (Ext.isDefined(window.crypto) && Ext.isFunction(window.crypto.random)) {
				n = window.crypto.random(32);

				for (i = 0; i < n.length; ++i) {
					rng_pool[rng_pptr++] = n.charCodeAt(i) & 0xff;
					rng_pptr %= rng_psize;
				}
			}	
		} catch (e) {
			// Do nothing ...
		}

		while (rng_pptr < rng_psize) {
			n = Math.floor(65536 * Math.random());
			rng_pool[rng_pptr++] = (n >>> 8) & 0xff;
			rng_pool[rng_pptr++] = n & 0xff;
		}

		rng_pptr = 0;
		rngSeedTime();

		return {
			reset: function() {
				delete this.state;
			},

			nextByte: function() {
				if (!this.state) {
					rngSeedTime();

					// Use MARC4 to generate random byte streams ...
					this.state = new Crypto.MARC4();
					this.state.init({ keyLen : rng_psize << 3 });
					this.state.keyExpansion({ key: rng_pool, iv: [] });
				}
				return this.state.nextByte();
			},

			nextBytes: function(bytes) {
				for (var i = 0, l = bytes.length; i < l; ++i) {
					bytes[i] = this.nextByte();
				}
			}
		};
	}());

	// Generic cipher
	Ext.extend(Crypto.Cipher, Ext.util.Observable, {
		// TODO
		cipherID: '',

		selfTest: function() {
			throw new Error(ERRORS.AbstractError('Cipher::selfTest'));
		}
	});

	// Asymmetric cipher
	Ext.extend(Crypto.AsymmetricCipher, Crypto.Cipher, {
		doPublic: function(x) {
			throw new Error(ERRORS.AbstractError('AsymmetricCipher::doPublic'));
		},

		doPrivate: function(x) {
			throw new Error(ERRORS.AbstractError('AsymmetricCipher::doPrivate'));
		},

		encryptBlock: function(m, ofs, bs, p, f) {
			throw new Error(ERRORS.AbstractError('AsymmetricCipher::encryptBlock'));
		},

		decryptBlock: function(c, ofs, bs, p, f) {
			throw new Error(ERRORS.AbstractError('AsymmetricCipher::decryptBlock'));
		},

		encrypt: function(s, options) {
			options = options || {};

			var m = s.stringToBytes(),
				l = m.length, i = 0, r = [],
				p = options.padding || UTIL.PKCS1PAD2,
				f = (options.method || 'public').toLowerCase() == 'public' ? this.doPublic : this.doPrivate,
				bs = (this.n.bitLength() + 7) >>> 3;

			do {
				r.push(this.encryptBlock(m, i, bs, p, f));
				i += (bs - p.RESERVED_OCTETS);
			} while (i < l);
			return r.join('');
		},

		decrypt: function(s, options) {
			options = options || {};

			var c = s.stringToBytes(),
				l = c.length, i = 0, r = [],
				p = options.padding || UTIL.PKCS1PAD2,
				f = (options.method || 'private').toLowerCase() == 'public' ? this.doPublic : this.doPrivate,
				bs = (this.n.bitLength() + 7) >>> 3;

			while (i < l) {
				r.push(this.decryptBlock(c, i, bs, p, f));
				i += bs;
			}
			return r.join('');
		}
	});

	// RSA
	Ext.extend(Crypto.RSA, Crypto.AsymmetricCipher, function() {
		var rng = new UTIL.SecureRandom();

		return {
			cipherID: 'RSA',

			doPublic: function(x) {
				return x.modPowInt(this.e, this.n);
			},

			doPrivate: function(x) {
				if (Ext.isEmpty(this.p) || Ext.isEmpty(this.q)) {
					return x.modPow(this.d, this.n);
				}
				var xp = x.mod(this.p).modPow(this.dmp1, this.p);
				var xq = x.mod(this.q).modPow(this.dmq1, this.q);
				while (xp.compareTo(xq) < 0) {
					xp = xp.add(this.p);
				}
				return xp.subtract(xq).multiply(this.coeff).mod(this.p).multiply(this.q).add(xq);
			},

			encryptBlock: function(m, ofs, bs, p, f) {
				p = p || UTIL.PKCS1PAD2;
				f = f || this.doPublic;

				var b = p.pad(m.slice(ofs, ofs + (bs - p.RESERVED_OCTETS)), bs),
					x = new BIGINT(b),
					c = f.call(this, x);

				if (c === undefined || c === null) {
					throw new Error(ERRORS.EncryptionError());
				}

				c = c.toBytes();
				while (c.length < bs) {
					c = [0].concat(c);
				}

				return c.bytesToString();
			},

			decryptBlock: function(c, ofs, bs, p, f) {
				p = p || UTIL.PKCS1PAD2;
				f = f || this.doPrivate;

				var x = MATH.parseBigInt(c.slice(ofs, ofs + bs)),
					d = f.call(this, x), b;

				if (d === undefined || d === null) {
					throw new Error(ERRORS.DecryptionError());
				}

				d = d.toRawBytes();
				b = p.unpad(d, bs);

				return b.bytesToString();
			},

			setPrivateKey: function(n, e, d) {
				if (!Ext.isEmpty(n) && !Ext.isEmpty(e) && !Ext.isEmpty(d)) {
					this.n = MATH.parseBigInt(n, 16);
					this.e = (Ext.isNumber(e) ? e : parseInt(e, 16));
					this.d = MATH.parseBigInt(d, 16);
					return true;
				}
				return false;
			},

			setPrivateKeyEx: function(n, e, d, p, q, dp, dq, c) {
				if (!Ext.isEmpty(n) && !Ext.isEmpty(e) && !Ext.isEmpty(d) &&
					!Ext.isEmpty(p) && !Ext.isEmpty(q) &&
					!Ext.isEmpty(dp) && !Ext.isEmpty(dq) && !Ext.isEmpty(c))
				{
					this.n = MATH.parseBigInt(n, 16);
					this.e = (Ext.isNumber(e) ? e : parseInt(e, 16));
					this.d = MATH.parseBigInt(d, 16);
					this.p = MATH.parseBigInt(p, 16);
					this.q = MATH.parseBigInt(q, 16);
					this.dmp1 = MATH.parseBigInt(dp, 16);
					this.dmq1 = MATH.parseBigInt(dq, 16);
					this.coeff = MATH.parseBigInt(c, 16);
					return true;
				}
				return false;
			},

			setPublicKey: function(n, e) {
				if (!Ext.isEmpty(n) && !Ext.isEmpty(e)) {
					this.n = MATH.parseBigInt(n, 16);
					this.e = (Ext.isNumber(e) ? e : parseInt(e, 16));
					return true;
				}
				return false;
			},

			generateKeyPair: function(b, e) {
				if (Ext.isEmpty(b) || Ext.isEmpty(e)) {
					return false;
				}
				var qs = b >> 1;
				this.e = (Ext.isNumber(e) ? e : parseInt(e, 16));
				var ee = (Ext.isNumber(e) ? nbv(e) : BIGINT.parseBigInt(e, 16));
				for (;;) {
					for (;;) {
						this.p = new BIGINT(b - qs, 1, rng);
						if (this.p.subtract(BIGINT.ONE).gcd(ee).compareTo(BIGINT.ONE) === 0 && this.p.isProbablePrime(10)) {
							break;
						}
					}

					for (;;) {
						this.q = new BIGINT(qs, 1, rng);
						if (this.q.subtract(BIGINT.ONE).gcd(ee).compareTo(BIGINT.ONE) === 0 && this.q.isProbablePrime(10)) {
							break;
						}
					}

					if (this.p.compareTo(this.q) <= 0) {
						var t = this.p;
						this.p = this.q;
						this.q = t;
					}

					var p1 = this.p.subtract(BIGINT.ONE);
					var q1 = this.q.subtract(BIGINT.ONE);
					var phi = p1.multiply(q1);

					if (phi.gcd(ee).compareTo(BIGINT.ONE) === 0) {
						this.n = this.p.multiply(this.q);
						this.d = ee.modInverse(phi);
						this.dmp1 = this.d.mod(p1);
						this.dmq1 = this.d.mod(q1);
						this.coeff = this.q.modInverse(this.p);
						break;
					}
				}
			}
		};
	}());

	// Symmetric cipher
	Ext.extend(Crypto.SymmetricCipher, Crypto.Cipher, {
		Nk: 0,	// key length
		Nb: 0,	// block and/or IV size

		init: function(options) {
			throw new Error(ERRORS.AbstractError('SymmetricCipher::init'));
		},

		keyDerivation: function(pwd, salt, kdf, options) {
			kdf = kdf || UTIL.PBKDF1;
			options = options || {};

			return kdf(pwd.stringToBytes(), salt, this.Nk, this.Nb, options);
		},

		keyExpansion: function(km) {
			var key = km.key;

			if (key.length != this.Nk * 4) {
				throw new Error(ERRORS.WrongKeyLengthError(
					String.format('{0}::keyExpansion', this.cipherID), key.length << 3));
			}
		},

		setKey: function(pwd, salt, kdf, options) {
			kdf = kdf || UTIL.PBKDF1;
			options = options || {};

			var km = this.keyDerivation(pwd, salt, kdf, options);
			this.keyExpansion(km);

			return km.iv;
		},

		encrypt: function(s, pwd, options) {
			throw new Error(ERRORS.AbstractError('SymmetricCipher::encrypt'));
		},

		decrypt: function(s, pwd, options) {
			throw new Error(ERRORS.AbstractError('SymmetricCipher::decrypt'));
		}
	});

	// Block cipher
	Ext.extend(Crypto.BlockCipher, Crypto.SymmetricCipher, {
		Nr: 0,		// # of rounds

		setInput: function(d, s, ofs) {
			var i, bs = this.Nb * 4;

			for (i = 0; i < bs; i++) {
				d[i] = s[ofs + i];
			}
		},

		setOutput: function(d, s, ofs) {
			var i, bs = this.Nb * 4;

			for (i = 0; i < bs; i++) {
				d[ofs + i] = s[i];
			}
		},

		encryptBlock: function(m, ofs) {
			throw new Error(ERRORS.AbstractError('BlockCipher::encryptBlock'));
		},

		decryptBlock: function(c, ofs) {
			throw new Error(ERRORS.AbstractError('BlockCipher::decryptBlock'));
		},

		encrypt: function(s, pwd, options) {
			options = options || {};

			Ext.applyIf(options, {
				keyLen: this.Nk * 32,
				rounds: this.Nr,
				blockSize: this.Nb * 32,
				mode: Crypto.BlockCipher.mode.CBC,
				salted: true,
				kdf: UTIL.PBKDF1
			});

			this.init(options);

			var m = s.stringToBytes(),
				salt = (options.salted ? Array.randomBytes(8) : []),
				kdf = (Ext.isObject(options.kdf) ? options.kdf.fn : options.kdf) || UTIL.PBKDF1,
				mode = (Ext.isString(options.mode) ?
						Crypto.BlockCipher.mode[options.mode.toUpperCase()] : options.mode) ||
						Crypto.BlockCipher.mode.CBC;

			var iv = this.setKey(pwd, salt, kdf, Ext.isObject(options.kdf) ? options.kdf : {});
			mode.encrypt(this, m, iv);

			if (options.salted) {
				m = SALTBLOCK.concat(salt, m);
			}

			return m.bytesToString();
		},

		decrypt: function(s, pwd, options) {
			options = options || {};

			Ext.applyIf(options, {
				keyLen: this.Nk * 32,
				rounds: this.Nr,
				blockSize: this.Nb * 32,
				mode: Crypto.BlockCipher.mode.CBC,
				kdf: UTIL.PBKDF1
			});

			this.init(options);

			var c = s.stringToBytes(),
				salted = s.substring(0, 8) == 'Salted__',
				salt = (salted ? c.slice(8, 16) : []),
				kdf = (Ext.isObject(options.kdf) ? options.kdf.fn : options.kdf) || UTIL.PBKDF1,
				mode = (Ext.isString(options.mode) ?
						Crypto.BlockCipher.mode[options.mode.toUpperCase()] : options.mode) ||
						Crypto.BlockCipher.mode.CBC;

			c = c.slice((salted ? 16 : 0));
			var iv = this.setKey(pwd, salt, kdf, Ext.isObject(options.kdf) ? options.kdf : {});
			mode.decrypt(this, c, iv);

			return c.bytesToString();
		},

		MAC: function(key, s, options) {
			options = options || {};
			return Crypto.OMAC(this, key, s, options);
		},

		verifyMAC: function(mac, key, s, options) {
			options = options || {};

			var r = this.MAC(key, s, options);
			return (options.asBytes ?
				Ext.isArray(mac) && mac.compareTo(r) === 0 :
				Ext.isString(mac) && mac == r) ? true : false;
		},

		selfTestPrim: function(TEST_VECTORS) {
			TEST_VECTORS = TEST_VECTORS || [];

			var i, success = true;

			for (i = 0; i < TEST_VECTORS.length; i++) {
				this.init({
					keyLen: TEST_VECTORS[i].key.length * 8,
					rounds: TEST_VECTORS[i].rounds || this.Nr || 0
				});

				this.keyExpansion({
					key: TEST_VECTORS[i].key.slice(0),
					iv: []
				});

				var data = TEST_VECTORS[i].plainText.slice(0);

				this.encryptBlock(data, 0);
				if (!(success = data.compareTo(TEST_VECTORS[i].cipherText) === 0)) {
					console.error("%s:selfTest(%d) encryption FAILED!! %s != %s",
						this.cipherID, i,
						data.bytesToHex(),
						TEST_VECTORS[i].cipherText.bytesToHex());
					break;
				}

				this.decryptBlock(data, 0);
				if (!(success = data.compareTo(TEST_VECTORS[i].plainText) === 0)) {
					console.error("%s:selfTest(%d) decryption FAILED!! %s != %s",
						this.cipherID, i,
						data.bytesToHex(),
						TEST_VECTORS[i].cipherText.bytesToHex());
					break;
				}
			}
			return success;
		}
	});

	// AES
	Ext.extend(Crypto.AES, Crypto.BlockCipher, function() {
		var SBOX = [
			0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5,
			0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
			0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0,
			0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
			0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc,
			0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
			0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a,
			0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
			0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0,
			0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
			0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b,
			0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
			0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85,
			0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
			0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5,
			0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
			0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17,
			0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
			0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88,
			0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
			0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c,
			0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
			0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9,
			0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
			0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6,
			0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
			0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e,
			0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
			0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94,
			0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
			0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68,
			0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
		],

		INVSBOX = [],

		MULT2 = [],
		MULT3 = [],
		MULT9 = [],
		MULTB = [],
		MULTD = [],
		MULTE = [],

		RCON = [0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36];

		var xtime = function(a, b) {
			var r, i;

			for (r = 0, i = 0; i < 8; i++) {
				if (b & 1) {
					r ^= a;
				}
				var isset = a & 0x80;
				a = (a << 1) & 0xff;
				if (isset) {
					a ^= 0x1b;
				}
				b >>>= 1;
			}
			return r;
		};

		var rr;

		// Compute inverse SBOX lookup table
		for (rr = 0; rr < 256; rr++) {
			INVSBOX[SBOX[rr]] = rr;
		}

		// Compute multiplication in GF(2^8) lookup tables
		for (rr = 0; rr < 256; rr++) {
			MULT2[rr] = xtime(rr, 0x2);
			MULT3[rr] = xtime(rr, 0x3);
			MULT9[rr] = xtime(rr, 0x9);
			MULTB[rr] = xtime(rr, 0xb);
			MULTD[rr] = xtime(rr, 0xd);
			MULTE[rr] = xtime(rr, 0xe);
		}

		return {
			cipherID: 'AES',

			Nk: 4,	// 128 bits key
			Nb: 4,	// 128 bit blocksize
			Nr: 10,	// 10 rounds

			init: function(options) {
				options = options || {};

				var n = options.keyLen || this.Nk * 32;

				// # of rounds is key dependent ...
				if (n == 128) {
					this.Nk = 4;		// 128 bit key
					this.Nr = 10;		// 10 rounds
				} else if (n == 192) {
					this.Nk = 6;		// 192 bit key
					this.Nr = 12;		// 12 rounds
				} else {
					this.Nk = 8;		// 256 bit key
					this.Nr = 14;		// 14 rounds
				}
			},

			keyExpansion: function(km) {
				Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

				var i, t, key = km.key;

				this.S = [[], [], [], []];
				this.KS = [];

				for (i = 0; i < this.Nk; i++) {
					this.KS[i] = [key[i * 4], key[i * 4 + 1], key[i * 4 + 2], key[i * 4 + 3]];
				}

				for (i = this.Nk, l = this.Nb * (this.Nr + 1); i < l; i++) {
					t = [this.KS[i - 1][0], this.KS[i - 1][1], this.KS[i - 1][2], this.KS[i - 1][3]];

					if (i % this.Nk === 0) {
						t.push(t.shift());

						t[0] = SBOX[t[0]];
						t[1] = SBOX[t[1]];
						t[2] = SBOX[t[2]];
						t[3] = SBOX[t[3]];

						t[0] ^= RCON[i / this.Nk];
					} else if (this.Nk > 6 && i % this.Nk == 4) {
						t[0] = SBOX[t[0]];
						t[1] = SBOX[t[1]];
						t[2] = SBOX[t[2]];
						t[3] = SBOX[t[3]];
					}

					this.KS[i] = [
						this.KS[i - this.Nk][0] ^ t[0],
						this.KS[i - this.Nk][1] ^ t[1],
						this.KS[i - this.Nk][2] ^ t[2],
						this.KS[i - this.Nk][3] ^ t[3]
					];
				}
			},

			setInput: function(d, s, ofs) {
				var i, j;

				for (i = 0; i < this.Nb; i++) {
					for (j = 0; j < 4; j++) {
						d[i][j] = s[ofs + j * 4 + i];
					}
				}
			},

			setOutput: function(d, s, ofs) {
				var i, j;

				for (i = 0; i < this.Nb; i++) {
					for (j = 0; j < 4; j++) {
						d[ofs + j * 4 + i] = s[i][j];
					}
				}
			},

			addRoundKey: function(r, S, KS) {
				var i, j;

				for (i = 0; i < 4; i++) {
					for (j = 0; j < 4; j++) {
						S[i][j] ^= KS[(r * 4) + j][i];
					}
				}
			},

			subBytes: function(S, SBOX) {
				var i, j;

				for (i = 0; i < 4; i++) {
					for (j = 0; j < 4; j++) {
						S[i][j] = SBOX[S[i][j]];
					}
				}
			},

			shiftRows: function(S, enc) {
				if (enc) {
					S[1].push(S[1].shift());
					S[2].push(S[2].shift());
					S[2].push(S[2].shift());
					S[3].unshift(S[3].pop());
				} else {
					S[1].unshift(S[1].pop());
					S[2].push(S[2].shift());
					S[2].push(S[2].shift());
					S[3].push(S[3].shift());
				}
			},

			mixColumns: function(S, enc) {
				var j, s0, s1, s2, s3;

				if (enc) {
					for (j = 0; j < 4; j++) {
						s0 = S[0][j]; s1 = S[1][j]; s2 = S[2][j]; s3 = S[3][j];

						S[0][j] = MULT2[s0] ^ MULT3[s1] ^ s2 ^ s3;
						S[1][j] = s0 ^ MULT2[s1] ^ MULT3[s2] ^ s3;
						S[2][j] = s0 ^ s1 ^ MULT2[s2] ^ MULT3[s3];
						S[3][j] = MULT3[s0] ^ s1 ^ s2 ^ MULT2[s3];
					}
				} else {
					for (j = 0; j < 4; j++) {
						s0 = S[0][j]; s1 = S[1][j]; s2 = S[2][j]; s3 = S[3][j];

						S[0][j] = MULTE[s0] ^ MULTB[s1] ^ MULTD[s2] ^ MULT9[s3];
						S[1][j] = MULT9[s0] ^ MULTE[s1] ^ MULTB[s2] ^ MULTD[s3];
						S[2][j] = MULTD[s0] ^ MULT9[s1] ^ MULTE[s2] ^ MULTB[s3];
						S[3][j] = MULTB[s0] ^ MULTD[s1] ^ MULT9[s2] ^ MULTE[s3];
					}
				}
			},

			encryptBlock: function(m, ofs) {
				var r, S = this.S, KS = this.KS;

				this.setInput(S, m, ofs);
				this.addRoundKey(0, S, KS);

				for (r = 1; r < this.Nr; r++) {
					this.subBytes(S, SBOX);
					this.shiftRows(S, true);
					this.mixColumns(S, true);
					this.addRoundKey(r, S, KS);
				}

				this.subBytes(S, SBOX);
				this.shiftRows(S, true);
				this.addRoundKey(this.Nr, S, KS);
				this.setOutput(m, S, ofs);
			},

			decryptBlock: function(c, ofs) {
				var r, S = this.S, KS = this.KS;

				this.setInput(S, c, ofs);
				this.addRoundKey(this.Nr, S, KS);

				for (r = this.Nr - 1; r > 0; r--) {
					this.shiftRows(S, false);
					this.subBytes(S, INVSBOX);
					this.addRoundKey(r, S, KS);
					this.mixColumns(S, false);
				}

				this.shiftRows(S, false);
				this.subBytes(S, INVSBOX);
				this.addRoundKey(0, S, KS);
				this.setOutput(c, S, ofs);
			},

			selfTest: function() {
				// TODO
				var TEST_VECTORS = [
				];

				return this.selfTestPrim(TEST_VECTORS);
			}
		};
	}());

	// DES
	Ext.extend(Crypto.DES, Crypto.BlockCipher, function() {
		var SBOX = [
			[
				0x01010400, 0x00000000, 0x00010000, 0x01010404, 0x01010004, 0x00010404,
				0x00000004, 0x00010000, 0x00000400, 0x01010400, 0x01010404, 0x00000400,
				0x01000404, 0x01010004, 0x01000000, 0x00000004, 0x00000404, 0x01000400,
				0x01000400, 0x00010400, 0x00010400, 0x01010000, 0x01010000, 0x01000404,
				0x00010004, 0x01000004, 0x01000004, 0x00010004, 0x00000000, 0x00000404,
				0x00010404, 0x01000000, 0x00010000, 0x01010404, 0x00000004, 0x01010000,
				0x01010400, 0x01000000, 0x01000000, 0x00000400, 0x01010004, 0x00010000,
				0x00010400, 0x01000004, 0x00000400, 0x00000004, 0x01000404, 0x00010404,
				0x01010404, 0x00010004, 0x01010000, 0x01000404, 0x01000004, 0x00000404,
				0x00010404, 0x01010400, 0x00000404, 0x01000400, 0x01000400, 0x00000000,
				0x00010004, 0x00010400, 0x00000000, 0x01010004
			], [
				0x80108020, 0x80008000, 0x00008000, 0x00108020, 0x00100000, 0x00000020,
				0x80100020, 0x80008020, 0x80000020, 0x80108020, 0x80108000, 0x80000000,
				0x80008000, 0x00100000, 0x00000020, 0x80100020, 0x00108000, 0x00100020,
				0x80008020, 0x00000000, 0x80000000, 0x00008000, 0x00108020, 0x80100000,
				0x00100020, 0x80000020, 0x00000000, 0x00108000, 0x00008020, 0x80108000,
				0x80100000, 0x00008020, 0x00000000, 0x00108020, 0x80100020, 0x00100000,
				0x80008020, 0x80100000, 0x80108000, 0x00008000, 0x80100000, 0x80008000,
				0x00000020, 0x80108020, 0x00108020, 0x00000020, 0x00008000, 0x80000000,
				0x00008020, 0x80108000, 0x00100000, 0x80000020, 0x00100020, 0x80008020,
				0x80000020, 0x00100020, 0x00108000, 0x00000000, 0x80008000, 0x00008020,
				0x80000000, 0x80100020, 0x80108020, 0x00108000
			], [
				0x00000208, 0x08020200, 0x00000000, 0x08020008, 0x08000200, 0x00000000,
				0x00020208, 0x08000200, 0x00020008, 0x08000008, 0x08000008, 0x00020000,
				0x08020208, 0x00020008, 0x08020000, 0x00000208, 0x08000000, 0x00000008,
				0x08020200, 0x00000200, 0x00020200, 0x08020000, 0x08020008, 0x00020208,
				0x08000208, 0x00020200, 0x00020000, 0x08000208, 0x00000008, 0x08020208,
				0x00000200, 0x08000000, 0x08020200, 0x08000000, 0x00020008, 0x00000208,
				0x00020000, 0x08020200, 0x08000200, 0x00000000, 0x00000200, 0x00020008,
				0x08020208, 0x08000200, 0x08000008, 0x00000200, 0x00000000, 0x08020008,
				0x08000208, 0x00020000, 0x08000000, 0x08020208, 0x00000008, 0x00020208,
				0x00020200, 0x08000008, 0x08020000, 0x08000208, 0x00000208, 0x08020000,
				0x00020208, 0x00000008, 0x08020008, 0x00020200
			], [
				0x00802001, 0x00002081, 0x00002081, 0x00000080, 0x00802080, 0x00800081,
				0x00800001, 0x00002001, 0x00000000, 0x00802000, 0x00802000, 0x00802081,
				0x00000081, 0x00000000, 0x00800080, 0x00800001, 0x00000001, 0x00002000,
				0x00800000, 0x00802001, 0x00000080, 0x00800000, 0x00002001, 0x00002080,
				0x00800081, 0x00000001, 0x00002080, 0x00800080, 0x00002000, 0x00802080,
				0x00802081, 0x00000081, 0x00800080, 0x00800001, 0x00802000, 0x00802081,
				0x00000081, 0x00000000, 0x00000000, 0x00802000, 0x00002080, 0x00800080,
				0x00800081, 0x00000001, 0x00802001, 0x00002081, 0x00002081, 0x00000080,
				0x00802081, 0x00000081, 0x00000001, 0x00002000, 0x00800001, 0x00002001,
				0x00802080, 0x00800081, 0x00002001, 0x00002080, 0x00800000, 0x00802001,
				0x00000080, 0x00800000, 0x00002000, 0x00802080
			], [ 
				0x00000100, 0x02080100, 0x02080000, 0x42000100, 0x00080000, 0x00000100,
				0x40000000, 0x02080000, 0x40080100, 0x00080000, 0x02000100, 0x40080100,
				0x42000100, 0x42080000, 0x00080100, 0x40000000, 0x02000000, 0x40080000,
				0x40080000, 0x00000000, 0x40000100, 0x42080100, 0x42080100, 0x02000100,
				0x42080000, 0x40000100, 0x00000000, 0x42000000, 0x02080100, 0x02000000,
				0x42000000, 0x00080100, 0x00080000, 0x42000100, 0x00000100, 0x02000000,
				0x40000000, 0x02080000, 0x42000100, 0x40080100, 0x02000100, 0x40000000,
				0x42080000, 0x02080100, 0x40080100, 0x00000100, 0x02000000, 0x42080000,
				0x42080100, 0x00080100, 0x42000000, 0x42080100, 0x02080000, 0x00000000,
				0x40080000, 0x42000000, 0x00080100, 0x02000100, 0x40000100, 0x00080000,
				0x00000000, 0x40080000, 0x02080100, 0x40000100
			], [
				0x20000010, 0x20400000, 0x00004000, 0x20404010, 0x20400000, 0x00000010,
				0x20404010, 0x00400000, 0x20004000, 0x00404010, 0x00400000, 0x20000010,
				0x00400010, 0x20004000, 0x20000000, 0x00004010, 0x00000000, 0x00400010,
				0x20004010, 0x00004000, 0x00404000, 0x20004010, 0x00000010, 0x20400010,
				0x20400010, 0x00000000, 0x00404010, 0x20404000, 0x00004010, 0x00404000,
				0x20404000, 0x20000000, 0x20004000, 0x00000010, 0x20400010, 0x00404000,
				0x20404010, 0x00400000, 0x00004010, 0x20000010, 0x00400000, 0x20004000,
				0x20000000, 0x00004010, 0x20000010, 0x20404010, 0x00404000, 0x20400000,
				0x00404010, 0x20404000, 0x00000000, 0x20400010, 0x00000010, 0x00004000,
				0x20400000, 0x00404010, 0x00004000, 0x00400010, 0x20004010, 0x00000000,
				0x20404000, 0x20000000, 0x00400010, 0x20004010
			], [
				0x00200000, 0x04200002, 0x04000802, 0x00000000, 0x00000800, 0x04000802,
				0x00200802, 0x04200800, 0x04200802, 0x00200000, 0x00000000, 0x04000002,
				0x00000002, 0x04000000, 0x04200002, 0x00000802, 0x04000800, 0x00200802,
				0x00200002, 0x04000800, 0x04000002, 0x04200000, 0x04200800, 0x00200002,
				0x04200000, 0x00000800, 0x00000802, 0x04200802, 0x00200800, 0x00000002,
				0x04000000, 0x00200800, 0x04000000, 0x00200800, 0x00200000, 0x04000802,
				0x04000802, 0x04200002, 0x04200002, 0x00000002, 0x00200002, 0x04000000,
				0x04000800, 0x00200000, 0x04200800, 0x00000802, 0x00200802, 0x04200800,
				0x00000802, 0x04000002, 0x04200802, 0x04200000, 0x00200800, 0x00000000,
				0x00000002, 0x04200802, 0x00000000, 0x00200802, 0x04200000, 0x00000800,
				0x04000002, 0x04000800, 0x00000800, 0x00200002
			], [
				0x10001040, 0x00001000, 0x00040000, 0x10041040, 0x10000000, 0x10001040,
				0x00000040, 0x10000000, 0x00040040, 0x10040000, 0x10041040, 0x00041000,
				0x10041000, 0x00041040, 0x00001000, 0x00000040, 0x10040000, 0x10000040,
				0x10001000, 0x00001040, 0x00041000, 0x00040040, 0x10040040, 0x10041000,
				0x00001040, 0x00000000, 0x00000000, 0x10040040, 0x10000040, 0x10001000,
				0x00041040, 0x00040000, 0x00041040, 0x00040000, 0x10041000, 0x00001000,
				0x00000040, 0x10040040, 0x00001000, 0x00041040, 0x10001000, 0x00000040,
				0x10000040, 0x10040000, 0x10040040, 0x10000000, 0x00040000, 0x10001040,
				0x00000000, 0x10041040, 0x00040040, 0x10000040, 0x10040000, 0x10001000,
				0x10001040, 0x00000000, 0x10041040, 0x00041000, 0x00041000, 0x00001040,
				0x00001040, 0x00040040, 0x10000000, 0x10041000
			]
		];

		var WEAK_KEYS = [
			[0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00], [0x00, 0x00, 0x1e, 0x1e, 0x00, 0x00, 0x0e, 0x0e],
			[0x00, 0x00, 0xe0, 0xe0, 0x00, 0x00, 0xf0, 0xf0], [0x00, 0x00, 0xfe, 0xfe, 0x00, 0x00, 0xfe, 0xfe],
			[0x00, 0x1e, 0x00, 0x1e, 0x00, 0x0e, 0x00, 0x0e], [0x00, 0x1e, 0x1e, 0x00, 0x00, 0x0e, 0x0e, 0x00],
			[0x00, 0x1e, 0xe0, 0xfe, 0x00, 0x0e, 0xf0, 0xfe], [0x00, 0x1e, 0xfe, 0xe0, 0x00, 0x0e, 0xfe, 0xf0],
			[0x00, 0xe0, 0x00, 0xe0, 0x00, 0xf0, 0x00, 0xf0], [0x00, 0xe0, 0x1e, 0xfe, 0x00, 0xf0, 0x0e, 0xfe],
			[0x00, 0xe0, 0xe0, 0x00, 0x00, 0xf0, 0xf0, 0x00], [0x00, 0xe0, 0xfe, 0x1e, 0x00, 0xf0, 0xfe, 0x0e],
			[0x00, 0xfe, 0x00, 0xfe, 0x00, 0xfe, 0x00, 0xfe], [0x00, 0xfe, 0x1e, 0xe0, 0x00, 0xfe, 0x0e, 0xf0],
			[0x00, 0xfe, 0xe0, 0x1e, 0x00, 0xfe, 0xf0, 0x0e], [0x00, 0xfe, 0xfe, 0x00, 0x00, 0xfe, 0xfe, 0x00],
			[0x1e, 0x00, 0x00, 0x1e, 0x0e, 0x00, 0x00, 0x0e], [0x1e, 0x00, 0x1e, 0x00, 0x0e, 0x00, 0x0e, 0x00],
			[0x1e, 0x00, 0xe0, 0xfe, 0x0e, 0x00, 0xf0, 0xfe], [0x1e, 0x00, 0xfe, 0xe0, 0x0e, 0x00, 0xfe, 0xf0],
			[0x1e, 0x1e, 0x00, 0x00, 0x0e, 0x0e, 0x00, 0x00], [0x1e, 0x1e, 0x1e, 0x1e, 0x0e, 0x0e, 0x0e, 0x0e],
			[0x1e, 0x1e, 0xe0, 0xe0, 0x0e, 0x0e, 0xf0, 0xf0], [0x1e, 0x1e, 0xfe, 0xfe, 0x0e, 0x0e, 0xfe, 0xfe],
			[0x1e, 0xe0, 0x00, 0xfe, 0x0e, 0xf0, 0x00, 0xfe], [0x1e, 0xe0, 0x1e, 0xe0, 0x0e, 0xf0, 0x0e, 0xf0],
			[0x1e, 0xe0, 0xe0, 0x1e, 0x0e, 0xf0, 0xf0, 0x0e], [0x1e, 0xe0, 0xfe, 0x00, 0x0e, 0xf0, 0xfe, 0x00],
			[0x1e, 0xfe, 0x00, 0xe0, 0x0e, 0xfe, 0x00, 0xf0], [0x1e, 0xfe, 0x1e, 0xfe, 0x0e, 0xfe, 0x0e, 0xfe],
			[0x1e, 0xfe, 0xe0, 0x00, 0x0e, 0xfe, 0xf0, 0x00], [0x1e, 0xfe, 0xfe, 0x1e, 0x0e, 0xfe, 0xfe, 0x0e],
			[0xe0, 0x00, 0x00, 0xe0, 0xf0, 0x00, 0x00, 0xf0], [0xe0, 0x00, 0x1e, 0xfe, 0xf0, 0x00, 0x0e, 0xfe],
			[0xe0, 0x00, 0xe0, 0x00, 0xf0, 0x00, 0xf0, 0x00], [0xe0, 0x00, 0xfe, 0x1e, 0xf0, 0x00, 0xfe, 0x0e],
			[0xe0, 0x1e, 0x00, 0xfe, 0xf0, 0x0e, 0x00, 0xfe], [0xe0, 0x1e, 0x1e, 0xe0, 0xf0, 0x0e, 0x0e, 0xf0],
			[0xe0, 0x1e, 0xe0, 0x1e, 0xf0, 0x0e, 0xf0, 0x0e], [0xe0, 0x1e, 0xfe, 0x00, 0xf0, 0x0e, 0xfe, 0x00],
			[0xe0, 0xe0, 0x00, 0x00, 0xf0, 0xf0, 0x00, 0x00], [0xe0, 0xe0, 0x1e, 0x1e, 0xf0, 0xf0, 0x0e, 0x0e],
			[0xe0, 0xe0, 0xe0, 0xe0, 0xf0, 0xf0, 0xf0, 0xf0], [0xe0, 0xe0, 0xfe, 0xfe, 0xf0, 0xf0, 0xfe, 0xfe],
			[0xe0, 0xfe, 0x00, 0x1e, 0xf0, 0xfe, 0x00, 0x0e], [0xe0, 0xfe, 0x1e, 0x00, 0xf0, 0xfe, 0x0e, 0x00],
			[0xe0, 0xfe, 0xe0, 0xfe, 0xf0, 0xfe, 0xf0, 0xfe], [0xe0, 0xfe, 0xfe, 0xe0, 0xf0, 0xfe, 0xfe, 0xf0],
			[0xfe, 0x00, 0x00, 0xfe, 0xfe, 0x00, 0x00, 0xfe], [0xfe, 0x00, 0x1e, 0xe0, 0xfe, 0x00, 0x0e, 0xf0],
			[0xfe, 0x00, 0xe0, 0x1e, 0xfe, 0x00, 0xf0, 0x0e], [0xfe, 0x00, 0xfe, 0x00, 0xfe, 0x00, 0xfe, 0x00],
			[0xfe, 0x1e, 0x00, 0xe0, 0xfe, 0x0e, 0x00, 0xf0], [0xfe, 0x1e, 0x1e, 0xfe, 0xfe, 0x0e, 0x0e, 0xfe],
			[0xfe, 0x1e, 0xe0, 0x00, 0xfe, 0x0e, 0xf0, 0x00], [0xfe, 0x1e, 0xfe, 0x1e, 0xfe, 0x0e, 0xfe, 0x0e],
			[0xfe, 0xe0, 0x00, 0x1e, 0xfe, 0xf0, 0x00, 0x0e], [0xfe, 0xe0, 0x1e, 0x00, 0xfe, 0xf0, 0x0e, 0x00],
			[0xfe, 0xe0, 0xe0, 0xfe, 0xfe, 0xf0, 0xf0, 0xfe], [0xfe, 0xe0, 0xfe, 0xe0, 0xfe, 0xf0, 0xfe, 0xf0],
			[0xfe, 0xfe, 0x00, 0x00, 0xfe, 0xfe, 0x00, 0x00], [0xfe, 0xfe, 0x1e, 0x1e, 0xfe, 0xfe, 0x0e, 0x0e],
			[0xfe, 0xfe, 0xe0, 0xe0, 0xfe, 0xfe, 0xf0, 0xf0], [0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe]
		];

		var L_SWAP = [
			0x00000000, 0x00000001, 0x00000100, 0x00000101,
			0x00010000, 0x00010001, 0x00010100, 0x00010101,
			0x01000000, 0x01000001, 0x01000100, 0x01000101,
			0x01010000, 0x01010001, 0x01010100, 0x01010101
		];

		var R_SWAP = [
			0x00000000, 0x01000000, 0x00010000, 0x01010000,
			0x00000100, 0x01000100, 0x00010100, 0x01010100,
			0x00000001, 0x01000001, 0x00010001, 0x01010001,
			0x00000101, 0x01000101, 0x00010101, 0x01010101,
		];

		var ROT = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

		return {
			cipherID: 'DES',

			Nk: 2,	// 64 (56 effective) bits key
			Nb: 2,	// 64 bits blocksize
			Nr: 16,	// 16 rounds

			init: function(options) {
				// DES has no config options ...
			},

			isWeakKey: function(key) {
				var i, left, right, middle, r, k = key.slice(0);

				for (i = 0; i < k.length; i++) {
					k[i] &= 0xfe;
				}

				left = 0; right = WEAK_KEYS.length - 1;
				while (left <= right) {
					middle = (left + right) >>> 1;
					if ((r = k.compareTo(WEAK_KEYS[middle])) === 0) {
						return true;
					}
					if (r > 0) {
						left = middle + 1;
					} else {
						right = middle - 1;
					}
				}
				return false;
			},

			keyInit: function(key, KS) {
				if (this.isWeakKey(key)) {
					throw new Error(ERRORS.WeakKeyError(this, key));
				};

				var b = key.bytesToWords(), l = b[0], r = b[1], t;

				// perform P()
				t = ((r >>> 4) ^ l) & 0x0f0f0f0f;
				l ^= t;
				r ^= t << 4;

				// perform P()
				t = (r ^ l) & 0x10101010;
				l ^= t;
				r ^= t;

				l = ((L_SWAP[l & 0x0f] << 3) |
					 (L_SWAP[(l >>> 8) & 0x0f] << 2) |
					 (L_SWAP[(l >>> 16) & 0x0f] << 1) |
					 (L_SWAP[(l >>> 24) & 0x0f]) |
					 (L_SWAP[(l >>> 5) & 0x0f] << 7) |
					 (L_SWAP[(l >>> 13) & 0x0f] << 6) |
					 (L_SWAP[(l >>> 21) & 0x0f] << 5) |
					 (L_SWAP[(l >>> 29) & 0x0f] << 4));

				l &= 0x0fffffff;

				r = ((R_SWAP[(r >>> 1) & 0x0f] << 3) |
					 (R_SWAP[(r >>> 9) & 0x0f] << 2) |
					 (R_SWAP[(r >>> 17) & 0x0f] << 1) |
					 (R_SWAP[(r >>> 25) & 0x0f]) |
					 (R_SWAP[(r >>> 4) & 0x0f] << 7) |
					 (R_SWAP[(r >>> 12) & 0x0f] << 6) |
					 (R_SWAP[(r >>> 20) & 0x0f] << 5) |
					 (R_SWAP[(r >>> 28) & 0x0f] << 4));

				r &= 0x0fffffff;

				for (i = 0; i < this.Nr; i++) {
					l = ((l << ROT[i]) | (l >>> (28 - ROT[i]))) & 0x0fffffff;
					r = ((r << ROT[i]) | (r >>> (28 - ROT[i]))) & 0x0fffffff;

					KS[i] = [
						(((l << 4) & 0x24000000)   | ((l << 28) & 0x10000000)  |
						 ((l << 14) & 0x08000000)  | ((l << 18) & 0x02080000)  |
						 ((l << 6) & 0x01000000)   | ((l << 9) & 0x00200000)   |
						 ((l >>> 1) & 0x00100000)  | ((l << 10) & 0x00040000)  |
						 ((l << 2) & 0x00020000)   | ((l >>> 10) & 0x00010000) |
						 ((r >>> 13) & 0x00002000) | ((r >>> 4) & 0x00001000)  |
						 ((r << 6) & 0x00000800)   | ((r >>> 1) & 0x00000400)  |
						 ((r >>> 14) & 0x00000200) | (r & 0x00000100)          |
						 ((r >>> 5) & 0x00000020)  | ((r >>> 10) & 0x00000010) |
						 ((r >>> 3) & 0x00000008)  | ((r >>> 18) & 0x00000004) |
						 ((r >>> 26) & 0x00000002) | ((r >>> 24) & 0x00000001)),

						(((l << 15) & 0x20000000)  | ((l << 17) & 0x10000000)  |
 						 ((l << 10) & 0x08000000)  | ((l << 22) & 0x04000000)  |
 						 ((l >>> 2) & 0x02000000)  | ((l << 1) & 0x01000000)   |
 						 ((l << 16) & 0x00200000)  | ((l << 11) & 0x00100000)  |
 						 ((l << 3) & 0x00080000)   | ((l >>> 6) & 0x00040000)  |
 						 ((l << 15) & 0x00020000)  | ((l >>> 4) & 0x00010000)  |
 						 ((r >>> 2) & 0x00002000)  | ((r << 8) & 0x00001000)   |
 						 ((r >>> 14) & 0x00000808) | ((r >>> 9) & 0x00000400)  |
 						 ((r) & 0x00000200)        | ((r << 7) & 0x00000100)   |
 						 ((r >>> 7) & 0x00000020)  | ((r >>> 3) & 0x00000011)  |
 						 ((r << 2) & 0x00000004)   | ((r >>> 21) & 0x00000002))
					]
				}
			},

			keyExpansion: function(km) {
				Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

				var key = km.key;

				this.KS = [];

				this.keyInit(key.slice(0, 8), this.KS);
			},

			IPERM: function(b) {
				var t, l = b[0], r = b[1];

				// perform P()
				t = ((l >>> 4) ^ r) & 0x0f0f0f0f;
				r ^= t;
				l ^= t << 4;

				// perform P()
				t = ((l >>> 16) ^ r) & 0x0000ffff;
				r ^= t;
				l ^= t << 16;

				// perform P()
				t = ((r >>> 2) ^ l) & 0x33333333;
				l ^= t;
				r ^= (t << 2);

				// perform P()
				t = ((r >>> 8) ^ l) & 0x00ff00ff;
				l ^= t;
				r ^= (t << 8);

				r = (r << 1) | (r >>> 31);
				t = (l ^ r) & 0xaaaaaaaa;
				r ^= t;
				l ^= t;
				l = (l << 1) | (l >>> 31);

				b[0] = l; b[1] = r;
			},

			DES: function(KS, b, enc) {
				var t, S = SBOX, l = b[0], r = b[1];

				for (var i = 0, k = (enc ? 0 : this.Nr - 1), s = (enc ? 1 : -1); i < this.Nr; i++, k += s) {
					t = r ^ KS[k][0];
					l ^= S[7][t & 0x3f];
					l ^= S[5][(t >>> 8) & 0x3f];
					l ^= S[3][(t >>> 16) & 0x3f];
					l ^= S[1][(t >>> 24) & 0x3f];
					t = ((r >>> 4) | (r << 28)) ^ KS[k][1];
					l ^= S[6][t & 0x3f];
					l ^= S[4][(t >>> 8) & 0x3f];
					l ^= S[2][(t >>> 16) & 0x3f];
					l ^= S[0][(t >>> 24) & 0x3f];
					t = l; l = r; r = t;
				}
				b[0] = r; b[1] = l;
			},

			FPERM: function(b) {
				var t, l = b[0], r = b[1];

				l = (l << 31) | (l >>> 1);
				t = (l ^ r) & 0xaaaaaaaa;
				l ^= t;
				r ^= t;
				r = (r << 31) | (r >>> 1);

				// perform P()
				t = ((r >>> 8) ^ l) & 0x00ff00ff;
				l ^= t;
				r ^= t << 8;

				// perform P()
				t = ((r >>> 2) ^ l) & 0x33333333;
				l ^= t;
				r ^= t << 2;

				// perform P()
				t = ((l >>> 16) ^ r) & 0x0000ffff;
				r ^= t;
				l ^= t << 16;

				// perform P()
				t = ((l >>> 4) ^ r) & 0x0f0f0f0f;
				r ^= t;
				l ^= t << 4;

				b[0] = l; b[1] = r;
			},

			encryptBlock: function(m, ofs) {
				var b = [];

				this.setInput(b, m, ofs);
				b = b.bytesToWords();

				this.IPERM(b);
				this.DES(this.KS, b, true);
				this.FPERM(b);

				b = b.wordsToBytes();
				this.setOutput(m, b, ofs);
			},

			decryptBlock: function(c, ofs) {
				var b = [];

				this.setInput(b, c, ofs);
				b = b.bytesToWords();

				this.IPERM(b);
				this.DES(this.KS, b, false);
				this.FPERM(b);

				b = b.wordsToBytes();
				this.setOutput(c, b, ofs);
			},

			selfTest: function() {
				// TODO
				var TEST_VECTORS = [
				];

				return this.selfTestPrim(TEST_VECTORS);
			}
		};
	}());

	// DESX
	Ext.extend(Crypto.DESX, Crypto.DES, function() {
		var DESX_TAB = [
			0xBD, 0x56, 0xEA, 0xF2, 0xA2, 0xF1, 0xAC, 0x2A, 0xB0, 0x93, 0xD1, 0x9C, 0x1B, 0x33, 0xFD, 0xD0,
			0x30, 0x04, 0xB6, 0xDC, 0x7D, 0xDF, 0x32, 0x4B, 0xF7, 0xCB, 0x45, 0x9B, 0x31, 0xBB, 0x21, 0x5A,
			0x41, 0x9F, 0xE1, 0xD9, 0x4A, 0x4D, 0x9E, 0xDA, 0xA0, 0x68, 0x2C, 0xC3, 0x27, 0x5F, 0x80, 0x36,
			0x3E, 0xEE, 0xFB, 0x95, 0x1A, 0xFE, 0xCE, 0xA8, 0x34, 0xA9, 0x13, 0xF0, 0xA6, 0x3F, 0xD8, 0xC0,
			0x78, 0x24, 0xAF, 0x23, 0x52, 0xC1, 0x67, 0x17, 0xF5, 0x66, 0x90, 0xE7, 0xE8, 0x07, 0xB8, 0x60,
			0x48, 0xE6, 0x1E, 0x53, 0xF3, 0x92, 0xA4, 0x72, 0x8C, 0x08, 0x15, 0x6E, 0x86, 0x00, 0x84, 0xFA,
			0xF4, 0x7F, 0x8A, 0x42, 0x19, 0xF6, 0xDB, 0xCD, 0x14, 0x8D, 0x50, 0x12, 0xBA, 0x3C, 0x06, 0x4E,
			0xEC, 0xB3, 0x35, 0x11, 0xA1, 0x88, 0x8E, 0x2B, 0x94, 0x99, 0xB7, 0x71, 0x74, 0xD3, 0xE4, 0xBF,
			0x3A, 0xDE, 0x96, 0x0E, 0xBC, 0x0A, 0xED, 0x77, 0xFC, 0x37, 0x6B, 0x03, 0x79, 0x89, 0x62, 0xC6,
			0xD7, 0xC0, 0xD2, 0x7C, 0x6A, 0x8B, 0x22, 0xA3, 0x5B, 0x05, 0x5D, 0x02, 0x75, 0xD5, 0x61, 0xE3,
			0x18, 0x8F, 0x55, 0x51, 0xAD, 0x1F, 0x0B, 0x5E, 0x85, 0xE5, 0xC2, 0x57, 0x63, 0xCA, 0x3D, 0x6C,
			0xB4, 0xC5, 0xCC, 0x70, 0xB2, 0x91, 0x59, 0x0D, 0x47, 0x20, 0xC8, 0x4F, 0x58, 0xE0, 0x01, 0xE2,
			0x16, 0x38, 0xC4, 0x6F, 0x3B, 0x0F, 0x65, 0x46, 0xBE, 0x7E, 0x2D, 0x7B, 0x82, 0xF9, 0x40, 0xB5,
			0x1D, 0x73, 0xF8, 0xEB, 0x26, 0xC7, 0x87, 0x97, 0x25, 0x54, 0xB1, 0x28, 0xAA, 0x98, 0x9D, 0xA5,
			0x64, 0x6D, 0x7A, 0xD4, 0x10, 0x81, 0x44, 0xEF, 0x49, 0xD6, 0xAE, 0x2E, 0xDD, 0x76, 0x5C, 0x2F,
			0xA7, 0x1C, 0xC9, 0x09, 0x69, 0x9A, 0x83, 0xCF, 0x29, 0x39, 0xB9, 0xE9, 0x4C, 0xFF, 0x43, 0xAB
		];

		return {
			cipherID: 'DESX',

			Nk: 4,	// 128 (119 effective) bits key

			hashKey: function(key) {
				var i, j;

				for (i = 0; i < 8; i++) {
					j = this.K2[0] ^ this.K2[1];
					this.K2.push(DESX_TAB[j] ^ key[i]).shift();
				}
			},

			keyExpansion: function(km) {
				var key = km.key.slice(0);

				Crypto.DESX.superclass.keyExpansion.call(this, km);

				this.K1 = key.slice(8, 16);
				this.K2 = Array.fillBytes(8, 0);

				this.hashKey(key.slice(0, 8));
				this.hashKey(key.slice(8, 16));
			},

			xorBlock: function(K, b, ofs) {
				for (var i = 0; i < 8; i++) {
					b[ofs + i] ^= K[i];
				}
			},

			encryptBlock: function(m, ofs) {
				this.xorBlock(this.K1, m, ofs);
				Crypto.DESX.superclass.encryptBlock.call(this, m, ofs);
				this.xorBlock(this.K2, m, ofs);
			},

			decryptBlock: function(c, ofs) {
				this.xorBlock(this.K2, c, ofs);
				Crypto.DESX.superclass.decryptBlock.call(this, c, ofs);
				this.xorBlock(this.K1, c, ofs);
			}
		};
	});

	// 3DES
	Ext.extend(Crypto.TripleDES, Crypto.DES, {
		cipherID: '3DES',

		Nk: 6,	// 192 (168 effective) bits key
		Km: 1,	// 3DES Keying mode

		init: function(options) {
			options = options || {};

			var n = options.keyLen || this.Nk * 32;

			if (n == 56 || n == 64) {
				this.Nk = 2;		// 64 (56) bit key
				this.Km = 3;		// Mode 3 - all keys identical
			} else if (n == 112 || n == 128) {
				this.Nk = 4;		// 128 (112) bit key
				this.Km = 2;		// Mode 2 - key1 and key2 independent, key3 == key1
			} else {
				this.Nk = 6;		// 192 (168) bit key
				this.Km = 1;		// Mode 1 - all keys independent
			}
		},

		keyExpansion: function(km) {
			Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

			var key = km.key,
				k1 = key.slice(0, 8),
				k2 = (this.Km < 3 ? key.slice(8, 16) : key.slice(0, 8)),
				k3 = (this.Km < 2 ? key.slice(16, 24) : key.slice(0, 8));

			this.KS = [[], [], []];

			this.keyInit(k1, this.KS[0]);
			this.keyInit(k2, this.KS[1]);
			this.keyInit(k3, this.KS[2]);
		},

		encryptBlock: function(m, ofs) {
			var b = [];

			this.setInput(b, m, ofs);
			b = b.bytesToWords();

			this.IPERM(b);
			this.DES(this.KS[0], b, true);
			this.DES(this.KS[1], b, false);
			this.DES(this.KS[2], b, true);
			this.FPERM(b);

			b = b.wordsToBytes();
			this.setOutput(m, b, ofs);
		},

		decryptBlock: function(c, ofs) {
			var b = [];

			this.setInput(b, c, ofs);
			b = b.bytesToWords();

			this.IPERM(b);
			this.DES(this.KS[2], b, false);
			this.DES(this.KS[1], b, true);
			this.DES(this.KS[0], b, false);
			this.FPERM(b);

			b = b.wordsToBytes();
			this.setOutput(c, b, ofs);
		},

		selfTest: function() {
			// TODO
			var TEST_VECTORS = [
			];

			return this.selfTestPrim(TEST_VECTORS);
		}
	});

	// BlowFish
	Ext.extend(Crypto.BlowFish, Crypto.BlockCipher, function() {
		var P_INIT = [
			0x243F6A88, 0x85A308D3, 0x13198A2E, 0x03707344,
			0xA4093822, 0x299F31D0, 0x082EFA98, 0xEC4E6C89,
			0x452821E6, 0x38D01377, 0xBE5466CF, 0x34E90C6C,
			0xC0AC29B7, 0xC97C50DD, 0x3F84D5B5, 0xB5470917,
			0x9216D5D9, 0x8979FB1B
		];

		var S0_INIT = [
			0xD1310BA6, 0x98DFB5AC, 0x2FFD72DB, 0xD01ADFB7, 0xB8E1AFED, 0x6A267E96, 0xBA7C9045, 0xF12C7F99,
			0x24A19947, 0xB3916CF7, 0x0801F2E2, 0x858EFC16, 0x636920D8, 0x71574E69, 0xA458FEA3, 0xF4933D7E,
			0x0D95748F, 0x728EB658, 0x718BCD58, 0x82154AEE, 0x7B54A41D, 0xC25A59B5, 0x9C30D539, 0x2AF26013,
			0xC5D1B023, 0x286085F0, 0xCA417918, 0xB8DB38EF, 0x8E79DCB0, 0x603A180E, 0x6C9E0E8B, 0xB01E8A3E,
			0xD71577C1, 0xBD314B27, 0x78AF2FDA, 0x55605C60, 0xE65525F3, 0xAA55AB94, 0x57489862, 0x63E81440,
			0x55CA396A, 0x2AAB10B6, 0xB4CC5C34, 0x1141E8CE, 0xA15486AF, 0x7C72E993, 0xB3EE1411, 0x636FBC2A,
			0x2BA9C55D, 0x741831F6, 0xCE5C3E16, 0x9B87931E, 0xAFD6BA33, 0x6C24CF5C, 0x7A325381, 0x28958677,
			0x3B8F4898, 0x6B4BB9AF, 0xC4BFE81B, 0x66282193, 0x61D809CC, 0xFB21A991, 0x487CAC60, 0x5DEC8032,
			0xEF845D5D, 0xE98575B1, 0xDC262302, 0xEB651B88, 0x23893E81, 0xD396ACC5, 0x0F6D6FF3, 0x83F44239,
			0x2E0B4482, 0xA4842004, 0x69C8F04A, 0x9E1F9B5E, 0x21C66842, 0xF6E96C9A, 0x670C9C61, 0xABD388F0,
			0x6A51A0D2, 0xD8542F68, 0x960FA728, 0xAB5133A3, 0x6EEF0B6C, 0x137A3BE4, 0xBA3BF050, 0x7EFB2A98,
			0xA1F1651D, 0x39AF0176, 0x66CA593E, 0x82430E88, 0x8CEE8619, 0x456F9FB4, 0x7D84A5C3, 0x3B8B5EBE,
			0xE06F75D8, 0x85C12073, 0x401A449F, 0x56C16AA6, 0x4ED3AA62, 0x363F7706, 0x1BFEDF72, 0x429B023D,
			0x37D0D724, 0xD00A1248, 0xDB0FEAD3, 0x49F1C09B, 0x075372C9, 0x80991B7B, 0x25D479D8, 0xF6E8DEF7,
			0xE3FE501A, 0xB6794C3B, 0x976CE0BD, 0x04C006BA, 0xC1A94FB6, 0x409F60C4, 0x5E5C9EC2, 0x196A2463,
			0x68FB6FAF, 0x3E6C53B5, 0x1339B2EB, 0x3B52EC6F, 0x6DFC511F, 0x9B30952C, 0xCC814544, 0xAF5EBD09,
			0xBEE3D004, 0xDE334AFD, 0x660F2807, 0x192E4BB3, 0xC0CBA857, 0x45C8740F, 0xD20B5F39, 0xB9D3FBDB,
			0x5579C0BD, 0x1A60320A, 0xD6A100C6, 0x402C7279, 0x679F25FE, 0xFB1FA3CC, 0x8EA5E9F8, 0xDB3222F8,
			0x3C7516DF, 0xFD616B15, 0x2F501EC8, 0xAD0552AB, 0x323DB5FA, 0xFD238760, 0x53317B48, 0x3E00DF82,
			0x9E5C57BB, 0xCA6F8CA0, 0x1A87562E, 0xDF1769DB, 0xD542A8F6, 0x287EFFC3, 0xAC6732C6, 0x8C4F5573,
			0x695B27B0, 0xBBCA58C8, 0xE1FFA35D, 0xB8F011A0, 0x10FA3D98, 0xFD2183B8, 0x4AFCB56C, 0x2DD1D35B,
			0x9A53E479, 0xB6F84565, 0xD28E49BC, 0x4BFB9790, 0xE1DDF2DA, 0xA4CB7E33, 0x62FB1341, 0xCEE4C6E8,
			0xEF20CADA, 0x36774C01, 0xD07E9EFE, 0x2BF11FB4, 0x95DBDA4D, 0xAE909198, 0xEAAD8E71, 0x6B93D5A0,
			0xD08ED1D0, 0xAFC725E0, 0x8E3C5B2F, 0x8E7594B7, 0x8FF6E2FB, 0xF2122B64, 0x8888B812, 0x900DF01C,
			0x4FAD5EA0, 0x688FC31C, 0xD1CFF191, 0xB3A8C1AD, 0x2F2F2218, 0xBE0E1777, 0xEA752DFE, 0x8B021FA1,
			0xE5A0CC0F, 0xB56F74E8, 0x18ACF3D6, 0xCE89E299, 0xB4A84FE0, 0xFD13E0B7, 0x7CC43B81, 0xD2ADA8D9,
			0x165FA266, 0x80957705, 0x93CC7314, 0x211A1477, 0xE6AD2065, 0x77B5FA86, 0xC75442F5, 0xFB9D35CF,
			0xEBCDAF0C, 0x7B3E89A0, 0xD6411BD3, 0xAE1E7E49, 0x00250E2D, 0x2071B35E, 0x226800BB, 0x57B8E0AF,
			0x2464369B, 0xF009B91E, 0x5563911D, 0x59DFA6AA, 0x78C14389, 0xD95A537F, 0x207D5BA2, 0x02E5B9C5,
			0x83260376, 0x6295CFA9, 0x11C81968, 0x4E734A41, 0xB3472DCA, 0x7B14A94A, 0x1B510052, 0x9A532915,
			0xD60F573F, 0xBC9BC6E4, 0x2B60A476, 0x81E67400, 0x08BA6FB5, 0x571BE91F, 0xF296EC6B, 0x2A0DD915,
			0xB6636521, 0xE7B9F9B6, 0xFF34052E, 0xC5855664, 0x53B02D5D, 0xA99F8FA1, 0x08BA4799, 0x6E85076A
		];

		var S1_INIT = [
			0x4B7A70E9, 0xB5B32944, 0xDB75092E, 0xC4192623, 0xAD6EA6B0, 0x49A7DF7D, 0x9CEE60B8, 0x8FEDB266,
			0xECAA8C71, 0x699A17FF, 0x5664526C, 0xC2B19EE1, 0x193602A5, 0x75094C29, 0xA0591340, 0xE4183A3E,
			0x3F54989A, 0x5B429D65, 0x6B8FE4D6, 0x99F73FD6, 0xA1D29C07, 0xEFE830F5, 0x4D2D38E6, 0xF0255DC1,
			0x4CDD2086, 0x8470EB26, 0x6382E9C6, 0x021ECC5E, 0x09686B3F, 0x3EBAEFC9, 0x3C971814, 0x6B6A70A1,
			0x687F3584, 0x52A0E286, 0xB79C5305, 0xAA500737, 0x3E07841C, 0x7FDEAE5C, 0x8E7D44EC, 0x5716F2B8,
			0xB03ADA37, 0xF0500C0D, 0xF01C1F04, 0x0200B3FF, 0xAE0CF51A, 0x3CB574B2, 0x25837A58, 0xDC0921BD,
			0xD19113F9, 0x7CA92FF6, 0x94324773, 0x22F54701, 0x3AE5E581, 0x37C2DADC, 0xC8B57634, 0x9AF3DDA7,
			0xA9446146, 0x0FD0030E, 0xECC8C73E, 0xA4751E41, 0xE238CD99, 0x3BEA0E2F, 0x3280BBA1, 0x183EB331, 
			0x4E548B38, 0x4F6DB908, 0x6F420D03, 0xF60A04BF, 0x2CB81290, 0x24977C79, 0x5679B072, 0xBCAF89AF,
			0xDE9A771F, 0xD9930810, 0xB38BAE12, 0xDCCF3F2E, 0x5512721F, 0x2E6B7124, 0x501ADDE6, 0x9F84CD87,
			0x7A584718, 0x7408DA17, 0xBC9F9ABC, 0xE94B7D8C, 0xEC7AEC3A, 0xDB851DFA, 0x63094366, 0xC464C3D2,
			0xEF1C1847, 0x3215D908, 0xDD433B37, 0x24C2BA16, 0x12A14D43, 0x2A65C451, 0x50940002, 0x133AE4DD,
			0x71DFF89E, 0x10314E55, 0x81AC77D6, 0x5F11199B, 0x043556F1, 0xD7A3C76B, 0x3C11183B, 0x5924A509,
			0xF28FE6ED, 0x97F1FBFA, 0x9EBABF2C, 0x1E153C6E, 0x86E34570, 0xEAE96FB1, 0x860E5E0A, 0x5A3E2AB3,
			0x771FE71C, 0x4E3D06FA, 0x2965DCB9, 0x99E71D0F, 0x803E89D6, 0x5266C825, 0x2E4CC978, 0x9C10B36A,
			0xC6150EBA, 0x94E2EA78, 0xA5FC3C53, 0x1E0A2DF4, 0xF2F74EA7, 0x361D2B3D, 0x1939260F, 0x19C27960,
			0x5223A708, 0xF71312B6, 0xEBADFE6E, 0xEAC31F66, 0xE3BC4595, 0xA67BC883, 0xB17F37D1, 0x018CFF28,
			0xC332DDEF, 0xBE6C5AA5, 0x65582185, 0x68AB9802, 0xEECEA50F, 0xDB2F953B, 0x2AEF7DAD, 0x5B6E2F84,
			0x1521B628, 0x29076170, 0xECDD4775, 0x619F1510, 0x13CCA830, 0xEB61BD96, 0x0334FE1E, 0xAA0363CF,
			0xB5735C90, 0x4C70A239, 0xD59E9E0B, 0xCBAADE14, 0xEECC86BC, 0x60622CA7, 0x9CAB5CAB, 0xB2F3846E,
			0x648B1EAF, 0x19BDF0CA, 0xA02369B9, 0x655ABB50, 0x40685A32, 0x3C2AB4B3, 0x319EE9D5, 0xC021B8F7,
			0x9B540B19, 0x875FA099, 0x95F7997E, 0x623D7DA8, 0xF837889A, 0x97E32D77, 0x11ED935F, 0x16681281,
			0x0E358829, 0xC7E61FD6, 0x96DEDFA1, 0x7858BA99, 0x57F584A5, 0x1B227263, 0x9B83C3FF, 0x1AC24696,
			0xCDB30AEB, 0x532E3054, 0x8FD948E4, 0x6DBC3128, 0x58EBF2EF, 0x34C6FFEA, 0xFE28ED61, 0xEE7C3C73,
			0x5D4A14D9, 0xE864B7E3, 0x42105D14, 0x203E13E0, 0x45EEE2B6, 0xA3AAABEA, 0xDB6C4F15, 0xFACB4FD0,
			0xC742F442, 0xEF6ABBB5, 0x654F3B1D, 0x41CD2105, 0xD81E799E, 0x86854DC7, 0xE44B476A, 0x3D816250,
			0xCF62A1F2, 0x5B8D2646, 0xFC8883A0, 0xC1C7B6A3, 0x7F1524C3, 0x69CB7492, 0x47848A0B, 0x5692B285,
			0x095BBF00, 0xAD19489D, 0x1462B174, 0x23820E00, 0x58428D2A, 0x0C55F5EA, 0x1DADF43E, 0x233F7061,
			0x3372F092, 0x8D937E41, 0xD65FECF1, 0x6C223BDB, 0x7CDE3759, 0xCBEE7460, 0x4085F2A7, 0xCE77326E,
			0xA6078084, 0x19F8509E, 0xE8EFD855, 0x61D99735, 0xA969A7AA, 0xC50C06C2, 0x5A04ABFC, 0x800BCADC,
			0x9E447A2E, 0xC3453484, 0xFDD56705, 0x0E1E9EC9, 0xDB73DBD3, 0x105588CD, 0x675FDA79, 0xE3674340,
			0xC5C43465, 0x713E38D8, 0x3D28F89E, 0xF16DFF20, 0x153E21E7, 0x8FB03D4A, 0xE6E39F2B, 0xDB83ADF7
		];

		var S2_INIT = [
			0xE93D5A68, 0x948140F7, 0xF64C261C, 0x94692934, 0x411520F7, 0x7602D4F7, 0xBCF46B2E, 0xD4A20068,
			0xD4082471, 0x3320F46A, 0x43B7D4B7, 0x500061AF, 0x1E39F62E, 0x97244546, 0x14214F74, 0xBF8B8840,
			0x4D95FC1D, 0x96B591AF, 0x70F4DDD3, 0x66A02F45, 0xBFBC09EC, 0x03BD9785, 0x7FAC6DD0, 0x31CB8504,
			0x96EB27B3, 0x55FD3941, 0xDA2547E6, 0xABCA0A9A, 0x28507825, 0x530429F4, 0x0A2C86DA, 0xE9B66DFB,
			0x68DC1462, 0xD7486900, 0x680EC0A4, 0x27A18DEE, 0x4F3FFEA2, 0xE887AD8C, 0xB58CE006, 0x7AF4D6B6,
			0xAACE1E7C, 0xD3375FEC, 0xCE78A399, 0x406B2A42, 0x20FE9E35, 0xD9F385B9, 0xEE39D7AB, 0x3B124E8B,
			0x1DC9FAF7, 0x4B6D1856, 0x26A36631, 0xEAE397B2, 0x3A6EFA74, 0xDD5B4332, 0x6841E7F7, 0xCA7820FB,
			0xFB0AF54E, 0xD8FEB397, 0x454056AC, 0xBA489527, 0x55533A3A, 0x20838D87, 0xFE6BA9B7, 0xD096954B,
			0x55A867BC, 0xA1159A58, 0xCCA92963, 0x99E1DB33, 0xA62A4A56, 0x3F3125F9, 0x5EF47E1C, 0x9029317C,
			0xFDF8E802, 0x04272F70, 0x80BB155C, 0x05282CE3, 0x95C11548, 0xE4C66D22, 0x48C1133F, 0xC70F86DC,
			0x07F9C9EE, 0x41041F0F, 0x404779A4, 0x5D886E17, 0x325F51EB, 0xD59BC0D1, 0xF2BCC18F, 0x41113564,
			0x257B7834, 0x602A9C60, 0xDFF8E8A3, 0x1F636C1B, 0x0E12B4C2, 0x02E1329E, 0xAF664FD1, 0xCAD18115, 
			0x6B2395E0, 0x333E92E1, 0x3B240B62, 0xEEBEB922, 0x85B2A20E, 0xE6BA0D99, 0xDE720C8C, 0x2DA2F728,
			0xD0127845, 0x95B794FD, 0x647D0862, 0xE7CCF5F0, 0x5449A36F, 0x877D48FA, 0xC39DFD27, 0xF33E8D1E,
			0x0A476341, 0x992EFF74, 0x3A6F6EAB, 0xF4F8FD37, 0xA812DC60, 0xA1EBDDF8, 0x991BE14C, 0xDB6E6B0D,
			0xC67B5510, 0x6D672C37, 0x2765D43B, 0xDCD0E804, 0xF1290DC7, 0xCC00FFA3, 0xB5390F92, 0x690FED0B,
			0x667B9FFB, 0xCEDB7D9C, 0xA091CF0B, 0xD9155EA3, 0xBB132F88, 0x515BAD24, 0x7B9479BF, 0x763BD6EB,
			0x37392EB3, 0xCC115979, 0x8026E297, 0xF42E312D, 0x6842ADA7, 0xC66A2B3B, 0x12754CCC, 0x782EF11C,
			0x6A124237, 0xB79251E7, 0x06A1BBE6, 0x4BFB6350, 0x1A6B1018, 0x11CAEDFA, 0x3D25BDD8, 0xE2E1C3C9,
			0x44421659, 0x0A121386, 0xD90CEC6E, 0xD5ABEA2A, 0x64AF674E, 0xDA86A85F, 0xBEBFE988, 0x64E4C3FE,
			0x9DBC8057, 0xF0F7C086, 0x60787BF8, 0x6003604D, 0xD1FD8346, 0xF6381FB0, 0x7745AE04, 0xD736FCCC,
			0x83426B33, 0xF01EAB71, 0xB0804187, 0x3C005E5F, 0x77A057BE, 0xBDE8AE24, 0x55464299, 0xBF582E61,
			0x4E58F48F, 0xF2DDFDA2, 0xF474EF38, 0x8789BDC2, 0x5366F9C3, 0xC8B38E74, 0xB475F255, 0x46FCD9B9,
			0x7AEB2661, 0x8B1DDF84, 0x846A0E79, 0x915F95E2, 0x466E598E, 0x20B45770, 0x8CD55591, 0xC902DE4C,
			0xB90BACE1, 0xBB8205D0, 0x11A86248, 0x7574A99E, 0xB77F19B6, 0xE0A9DC09, 0x662D09A1, 0xC4324633,
			0xE85A1F02, 0x09F0BE8C, 0x4A99A025, 0x1D6EFE10, 0x1AB93D1D, 0x0BA5A4DF, 0xA186F20F, 0x2868F169,
			0xDCB7DA83, 0x573906FE, 0xA1E2CE9B, 0x4FCD7F52, 0x50115E01, 0xA70683FA, 0xA002B5C4, 0x0DE6D027,
			0x9AF88C27, 0x773F8641, 0xC3604C06, 0x61A806B5, 0xF0177A28, 0xC0F586E0, 0x006058AA, 0x30DC7D62,
			0x11E69ED7, 0x2338EA63, 0x53C2DD94, 0xC2C21634, 0xBBCBEE56, 0x90BCB6DE, 0xEBFC7DA1, 0xCE591D76,
			0x6F05E409, 0x4B7C0188, 0x39720A3D, 0x7C927C24, 0x86E3725F, 0x724D9DB9, 0x1AC15BB4, 0xD39EB8FC,
			0xED545578, 0x08FCA5B5, 0xD83D7CD3, 0x4DAD0FC4, 0x1E50EF5E, 0xB161E6F8, 0xA28514D9, 0x6C51133C,
			0x6FD5C7E7, 0x56E14EC4, 0x362ABFCE, 0xDDC6C837, 0xD79A3234, 0x92638212, 0x670EFA8E, 0x406000E0
		];

		var S3_INIT = [
			0x3A39CE37, 0xD3FAF5CF, 0xABC27737, 0x5AC52D1B, 0x5CB0679E, 0x4FA33742, 0xD3822740, 0x99BC9BBE,
			0xD5118E9D, 0xBF0F7315, 0xD62D1C7E, 0xC700C47B, 0xB78C1B6B, 0x21A19045, 0xB26EB1BE, 0x6A366EB4,
			0x5748AB2F, 0xBC946E79, 0xC6A376D2, 0x6549C2C8, 0x530FF8EE, 0x468DDE7D, 0xD5730A1D, 0x4CD04DC6,
			0x2939BBDB, 0xA9BA4650, 0xAC9526E8, 0xBE5EE304, 0xA1FAD5F0, 0x6A2D519A, 0x63EF8CE2, 0x9A86EE22,
			0xC089C2B8, 0x43242EF6, 0xA51E03AA, 0x9CF2D0A4, 0x83C061BA, 0x9BE96A4D, 0x8FE51550, 0xBA645BD6,
			0x2826A2F9, 0xA73A3AE1, 0x4BA99586, 0xEF5562E9, 0xC72FEFD3, 0xF752F7DA, 0x3F046F69, 0x77FA0A59,
			0x80E4A915, 0x87B08601, 0x9B09E6AD, 0x3B3EE593, 0xE990FD5A, 0x9E34D797, 0x2CF0B7D9, 0x022B8B51,
			0x96D5AC3A, 0x017DA67D, 0xD1CF3ED6, 0x7C7D2D28, 0x1F9F25CF, 0xADF2B89B, 0x5AD6B472, 0x5A88F54C,
			0xE029AC71, 0xE019A5E6, 0x47B0ACFD, 0xED93FA9B, 0xE8D3C48D, 0x283B57CC, 0xF8D56629, 0x79132E28,
			0x785F0191, 0xED756055, 0xF7960E44, 0xE3D35E8C, 0x15056DD4, 0x88F46DBA, 0x03A16125, 0x0564F0BD,
			0xC3EB9E15, 0x3C9057A2, 0x97271AEC, 0xA93A072A, 0x1B3F6D9B, 0x1E6321F5, 0xF59C66FB, 0x26DCF319,
			0x7533D928, 0xB155FDF5, 0x03563482, 0x8ABA3CBB, 0x28517711, 0xC20AD9F8, 0xABCC5167, 0xCCAD925F,
			0x4DE81751, 0x3830DC8E, 0x379D5862, 0x9320F991, 0xEA7A90C2, 0xFB3E7BCE, 0x5121CE64, 0x774FBE32,
			0xA8B6E37E, 0xC3293D46, 0x48DE5369, 0x6413E680, 0xA2AE0810, 0xDD6DB224, 0x69852DFD, 0x09072166,
			0xB39A460A, 0x6445C0DD, 0x586CDECF, 0x1C20C8AE, 0x5BBEF7DD, 0x1B588D40, 0xCCD2017F, 0x6BB4E3BB,
			0xDDA26A7E, 0x3A59FF45, 0x3E350A44, 0xBCB4CDD5, 0x72EACEA8, 0xFA6484BB, 0x8D6612AE, 0xBF3C6F47,
			0xD29BE463, 0x542F5D9E, 0xAEC2771B, 0xF64E6370, 0x740E0D8D, 0xE75B1357, 0xF8721671, 0xAF537D5D,
			0x4040CB08, 0x4EB4E2CC, 0x34D2466A, 0x0115AF84, 0xE1B00428, 0x95983A1D, 0x06B89FB4, 0xCE6EA048,
			0x6F3F3B82, 0x3520AB82, 0x011A1D4B, 0x277227F8, 0x611560B1, 0xE7933FDC, 0xBB3A792B, 0x344525BD,
			0xA08839E1, 0x51CE794B, 0x2F32C9B7, 0xA01FBAC9, 0xE01CC87E, 0xBCC7D1F6, 0xCF0111C3, 0xA1E8AAC7,
			0x1A908749, 0xD44FBD9A, 0xD0DADECB, 0xD50ADA38, 0x0339C32A, 0xC6913667, 0x8DF9317C, 0xE0B12B4F,
			0xF79E59B7, 0x43F5BB3A, 0xF2D519FF, 0x27D9459C, 0xBF97222C, 0x15E6FC2A, 0x0F91FC71, 0x9B941525,
			0xFAE59361, 0xCEB69CEB, 0xC2A86459, 0x12BAA8D1, 0xB6C1075E, 0xE3056A0C, 0x10D25065, 0xCB03A442,
			0xE0EC6E0E, 0x1698DB3B, 0x4C98A0BE, 0x3278E964, 0x9F1F9532, 0xE0D392DF, 0xD3A0342B, 0x8971F21E,
			0x1B0A7441, 0x4BA3348C, 0xC5BE7120, 0xC37632D8, 0xDF359F8D, 0x9B992F2E, 0xE60B6F47, 0x0FE3F11D,
			0xE54CDA54, 0x1EDAD891, 0xCE6279CF, 0xCD3E7E6F, 0x1618B166, 0xFD2C1D05, 0x848FD2C5, 0xF6FB2299,
			0xF523F357, 0xA6327623, 0x93A83531, 0x56CCCD02, 0xACF08162, 0x5A75EBB5, 0x6E163697, 0x88D273CC,
			0xDE966292, 0x81B949D0, 0x4C50901B, 0x71C65614, 0xE6C6C7BD, 0x327A140A, 0x45E1D006, 0xC3F27B9A,
			0xC9AA53FD, 0x62A80F00, 0xBB25BFE2, 0x35BDD2F6, 0x71126905, 0xB2040222, 0xB6CBCF7C, 0xCD769C2B,
			0x53113EC0, 0x1640E3D3, 0x38ABBD60, 0x2547ADF0, 0xBA38209C, 0xF746CE76, 0x77AFA1C5, 0x20756060,
			0x85CBFE4E, 0x8AE88DD8, 0x7AAAF9B0, 0x4CF9AA7E, 0x1948C25C, 0x02FB8A8C, 0x01C36AE4, 0xD6EBE1F9,
			0x90D4F869, 0xA65CDEA0, 0x3F09252D, 0xC208E69F, 0xB74E6132, 0xCE77E25B, 0x578FDFE3, 0x3AC372E6
		];

		var Z_INIT = [0, 0, 0, 0, 0, 0, 0, 0];

		return {
			cipherID: 'BlowFish',

			Nk: 8,	// 256 bits key
			Nb: 2,	// 64 bits blocksize
			Nr: 16,	// 16 rounds

			init: function(options) {
				options = options || {};

				var n = options.keyLen || this.Nk * 32,
					r = options.rounds || this.Nr;

				if (n >= 32 && n <= 448) {
					// keys up to 448 bits
					this.Nk = n >>> 5; //Math.floor(n / 32);
				} else {
					this.Nk = 8;	// 256 bits key
				}
				this.Nr = r > 0 ? r : this.Nr;
			},

			spBoxSetup: function(SP, Z) {
				for (var i = 0, l = SP.length; i < l; i += 2) {
					this.encryptBlock(Z, 0);

					var z = Z.bytesToWords();

					SP[i] = z[0];
					SP[i + 1] = z[1];
				}
			},

			keyExpansion: function(km) {
				Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

				// Initial subkeys
				this.P = P_INIT.slice(0);

				// Initial SBOX-es
				this.S0 = S0_INIT.slice(0);
				this.S1 = S1_INIT.slice(0);
				this.S2 = S2_INIT.slice(0);
				this.S3 = S3_INIT.slice(0);

				var key = km.key,
					i, j, k, l, d, p,
					Z = Z_INIT.slice(0),
					P = this.P;

				for (i = 0, j = 0, l = key.length, p = P.length; i < p; i++) {
					d = 0;
					for (k = 0; k < 4; k++) {
						d = (d << 8) | key[j];
						j = (j + 1) % l;
					}
					P[i] ^= d;
				}

				this.spBoxSetup(this.P, Z);
				this.spBoxSetup(this.S0, Z);
				this.spBoxSetup(this.S1, Z);
				this.spBoxSetup(this.S2, Z);
				this.spBoxSetup(this.S3, Z);
			},

			F: function(x) {
				return ((((this.S0[(x >>> 24) & 0xff] + this.S1[(x >>> 16) & 0xff]) & 0xffffffff) ^
						   this.S2[(x >>> 8) & 0xff]) + this.S3[x & 0xff]) & 0xffffffff;
			},

			encryptBlock: function(m, ofs) {
				var P = this.P, i, t,
					b = [], xL, xR;

				this.setInput(b, m, ofs);
				b = b.bytesToWords();

				for (i = 0, xL = b[0], xR = b[1]; i < this.Nr; i++) {
					xL ^= P[i];
					xR = this.F(xL) ^ xR;
					t = xL; xL = xR; xR = t;
				}
				b[1] = xL ^ P[16];
				b[0] = xR ^ P[17];

				b = b.wordsToBytes();
				this.setOutput(m, b, ofs);
			},

			decryptBlock: function(c, ofs) {
				var P = this.P, i, t,
					b = [], xL, xR;

				this.setInput(b, c, ofs);
				b = b.bytesToWords();

				for (i = this.Nr - 1, xL = b[0], xR = b[1]; i >= 0; i--) {
					xL ^= P[i + 2];
					xR = this.F(xL) ^ xR;
					t = xL; xL = xR; xR = t;
				}
				b[1] = xL ^ P[1];
				b[0] = xR ^ P[0];

				b = b.wordsToBytes();
				this.setOutput(c, b, ofs);
			},

			selfTest: function() {
				var TEST_VECTORS = [
					// Source: http://www.schneier.com/code/vectors.txt
					{
						key: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						plainText: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						cipherText: [0x4E, 0xF9, 0x97, 0x45, 0x61, 0x98, 0xDD, 0x78]
					}, {
						key: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
						plainText: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
						cipherText: [0x51, 0x86, 0x6F, 0xD5, 0xB8, 0x5E, 0xCB, 0x8A]
					}, {
						key: [0x30, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						plainText: [0x10, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01],
						cipherText: [0x7D, 0x85, 0x6F, 0x9A, 0x61, 0x30, 0x63, 0xF2]
					}, {
						key: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11],
						plainText: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11],
						cipherText: [0x24, 0x66, 0xDD, 0x87, 0x8B, 0x96, 0x3C, 0x9D]
					}, {
						key: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						plainText: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11],
						cipherText: [0x61, 0xF9, 0xC3, 0x80, 0x22, 0x81, 0xB0, 0x96]
					}, {
						key: [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x11],
						plainText: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						cipherText: [0x7D, 0x0C, 0xC6, 0x30, 0xAF, 0xDA, 0x1E, 0xC7]
					}, {
						key: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						plainText: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						cipherText: [0x4E, 0xF9, 0x97, 0x45, 0x61, 0x98, 0xDD, 0x78]
					}, {
						key: [0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10],
						plainText: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						cipherText: [0x0A, 0xCE, 0xAB, 0x0F, 0xC6, 0xA0, 0xA2, 0x8D]
					}, {
						key: [0x7C, 0xA1, 0x10, 0x45, 0x4A, 0x1A, 0x6E, 0x57],
						plainText: [0x01, 0xA1, 0xD6, 0xD0, 0x39, 0x77, 0x67, 0x42],
						cipherText: [0x59, 0xC6, 0x82, 0x45, 0xEB, 0x05, 0x28, 0x2B]
					}, {
						key: [0x01, 0x31, 0xD9, 0x61, 0x9D, 0xC1, 0x37, 0x6E],
						plainText: [0x5C, 0xD5, 0x4C, 0xA8, 0x3D, 0xEF, 0x57, 0xDA],
						cipherText: [0xB1, 0xB8, 0xCC, 0x0B, 0x25, 0x0F, 0x09, 0xA0]
					}, {
						key: [0x07, 0xA1, 0x13, 0x3E, 0x4A, 0x0B, 0x26, 0x86],
						plainText: [0x02, 0x48, 0xD4, 0x38, 0x06, 0xF6, 0x71, 0x72],
						cipherText: [0x17, 0x30, 0xE5, 0x77, 0x8B, 0xEA, 0x1D, 0xA4]
					}, {
						key: [0x38, 0x49, 0x67, 0x4C, 0x26, 0x02, 0x31, 0x9E],
						plainText: [0x51, 0x45, 0x4B, 0x58, 0x2D, 0xDF, 0x44, 0x0A],
						cipherText: [0xA2, 0x5E, 0x78, 0x56, 0xCF, 0x26, 0x51, 0xEB]
					}, {
						key: [0x04, 0xB9, 0x15, 0xBA, 0x43, 0xFE, 0xB5, 0xB6],
						plainText: [0x42, 0xFD, 0x44, 0x30, 0x59, 0x57, 0x7F, 0xA2],
						cipherText: [0x35, 0x38, 0x82, 0xB1, 0x09, 0xCE, 0x8F, 0x1A]
					}, {
						key: [0x01, 0x13, 0xB9, 0x70, 0xFD, 0x34, 0xF2, 0xCE],
						plainText: [0x05, 0x9B, 0x5E, 0x08, 0x51, 0xCF, 0x14, 0x3A],
						cipherText: [0x48, 0xF4, 0xD0, 0x88, 0x4C, 0x37, 0x99, 0x18]
					}, {
						key: [0x01, 0x70, 0xF1, 0x75, 0x46, 0x8F, 0xB5, 0xE6],
						plainText: [0x07, 0x56, 0xD8, 0xE0, 0x77, 0x47, 0x61, 0xD2],
						cipherText: [0x43, 0x21, 0x93, 0xB7, 0x89, 0x51, 0xFC, 0x98]
					}, {
						key: [0x43, 0x29, 0x7F, 0xAD, 0x38, 0xE3, 0x73, 0xFE],
						plainText: [0x76, 0x25, 0x14, 0xB8, 0x29, 0xBF, 0x48, 0x6A],
						cipherText: [0x13, 0xF0, 0x41, 0x54, 0xD6, 0x9D, 0x1A, 0xE5]
					}, {
						key: [0x07, 0xA7, 0x13, 0x70, 0x45, 0xDA, 0x2A, 0x16],
						plainText: [0x3B, 0xDD, 0x11, 0x90, 0x49, 0x37, 0x28, 0x02],
						cipherText: [0x2E, 0xED, 0xDA, 0x93, 0xFF, 0xD3, 0x9C, 0x79]
					}, {
						key: [0x04, 0x68, 0x91, 0x04, 0xC2, 0xFD, 0x3B, 0x2F],
						plainText: [0x26, 0x95, 0x5F, 0x68, 0x35, 0xAF, 0x60, 0x9A],
						cipherText: [0xD8, 0x87, 0xE0, 0x39, 0x3C, 0x2D, 0xA6, 0xE3]
					}, {
						key: [0x37, 0xD0, 0x6B, 0xB5, 0x16, 0xCB, 0x75, 0x46],
						plainText: [0x16, 0x4D, 0x5E, 0x40, 0x4F, 0x27, 0x52, 0x32],
						cipherText: [0x5F, 0x99, 0xD0, 0x4F, 0x5B, 0x16, 0x39, 0x69]
					}, {
						key: [0x1F, 0x08, 0x26, 0x0D, 0x1A, 0xC2, 0x46, 0x5E],
						plainText: [0x6B, 0x05, 0x6E, 0x18, 0x75, 0x9F, 0x5C, 0xCA],
						cipherText: [0x4A, 0x05, 0x7A, 0x3B, 0x24, 0xD3, 0x97, 0x7B]
					}, {
						key: [0x58, 0x40, 0x23, 0x64, 0x1A, 0xBA, 0x61, 0x76],
						plainText: [0x00, 0x4B, 0xD6, 0xEF, 0x09, 0x17, 0x60, 0x62],
						cipherText: [0x45, 0x20, 0x31, 0xC1, 0xE4, 0xFA, 0xDA, 0x8E]
					}, {
						key: [0x02, 0x58, 0x16, 0x16, 0x46, 0x29, 0xB0, 0x07],
						plainText: [0x48, 0x0D, 0x39, 0x00, 0x6E, 0xE7, 0x62, 0xF2],
						cipherText: [0x75, 0x55, 0xAE, 0x39, 0xF5, 0x9B, 0x87, 0xBD]
					}, {
						key: [0x49, 0x79, 0x3E, 0xBC, 0x79, 0xB3, 0x25, 0x8F],
						plainText: [0x43, 0x75, 0x40, 0xC8, 0x69, 0x8F, 0x3C, 0xFA],
						cipherText: [0x53, 0xC5, 0x5F, 0x9C, 0xB4, 0x9F, 0xC0, 0x19]
					}, {
						key: [0x4F, 0xB0, 0x5E, 0x15, 0x15, 0xAB, 0x73, 0xA7],
						plainText: [0x07, 0x2D, 0x43, 0xA0, 0x77, 0x07, 0x52, 0x92],
						cipherText: [0x7A, 0x8E, 0x7B, 0xFA, 0x93, 0x7E, 0x89, 0xA3]
					}, {
						key: [0x49, 0xE9, 0x5D, 0x6D, 0x4C, 0xA2, 0x29, 0xBF],
						plainText: [0x02, 0xFE, 0x55, 0x77, 0x81, 0x17, 0xF1, 0x2A],
						cipherText: [0xCF, 0x9C, 0x5D, 0x7A, 0x49, 0x86, 0xAD, 0xB5]
					}, {
						key: [0x01, 0x83, 0x10, 0xDC, 0x40, 0x9B, 0x26, 0xD6],
						plainText: [0x1D, 0x9D, 0x5C, 0x50, 0x18, 0xF7, 0x28, 0xC2],
						cipherText: [0xD1, 0xAB, 0xB2, 0x90, 0x65, 0x8B, 0xC7, 0x78]
					}, {
						key: [0x1C, 0x58, 0x7F, 0x1C, 0x13, 0x92, 0x4F, 0xEF],
						plainText: [0x30, 0x55, 0x32, 0x28, 0x6D, 0x6F, 0x29, 0x5A],
						cipherText: [0x55, 0xCB, 0x37, 0x74, 0xD1, 0x3E, 0xF2, 0x01]
					}, {
						key: [0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01],
						plainText: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						cipherText: [0xFA, 0x34, 0xEC, 0x48, 0x47, 0xB2, 0x68, 0xB2]
					}, {
						key: [0x1F, 0x1F, 0x1F, 0x1F, 0x0E, 0x0E, 0x0E, 0x0E],
						plainText: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						cipherText: [0xA7, 0x90, 0x79, 0x51, 0x08, 0xEA, 0x3C, 0xAE]
					}, {
						key: [0xE0, 0xFE, 0xE0, 0xFE, 0xF1, 0xFE, 0xF1, 0xFE],
						plainText: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						cipherText: [0xC3, 0x9E, 0x07, 0x2D, 0x9F, 0xAC, 0x63, 0x1D]
					}, {
						key: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						plainText: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
						cipherText: [0x01, 0x49, 0x33, 0xE0, 0xCD, 0xAF, 0xF6, 0xE4]
					}, {
						key: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
						plainText: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						cipherText: [0xF2, 0x1E, 0x9A, 0x77, 0xB7, 0x1C, 0x49, 0xBC]
					}, {
						key: [0x01, 0x23, 0x45, 0x67, 0x89, 0xAB, 0xCD, 0xEF],
						plainText: [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
						cipherText: [0x24, 0x59, 0x46, 0x88, 0x57, 0x54, 0x36, 0x9A]
					}, {
						key: [0xFE, 0xDC, 0xBA, 0x98, 0x76, 0x54, 0x32, 0x10],
						plainText: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
						cipherText: [0x6B, 0x5C, 0x5A, 0x9C, 0x5D, 0x9E, 0x0A, 0x5A]
					}
				];
				return this.selfTestPrim(TEST_VECTORS);
			}
		};
	}());

	// RC5
	Ext.extend(Crypto.RC5, Crypto.BlockCipher, function() {
		var P_MAGIC = 0xb7e15163;
		var Q_MAGIC = 0x9e3779b9;

		return {
			cipherID: 'RC5',

			Nk: 4,	// 128 bits key
			Nb: 2,	// 64 bits blocksize
			Nr: 12,	// 12 rounds

			init: function(options) {
				options = options || {};

				var n = options.keyLen || this.Nk * 32,
					r = options.rounds || this.Nr;

				if (n >= 32 && n <= 2040) {
					// keys up to 2040 bits (in steps of 32 bits)
					this.Nk = n >>> 5; //Math.floor(n / 32);
				} else {
					this.Nk = 4;	// 128 bits key
				}
				this.Nr = r > 0 ? r : this.Nr;
			},

			bytesToKey: function(bytes) {
				var r = [];
				for (var i = bytes.length - 1; i >= 0; i--) {
					r[i >>> 2] = UTIL.rotl(r[i >>> 2] || 0, 8) | bytes[i];
				}
				return r;
			},

			keySetup: function(key, t) {
				var i, j, k,
					A, B, M,
					L = this.bytesToKey(key),
					c = L.length, l = 3 * Math.max(t, c);

				this.S[0] = P_MAGIC;
				for (i = 1; i < t; i++) {
					this.S[i] = this.S[i - 1] + Q_MAGIC;
					this.S[i] &= 0xffffffff;
				}

				for (k = i = j = A = B = 0; k < l; k++) {
					A = this.S[i] + A + B;
					A &= 0xffffffff;
					A = this.S[i] = UTIL.rotl(A, 3);

					M = A + B;
					M &= 0xffffffff;

					B = L[j] + A + B;
					B &= 0xffffffff;
					B = L[j] = UTIL.rotl(B, M);

					i = (i + 1) % t;
					j = (j + 1) % c;
				}
			},

			keyExpansion: function(km) {
				Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

				this.S = [];

				this.keySetup(km.key, 2 * (this.Nr + 1));
			},

			encryptBlock: function(m, ofs) {
				var i, b = [], S = this.S;

				this.setInput(b, m, ofs);
				b = b.bytesToWordsEndian();

				// NOTE: b[0] == A, b[1] == B
				b[0] += S[0];
				b[0] &= 0xffffffff;

				b[1] += S[1];
				b[1] &= 0xffffffff;

				for (i = 1; i <= this.Nr; i++) {
					b[0] ^= b[1];
					b[0] = UTIL.rotl(b[0], b[1]);
					b[0] += S[2 * i];
					b[0] &= 0xffffffff;

					b[1] ^= b[0];
					b[1] = UTIL.rotl(b[1], b[0]);
					b[1] += S[(2 * i) + 1];
					b[1] &= 0xffffffff;
				}

				b = b.wordsToBytesEndian();
				this.setOutput(m, b, ofs);
			},

			decryptBlock: function(c, ofs) {
				var i, b = [], S = this.S;

				this.setInput(b, c, ofs);
				b = b.bytesToWordsEndian();

				// NOTE: b[0] == A, b[1] == B
				for (i = this.Nr; i >= 1; i--) {
					b[1] -= S[(2 * i) + 1];
					b[1] &= 0xffffffff;
					b[1] = UTIL.rotr(b[1], b[0]);
					b[1] ^= b[0];

					b[0] -= S[2 * i];
					b[0] &= 0xffffffff;
					b[0] = UTIL.rotr(b[0], b[1]);
					b[0] ^= b[1];
				}

				b[0] -= S[0];
				b[0] &= 0xffffffff;

				b[1] -= S[1];
				b[1] &= 0xffffffff;

				b = b.wordsToBytesEndian();
				this.setOutput(c, b, ofs);
			},

			selfTest: function() {
				var TEST_VECTORS = [
					// Source: http://people.csail.mit.edu/rivest/Rivest-rc5rev.pdf
					{
						key: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						plainText: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						cipherText: [
							0x21, 0xa5, 0xdb, 0xee, 0x15, 0x4b, 0x8f, 0x6d
						]
					}, {
						key: [
							0x91, 0x5f, 0x46, 0x19, 0xbe, 0x41, 0xb2, 0x51,
							0x63, 0x55, 0xa5, 0x01, 0x10, 0xa9, 0xce, 0x91
						],
						plainText: [
							0x21, 0xa5, 0xdb, 0xee, 0x15, 0x4b, 0x8f, 0x6d
						],
						cipherText: [
							0xf7, 0xc0, 0x13, 0xac, 0x5b, 0x2b, 0x89, 0x52
						]
					}, {
						key: [
							0x78, 0x33, 0x48, 0xe7, 0x5a, 0xeb, 0x0f, 0x2f,
							0xd7, 0xb1, 0x69, 0xbb, 0x8d, 0xc1, 0x67, 0x87
						],
						plainText: [
							0xf7, 0xc0, 0x13, 0xac, 0x5b, 0x2b, 0x89, 0x52
						],
						cipherText: [
							0x2f, 0x42, 0xb3, 0xb7, 0x03, 0x69, 0xfc, 0x92
						]
					}, {
						key: [
							0xdc, 0x49, 0xdb, 0x13, 0x75, 0xa5, 0x58, 0x4f,
							0x64, 0x85, 0xb4, 0x13, 0xb5, 0xf1, 0x2b, 0xaf
						],
						plainText: [
							0x2f, 0x42, 0xb3, 0xb7, 0x03, 0x69, 0xfc, 0x92
						],
						cipherText: [
							0x65, 0xc1, 0x78, 0xb2, 0x84, 0xd1, 0x97, 0xcc
						]
					}, {
						key: [
							0x52, 0x69, 0xf1, 0x49, 0xd4, 0x1b, 0xa0, 0x15,
							0x24, 0x97, 0x57, 0x4d, 0x7f, 0x15, 0x31, 0x25
						],
						plainText: [
							0x65, 0xc1, 0x78, 0xb2, 0x84, 0xd1, 0x97, 0xcc
						],
						cipherText: [
							0xeb, 0x44, 0xe4, 0x15, 0xda, 0x31, 0x98, 0x24
						]
					}
				];

				return this.selfTestPrim(TEST_VECTORS);
			}
		};
	}());

	Ext.extend(Crypto.RC6, Crypto.RC5, function() {
		return {
			cipherID: 'RC6',

			Nk: 8,	// 256 bits key
			Nb: 4,	// 128 bits blocksize
			Nr: 20,	// 20 rounds

			keyExpansion: function(km) {
				Crypto.BlockCipher.superclass.keyExpansion.apply(this, arguments);

				this.S = [];

				this.keySetup(km.key, (2 * this.Nr) + 4);
			},

			multiply: function(v1, v2) {
				// Multiplies two 32 bit unsigned integers together using Karatsuba's algorithm
				// to overcome Javascripts 53 bit limit ...
				var x = [v1].wordsToShorts(),
					y = [v2].wordsToShorts(),
					A = x[0] * y[0],
					B = x[1] * y[1],
					C = (x[0] + x[1]) * (y[0] + y[1]),
					K = C - A - B;
					R = (K * 0x10000) + B;
//					r = [];

//				r[0] = (A + Math.floor(R / 0x100000000)) & 0xffffffff;
//				r[1] = (R % 0x100000000) & 0xffffffff;

				return (R % 0x100000000) & 0xffffffff; //r[1];
			},

			encryptBlock: function(m, ofs) {
				var i, b = [], S = this.S, t, u;

				this.setInput(b, m, ofs);
				b = b.bytesToWordsEndian();

				// NOTE b[0] == A, b[1] == B, b[2] == C, b[3] == D
				b[1] += S[0];
				b[1] &= 0xffffffff;

				b[3] += S[1];
				b[3] &= 0xffffffff;

				for (i = 1; i <= this.Nr; i++) {
					t = (2 * b[1]) + 1;
					t &= 0xffffffff;
					t = this.multiply(t, b[1]);
					t = UTIL.rotl(t, 5);

					u = (2 * b[3]) + 1;
					u &= 0xffffffff;
					u = this.multiply(u, b[3]);
					u = UTIL.rotl(u, 5);

					b[0] ^= t;
					b[0] = UTIL.rotl(b[0], u);
					b[0] += S[2 * i];
					b[0] &= 0xffffffff;

					b[2] ^= u;
					b[2] = UTIL.rotl(b[2], t);
					b[2] += S[(2 * i) + 1];
					b[2] &= 0xffffffff;

					t = b[0]; b[0] = b[1]; b[1] = b[2]; b[2] = b[3]; b[3] = t;
				}

				b[0] += S[(2 * this.Nr) + 2];
				b[0] &= 0xffffffff;

				b[2] += S[(2 * this.Nr) + 3];
				b[2] &= 0xffffffff;

				b = b.wordsToBytesEndian();
				this.setOutput(m, b, ofs);
			},

			decryptBlock: function(c, ofs) {
				var i, b = [], S = this.S, t, u;

				this.setInput(b, c, ofs);
				b = b.bytesToWordsEndian();

				// NOTE b[0] == A, b[1] == B, b[2] == C, b[3] == D
				b[0] -= S[(2 * this.Nr) + 2];
				b[0] &= 0xffffffff;

				b[2] -= S[(2 * this.Nr) + 3];
				b[2] &= 0xffffffff;

				for (i = this.Nr; i >= 1; i--) {
					t = b[3]; b[3] = b[2]; b[2] = b[1]; b[1] = b[0]; b[0] = t;

					u = (2 * b[3]) + 1;
					u &= 0xffffffff;
					u = this.multiply(u, b[3]);
					u = UTIL.rotl(u, 5);

					t = (2 * b[1]) + 1;
					t &= 0xffffffff;
					t = this.multiply(t, b[1]);
					t = UTIL.rotl(t, 5);

					b[2] -= S[(2 * i) + 1];
					b[2] &= 0xffffffff;
					b[2] = UTIL.rotr(b[2], t);
					b[2] ^= u;

					b[0] -= S[2 * i];
					b[0] &= 0xffffffff;
					b[0] = UTIL.rotr(b[0], u);
					b[0] ^= t;
				}

				b[3] -= S[1];
				b[3] &= 0xffffffff;

				b[1] -= S[0];
				b[1] &= 0xffffffff;

				b = b.wordsToBytesEndian();
				this.setOutput(c, b, ofs);
			},

			selfTest: function() {
				var TEST_VECTORS = [
					// Source: http://people.csail.mit.edu/rivest/Rc6.pdf
					{
						key: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						plainText: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						cipherText: [
							0x8f, 0xc3, 0xa5, 0x36, 0x56, 0xb1, 0xf7, 0x78,
							0xc1, 0x29, 0xdf, 0x4e, 0x98, 0x48, 0xa4, 0x1e
						]
					}, {
						key: [
							0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
							0x01, 0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78
						],
						plainText: [
							0x02, 0x13, 0x24, 0x35, 0x46, 0x57, 0x68, 0x79,
							0x8a, 0x9b, 0xac, 0xbd, 0xce, 0xdf, 0xe0, 0xf1
						],
						cipherText: [
							0x52, 0x4e, 0x19, 0x2f, 0x47, 0x15, 0xc6, 0x23,
							0x1f, 0x51, 0xf6, 0x36, 0x7e, 0xa4, 0x3f, 0x18
						]
					}, {
						key: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						plainText: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						cipherText: [
							0x6c, 0xd6, 0x1b, 0xcb, 0x19, 0x0b, 0x30, 0x38,
							0x4e, 0x8a, 0x3f, 0x16, 0x86, 0x90, 0xae, 0x82
						]
					}, {
						key: [
							0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
							0x01, 0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78,
							0x89, 0x9a, 0xab, 0xbc, 0xcd, 0xde, 0xef, 0xf0
						],
						plainText: [
							0x02, 0x13, 0x24, 0x35, 0x46, 0x57, 0x68, 0x79,
							0x8a, 0x9b, 0xac, 0xbd, 0xce, 0xdf, 0xe0, 0xf1
						],
						cipherText: [
							0x68, 0x83, 0x29, 0xd0, 0x19, 0xe5, 0x05, 0x04,
							0x1e, 0x52, 0xe9, 0x2a, 0xf9, 0x52, 0x91, 0xd4
						]
					}, {
						key: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						plainText: [
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
						],
						cipherText: [
							0x8f, 0x5f, 0xbd, 0x05, 0x10, 0xd1, 0x5f, 0xa8,
							0x93, 0xfa, 0x3f, 0xda, 0x6e, 0x85, 0x7e, 0xc2
						]
					}, {
						key: [
							0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef,
							0x01, 0x12, 0x23, 0x34, 0x45, 0x56, 0x67, 0x78,
							0x89, 0x9a, 0xab, 0xbc, 0xcd, 0xde, 0xef, 0xf0,
							0x10, 0x32, 0x54, 0x76, 0x98, 0xba, 0xdc, 0xfe
						],
						plainText: [
							0x02, 0x13, 0x24, 0x35, 0x46, 0x57, 0x68, 0x79,
							0x8a, 0x9b, 0xac, 0xbd, 0xce, 0xdf, 0xe0, 0xf1
						],
						cipherText: [
							0xc8, 0x24, 0x18, 0x16, 0xf0, 0xd7, 0xe4, 0x89,
							0x20, 0xad, 0x16, 0xa1, 0x67, 0x4e, 0x5d, 0x48
						]
					}
				];

				return this.selfTestPrim(TEST_VECTORS);
			}
		};
	}());

	// Stream cipher
	Ext.extend(Crypto.StreamCipher, Crypto.SymmetricCipher, {
		nextState: function() {
			throw new Error(ERRORS.AbstractError('StreamCipher::nextState'));
		},

		nextByte: function() {
			throw new Error(ERRORS.AbstractError('StreamCipher::nextByte'));
		},

		// For PRNG purposes
		nextBytes: function(a) {
			for (var i = 0, l = a.length; i < l; i++) {
				a[i] = this.nextByte();
			}
		},

		encrypt: function(s, pwd, options) {
			options = options || {};

			Ext.applyIf(options, {
				keyLen: 256,
				salted: true,
				kdf: UTIL.PBKDF1
			});

			this.init(options);

			var m = s.stringToBytes(),
				salt = (options.salted ? Array.randomBytes(8) : []),
				kdf = (Ext.isObject(options.kdf) ? options.kdf.fn : options.kdf) || UTIL.PBKDF1;

			this.setKey(pwd, salt, kdf, Ext.isObject(options.kdf) ? options.kdf : {});
			this.outputBytes(m);

			if (options.salted) {
				m = SALTBLOCK.concat(salt, m);
			}

			return m.bytesToString();
		},

		decrypt: function(s, pwd, options) {
			options = options || {};

			Ext.applyIf(options, {
				keyLen: 256,
				kdf: UTIL.PBKDF1
			});

			this.init(options);

			var c = s.stringToBytes(),
				salted = s.substring(0, 8) == 'Salted__',
				salt = (salted ? c.slice(8, 16) : []),
				kdf = (Ext.isObject(options.kdf) ? options.kdf.fn : options.kdf) || UTIL.PBKDF1;

			c = c.slice((salted ? 16 : 0));

			this.setKey(pwd, salt, kdf, Ext.isObject(options.kdf) ? options.kdf : {});
			this.outputBytes(c);

			return c.bytesToString();
		},

		outputBytes: function(m) {
			for (var i = 0, l = m.length; i < l; i++) {
				m[i] ^= this.nextByte();
			}
		},

		selfTestPrim: function(TEST_VECTORS) {
			TEST_VECTORS = TEST_VECTORS || [];

			var i, success = true;

			for (i = 0; i < TEST_VECTORS.length; i++) {
				this.init({
					keyLen: TEST_VECTORS[i].key.length * 8
				});

				this.keyExpansion({
					key: TEST_VECTORS[i].key.slice(0),
					iv: TEST_VECTORS[i].iv ? TEST_VECTORS[i].iv.slice(0) : []
				});

				var data = [];
				for (var j = 0, l = TEST_VECTORS[i].cipherText.length; j < l; j++) {
					data.push(this.nextByte());
				}

				if (!(success = data.compareTo(TEST_VECTORS[i].cipherText) === 0)) {
					console.error("%s:selfTest(%d) FAILED!! %s != %s",
						this.cipherID, i,
						data.bytesToHex(),
						TEST_VECTORS[i].cipherText.bytesToHex());
					break;
				}
			}
			return success;
		}
	});

	// ARC4 (RC4)
	Ext.extend(Crypto.ARC4, Crypto.StreamCipher, {
		cipherID: 'ARC4',

		Nk: 8,	// 256 bits key
		Nb: 0,	// No IV !!

		init: function(options) {
			options = options || {};

			var n = options.keyLen || this.Nk * 32;

			if (n == 40) {
				this.Nk = 1.25;		// 40 bits key
			} else if (n > 40 && n <= 2048) {
				// keys up to 2048 bits (in steps of 32 bits)
				this.Nk = n >>> 5; //Math.floor(n / 32);
			} else {
				this.Nk = 8;		// 256 bits key
			}
		},

		keyExpansion: function(km) {
			Crypto.StreamCipher.superclass.keyExpansion.apply(this, arguments);

			var key = km.key, iv = km.iv;
			if (!Ext.isEmpty(iv)) {
				key = key.concat(iv);
			}

			this.i = 0;
			this.j = 0;
			this.S = [];

			var S = this.S,
				i, j, l = key.length, t;

			for (i = 0; i < 256; i++) {
				S[i] = i;
			}
			for (i = 0, j = 0; i < 256; i++) {
				j = (j + S[i] + key[i % l]) & 0xff;
				t = S[i];
				S[i] = S[j];
				S[j] = t;
			}
		},

		nextState: function() {
			var S = this.S, t;

			this.i = (this.i + 1) & 0xff;
			this.j = (this.j + S[this.i]) & 0xff;

			t = S[this.i];
			S[this.i] = S[this.j];
			S[this.j] = t;
		},

		nextByte: function() {
			this.nextState();

			return this.S[(this.S[this.i] + this.S[this.j]) & 0xff];
		},

		selfTest: function() {
			// TODO
			var TEST_VECTORS = [
			];

			return this.selfTestPrim(TEST_VECTORS);
		}
	});

	// MARC4 (Modified ARC4)
	Ext.extend(Crypto.MARC4, Crypto.ARC4, {
		cipherID: 'MARC4',

		Nb: 4,	// 128 bits IV
		Ns: 1536,	// # of initial output bytes to skip

		init: function(options) {
			Crypto.MARC4.superclass.init.apply(this, arguments);

			this.initial = true;
		},

		nextState: function() {
			if (this.initial) {
				delete this.initial;

				// Skip the first x states ...
				for (var i = 0; i < this.Ns; i++) {
					Crypto.MARC4.superclass.nextState.apply(this, arguments);
				}
				return;
			}
			Crypto.MARC4.superclass.nextState.apply(this, arguments);
		},

		selfTest: function() {
			// TODO
			var TEST_VECTORS = [
			];

			return this.selfTestPrim(TEST_VECTORS);
		}
	});

	// Rabbit
	Ext.extend(Crypto.Rabbit, Crypto.StreamCipher, {
		cipherID: 'Rabbit',

		Nk: 4,	// 128 bit key
		Nb: 2,	// 64 bit IV

		init: function(options) {
			// Rabbit has no config options
		},

		keySetup: function(key) {
			var X = this.X, C = this.C, i;

			X[0] = key[0];
			X[2] = key[1];
			X[4] = key[2];
			X[6] = key[3];
			X[1] = (key[3] << 16) | (key[2] >>> 16);
			X[3] = (key[0] << 16) | (key[3] >>> 16);
			X[5] = (key[1] << 16) | (key[0] >>> 16);
			X[7] = (key[2] << 16) | (key[1] >>> 16);

			// Generate initial counter values
			C[0] = UTIL.rotl(key[2], 16);
			C[2] = UTIL.rotl(key[3], 16);
			C[4] = UTIL.rotl(key[0], 16);
			C[6] = UTIL.rotl(key[1], 16);
			C[1] = (key[0] & 0xffff0000) | (key[1] & 0xffff);
			C[3] = (key[1] & 0xffff0000) | (key[2] & 0xffff);
			C[5] = (key[2] & 0xffff0000) | (key[3] & 0xffff);
			C[7] = (key[3] & 0xffff0000) | (key[0] & 0xffff);

			for (i = 0; i < 4; i++) {
				this.nextState();
			}
			for (i = 0; i < 8; i++) {
				C[i] ^= X[(i + 4) & 7];
			}
		},

		ivSetup: function(iv) {
			var C = this.C,
				i0 = UTIL.endian(iv[0]),
				i2 = UTIL.endian(iv[1]),
				i1 = (i0 >>> 16) | (i2 & 0xffff0000),
				i3 = (i2 <<  16) | (i0 & 0x0000ffff);

			C[0] ^= i0;
			C[1] ^= i1;
			C[2] ^= i2;
			C[3] ^= i3;
			C[4] ^= i0;
			C[5] ^= i1;
			C[6] ^= i2;
			C[7] ^= i3;

			for (var i = 0; i < 4; i++) {
				this.nextState();
			}
		},

		keyExpansion: function(km) {
			Crypto.StreamCipher.superclass.keyExpansion.apply(this, arguments);

			var key = UTIL.endian(km.key.bytesToWords());

			this.i = -1;
			this.j = 0;
			this.S = [];
			this.X = [];
			this.C = [];
			this.B = 0;

			this.keySetup(key);
			if (km.iv && km.iv.length > 0) {
				var iv = km.iv.bytesToWords();
				this.ivSetup(iv);
			};
		},

		nextState: function() {
			var X = this.X, C = this.C, C_old = [], i, g = [];

			for (i = 0; i < 8; i++) {
				C_old[i] = C[i];
			}

			C[0] = (C[0] + 0x4d34d34d + this.B) >>> 0;
			C[1] = (C[1] + 0xd34d34d3 + ((C[0] >>> 0) < (C_old[0] >>> 0) ? 1 : 0)) >>> 0;
			C[2] = (C[2] + 0x34d34d34 + ((C[1] >>> 0) < (C_old[1] >>> 0) ? 1 : 0)) >>> 0;
			C[3] = (C[3] + 0x4d34d34d + ((C[2] >>> 0) < (C_old[2] >>> 0) ? 1 : 0)) >>> 0;
			C[4] = (C[4] + 0xd34d34d3 + ((C[3] >>> 0) < (C_old[3] >>> 0) ? 1 : 0)) >>> 0;
			C[5] = (C[5] + 0x34d34d34 + ((C[4] >>> 0) < (C_old[4] >>> 0) ? 1 : 0)) >>> 0;
			C[6] = (C[6] + 0x4d34d34d + ((C[5] >>> 0) < (C_old[5] >>> 0) ? 1 : 0)) >>> 0;
			C[7] = (C[7] + 0xd34d34d3 + ((C[6] >>> 0) < (C_old[6] >>> 0) ? 1 : 0)) >>> 0;

			this.B = (C[7] >>> 0) < (C_old[7] >>> 0) ? 1 : 0;

			for (i = 0; i < 8; i++) {
				var gx = (X[i] + C[i]) >>> 0,
					ga = gx & 0xffff,
					gb = gx >>> 16,
					gh = ((((ga * ga) >>> 17) + ga * gb) >>> 15) + gb * gb,
					gl = (((gx & 0xffff0000) * gx) >>> 0) + (((gx & 0x0000ffff) * gx) >>> 0) >>> 0;

				g[i] = gh ^ gl;
			}

			X[0] = g[0] + ((g[7] << 16) | (g[7] >>> 16)) + ((g[6] << 16) | (g[6] >>> 16));
			X[1] = g[1] + ((g[0] <<  8) | (g[0] >>> 24)) + g[7];
			X[2] = g[2] + ((g[1] << 16) | (g[1] >>> 16)) + ((g[0] << 16) | (g[0] >>> 16));
			X[3] = g[3] + ((g[2] <<  8) | (g[2] >>> 24)) + g[1];
			X[4] = g[4] + ((g[3] << 16) | (g[3] >>> 16)) + ((g[2] << 16) | (g[2] >>> 16));
			X[5] = g[5] + ((g[4] <<  8) | (g[4] >>> 24)) + g[3];
			X[6] = g[6] + ((g[5] << 16) | (g[5] >>> 16)) + ((g[4] << 16) | (g[4] >>> 16));
			X[7] = g[7] + ((g[6] <<  8) | (g[6] >>> 24)) + g[5];
		},

		nextByte: function() {
			var S = this.S, X = this.X, i;

			this.i = (this.i + 1) % 16;

			if (this.i === 0) {
				this.nextState();

				S[0] = X[0] ^ (X[5] >>> 16) ^ (X[3] << 16);
				S[1] = X[2] ^ (X[7] >>> 16) ^ (X[5] << 16);
				S[2] = X[4] ^ (X[1] >>> 16) ^ (X[7] << 16);
				S[3] = X[6] ^ (X[3] >>> 16) ^ (X[1] << 16);

				for (i = 0; i < 4; i++) {
					S[i] = ((S[i] << 8) | (S[i] >>> 24)) & 0x00ff00ff | ((S[i] << 24) | (S[i] >>> 8)) & 0xff00ff00;
				}
				for (i = 120; i >= 0; i -= 8) {
					S[i >>> 3] = (S[i >>> 5] >>> (24 - i % 32)) & 0xff;
				}
			}

			return S[this.i];
		},

		selfTest: function() {
			var TEST_VECTORS = [
				// Source: http://www.cryptico.com/Files/Filer/WP_Rabbit_Specification.pdf
				{
					key: [
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
					],
					cipherText: [
						0x02, 0xF7, 0x4A, 0x1C, 0x26, 0x45, 0x6B, 0xF5,
						0xEC, 0xD6, 0xA5, 0x36, 0xF0, 0x54, 0x57, 0xB1,
						0xA7, 0x8A, 0xC6, 0x89, 0x47, 0x6C, 0x69, 0x7B,
						0x39, 0x0C, 0x9C, 0xC5, 0x15, 0xD8, 0xE8, 0x88,
						0x96, 0xD6, 0x73, 0x16, 0x88, 0xD1, 0x68, 0xDA,
						0x51, 0xD4, 0x0C, 0x70, 0xC3, 0xA1, 0x16, 0xF4
					]
				}, {
					key: [
						0xAC, 0xC3, 0x51, 0xDC, 0xF1, 0x62, 0xFC, 0x3B,
						0xFE, 0x36, 0x3D, 0x2E, 0x29, 0x13, 0x28, 0x91
					],
					cipherText: [
						0x9C, 0x51, 0xE2, 0x87, 0x84, 0xC3, 0x7F, 0xE9,
						0xA1, 0x27, 0xF6, 0x3E, 0xC8, 0xF3, 0x2D, 0x3D,
						0x19, 0xFC, 0x54, 0x85, 0xAA, 0x53, 0xBF, 0x96,
						0x88, 0x5B, 0x40, 0xF4, 0x61, 0xCD, 0x76, 0xF5,
						0x5E, 0x4C, 0x4D, 0x20, 0x20, 0x3B, 0xE5, 0x8A,
						0x50, 0x43, 0xDB, 0xFB, 0x73, 0x74, 0x54, 0xE5
					]
				}, {
					key: [
						0x43, 0x00, 0x9B, 0xC0, 0x01, 0xAB, 0xE9, 0xE9,
						0x33, 0xC7, 0xE0, 0x87, 0x15, 0x74, 0x95, 0x83
					],
					cipherText: [
						0x9B, 0x60, 0xD0, 0x02, 0xFD, 0x5C, 0xEB, 0x32,
						0xAC, 0xCD, 0x41, 0xA0, 0xCD, 0x0D, 0xB1, 0x0C,
						0xAD, 0x3E, 0xFF, 0x4C, 0x11, 0x92, 0x70, 0x7B,
						0x5A, 0x01, 0x17, 0x0F, 0xCA, 0x9F, 0xFC, 0x95,
						0x28, 0x74, 0x94, 0x3A, 0xAD, 0x47, 0x41, 0x92,
						0x3F, 0x7F, 0xFC, 0x8B, 0xDE, 0xE5, 0x49, 0x96
					]
				}, {
					key: [
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
					],
					iv: [
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
					],
					cipherText: [
						0xED, 0xB7, 0x05, 0x67, 0x37, 0x5D, 0xCD, 0x7C,
						0xD8, 0x95, 0x54, 0xF8, 0x5E, 0x27, 0xA7, 0xC6,
						0x8D, 0x4A, 0xDC, 0x70, 0x32, 0x29, 0x8F, 0x7B,
						0xD4, 0xEF, 0xF5, 0x04, 0xAC, 0xA6, 0x29, 0x5F,
						0x66, 0x8F, 0xBF, 0x47, 0x8A, 0xDB, 0x2B, 0xE5,
						0x1E, 0x6C, 0xDE, 0x29, 0x2B, 0x82, 0xDE, 0x2A
					]
				}, {
					key: [
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
					],
					iv: [
						0x59, 0x7E, 0x26, 0xC1, 0x75, 0xF5, 0x73, 0xC3
					],
					cipherText: [
						0x6D, 0x7D, 0x01, 0x22, 0x92, 0xCC, 0xDC, 0xE0,
						0xE2, 0x12, 0x00, 0x58, 0xB9, 0x4E, 0xCD, 0x1F,
						0x2E, 0x6F, 0x93, 0xED, 0xFF, 0x99, 0x24, 0x7B,
						0x01, 0x25, 0x21, 0xD1, 0x10, 0x4E, 0x5F, 0xA7,
						0xA7, 0x9B, 0x02, 0x12, 0xD0, 0xBD, 0x56, 0x23,
						0x39, 0x38, 0xE7, 0x93, 0xC3, 0x12, 0xC1, 0xEB
					]
				}, {
					key: [
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
					],
					iv: [
						0x27, 0x17, 0xF4, 0xD2, 0x1A, 0x56, 0xEB, 0xA6
					],
					cipherText: [
						0x4D, 0x10, 0x51, 0xA1, 0x23, 0xAF, 0xB6, 0x70,
						0xBF, 0x8D, 0x85, 0x05, 0xC8, 0xD8, 0x5A, 0x44,
						0x03, 0x5B, 0xC3, 0xAC, 0xC6, 0x67, 0xAE, 0xAE,
						0x5B, 0x2C, 0xF4, 0x47, 0x79, 0xF2, 0xC8, 0x96,
						0xCB, 0x51, 0x15, 0xF0, 0x34, 0xF0, 0x3D, 0x31,
						0x17, 0x1C, 0xA7, 0x5F, 0x89, 0xFC, 0xCB, 0x9F
					]
				}
			];

			return this.selfTestPrim(TEST_VECTORS);
		}
	});

	// Array extensions
	Ext.apply(Array.prototype, {
		md5: function(options) {
			options = options || {};
			return HASH.md5(this, options);
		},

		sha1: function(options) {
			options = options || {};
			return HASH.sha1(this, options);
		},

		sha256: function(options) {
			options = options || {};
			return HASH.sha256(this, options);
		},

		compareTo: function(a) {
			var l = this.length;

			if (l < a.length) {
				return -1;
			} else if (l > a.length) {
				return 1;
			} else {
				for (var i = 0; i < l; i++) {
					if (this[i] < a[i]) {
						return -1;
					} else if (this[i] > a[i]) {
						return 1;
					}
				}
			}
			return 0;
		},

		bytesToString: function() {
			var r = [];
			for (var i = 0, l = this.length; i < l; i++) {
				r.push(String.fromCharCode(this[i]));
			}
			return r.join("");
		},

		bytesToWords: function() {
			var r = [];
			for (var i = 0, j = 0, l = this.length; i < l; i++, j += 8) {
				r[j >>> 5] |= this[i] << (24 - j % 32);
			}
			return r;
		},

		wordsToBytes: function() {
			var r = [];
			for (var i = 0, l = this.length << 5; i < l; i += 8) {
				r.push((this[i >>> 5] >>> (24 - i % 32)) & 0xff);
			}
			return r;
		},

		bytesToWordsEndian: function() {
			var r = [];
			for (var i = 0, l = this.length; i < l; i++) {
				if (i % 4 === 0) {
					r[i >>> 2] = 0;
				}
				r[i >>> 2] |= this[i] << ((i % 4) * 8);
			}
			return r;
		},

		wordsToBytesEndian: function() {
			var r = [];
			for (var i = 0, l = this.length << 2; i < l; i++) {
				r[i] = (this[i >>> 2] >>> ((i % 4) * 8)) & 0xff;
			}
			return r;
		},

		wordsToShorts: function() {
			var r = [];
			for (var i = 0, l = this.length << 5; i < l; i += 16) {
				r.push((this[i >>> 5] >>> (16 - i % 32)) & 0xffff);
			}
			return r;
		},

		shortsToWords: function() {
			var r = [];
			for (var i = 0, j = 0, l = this.length; i < l; i++, j += 16) {
				r[j >>> 5] |= this[i] << (16 - j % 32);
			}
			return r;
		},

		bytesToHex: function() {
			var r = [];
			for (var i = 0, l = this.length; i < l; i++) {
				r.push(((this[i] >>> 4) & 0x0f).toString(16));
				r.push((this[i] & 0x0f).toString(16));
			}
			return r.join("");
		}
	});

	Ext.apply(Array, function() {
		var rng = new Crypto.util.SecureRandom();

		return {
			randomBytes: function(n) {
				var r = [];
				r.length = n;
				rng.nextBytes(r);
				return r;
			},

			fillBytes: function(n, c) {
				c = (c || 0) & 0xff;
				for (var i = 0, r = []; i < n; i++) { r[i] = c; }
				return r;
			},

			fillWords: function(n, w) {
				w = (w || 0) & 0xffffffff;
				for (var i = 0, r = []; i < n; i++) { r[i] = w; }
				return r;
			},
		};
	}());

	// String extensions
	Ext.apply(String.prototype, function() {
		var B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var B64stripRe = /-----BEGIN [^-]+-----([A-Za-z0-9+\/=\s]+)-----END [^-]+-----|begin-base64[^\n]+\n([A-Za-z0-9+\/=\s]+)====/;

		return {
			md5: function(options) {
				options = options || {};
				return HASH.md5(this, options);
			},

			sha1: function(options) {
				options = options || {};
				return HASH.sha1(this, options);
			},

			sha256: function(options) {
				options = options || {};
				return HASH.sha256(this, options);
			},

			stringToBytes: function() {
				var r = [];
				for (var i = 0, l = this.length; i < l; i++) {
					r.push(this.charCodeAt(i) & 0xff);
				}
				return r;
			},

			stringToWords: function() {
				var r = [];
				for (var i = 0, j = 0, l = this.length; i < l; i++, j += 8) {
					r[j >>> 5] |= (this.charCodeAt(i) & 0xff) << (24 - j % 32);
				}
				return r;
			},

			hexToBytes: function() {
				var r = [], me = this;
				if (me.length & 0x1 > 0) {
					me = '0'.concat(me);
				}
				for (var i = 0, l = me.length; i < l; i += 2) {
					r.push(parseInt(me.substring(i, i + 2), 16));
				}
				return r;
			},

			chunkSplit: function(n) {
				var r = [], i = 0, s = this, l = s.length;

				n = n || 64;
				while (i + n < l) {
					r.push(s.substring(i, i + n));
					r.push("\n");

					i += n;
				}
				r.push(s.substring(i, l));
				return r.join('');
			},

			chunkJoin: function() {
				return this.replace(/\n/g, '');
			},

			rawEncodeB64: function(utf8) {
				var o1, o2, o3, bits, h1, h2, h3, h4,
					e = [], pad = '', c, plain, coded;

				plain = (utf8 === true ? this.encodeUTF8() : this);

				var l = plain.length;

				c = l % 3;
				if (c > 0) {
					while (c++ < 3) {
						pad += '=';
						plain += '\0';
					}
				}

				for (c = 0; c < l; c += 3) {
					o1 = plain.charCodeAt(c);
					o2 = plain.charCodeAt(c + 1);
					o3 = plain.charCodeAt(c + 2);

					bits = o1 << 16 | o2 << 8 | o3;

					h1 = bits >> 18 & 0x3f;
					h2 = bits >> 12 & 0x3f;
					h3 = bits >> 6 & 0x3f;
					h4 = bits & 0x3f;

					e[c / 3] = B64.charAt(h1) + B64.charAt(h2) + B64.charAt(h3) + B64.charAt(h4);
				}
				coded = e.join('');
				coded = coded.slice(0, coded.length - pad.length) + pad;

				return coded;
			},

			rawDecodeB64: function(utf8) {
				var o1, o2, o3, h1, h2, h3, h4,
					bits, d = [], plain, coded = this;

				for (var c = 0, l = coded.length; c < l; c += 4) {
					h1 = B64.indexOf(coded.charAt(c));
					h2 = B64.indexOf(coded.charAt(c + 1));
					h3 = B64.indexOf(coded.charAt(c + 2));
					h4 = B64.indexOf(coded.charAt(c + 3));

					bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

					o1 = bits >>> 16 & 0xff;
					o2 = bits >>> 8 & 0xff;
					o3 = bits & 0xff;

					var i = c >> 2;
					d[i] = String.fromCharCode(o1, o2, o3);

					if (h4 == 0x40) {
						d[i] = String.fromCharCode(o1, o2);
					}
					if (h3 == 0x40) {
						d[i] = String.fromCharCode(o1);
					}
				}
				plain = d.join('');

				return (utf8 === true ? plain.decodeUTF8() : plain);
			},

			encodeB64: function(utf8) {
				return this.rawEncodeB64(utf8).chunkSplit();
			},

			decodeB64: function(utf8) {
				var me = this, m = B64stripRe.exec(me);
				if (m) {
					me = (m[1] ? m[1] : (m[2] ? m[2] : me));
				}
				return me.chunkJoin().rawDecodeB64(utf8);
			},

			encodeUTF8: function() {
				var coded = this.replace(/[\u0080-\u07ff]/g, function(c) { 
					var cc = c.charCodeAt(0);
					return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
				});

				coded = coded.replace(/[\u0800-\uffff]/g, function(c) { 
					var cc = c.charCodeAt(0); 
					return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
				});

				return coded;
			},

			decodeUTF8: function() {
				var plain = this.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function(c) {
						var cc = (c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f;
						return String.fromCharCode(cc);
				});

				plain = plain.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function(c) {
					var cc = ((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | ( c.charCodeAt(2) & 0x3f); 
					return String.fromCharCode(cc);
				});

				return plain;
			}
		};
	}());
}());
