/**
 * Cricket Game - Main Entry Point
 * 
 * This is a clean, well-architected cricket batting game built with Three.js.
 * The codebase is organized with proper separation of concerns.
 */

import { GameEngine } from './core/GameEngine';

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏏 Cricket game starting...');
  
  // Get canvas element
  const canvas = document.getElementById('bg') as HTMLCanvasElement;
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Create and start game engine
  const gameEngine = new GameEngine(canvas);
  gameEngine.start();

  // Expose debug functions globally
  (window as any).debugGameState = () => gameEngine.debugGameState();
  (window as any).testSwing = () => gameEngine.testSwing();

  // Game loading complete
  console.log('🏏 Cricket game loaded successfully!');
  console.log('🎮 Controls:');
  console.log('• Press SPACEBAR or TAP screen when bowler runs');
  console.log('• Run testSwing() in console for instant test');
  console.log('• Run debugGameState() in console to check game state');
  console.log('✅ Game is running!');

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    gameEngine.dispose();
  });
});
