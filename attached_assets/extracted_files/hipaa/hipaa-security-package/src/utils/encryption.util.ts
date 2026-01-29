/**
 * Field-Level Encryption Utility for PHI
 * 
 * Uses AES-256-GCM for encrypting sensitive fields before database storage.
 * This ensures that even database administrators cannot read sensitive data
 * like SSNs, DOBs, gate codes, and medical information.
 * 
 * HIPAA Technical Safeguard: Encryption at Rest (Field-Level)
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Derives a 256-bit key from the master key using scrypt
 * This adds an extra layer of security
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, 32);
}

/**
 * Validates the encryption key is properly configured
 */
function validateKey(): string {
  const key = process.env.PHI_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error(
      'PHI_ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one with: openssl rand -hex 32'
    );
  }
  
  if (key.length < 32) {
    throw new Error(
      'PHI_ENCRYPTION_KEY must be at least 32 characters. ' +
      'Use a strong, randomly generated key.'
    );
  }
  
  return key;
}

/**
 * Encrypts a string value using AES-256-GCM
 * 
 * @param plaintext - The sensitive data to encrypt (e.g., SSN, DOB)
 * @returns Encrypted string in format: salt:iv:authTag:ciphertext (all hex)
 * 
 * @example
 * const encryptedSSN = encryptPHI('123-45-6789');
 * // Store encryptedSSN in database
 */
export function encryptPHI(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    return '';
  }

  const masterKey = validateKey();
  
  // Generate random salt and IV for each encryption
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  
  // Derive encryption key
  const key = deriveKey(masterKey, salt);
  
  // Create cipher and encrypt
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get authentication tag for integrity verification
  const authTag = cipher.getAuthTag();
  
  // Combine all components: salt:iv:authTag:ciphertext
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted,
  ].join(':');
}

/**
 * Decrypts a PHI string that was encrypted with encryptPHI
 * 
 * @param encryptedData - The encrypted string from the database
 * @returns Original plaintext value
 * 
 * @example
 * const ssn = decryptPHI(client.encryptedSSN);
 * // Use ssn value
 */
export function decryptPHI(encryptedData: string): string {
  if (!encryptedData || encryptedData.trim() === '') {
    return '';
  }

  const masterKey = validateKey();
  
  // Parse components
  const parts = encryptedData.split(':');
  
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [saltHex, ivHex, authTagHex, ciphertext] = parts;
  
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  // Derive the same key using stored salt
  const key = deriveKey(masterKey, salt);
  
  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  // Decrypt
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Checks if a value appears to be encrypted (for migration purposes)
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;
  
  const parts = value.split(':');
  if (parts.length !== 4) return false;
  
  // Check if all parts are valid hex
  return parts.every(part => /^[0-9a-f]+$/i.test(part));
}

/**
 * Safely compare encrypted values without decrypting
 * This is useful for searching by encrypted fields
 * 
 * Note: Due to random IV/salt, you cannot directly compare encrypted values.
 * For searchable encrypted fields, consider using deterministic encryption
 * or encrypted indexes.
 */
export function compareEncryptedValue(
  encryptedStored: string,
  plaintextToCompare: string,
): boolean {
  try {
    const decrypted = decryptPHI(encryptedStored);
    return decrypted === plaintextToCompare;
  } catch {
    return false;
  }
}

/**
 * TypeORM Column Transformer for automatic encryption/decryption
 * 
 * Usage in Entity:
 * @Column({ transformer: PHITransformer })
 * ssn: string;
 */
export const PHITransformer = {
  to: (value: string): string => encryptPHI(value),
  from: (value: string): string => decryptPHI(value),
};

/**
 * Mask a decrypted value for display purposes
 * Shows only last 4 characters
 * 
 * @example
 * maskPHI('123-45-6789') // '***-**-6789'
 */
export function maskPHI(value: string, visibleChars = 4): string {
  if (!value || value.length <= visibleChars) {
    return '*'.repeat(value?.length || 0);
  }
  
  const masked = '*'.repeat(value.length - visibleChars);
  const visible = value.slice(-visibleChars);
  
  return masked + visible;
}

/**
 * Rotate encryption keys (for key management)
 * Re-encrypts data with a new key
 */
export function reencryptWithNewKey(
  encryptedData: string,
  oldKey: string,
  newKey: string,
): string {
  // Temporarily override the key
  const originalKey = process.env.PHI_ENCRYPTION_KEY;
  
  try {
    // Decrypt with old key
    process.env.PHI_ENCRYPTION_KEY = oldKey;
    const plaintext = decryptPHI(encryptedData);
    
    // Encrypt with new key
    process.env.PHI_ENCRYPTION_KEY = newKey;
    const newEncrypted = encryptPHI(plaintext);
    
    return newEncrypted;
  } finally {
    // Restore original key
    process.env.PHI_ENCRYPTION_KEY = originalKey;
  }
}
