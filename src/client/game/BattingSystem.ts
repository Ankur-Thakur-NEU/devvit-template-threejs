/**
 * Batting mechanics and scoring system
 */

import * as THREE from 'three';
import { GameStateManager } from '../core/GameState';
import { CollisionDetection, HitResult } from './CollisionDetection';
import { BallPhysics } from './BallPhysics';
import { UIManager } from '../ui/UIManager';
import { BALLS_PER_OVER, MAX_WICKETS } from '../core/GameConfig';

export class BattingSystem {
  private batSwingCooldown: boolean = false;
  private batSwingPower: number = 0;

  constructor(
    private gameState: GameStateManager,
    private collisionDetection: CollisionDetection,
    private ballPhysics: BallPhysics,
    private uiManager: UIManager,
    private bat: THREE.Mesh,
    private onGameComplete: () => void
  ) {}

  // Simple bat system - no complex batsman references needed

  handleBatSwing(): void {
    console.log('handleBatSwing called!');
    const state = this.gameState.getState();
    
    console.log('batSwingCooldown:', this.batSwingCooldown, 'gameState.isOut:', state.isOut);

    if (this.batSwingCooldown || state.isOut) {
      console.log('Swing blocked by cooldown or out status');
      return;
    }

    console.log('Swing proceeding...');
    this.batSwingCooldown = true;

    // Start bat swing animation immediately
    this.batSwingPower = 1.0;
    console.log('🏏 Starting bat swing animation, batSwingPower set to:', this.batSwingPower);

    // Check for bat-ball collision
    const hitResult = this.collisionDetection.checkBatBallCollision();
    console.log('Hit result:', hitResult);

    // Note: Ball counter should only increment when ball completes delivery, not on swing

    if (hitResult.hit) {
      // Generate hit direction and notify ball physics with quality
      const hitDirection = this.collisionDetection.generateHitDirection(hitResult);
      this.ballPhysics.onBallHit(hitDirection, hitResult.quality);
      
      console.log('Ball hit! Quality:', hitResult.quality, 'Direction:', hitDirection, 'Power:', hitResult.power);
    }

    // Handle scoring based on hit quality
    this.processHitResult(hitResult);

    // Handle over completion
    if (this.gameState.getState().deliveriesLeft <= 0) {
      this.gameState.completeOver();
      this.uiManager.updateInstruction(`🏏 Over ${this.gameState.getState().overs} complete! New over starting...`);
    }

    // Handle innings completion
    if (this.gameState.getState().wickets >= MAX_WICKETS) {
      this.handleInningsComplete();
      return;
    }

    // Reset swing cooldown
    setTimeout(() => {
      this.batSwingCooldown = false;
    }, 500);

    // Update UI and save data
    this.uiManager.updateUI();
    this.gameState.saveGameData();
  }

  private processHitResult(hitResult: HitResult): void {
    const state = this.gameState.getState();

    switch (hitResult.quality) {
      case 'perfect':
        this.gameState.addSix();
        this.uiManager.updateGameStatus('SIX!', '#00ff00');
        this.uiManager.updateInstruction('🎉 SIX! Massive hit!');
        
        // Check for milestones and earn boosters
        this.checkMilestonesAndBoosters();
        
        this.animateBatSwing(1.0, 1000);
        break;

      case 'good':
        const runs = Math.floor(Math.random() * 4) + 1; // 1-4 runs
        this.gameState.addScore(runs);
        this.uiManager.updateGameStatus(`${runs} RUN${runs > 1 ? 'S' : ''}`, '#ffff00');
        this.uiManager.updateInstruction(`Good shot! ${runs} run${runs > 1 ? 's' : ''}!`);
        
        this.animateBatSwing(0.7, 800);
        break;

      case 'edge':
        const edgeRuns = Math.random() < 0.5 ? 1 : 2;
        this.gameState.addScore(edgeRuns);
        this.uiManager.updateGameStatus(`EDGE ${edgeRuns}`, '#ffa500');
        this.uiManager.updateInstruction(`Edge! ${edgeRuns} run${edgeRuns > 1 ? 's' : ''} off the edge!`);
        
        this.animateBatSwing(0.5, 700);
        break;

      case 'early':
        this.uiManager.updateGameStatus('EARLY', '#ff8800');
        this.uiManager.updateInstruction('Too early! Wait for the ball to come closer.');
        
        this.animateBatSwing(0.2, 400);
        break;

      case 'miss':
        this.uiManager.updateGameStatus('MISSED', '#ff8800');
        this.uiManager.updateInstruction('Swing and a miss! Ball heading for stumps!');
        
        this.animateBatSwing(0.1, 300);
        break;
    }
  }

  private animateBatSwing(power: number, duration: number): void {
    this.batSwingPower = power;
    setTimeout(() => {
      this.batSwingPower = 0;
      if (power > 0.5) {
        this.uiManager.updateGameStatus('Batting', '#FFD700');
      }
    }, duration);
  }

  private checkMilestonesAndBoosters(): void {
    const newMilestones = this.gameState.checkMilestones();
    newMilestones.forEach(milestone => {
      this.uiManager.showMilestoneReward(milestone);
    });

    const newBoosters = this.gameState.earnBoosters();
    if (newBoosters > 0) {
      this.uiManager.updateInstruction(`⚡ Earned ${newBoosters} booster${newBoosters > 1 ? 's' : ''}! (${this.gameState.getState().boosters} total)`);
      
      setTimeout(() => {
        this.uiManager.updateInstruction('Use boosters to continue after getting out!');
      }, 3000);
    }
  }

  private handleInningsComplete(): void {
    const isNewHighScore = this.gameState.updateHighScore();
    
    if (isNewHighScore) {
      this.uiManager.updateInstruction(`🏆 NEW HIGH SCORE! ${this.gameState.getState().score} runs`);
    } else {
      this.uiManager.updateInstruction(`🏏 Innings complete! Final score: ${this.gameState.getState().score} runs`);
    }

    this.uiManager.updateGameStatus('ALL OUT', '#ff4444');

    // Save final score and notify completion
    this.gameState.saveGameData();
    this.onGameComplete();

    // Reset for new innings after delay
    setTimeout(() => {
      this.gameState.resetGame();
      this.uiManager.updateUI();
      this.uiManager.updateInstruction('🎯 New innings! Click Play to start batting again.');
    }, 3000);
  }

  // Simple bat swing animation (original working version)
  updateBatSwingAnimation(): void {
    try {
      if (typeof this.batSwingPower !== 'number') {
        this.batSwingPower = 0;
        return;
      }

      // Only animate if there's swing power and bat exists
      if (this.batSwingPower > 0 && this.bat) {
        console.log('🏏 Animating simple bat swing, power:', this.batSwingPower);
        
        // Calculate swing progress (0 to 1)
        const swingProgress = 1 - this.batSwingPower;
        
        // Simple bat rotation animation
        const swingAngle = swingProgress * Math.PI / 2; // 90 degree swing
        this.bat.rotation.z = swingAngle;
        
        // Gradually reduce swing power
        this.batSwingPower = Math.max(0, this.batSwingPower - 0.02);
      } else if (this.bat) {
        // Return bat to ready position
        this.bat.rotation.z = 0;
      }
    } catch (error) {
      console.log('Error in bat animation:', error);
      if (typeof this.batSwingPower === 'number') {
        this.batSwingPower = 0;
      }
    }
  }

  // Public getters
  getBatSwingPower(): number {
    return this.batSwingPower;
  }

  isSwingCooldown(): boolean {
    return this.batSwingCooldown;
  }

  // Reset for new game
  reset(): void {
    this.batSwingCooldown = false;
    this.batSwingPower = 0;
  }
}
