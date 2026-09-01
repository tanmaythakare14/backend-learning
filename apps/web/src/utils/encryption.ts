import CryptoJS from 'crypto-js';

/**
 * Encryption utility for secure storage
 * Uses AES encryption with a configurable key
 */
class EncryptionService {
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    this.encryptionKey =
      encryptionKey ||
      import.meta.env.VITE_ENCRYPTION_KEY ||
      'default-encryption-key-change-in-production';
  }

  encrypt(data: string): string {
    try {
      return CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) throw new Error('Decryption failed: Invalid key or corrupted data');
      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  encryptObject<T>(obj: T): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject<T>(encryptedData: string): T {
    return JSON.parse(this.decrypt(encryptedData)) as T;
  }

  setEncryptionKey(key: string): void {
    this.encryptionKey = key;
  }
}

export const encryptionService = new EncryptionService();
export { EncryptionService };
