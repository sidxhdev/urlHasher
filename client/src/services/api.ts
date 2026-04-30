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
    const response = await fetch(`${API_URL}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to shorten URL');
    }

    return response.json();
  },

  async getAllURLs(): Promise<URL[]> {
    const response = await fetch(`${API_URL}/api/urls`);

    if (!response.ok) {
      throw new Error('Failed to fetch URLs');
    }

    const data = await response.json();
    return data || [];
  },

  async getHealthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/api/health`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
