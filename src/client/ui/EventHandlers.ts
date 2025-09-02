/**
 * User input event handling
 */

import { BattingSystem } from '../game/BattingSystem';
import { UIManager } from './UIManager';
import { GameStateManager } from '../core/GameState';

export class EventHandlers {
  constructor(
    private battingSystem: BattingSystem,
    private uiManager: UIManager,
    private gameState: GameStateManager,
    private onPlayButtonClick: () => void
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard input
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        console.log('Space pressed - calling handleBatSwing');
        this.battingSystem.handleBatSwing();
      }
    });

    // Touch input
    window.addEventListener('touchstart', (event) => {
      console.log('Touch detected');
      event.preventDefault();
      this.battingSystem.handleBatSwing();
    });

    // Mouse input (excluding UI elements)
    window.addEventListener('click', (event) => {
      console.log('🖱️ CLICK DETECTED!');
      console.log('🎯 Target:', event.target);
      
      const target = event.target as HTMLElement;
      const isCanvas = target.tagName === 'CANVAS';
      
      // Don't trigger swing if clicking on UI buttons or interactive elements
      const isUIElement = target.tagName === 'BUTTON' || 
                         target.tagName === 'A' || 
                         target.closest('button') || 
                         target.closest('a') ||
                         target.id === 'play-button' ||
                         target.id === 'test-button' ||
                         target.classList.contains('footer') ||
                         target.classList.contains('game-header') ||
                         target.classList.contains('game-stats');
      
      console.log('🔍 Is UI element?', isUIElement);
      
      if (!isUIElement) {
        console.log('✅ TRIGGERING BAT SWING!');
        this.battingSystem.handleBatSwing();
      } else {
        console.log('❌ UI element clicked, not triggering bat swing');
      }
    }, true);

    // Play button
    const playButton = document.getElementById('play-button');
    playButton?.addEventListener('click', () => {
      console.log('Play button clicked!');
      this.onPlayButtonClick();
    });

    // Test button
    const testButton = document.getElementById('test-button');
    testButton?.addEventListener('click', () => {
      console.log('Test button clicked!');
      if (typeof (window as any).testSwing === 'function') {
        console.log('Calling testSwing function...');
        (window as any).testSwing();
      } else {
        console.log('Fallback: calling handleBatSwing directly');
        this.battingSystem.handleBatSwing();
      }
    });

    // Footer links
    const docsLink = document.getElementById('docs-link');
    docsLink?.addEventListener('click', () => {
      this.uiManager.updateInstruction('🏏 How to Play: Watch the bowler run up, time your swing when the ball is close, aim for sixes!');
    });

    const leaderboardLink = document.getElementById('leaderboard-link');
    leaderboardLink?.addEventListener('click', () => {
      this.uiManager.showLeaderboard();
    });

    const statsLink = document.getElementById('stats-link');
    statsLink?.addEventListener('click', () => {
      this.uiManager.showStats();
    });

    const discordLink = document.getElementById('discord-link');
    discordLink?.addEventListener('click', () => {
      this.uiManager.updateInstruction('💬 Community: Join the Devvit Discord for cricket game discussions!');
    });
  }
}
