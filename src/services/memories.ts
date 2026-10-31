import { isApiConfigured } from '../lib/api';
import { CloudMemory } from '../types';

const getGalleryAuthHeader = (): Record<string, string> => {
  try {
    const token = sessionStorage.getItem('ourbound_session_token');
    return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
  } catch {
    return {} as Record<string, string>;
  }
};

export const memoriesService = {
  async fetchPublished(): Promise<CloudMemory[]> {
    if (!isApiConfigured) return [];

    try {
      const response = await fetch('/.netlify/functions/memories-published', {
        headers: getGalleryAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch memories');
      const data = await response.json();
      return data.map((m: any) => ({
        id: m._id,
        ...m,
      })) as CloudMemory[];
    } catch (error) {
      console.error('[Our Bound] Error fetching published memories:', error);
      return [];
    }
  },

  async fetchAll(): Promise<CloudMemory[]> {
    if (!isApiConfigured) return [];

    try {
      const response = await fetch('/.netlify/functions/memories-all', {
        headers: getGalleryAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch memories');
      const data = await response.json();
      return data.map((m: any) => ({
        id: m._id,
        ...m,
      })) as CloudMemory[];
    } catch (error) {
      console.error('[Our Bound] Error fetching all memories:', error);
      return [];
    }
  },

  async create(payload: Omit<CloudMemory, 'id' | 'created_at' | 'updated_at'>): Promise<CloudMemory> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch('/.netlify/functions/memories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to create memory');
      const data = await response.json();
      return {
        id: data._id,
        ...data,
      } as CloudMemory;
    } catch (error) {
      console.error('[Our Bound] Error creating memory:', error);
      throw error;
    }
  },

  async update(id: string, payload: Partial<Omit<CloudMemory, 'id' | 'created_at' | 'updated_at'>>): Promise<CloudMemory> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch(`/.netlify/functions/memories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to update memory');
      const data = await response.json();
      return {
        id: data._id,
        ...data,
      } as CloudMemory;
    } catch (error) {
      console.error('[Our Bound] Error updating memory:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch(`/.netlify/functions/memories/${id}`, {
        method: 'DELETE',
        headers: getGalleryAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to delete memory');
    } catch (error) {
      console.error('[Our Bound] Error deleting memory:', error);
      throw error;
    }
  },

  async togglePublish(id: string, published: boolean): Promise<void> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch('/.netlify/functions/memories-publish', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify({ id, published }),
      });
      if (!response.ok) throw new Error('Failed to toggle publish status');
    } catch (error) {
      console.error('[Our Bound] Error toggling publish status:', error);
      throw error;
    }
  },

  async updateOrder(id: string, display_order: number): Promise<void> {
    if (!isApiConfigured) throw new Error('API not configured');

    try {
      const response = await fetch('/.netlify/functions/memories-order', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getGalleryAuthHeader(),
        },
        body: JSON.stringify({ id, display_order }),
      });
      if (!response.ok) throw new Error('Failed to update order');
    } catch (error) {
      console.error('[Our Bound] Error updating order:', error);
      throw error;
    }
  },
};
