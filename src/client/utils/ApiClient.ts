/**
 * API client for backend communication
 */

import { InitResponse } from '../../shared/types/api';

export class ApiClient {
  async fetchInitialData(): Promise<InitResponse | null> {
    try {
      const response = await fetch('/api/init');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json() as InitResponse;
      return data;
    } catch (err) {
      console.error('Error fetching initial data:', err);
      return null;
    }
  }

  async submitScore(scoreData: {
    username: string;
    score: number;
    sixes: number;
    totalSixes: number;
    date: number;
  }): Promise<boolean> {
    try {
      console.log('📤 Preparing to submit score:', scoreData);

      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoreData)
      });

      if (response.ok) {
        console.log('✅ Score submitted successfully');
        return true;
      } else {
        console.warn('⚠️ Score submission failed, but game continues');
        return false;
      }
    } catch (error) {
      console.warn('⚠️ Backend not available, score saved locally only');
      return false;
    }
  }

  async fetchLeaderboard(): Promise<any[]> {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        return await response.json();
      } else {
        console.log('Using mock leaderboard data');
        return [];
      }
    } catch (error) {
      console.log('Backend not available, using mock leaderboard');
      return [];
    }
  }
}
