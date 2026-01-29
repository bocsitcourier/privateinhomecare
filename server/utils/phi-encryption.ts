/**
 * Field-Level Encryption Utility for PHI (Protected Health Information)
 * 
 * Uses AES-256-GCM for encrypting sensitive fields before database storage.
 * This ensures that even database administrators cannot read sensitive data
 * like SSNs, DOBs, gate codes, and medical information.
 * 
 * HIPAA Technical Safeguard: Encryption at Rest (Field-Level) §164.312(a)(2)(iv)
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
    // In development, use a default key (NOT for production)
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[HIPAA] WARNING: PHI_ENCRYPTION_KEY not set. Using development default. Set a secure key for production!');
      return 'development-only-key-not-for-production-use!';
    }
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
 */
export function encryptPHI(plaintext: string): string {
  if (!plaintext || plaintext.trim() === '') {
    return '';
  }

  const masterKey = validateKey();
  
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  
  const key = deriveKey(masterKey, salt);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
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
 */
export function decryptPHI(encryptedData: string): string {
  if (!encryptedData || encryptedData.trim() === '') {
    return '';
  }

  const masterKey = validateKey();
  
  const parts = encryptedData.split(':');
  
  if (parts.length !== 4) {
    throw new Error('Invalid encrypted data format');
  }
  
  const [saltHex, ivHex, authTagHex, ciphertext] = parts;
  
  const salt = Buffer.from(saltHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const key = deriveKey(masterKey, salt);
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
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
  
  return parts.every(part => /^[0-9a-f]+$/i.test(part));
}

/**
 * Safely compare encrypted values by decrypting
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
 * Encrypt multiple PHI fields in an object
 */
export function encryptPHIFields<T extends Record<string, any>>(
  data: T,
  fieldNames: (keyof T)[]
): T {
  const encrypted = { ...data };
  
  for (const field of fieldNames) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptPHI(encrypted[field]) as any;
    }
  }
  
  return encrypted;
}

/**
 * Decrypt multiple PHI fields in an object
 */
export function decryptPHIFields<T extends Record<string, any>>(
  data: T,
  fieldNames: (keyof T)[]
): T {
  const decrypted = { ...data };
  
  for (const field of fieldNames) {
    if (decrypted[field] && typeof decrypted[field] === 'string' && isEncrypted(decrypted[field] as string)) {
      try {
        decrypted[field] = decryptPHI(decrypted[field] as string) as any;
      } catch (error) {
        console.error(`[HIPAA] Failed to decrypt field ${String(field)}:`, error);
      }
    }
  }
  
  return decrypted;
}
