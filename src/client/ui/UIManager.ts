/**
 * UI management and DOM manipulation
 */

import { GameStateManager, Milestone } from '../core/GameState';

export class UIManager {
  private scoreElement: HTMLElement;
  private ballsFacedElement: HTMLElement;
  private sixesElement: HTMLElement;
  private ballsLeftElement: HTMLElement;
  private boostersElement: HTMLElement;
  private gameStatusElement: HTMLElement;
  private instructionElement: HTMLElement;
  private welcomeMessageElement: HTMLElement;

  constructor(private gameState: GameStateManager) {
    this.initializeElements();
  }

  private initializeElements(): void {
    this.scoreElement = document.getElementById('score')!;
    this.ballsFacedElement = document.getElementById('balls-faced')!;
    this.sixesElement = document.getElementById('sixes')!;
    this.ballsLeftElement = document.getElementById('balls-left')!;
    this.boostersElement = document.getElementById('boosters')!;
    this.gameStatusElement = document.getElementById('game-status')!;
    this.instructionElement = document.getElementById('instruction')!;
    this.welcomeMessageElement = document.getElementById('welcome-message')!;
  }

  updateUI(): void {
    const state = this.gameState.getState();
    
    this.scoreElement.textContent = state.score.toString();
    this.ballsFacedElement.textContent = state.ballsFaced.toString();
    this.sixesElement.textContent = state.sixes.toString();
    this.ballsLeftElement.textContent = state.deliveriesLeft.toString();
    this.boostersElement.textContent = state.boosters.toString();

    if (state.isOut) {
      this.gameStatusElement.textContent = 'OUT!';
      this.gameStatusElement.style.color = '#ff4444';
      this.instructionElement.textContent = '❌ You\'re out! Better luck next time!';
      this.welcomeMessageElement.style.display = 'none';
    } else {
      this.gameStatusElement.textContent = 'Ready';
      this.gameStatusElement.style.color = '#FFD700';
      this.instructionElement.textContent = '🎯 Get ready! Tap/click to swing.';

      // Show welcome message only when game hasn't started much
      if (state.ballsFaced === 0) {
        this.welcomeMessageElement.style.display = 'block';
      } else {
        this.welcomeMessageElement.style.display = 'none';
      }
    }
  }

  updateGameStatus(status: string, color: string = '#FFD700'): void {
    this.gameStatusElement.textContent = status;
    this.gameStatusElement.style.color = color;
  }

  updateInstruction(text: string): void {
    this.instructionElement.textContent = text;
  }

  showGameOverScreen(finalScore: number, sixes: number): void {
    // Update welcome message to show final score
    const welcomeText = document.querySelector('.welcome-text') as HTMLElement;
    if (welcomeText) {
      welcomeText.textContent = `🏏 Game Over! Final Score: ${finalScore} runs`;
    }
    
    const subtitle = document.getElementById('subtitle') as HTMLElement;
    if (subtitle) {
      subtitle.textContent = `You scored ${sixes} sixes! Click Play to try again.`;
      subtitle.style.display = 'block';
    }

    // Show welcome message
    setTimeout(() => {
      this.welcomeMessageElement.style.display = 'block';
      this.welcomeMessageElement.classList.remove('hidden');
    }, 1500);
  }

  hideWelcomeMessage(): void {
    this.welcomeMessageElement.classList.add('hidden');
    this.welcomeMessageElement.style.display = 'none';
    
    // Restore original welcome message text
    const welcomeText = document.querySelector('.welcome-text') as HTMLElement;
    if (welcomeText) {
      welcomeText.textContent = '🎯 Perfect your timing and hit those sixes!';
    }
    
    const subtitle = document.getElementById('subtitle') as HTMLElement;
    if (subtitle) {
      subtitle.textContent = 'Tap Play to start batting...';
      subtitle.style.display = 'none';
    }
  }

  showMilestoneReward(milestone: Milestone): void {
    this.updateInstruction(`🎉 ${milestone.message}`);
    this.updateGameStatus('ACHIEVEMENT!', '#FFD700');

    setTimeout(() => {
      this.updateInstruction(`🏆 Reward Unlocked: ${milestone.reward}!`);
    }, 3000);

    setTimeout(() => {
      this.updateInstruction('Watch the bowler and time your swing to hit sixes!');
      this.updateGameStatus('Ready', '#FFD700');
    }, 6000);
  }

  showLeaderboard(): void {
    const leaderboard = this.gameState.getLeaderboard();
    let leaderboardText = '🏆 LEADERBOARD 🏆\n';
    
    leaderboard.slice(0, 5).forEach((entry, index) => {
      leaderboardText += `${index + 1}. ${entry.username}: ${entry.score} (${entry.sixes} sixes)\n`;
    });

    this.updateInstruction('📊 Leaderboard fetched! Check console for details.');
    console.log(leaderboardText);
  }

  showStats(): void {
    const state = this.gameState.getState();
    const statsText = `📊 YOUR STATS 📊
Score: ${state.score}
Balls Faced: ${state.ballsFaced}
Sixes: ${state.sixes}
Total Sixes: ${state.totalSixes}
High Score: ${state.highScore}
Boosters: ${state.boosters}
Wickets: ${state.wickets}
Overs: ${state.overs}
Deliveries Left: ${state.deliveriesLeft}`;

    this.updateInstruction('📊 Stats displayed! Check console for details.');
    console.log(statsText);
  }

  showFeedback(message: string, color: string): void {
    this.updateInstruction(message);
    console.log(`Feedback: ${message} (${color})`);
  }
}
