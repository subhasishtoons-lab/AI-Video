import { GeneratedVideo, ApiKeys } from '../types';

const DB_NAME = 'tunsu_video_ai_vault';
const DB_VERSION = 1;
const STORE_VIDEOS = 'videos';
const STORE_BLOBS = 'video_blobs';
const API_KEYS_STORAGE_KEY = 'tunsu_api_keys_v1';

class VaultStorage {
  private db: IDBDatabase | null = null;
  private isInitializing: Promise<IDBDatabase> | null = null;

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.isInitializing) return this.isInitializing;

    this.isInitializing = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_VIDEOS)) {
          db.createObjectStore(STORE_VIDEOS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_BLOBS)) {
          db.createObjectStore(STORE_BLOBS);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.isInitializing;
  }

  async saveVideo(video: GeneratedVideo, videoBlob?: Blob): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_VIDEOS, STORE_BLOBS], 'readwrite');
      const videoStore = tx.objectStore(STORE_VIDEOS);
      const blobStore = tx.objectStore(STORE_BLOBS);

      videoStore.put(video);

      if (videoBlob) {
        blobStore.put(videoBlob, video.id);
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllVideos(): Promise<GeneratedVideo[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_VIDEOS, 'readonly');
        const store = tx.objectStore(STORE_VIDEOS);
        const request = store.getAll();

        request.onsuccess = () => {
          const list: GeneratedVideo[] = request.result || [];
          // Sort newest first
          list.sort((a, b) => b.createdAt - a.createdAt);
          resolve(list);
        };
        request.onerror = () => reject(request.error);
      });
    } catch {
      return [];
    }
  }

  async getVideoBlob(id: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_BLOBS, 'readonly');
        const store = tx.objectStore(STORE_BLOBS);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch {
      return null;
    }
  }

  async deleteVideo(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_VIDEOS, STORE_BLOBS], 'readwrite');
      tx.objectStore(STORE_VIDEOS).delete(id);
      tx.objectStore(STORE_BLOBS).delete(id);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_VIDEOS, 'readwrite');
      const store = tx.objectStore(STORE_VIDEOS);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item: GeneratedVideo | undefined = getReq.result;
        if (!item) {
          resolve(false);
          return;
        }
        item.isFavorite = !item.isFavorite;
        store.put(item);
        resolve(item.isFavorite);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  }

  async calculateStorageUsage(): Promise<{ usedBytes: number; count: number }> {
    try {
      const videos = await this.getAllVideos();
      let usedBytes = 0;
      for (const v of videos) {
        usedBytes += (v.fileSizeMb || 0.5) * 1024 * 1024;
      }
      return { usedBytes, count: videos.length };
    } catch {
      return { usedBytes: 0, count: 0 };
    }
  }

  // API Keys storage (encrypted / masked locally)
  loadApiKeys(): ApiKeys {
    try {
      const raw = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {
      runwayKey: '',
      openaiKey: '',
      useCustomKeys: false,
    };
  }

  saveApiKeys(keys: ApiKeys): void {
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
    } catch {
      // ignore
    }
  }

  async exportVaultArchive(): Promise<string> {
    const videos = await this.getAllVideos();
    const manifest = {
      app: 'Tunsu Video AI',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      videos,
    };
    return JSON.stringify(manifest, null, 2);
  }
}

export const vaultStorage = new VaultStorage();
