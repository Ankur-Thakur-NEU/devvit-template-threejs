/**
 * Main game engine that orchestrates all systems
 */

import * as THREE from 'three';
import { GameStateManager } from './GameState';
import { SceneManager } from '../scene/SceneManager';
import { AnimationController } from '../game/AnimationController';
import { BallPhysics } from '../game/BallPhysics';
import { CollisionDetection } from '../game/CollisionDetection';
import { BattingSystem } from '../game/BattingSystem';
import { UIManager } from '../ui/UIManager';
import { EventHandlers } from '../ui/EventHandlers';
import { AudioSystem } from '../audio/AudioSystem';
import { ApiClient } from '../utils/ApiClient';

export class GameEngine {
  private gameState: GameStateManager;
  private sceneManager: SceneManager;
  private animationController: AnimationController;
  private ballPhysics: BallPhysics;
  private collisionDetection: CollisionDetection;
  private battingSystem: BattingSystem;
  private uiManager: UIManager;
  private eventHandlers: EventHandlers;
  private audioSystem: AudioSystem;
  private apiClient: ApiClient;

  private lastTime: number = 0;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    console.log('🔧 Initializing cricket game engine...');

    // Initialize core systems
    this.gameState = new GameStateManager();
    this.sceneManager = new SceneManager(canvas);
    this.audioSystem = new AudioSystem();
    this.apiClient = new ApiClient();

    // Initialize game systems
    this.initializeGameSystems();

    // Initialize event handling
    this.eventHandlers = new EventHandlers(
      this.battingSystem,
      this.uiManager,
      this.gameState,
      () => this.handlePlayButtonClick()
    );

    // Setup error handlers
    this.setupErrorHandlers();

    console.log('✅ Game engine initialized successfully!');
  }

  private initializeGameSystems(): void {
    // Get references to 3D objects
    const batsman = this.sceneManager.getBatsman()!;
    const bowler = this.sceneManager.getBowler()!;
    const bat = this.sceneManager.getBat()!;
    const ball = this.sceneManager.getBall()!;
    const batsmanWicket = this.sceneManager.getBatsmanWicket()!;

    // Initialize ball physics with scene for shadow
    this.ballPhysics = new BallPhysics(
      ball,
      this.gameState,
      () => this.handleMiss(),
      this.sceneManager.getScene()
    );

    // Initialize collision detection
    this.collisionDetection = new CollisionDetection(bat, ball, this.ballPhysics);

    // Initialize animation controller
    this.animationController = new AnimationController(
      this.gameState,
      bowler,
      ball,
      this.ballPhysics,
      this.audioSystem
    );

    // Initialize UI and batting system
    this.uiManager = new UIManager(this.gameState);
    this.completeBattingSystemInit();
  }

  private completeBattingSystemInit(): void {
    const bat = this.sceneManager.getBat()!;
    
    this.battingSystem = new BattingSystem(
      this.gameState,
      this.collisionDetection,
      this.ballPhysics,
      this.uiManager,
      bat,
      () => this.handleGameComplete()
    );
    
    console.log('✅ Simple bat system initialized');
  }

  private handleMiss(): void {
    console.log('Ball missed! Ball hits stumps - Batsman is out!');
    
    this.gameState.setOut();
    this.animationController.stopAllAnimations();
    
    const state = this.gameState.getState();
    this.uiManager.updateGameStatus('💥 BOWLED OUT!', 'red');
    this.uiManager.showFeedback('💥 BOWLED OUT! Ball hit the stumps!', 'red');
    this.uiManager.updateInstruction(`💥 BOWLED OUT! Final Score: ${state.score} runs (${state.sixes} sixes). Click Play to continue.`);

    // Visual effect on stumps
    const batsmanWicket = this.sceneManager.getBatsmanWicket()!;
    this.animateStumpsHit(batsmanWicket);

    // Show game over screen and reset scoreboard
    setTimeout(() => {
      this.uiManager.showGameOverScreen(state.score, state.sixes);
      
      // Reset the scoreboard after showing final score
      setTimeout(() => {
        console.log('🔄 Resetting scoreboard after batsman out');
        this.gameState.resetGame();
        this.uiManager.updateUI();
      }, 3000); // Reset after 3 seconds to show final score
    }, 1500);
  }

  private animateStumpsHit(wicket: THREE.Group): void {
    wicket.children.forEach((stump) => {
      if (stump instanceof THREE.Mesh) {
        const originalColor = stump.material as THREE.MeshLambertMaterial;
        originalColor.color.setHex(0xff0000); // Turn red briefly
        setTimeout(() => {
          originalColor.color.setHex(0x654321); // Back to brown
        }, 500);
      }
    });
  }

  private handleGameComplete(): void {
    void this.apiClient.submitScore({
      username: 'Player',
      score: this.gameState.getState().score,
      sixes: this.gameState.getState().sixes,
      totalSixes: this.gameState.getState().totalSixes,
      date: Date.now()
    });
  }

  private handlePlayButtonClick(): void {
    console.log('Play button clicked - starting new game');
    
    // Hide welcome message
    this.uiManager.hideWelcomeMessage();
    
    // Reset all systems
    this.gameState.resetGame();
    this.animationController.forceReset();
    this.battingSystem.reset();
    
    // Update UI
    this.uiManager.updateUI();
    this.uiManager.updateInstruction('🎯 Get ready! Watch the bowler and time your swing!');
    this.uiManager.updateGameStatus('Ready', '#FFD700');
    
    // Start first delivery
    setTimeout(() => {
      this.animationController.startBowlerRun();
    }, 1000);
  }

  private setupErrorHandlers(): void {
    window.addEventListener('error', (event) => {
      // Filter out common harmless errors
      if (event.message.includes('before initialization') ||
          event.message.includes('Cannot access') ||
          event.message.includes('MetaMask') ||
          event.message.includes('Ct') ||
          event.message.includes('minified')) {
        return;
      }
      console.error('Game error:', event.error);
      event.preventDefault();
    });

    window.addEventListener('unhandledrejection', (event) => {
      // Filter out MetaMask and other harmless rejections
      const reason = event.reason?.message || event.reason?.toString() || '';
      if (reason.includes('before initialization') ||
          reason.includes('Cannot access') ||
          reason.includes('MetaMask') ||
          reason.includes('Failed to connect to MetaMask')) {
        return;
      }
      console.warn('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    });
  }

  // Main game loop
  start(): void {
    console.log('🎮 Starting cricket game...');
    
    // Initialize UI
    this.uiManager.updateUI();
    
    // Load initial data
    this.loadInitialData();
    
    // Start animation loop
    this.animate(0);
    
    // Don't auto-start - wait for user to click Play button
    console.log('🎯 Game ready - waiting for user to click Play button');
  }

  private async loadInitialData(): Promise<void> {
    const subtitleElement = document.getElementById('subtitle');
    if (!subtitleElement) return;

    const data = await this.apiClient.fetchInitialData();
    if (data && data.type === 'init') {
      subtitleElement.textContent = `Welcome, ${data.username}! Ready to smash some sixes?`;
    } else {
      subtitleElement.textContent = 'Tap Play to start batting...';
    }

    // Show game ready message
    setTimeout(() => {
      this.uiManager.updateInstruction('🎮 Game Ready! Watch the bowler and time your swing!');
    }, 500);
  }

  private animate = (currentTime: number): void => {
    try {
      this.animationId = requestAnimationFrame(this.animate);

      const deltaTime = (currentTime - this.lastTime) / 1000;
      this.lastTime = currentTime;

      // Update animation controller
      this.animationController.update(deltaTime);

      // Update bat swing animation
      this.battingSystem.updateBatSwingAnimation();

      // Render scene
      this.sceneManager.render();
    } catch (error) {
      console.error('Error in animation loop:', error);
      // Continue the animation loop despite errors
      this.animationId = requestAnimationFrame(this.animate);
    }
  };

  // Cleanup
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.sceneManager.dispose();
    this.audioSystem.dispose();
  }

  // Debug functions
  debugGameState(): void {
    console.log('=== GAME STATE DEBUG ===');
    console.log('Full gameState:', this.gameState.getState());
    console.log('Current animation state:', this.animationController.getCurrentState());
    console.log('3D Objects:');
    console.log('- Ball position:', this.sceneManager.getBall()?.position);
    console.log('- Batsman position:', this.sceneManager.getBatsman()?.position);
    console.log('- Bowler position:', this.sceneManager.getBowler()?.position);
    console.log('- Bat position:', this.sceneManager.getBat()?.position);
  }

  testSwing(): void {
    console.log('Test swing called!');
    if (this.battingSystem.isSwingCooldown()) {
      console.log('Still in cooldown');
      return;
    }

    // Always hit a four for testing
    this.gameState.addScore(4);
    this.uiManager.updateGameStatus('TEST FOUR!', '#00ff00');
    this.uiManager.updateInstruction('Test swing worked! Score +4');
    this.uiManager.updateUI();

    setTimeout(() => {
      this.uiManager.updateGameStatus('Ready', '#FFD700');
    }, 1000);
  }
}
