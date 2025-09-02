/**
 * Animation state management and control
 */

import * as THREE from 'three';
import { AnimationState } from '../core/GameConfig';
import { GameStateManager } from '../core/GameState';
import { BallPhysics } from './BallPhysics';
import { AudioSystem } from '../audio/AudioSystem';

export class AnimationController {
  private currentState: AnimationState = AnimationState.IDLE;
  private animationTime: number = 0;
  private ballPhysics: BallPhysics;
  private audioSystem: AudioSystem;

  constructor(
    private gameState: GameStateManager,
    private bowler: THREE.Group,
    private ball: THREE.Mesh,
    ballPhysics: BallPhysics,
    audioSystem: AudioSystem
  ) {
    this.ballPhysics = ballPhysics;
    this.audioSystem = audioSystem;
    
    // Set up callback for next delivery
    this.ballPhysics.setNextDeliveryCallback(() => {
      this.resetAnimation();
    });
  }

  getCurrentState(): AnimationState {
    return this.currentState;
  }

  startBowlerRun(): void {
    const state = this.gameState.getState();
    if (state.isOut) {
      console.log('Cannot start bowling - batsman is out');
      return;
    }

    console.log('🏃 Starting bowler run - deliveries left:', state.deliveriesLeft);
    this.currentState = AnimationState.RUNNING;
    this.animationTime = 0;
    
    // Reset bowler position
    this.bowler.position.set(0, 0, 30);
  }

  update(deltaTime: number): void {
    // Only update animations if batsman is not out
    if (this.gameState.getState().isOut) {
      this.currentState = AnimationState.IDLE;
      return;
    }

    switch (this.currentState) {
      case AnimationState.IDLE:
        this.updateIdleAnimation(deltaTime);
        break;

      case AnimationState.RUNNING:
        this.updateBowlerRun(deltaTime);
        break;

      case AnimationState.THROWING:
        this.updateThrowingAnimation(deltaTime);
        break;

      case AnimationState.BALL_IN_FLIGHT:
        this.ballPhysics.updateBallFlight(deltaTime);
        break;

      case AnimationState.RESET:
        this.resetAnimation();
        break;
    }
  }

  private updateIdleAnimation(deltaTime: number): void {
    // Gentle idle animation for bowler
    this.bowler.rotation.y += deltaTime * 0.5;
  }

  private updateBowlerRun(deltaTime: number): void {
    try {
      const runSpeed = 10; // units per second
      this.bowler.position.z -= runSpeed * deltaTime;

      // Simple running animation - alternate leg positions
      const leftLeg = this.bowler.children[4] as THREE.Mesh;
      const rightLeg = this.bowler.children[5] as THREE.Mesh;

      if (leftLeg && rightLeg) {
        const legSwing = Math.sin(this.animationTime * 10) * 0.3;
        leftLeg.rotation.x = legSwing;
        rightLeg.rotation.x = -legSwing;
      }

      // Check if bowler has reached crease
      if (this.bowler.position.z <= 10) {
        this.currentState = AnimationState.THROWING;
        this.animationTime = 0;
      }

      this.animationTime += deltaTime;
    } catch (error) {
      console.error('Error in updateBowlerRun:', error);
      this.currentState = AnimationState.IDLE;
    }
  }

  private updateThrowingAnimation(deltaTime: number): void {
    this.animationTime += deltaTime;
    
    // Hold throwing pose briefly before releasing ball
    if (this.animationTime >= 0.5) {
      this.startBallThrow();
    }
  }

  private startBallThrow(): void {
    try {
      // Play throw sound
      this.audioSystem.playThrowSound();

      // Start ball physics
      this.ballPhysics.startThrow();

      this.currentState = AnimationState.BALL_IN_FLIGHT;
      this.animationTime = 0;
    } catch (error) {
      console.error('Error in startBallThrow:', error);
      this.currentState = AnimationState.IDLE;
    }
  }

  resetAnimation(): void {
    try {
      // Reset ball position
      this.ball.position.set(0, 1, 10);
      this.ball.rotation.set(0, 0, 0);

      // Reset bowler position
      this.bowler.position.set(0, 0, 30);

      // Reset state
      this.currentState = AnimationState.IDLE;
      this.animationTime = 0;

      // Reset ball physics
      this.ballPhysics.reset();

      console.log('Animation reset complete');

      // Auto-start next delivery if batsman is NOT out
      setTimeout(() => {
        if (this.currentState === AnimationState.IDLE && !this.gameState.getState().isOut) {
          console.log('🔄 Starting next delivery automatically');
          this.startBowlerRun();
        } else if (this.gameState.getState().isOut) {
          console.log('❌ Batsman is out - stopping bowling until Play button clicked');
        }
      }, 1500); // Reduced delay for faster continuous bowling
    } catch (error) {
      console.error('Error in resetAnimation:', error);
      this.currentState = AnimationState.IDLE;
      this.animationTime = 0;
    }
  }

  // Force stop all animations (used when batsman gets out)
  stopAllAnimations(): void {
    this.currentState = AnimationState.IDLE;
    this.animationTime = 0;
  }

  // Manual reset for new game
  forceReset(): void {
    this.ball.position.set(0, 1, 10);
    this.ball.rotation.set(0, 0, 0);
    this.bowler.position.set(0, 0, 30);
    this.currentState = AnimationState.IDLE;
    this.animationTime = 0;
    this.ballPhysics.reset();
  }
}
