import { isApiConfigured, shouldUseLocalFallback } from '../lib/api';
import { GalleryPhoto } from '../types';
import { validateImageFile } from './storage';

const getGalleryAuthHeader = (): Record<string, string> => {
  try {
    const token = sessionStorage.getItem('ourbound_session_token');
    return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

export { validateImageFile };

export const albumService = {
  async fetchAll(): Promise<GalleryPhoto[]> {
    if (!isApiConfigured) return [];

    try {
      const response = await fetch('/.netlify/functions/album-photos', {
        headers: getGalleryAuthHeader(),
      });

      if (!response.ok) {
        console.warn('[Our Bound] Could not fetch album_photos:', response.statusText);
        return [];
      }

      const data = await response.json();
      return data.map((p: any) => ({
        id: p._id,
        ...p,
      })) as GalleryPhoto[];
    } catch (error) {
      console.warn('[Our Bound] Could not fetch album_photos:', error);
      return [];
    }
  },

  async uploadPhoto(
    file: File,
    caption?: string,
    onProgress?: (pct: number) => void
  ): Promise<GalleryPhoto> {
    if (!isApiConfigured) {
      if (shouldUseLocalFallback) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            onProgress?.(100);
            resolve({
              id: `album-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              src: reader.result as string,
              caption: caption?.trim() || '',
              created_at: new Date().toISOString(),
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      throw new Error('Shared gallery backend is not configured. Add the Netlify Function environment variables and redeploy.');
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onProgress?.(50);

      const response = await fetch('/.netlify/functions/album-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify({
          file: base64,
          caption: caption?.trim() || '',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Upload failed');
      }

      const data = await response.json();
      onProgress?.(100);

      return {
        id: data._id,
        ...data,
      } as GalleryPhoto;
    } catch (err) {
      if (shouldUseLocalFallback) {
        console.warn('[Our Bound] Cloud upload encountered an issue, using local fallback for local-only testing:', err);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            onProgress?.(100);
            resolve({
              id: `album-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              src: reader.result as string,
              caption: caption?.trim() || '',
              created_at: new Date().toISOString(),
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      throw err;
    }
  },

  async deletePhoto(id: string, storage_path?: string): Promise<void> {
    if (isApiConfigured) {
      try {
        const response = await fetch(`/.netlify/functions/album-photos-delete/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...getGalleryAuthHeader(),
          },
          body: JSON.stringify({ storage_path }),
        });

        if (!response.ok) {
          throw new Error('Delete failed');
        }
      } catch (error) {
        console.warn('[Our Bound] Error deleting album photo:', error);
      }
    }
  },
};
