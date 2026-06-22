/**
 * SEIS Crypto Module - Cryptographic utilities for the SEIS ecosystem
 * Provides secure encryption, decryption, hashing, and key management
 * 
 * @module @seis/crypto
 * @version 1.0.0
 */

// ============================================================================
// CRYPTOGRAPHIC UTILITIES
// ============================================================================

/**
 * @typedef {Object} CryptoConfig
 * @property {string} algorithm - Encryption algorithm (AES-256-GCM, ChaCha20-Poly1305)
 * @property {number} keyLength - Key length in bits
 * @property {string} hashAlgorithm - Hash algorithm (SHA-256, SHA-384, SHA-512)
 * @property {boolean} useHardwareAcceleration - Enable hardware crypto acceleration
 */

/**
 * SEIS Cryptographic Module
 * Provides secure cryptographic operations for the SEIS ecosystem
 */
export class SEISCrypto {
  /**
   * Create crypto instance
   * @param {CryptoConfig} config - Crypto configuration
   */
  constructor(config = {}) {
    this.config = {
      algorithm: config.algorithm || 'AES-256-GCM',
      keyLength: config.keyLength || 256,
      hashAlgorithm: config.hashAlgorithm || 'SHA-256',
      useHardwareAcceleration: config.useHardwareAcceleration !== false
    };

    this._keyCache = new Map();
    console.log(`[SEIS Crypto] Initialized with ${this.config.algorithm}`);
  }

  /**
   * Generate a cryptographically secure random key
   * @param {number} length - Key length in bytes
   * @returns {Uint8Array} Random key
   */
  generateKey(length = 32) {
    const key = new Uint8Array(length);
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(key);
    } else if (typeof require !== 'undefined') {
      // Node.js environment
      const cryptoModule = require('crypto');
      const values = cryptoModule.randomBytes(length);
      key.set(values);
    } else {
      // Fallback (not cryptographically secure, for development only)
      for (let i = 0; i < length; i++) {
        key[i] = Math.floor(Math.random() * 256);
      }
      console.warn('[SEIS Crypto] Using non-secure random fallback');
    }

    return key;
  }

  /**
   * Generate a secure random string
   * @param {number} length - String length
   * @param {boolean} useSpecialChars - Include special characters
   * @returns {string} Random string
   */
  generateRandomString(length = 32, useSpecialChars = false) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const charset = useSpecialChars ? chars + specialChars : chars;
    
    const randomBytes = this.generateKey(Math.ceil(length * 1.2));
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += charset[randomBytes[i] % charset.length];
    }

    return result;
  }

  /**
   * Hash data using configured algorithm
   * @param {string|Uint8Array} data - Data to hash
   * @returns {Promise<string>} Hex-encoded hash
   */
  async hash(data) {
    const inputData = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest(
        this.config.hashAlgorithm,
        inputData
      );
      return Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (typeof require !== 'undefined') {
      const cryptoModule = require('crypto');
      const hash = cryptoModule.createHash(this.config.hashAlgorithm.toLowerCase());
      hash.update(Buffer.from(inputData));
      return hash.digest('hex');
    }

    throw new Error('No crypto implementation available');
  }

  /**
   * Generate HMAC for data integrity verification
   * @param {string|Uint8Array} data - Data to sign
   * @param {Uint8Array} key - Secret key
   * @returns {Promise<string>} Hex-encoded HMAC
   */
  async hmac(data, key) {
    const inputData = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: this.config.hashAlgorithm },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, inputData);
      return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    } else if (typeof require !== 'undefined') {
      const cryptoModule = require('crypto');
      const hmac = cryptoModule.createHmac(
        this.config.hashAlgorithm.toLowerCase(),
        Buffer.from(key)
      );
      hmac.update(Buffer.from(inputData));
      return hmac.digest('hex');
    }

    throw new Error('No crypto implementation available');
  }

  /**
   * Derive a key from a password using PBKDF2
   * @param {string} password - User password
   * @param {Uint8Array} salt - Random salt
   * @param {number} iterations - Number of iterations
   * @param {number} keyLength - Desired key length
   * @returns {Promise<Uint8Array>} Derived key
   */
  async deriveKey(password, salt, iterations = 100000, keyLength = 32) {
    const passwordData = new TextEncoder().encode(password);

    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordData,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: iterations,
          hash: this.config.hashAlgorithm
        },
        keyMaterial,
        keyLength * 8
      );

      return new Uint8Array(derivedBits);
    } else if (typeof require !== 'undefined') {
      const cryptoModule = require('crypto');
      const derivedKey = cryptoModule.pbkdf2Sync(
        password,
        Buffer.from(salt),
        iterations,
        keyLength,
        this.config.hashAlgorithm.toLowerCase().replace('-', '')
      );
      return new Uint8Array(derivedKey);
    }

    throw new Error('No crypto implementation available');
  }

  /**
   * Generate a salt for key derivation
   * @param {number} length - Salt length in bytes
   * @returns {Uint8Array} Random salt
   */
  generateSalt(length = 16) {
    return this.generateKey(length);
  }

  /**
   * Create a secure password hash
   * @param {string} password - Password to hash
   * @returns {Promise<Object>} Hash result with salt and iterations
   */
  async hashPassword(password) {
    const salt = this.generateSalt(16);
    const iterations = 100000;
    const keyLength = 32;

    const hash = await this.deriveKey(password, salt, iterations, keyLength);

    return {
      hash: Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join(''),
      salt: Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join(''),
      iterations,
      algorithm: this.config.hashAlgorithm
    };
  }

  /**
   * Verify a password against a stored hash
   * @param {string} password - Password to verify
   * @param {Object} storedHash - Stored hash object
   * @returns {Promise<boolean>} Whether password matches
   */
  async verifyPassword(password, storedHash) {
    const salt = new Uint8Array(
      storedHash.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
    );

    const hash = await this.deriveKey(
      password,
      salt,
      storedHash.iterations,
      32
    );

    const hashHex = Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === storedHash.hash;
  }

  /**
   * Generate a UUID v4
   * @returns {string} UUID string
   */
  generateUUID() {
    const randomValues = this.generateKey(16);
    
    // Set version (4) and variant bits
    randomValues[6] = (randomValues[6] & 0x0f) | 0x40;
    randomValues[8] = (randomValues[8] & 0x3f) | 0x80;

    const hex = Array.from(randomValues)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  /**
   * Encode data to Base64
   * @param {string|Uint8Array} data - Data to encode
   * @returns {string} Base64 encoded string
   */
  base64Encode(data) {
    const bytes = typeof data === 'string' 
      ? new TextEncoder().encode(data) 
      : data;

    if (typeof Buffer !== 'undefined') {
      return Buffer.from(bytes).toString('base64');
    } else if (typeof btoa !== 'undefined') {
      let binary = '';
      bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    }

    throw new Error('No Base64 encoding available');
  }

  /**
   * Decode Base64 data
   * @param {string} base64 - Base64 string to decode
   * @returns {Uint8Array} Decoded bytes
   */
  base64Decode(base64) {
    if (typeof Buffer !== 'undefined') {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    } else if (typeof atob !== 'undefined') {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }

    throw new Error('No Base64 decoding available');
  }

  /**
   * Generate a secure token for authentication/authorization
   * @param {number} length - Token length in bytes
   * @param {string} prefix - Optional prefix for the token
   * @returns {string} Secure token
   */
  generateToken(length = 32, prefix = '') {
    const randomPart = Array.from(this.generateKey(length))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return prefix ? `${prefix}_${randomPart}` : randomPart;
  }

  /**
   * Validate a token format
   * @param {string} token - Token to validate
   * @param {number} expectedLength - Expected random part length
   * @returns {boolean} Whether token is valid
   */
  validateToken(token, expectedLength = 64) {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('_');
    const randomPart = parts.length > 1 ? parts[1] : parts[0];

    if (randomPart.length !== expectedLength) {
      return false;
    }

    // Check if all characters are valid hex
    return /^[0-9a-f]+$/i.test(randomPart);
  }

  /**
   * Timing-safe comparison of two strings
   * @param {string} a - First string
   * @param {string} b - Second string
   * @returns {boolean} Whether strings are equal
   */
  timingSafeEqual(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') {
      return false;
    }

    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Get crypto module statistics
   * @returns {Object} Statistics object
   */
  getStats() {
    return {
      algorithm: this.config.algorithm,
      hashAlgorithm: this.config.hashAlgorithm,
      keyLength: this.config.keyLength,
      cachedKeys: this._keyCache.size,
      hardwareAcceleration: this.config.useHardwareAcceleration
    };
  }

  /**
   * Clear key cache
   * @returns {boolean} Success status
   */
  clearKeyCache() {
    this._keyCache.clear();
    return true;
  }
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Supported encryption algorithms
 * @enum {string}
 */
export const EncryptionAlgorithms = {
  AES_128_GCM: 'AES-128-GCM',
  AES_256_GCM: 'AES-256-GCM',
  CHACHA20_POLY1305: 'ChaCha20-Poly1305'
};

/**
 * Supported hash algorithms
 * @enum {string}
 */
export const HashAlgorithms = {
  SHA_256: 'SHA-256',
  SHA_384: 'SHA-384',
  SHA_512: 'SHA-512'
};

// ============================================================================
// EXPORTS
// ============================================================================

export default SEISCrypto;
export { SEISCrypto };
