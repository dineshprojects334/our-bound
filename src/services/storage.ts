import { isApiConfigured } from '../lib/api';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];

const getGalleryAuthHeader = (): Record<string, string> => {
  try {
    const token = sessionStorage.getItem('ourbound_session_token');
    return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

export function validateImageFile(file: File): string | null {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic'];
  const hasValidExt = validExts.some((ext) => fileName.endsWith(ext));

  if (!ALLOWED_TYPES.includes(fileType) && !hasValidExt) {
    return 'Only JPEG, PNG, WebP, GIF, and HEIC images are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File size must be under 15 MB.';
  }
  return null;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const storageService = {
  async upload(
    file: File,
    onProgress?: (pct: number) => void
  ): Promise<{ path: string; url: string }> {
    if (!isApiConfigured) throw new Error('API not configured. Please check your environment variables.');

    onProgress?.(25);

    try {
      // Convert file to base64 for upload
      const base64 = await fileToBase64(file);
      onProgress?.(75);

      const response = await fetch('/.netlify/functions/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();
      onProgress?.(100);
      return { path: data.path, url: data.url };
    } catch (error) {
      console.error('[Our Bound] Error uploading to Cloudinary:', error);
      throw error;
    }
  },

  async delete(path: string): Promise<void> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch('/.netlify/functions/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify({ path }),
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('[Our Bound] Error deleting from Cloudinary:', error);
      throw error;
    }
  },

  getPublicUrl(path: string): string {
    // Cloudinary URLs are public by default
    return path;
  },
};
