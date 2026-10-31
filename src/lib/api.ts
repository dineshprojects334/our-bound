import { shouldUseLocalGalleryFallback } from './galleryPersistence.js';

// API configuration for Netlify Functions
const API_BASE = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';

const viteApiBase = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL;

export const isApiConfigured = Boolean(viteApiBase);
export const shouldUseLocalFallback = shouldUseLocalGalleryFallback({
  viteApiBase,
  isDev: import.meta.env.DEV,
});

export const api = {
  memories: {
    fetchPublished: () => fetch(`${API_BASE}/memories-published`),
    fetchAll: () => fetch(`${API_BASE}/memories-all`),
    create: (data: any) => fetch(`${API_BASE}/memories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetch(`${API_BASE}/memories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetch(`${API_BASE}/memories/${id}`, {
      method: 'DELETE',
    }),
    togglePublish: (id: string, published: boolean) => fetch(`${API_BASE}/memories-publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published }),
    }),
    updateOrder: (id: string, display_order: number) => fetch(`${API_BASE}/memories-order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, display_order }),
    }),
  },
  storage: {
    upload: async (file: File, onProgress?: (pct: number) => void) => {
      const formData = new FormData();
      formData.append('file', file);

      // For simplicity, we'll use XMLHttpRequest for progress tracking
      return new Promise<{ path: string; url: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    },
    delete: (path: string) => fetch(`${API_BASE}/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path }),
    }),
  },
  album: {
    fetchAll: () => fetch(`${API_BASE}/album-photos`),
    uploadPhoto: (file: File, caption?: string, onProgress?: (pct: number) => void) => {
      const formData = new FormData();
      formData.append('file', file);
      if (caption) formData.append('caption', caption);

      return new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE}/album-photos`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const pct = Math.round((e.loaded / e.total) * 100);
            onProgress(pct);
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error('Upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('Upload failed'));
        xhr.send(formData);
      });
    },
    deletePhoto: (id: string, storage_path?: string) => fetch(`${API_BASE}/album-photos-delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, storage_path }),
    }),
  },
};

