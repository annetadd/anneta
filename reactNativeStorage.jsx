// AsyncStorage-backed storage adapter for React Native
// Usage: pass new ReactNativeStorage(AsyncStorage) into Library

export default class ReactNativeStorage {
  constructor(asyncStorage, options = {}) {
    if (!asyncStorage) {
      throw new Error('ReactNativeStorage requires AsyncStorage instance');
    }
    const { key = '@library/books', latencyMs = 0 } = options;
    this._asyncStorage = asyncStorage;
    this._key = key;
    this._latencyMs = latencyMs;
  }

  async loadBooks() {
    await delay(this._latencyMs);
    const raw = await this._asyncStorage.getItem(this._key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async saveBooks(books) {
    await delay(this._latencyMs);
    const payload = JSON.stringify(books || []);
    await this._asyncStorage.setItem(this._key, payload);
    return { ok: true, savedAt: new Date().toISOString() };
  }
}

function delay(ms) {
  if (!ms) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
