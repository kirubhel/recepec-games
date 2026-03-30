import apiClient from './client';

export interface Game {
  id: string;
  title: string;
  description?: string;
  subject_name?: string;
  game_type: number;
  thumbnail_url?: string;
  instructions?: string;
  game_data?: any;
}

export const gamesApi = {
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/games', { params });
      return response.data;
    } catch (e) {
      console.error('Failed to fetch games:', e);
      return { success: false, data: [] };
    }
  },
  getById: async (id: string) => {
    try {
      const response = await apiClient.get(`/games/${id}`);
      return response.data;
    } catch (e) {
      console.error(`Failed to fetch game ${id}:`, e);
      return { success: false, data: null };
    }
  }
};
