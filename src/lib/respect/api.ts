
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://learningcloud.et/api';

export interface Game {
  id: string;
  title: string;
  description?: string;
  game_type: number;
  course_id?: string;
  grade_level_id?: string;
  difficulty_level?: number;
  game_data?: any;
  thumbnail_url?: string;
  instructions?: string;
  points_reward?: number;
  time_limit?: number;
  order_index?: number;
  is_active: boolean;
  is_free: boolean;
  enable_instruction_audio?: boolean;
  image_url?: string;
  video_url?: string;
  content_body?: string;
  summary_questions?: any;
}

export const fetchRespectGame = async (id: string): Promise<Game | null> => {
  try {
    const fetchOptions = { headers: { 'Accept': 'application/json' } };
    
    // 1. Try hierarchical fetching (Prioritize local Go API for RESPECT missions)
    const endpoints = [
      `${API_BASE_URL}/respect/gamesdata/${id}`, // Local Go API (Robust)
      `${API_BASE_URL}/games/${id}`,             // Standard cloud detail
      `${API_BASE_URL}/activities/${id}`,        // Activities fallback
      `${API_BASE_URL}/respect/games/${id}`      // Metadata fallback
    ];

    for (const url of endpoints) {
      try {
        const res = await fetch(url, fetchOptions);
        if (res.ok) {
          const json = await res.json();
          const game = json.data || json;
          // If the backend returns 200 but success is false, treat as fail
          if (json.success === false) {
             console.warn(`RESPECT-API: ${url} returned success: false, trying next...`);
             continue;
          }
          if (game && game.id === id) return game;
        }
      } catch (err) {
        console.warn(`RESPECT-API: Fetch failed for ${url}`);
      }
    }

    // 2. Final Fallback: Search in the RESPECT games list for basic metadata
    console.warn(`RESPECT-API: Individual fetches failed for ${id}, searching in list...`);
    const listRes = await fetch(`${API_BASE_URL}/respect/games`, fetchOptions);
    if (listRes.ok) {
      const listJson = await listRes.json();
      const listData = listJson.data || listJson;
      const found = listData.find((g: any) => g.id === id);
      if (found) {
        console.log(`RESPECT-API: Recovered mission metadata from list for ${id}`);
        return found;
      }
    }
    
    return null;
  } catch (err) {
    console.error('RESPECT-API Global Error:', err);
    return null;
  }
};

export const parseGameData = (game: any, difficulty: string) => {
  if (!game?.game_data) return [];
  
  // 1. Ensure game_data is an object
  let data = game.game_data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse game_data string:', e);
      return [];
    }
  }

  // 2. Comprehensive Difficulty Tier Extraction (Hierarchical Fallback)
  let levels: any[] = [];
  
  if (data.difficultyLevels) {
    // Priority 1: difficultyLevels.[difficulty]
    levels = data.difficultyLevels[difficulty] || [];
  } else if (data.easy || data.medium || data.hard) {
    // Priority 2: Direct difficulty keys (data.easy, data.medium, data.hard)
    levels = data[difficulty] || [];
  } else {
    // Priority 3: No specific difficulty tiers, treat as 'medium' content
    if (difficulty === 'medium' || difficulty === 'easy') {
      levels = data.questions || data.levels || data.items || data.activities || [];
      // If it's still empty and data itself is an array, use it
      if (levels.length === 0 && Array.isArray(data)) {
        levels = data;
      }
    }
  }
  
  if (!levels || !Array.isArray(levels) || levels.length === 0) {
    // Last resort: If difficulty search failed but we have any data, maybe it's a flat object
    if (difficulty === 'medium' && (data.word || data.picture || data.question || data.options)) return [data];
    return [];
  }

  // 3. Nested Activity Normalization
  // Some missions group activities into "sets" or "groups"
  const flattened = levels.flatMap((set: any) => {
    const activities = set.activities || set.items || set.questions;
    if (activities && Array.isArray(activities)) return activities;
    return [set]; // If no nested activities, the set itself is the activity
  });
  
  return flattened;
};

export const fetchRespectCourse = async (courseId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/respect/courses/${courseId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || null;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch course details:', err);
    return null;
  }
};

export const fetchRespectSections = async (courseId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/respect/sections?course_id=${courseId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch sections:', err);
    return [];
  }
};

export const fetchGamesBySection = async (sectionId: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/respect/games?section=${sectionId}`);
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
    return [];
  } catch (err) {
    console.error('Failed to fetch games by section:', err);
    return [];
  }
};
