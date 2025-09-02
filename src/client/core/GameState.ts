/**
 * Game state management
 */

import { BALLS_PER_OVER, STORAGE_KEYS } from './GameConfig';

export interface GameState {
  score: number;
  ballsFaced: number;
  sixes: number;
  wickets: number;
  isOut: boolean;
  currentDelivery: number;
  deliveriesLeft: number;
  overs: number;
  boosters: number;
  totalSixes: number; // Persistent across sessions
  lastPlayedDate: number;
  sessionScore: number;
  highScore: number;
}

export interface Milestone {
  threshold: number;
  message: string;
  unlocked: boolean;
  reward: string;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
  sixes: number;
  date: number;
}

export class GameStateManager {
  private state: GameState;
  private milestones: Milestone[];
  private leaderboard: LeaderboardEntry[];

  constructor() {
    this.state = this.createInitialState();
    this.milestones = this.createMilestones();
    this.leaderboard = this.createMockLeaderboard();
    this.loadGameData();
  }

  private createInitialState(): GameState {
    return {
      score: 0,
      ballsFaced: 0,
      sixes: 0,
      wickets: 0,
      isOut: false,
      currentDelivery: 0,
      deliveriesLeft: BALLS_PER_OVER,
      overs: 0,
      boosters: 0,
      totalSixes: 0,
      lastPlayedDate: 0,
      sessionScore: 0,
      highScore: 0
    };
  }

  private createMilestones(): Milestone[] {
    return [
      {
        threshold: 6,
        message: "🎉 SIXER MASTER! You've unlocked the 'Boundary King' achievement!",
        unlocked: false,
        reward: "Golden Bat Skin"
      },
      {
        threshold: 20,
        message: "🏆 SIXER LEGEND! You've unlocked the 'Century Maker' achievement!",
        unlocked: false,
        reward: "Legendary Trophy"
      },
      {
        threshold: 50,
        message: "👑 SIXER GOD! You've unlocked the 'Immortal' achievement!",
        unlocked: false,
        reward: "God Mode - Never Get Out"
      }
    ];
  }

  private createMockLeaderboard(): LeaderboardEntry[] {
    return [
      { username: "CricketKing", score: 150, sixes: 25, date: Date.now() },
      { username: "BoundaryBash", score: 120, sixes: 20, date: Date.now() },
      { username: "SixerMaster", score: 100, sixes: 18, date: Date.now() },
      { username: "BatWizard", score: 85, sixes: 14, date: Date.now() },
      { username: "SpinDoctor", score: 75, sixes: 12, date: Date.now() }
    ];
  }

  // Getters
  getState(): GameState {
    return { ...this.state };
  }

  getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }

  // State mutations
  addScore(runs: number): void {
    this.state.score += runs;
    this.state.sessionScore += runs;
  }

  addSix(): void {
    this.state.sixes += 1;
    this.state.totalSixes += 1;
    this.addScore(6);
  }

  incrementBallsFaced(): void {
    this.state.ballsFaced += 1;
    this.state.deliveriesLeft -= 1;
    this.state.currentDelivery += 1;
  }

  setOut(): void {
    this.state.wickets += 1;
    this.state.isOut = true;
  }

  completeOver(): void {
    this.state.overs += 1;
    this.state.deliveriesLeft = BALLS_PER_OVER;
    this.state.currentDelivery = 0;
  }

  resetGame(): void {
    const persistentData = {
      totalSixes: this.state.totalSixes,
      highScore: this.state.highScore,
      boosters: this.state.boosters,
      lastPlayedDate: this.state.lastPlayedDate
    };

    this.state = { ...this.createInitialState(), ...persistentData };
  }

  // Milestone system
  checkMilestones(): Milestone[] {
    const newlyUnlocked: Milestone[] = [];
    
    this.milestones.forEach(milestone => {
      if (!milestone.unlocked && this.state.totalSixes >= milestone.threshold) {
        milestone.unlocked = true;
        newlyUnlocked.push(milestone);
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveGameData();
    }

    return newlyUnlocked;
  }

  // Booster system
  earnBoosters(): number {
    const newBoosters = Math.floor(this.state.totalSixes / 5) - this.state.boosters;
    if (newBoosters > 0) {
      this.state.boosters += newBoosters;
      this.saveGameData();
    }
    return newBoosters;
  }

  useBooster(): boolean {
    if (this.state.boosters > 0) {
      this.state.boosters -= 1;
      this.state.wickets = Math.max(0, this.state.wickets - 1);
      this.state.isOut = false;
      this.saveGameData();
      return true;
    }
    return false;
  }

  // Persistence
  private loadGameData(): void {
    try {
      const totalSixes = localStorage.getItem(STORAGE_KEYS.TOTAL_SIXES);
      const highScore = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      const boosters = localStorage.getItem(STORAGE_KEYS.BOOSTERS);
      const lastPlayed = localStorage.getItem(STORAGE_KEYS.LAST_PLAYED);
      const savedMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);

      if (totalSixes) this.state.totalSixes = parseInt(totalSixes);
      if (highScore) this.state.highScore = parseInt(highScore);
      if (boosters) this.state.boosters = parseInt(boosters);
      if (lastPlayed) this.state.lastPlayedDate = parseInt(lastPlayed);
      
      if (savedMilestones) {
        const parsedMilestones = JSON.parse(savedMilestones);
        this.milestones.forEach((milestone, index) => {
          if (parsedMilestones[index]) {
            milestone.unlocked = parsedMilestones[index].unlocked;
          }
        });
      }

      this.checkDailyReset();
    } catch (error) {
      console.warn('Error loading game data:', error);
    }
  }

  saveGameData(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TOTAL_SIXES, this.state.totalSixes.toString());
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.state.highScore.toString());
      localStorage.setItem(STORAGE_KEYS.BOOSTERS, this.state.boosters.toString());
      localStorage.setItem(STORAGE_KEYS.LAST_PLAYED, Date.now().toString());
      localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(this.milestones));
    } catch (error) {
      console.warn('Error saving game data:', error);
    }
  }

  private checkDailyReset(): void {
    const now = new Date();
    const lastPlayed = new Date(this.state.lastPlayedDate);

    // Reset if it's a new day
    if (now.getDate() !== lastPlayed.getDate() ||
        now.getMonth() !== lastPlayed.getMonth() ||
        now.getFullYear() !== lastPlayed.getFullYear()) {
      console.log('🌅 Daily reset triggered!');
      
      // Reset daily stats but keep total sixes and high score
      this.state.score = 0;
      this.state.sixes = 0;
      this.state.wickets = 0;
      this.state.overs = 0;
      this.state.sessionScore = 0;
      
      this.saveGameData();
    }
  }

  // High score management
  updateHighScore(): boolean {
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
      this.saveGameData();
      return true;
    }
    return false;
  }
}
