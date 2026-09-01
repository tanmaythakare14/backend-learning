import { encryptionService } from './encryption';

interface SecureStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  getItemObject<T>(key: string): T | null;
  setItemObject<T>(key: string, value: T): void;
}

class SecureStorageImpl implements SecureStorage {
  private storage: Storage;

  constructor(storage: Storage) {
    this.storage = storage;
  }

  getItem(key: string): string | null {
    try {
      const encrypted = this.storage.getItem(key);
      if (!encrypted) return null;
      return encryptionService.decrypt(encrypted);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      this.removeItem(key);
      return null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      this.storage.setItem(key, encryptionService.encrypt(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw new Error(`Failed to store item: ${key}`);
    }
  }

  removeItem(key: string): void {
    this.storage.removeItem(key);
  }

  clear(): void {
    this.storage.clear();
  }

  getItemObject<T>(key: string): T | null {
    try {
      const encrypted = this.storage.getItem(key);
      if (!encrypted) return null;
      return encryptionService.decryptObject<T>(encrypted);
    } catch (error) {
      console.error(`Error getting object ${key}:`, error);
      this.removeItem(key);
      return null;
    }
  }

  setItemObject<T>(key: string, value: T): void {
    try {
      this.storage.setItem(key, encryptionService.encryptObject(value));
    } catch (error) {
      console.error(`Error setting object ${key}:`, error);
      throw new Error(`Failed to store object: ${key}`);
    }
  }
}

export const secureLocalStorage: SecureStorage = new SecureStorageImpl(
  typeof window !== 'undefined' ? window.localStorage : ({} as Storage),
);

export const secureSessionStorage: SecureStorage = new SecureStorageImpl(
  typeof window !== 'undefined' ? window.sessionStorage : ({} as Storage),
);
