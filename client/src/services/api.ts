const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface URL {
  id: string;
  original_url: string;
  short_url: string;
  creation_date: string;
  click_count: number;
}

export interface CreateURLResponse {
  short_url: string;
  full_url: string;
}

export const apiService = {
  async shortenURL(url: string): Promise<CreateURLResponse> {
    const response = await fetch(`${API_URL}/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const text = await response.text();
    
    if (!response.ok) {
      console.error('API Error:', response.status, text);
      throw new Error(text || 'Failed to shorten URL');
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('JSON Parse Error:', text);
      throw new Error(`Invalid response: ${text}`);
    }
  },

  async getAllURLs(): Promise<URL[]> {
    const response = await fetch(`${API_URL}/urls`);

    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }

    const data = await response.json();
    return data || [];
  },

  async getHealthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
