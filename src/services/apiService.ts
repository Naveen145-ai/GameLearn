import axios from 'axios';
import { Platform } from 'react-native';

function resolveApiBaseUrl() {
	// Android emulator cannot access localhost; it needs 10.0.2.2. iOS simulator can use localhost.
	// For physical devices on the same Wi-Fi, replace with your machine IP.
	const port = 3004;
	// Use the provided LAN IP when available (user supplied)
	const LAN_IP = '10.68.167.242';
	if (LAN_IP) {
		return `http://${LAN_IP}:${port}/api`;
	}
	if (Platform.OS === 'android') {
		return `http://10.0.2.2:${port}/api`;
	}
	return `http://localhost:${port}/api`;
}

const API_BASE_URL = resolveApiBaseUrl();

export interface GameScore {
  id?: string;
  userId: string;
  gameId: string;
  score: number;
  timeSpent: number;
  completedAt: string;
  grade: number;
  subject: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalScore: number;
  gamesPlayed: number;
  averageScore: number;
  rank: number;
}

// Game Scores
export const saveGameScore = async (scoreData: GameScore): Promise<GameScore> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/scores`, scoreData);
    return response.data;
  } catch (error) {
    console.error('Error saving game score:', error);
    // Fallback to mock for development
    return {
      ...scoreData,
      id: `score_${Date.now()}`,
      completedAt: new Date().toISOString(),
    };
  }
};

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
  });

  async getUserScores(userId: string): Promise<GameScore[]> {
    try {
      const response = await this.api.get(`/scores/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user scores:', error);
      return [];
    }
  }

  async getGameScores(gameId: string): Promise<GameScore[]> {
    try {
      const response = await this.api.get(`/scores/game/${gameId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game scores:', error);
      return [];
    }
  }

  // Leaderboard
  async getGlobalLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.api.get('/leaderboard/global');
      return response.data;
    } catch (error) {
      console.error('Error fetching global leaderboard:', error);
      return [];
    }
  }

  async getSubjectLeaderboard(subject: string): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.api.get(`/leaderboard/subject/${subject}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching subject leaderboard:', error);
      return [];
    }
  }

  async getGradeLeaderboard(grade: number): Promise<LeaderboardEntry[]> {
    try {
      const response = await this.api.get(`/leaderboard/grade/${grade}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grade leaderboard:', error);
      return [];
    }
  }

  // User Management
  async createUser(userData: { name: string; grade: number }): Promise<any> {
    try {
      const response = await this.api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(userId: string): Promise<any> {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
}

export const apiService = new ApiService();
