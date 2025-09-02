/**
 * Ball physics and movement logic
 */

import * as THREE from 'three';
import { BALL_CONFIG } from '../core/GameConfig';
import { GameStateManager } from '../core/GameState';

export interface BallTrajectory {
  startX: number;
  startY: number;
  startZ: number;
  endX: number;
  endY: number;
  endZ: number;
  gravity: number;
  initialVelocity: number;
  angle: number;
}

export class BallPhysics {
  private trajectory: BallTrajectory;
  private ballWasHit: boolean = false;
  private ballHitDirection: THREE.Vector3 = new THREE.Vector3();
  private animationTime: number = 0;
  private ballSpeed: number = 0;
  private onNextDeliveryCallback?: () => void;

  constructor(
    private ball: THREE.Mesh,
    private gameState: GameStateManager,
    private onMissCallback: () => void,
    private scene: THREE.Scene
  ) {
    this.resetTrajectory();
  }

  setNextDeliveryCallback(callback: () => void): void {
    this.onNextDeliveryCallback = callback;
  }

  private resetTrajectory(): void {
    this.trajectory = {
      startX: BALL_CONFIG.startX,
      startY: BALL_CONFIG.startY,
      startZ: BALL_CONFIG.startZ,
      endX: BALL_CONFIG.endX,
      endY: BALL_CONFIG.endY,
      endZ: BALL_CONFIG.endZ,
      gravity: BALL_CONFIG.gravity,
      initialVelocity: BALL_CONFIG.initialVelocity,
      angle: BALL_CONFIG.angle
    };
  }

  startThrow(): void {
    // Randomize ball parameters for variety
    const speedVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
    this.ballSpeed = 15 * speedVariation;

    const angleVariation = (Math.random() - 0.5) * 0.3; // ±0.15 radians variation
    this.trajectory.angle = Math.PI / 6 + angleVariation;

    // Calculate trajectory parameters
    const distance = Math.abs(this.trajectory.endZ - this.trajectory.startZ);
    const height = this.trajectory.endY - this.trajectory.startY;
    const timeOfFlight = distance / this.ballSpeed;

    this.trajectory.initialVelocity = this.ballSpeed;
    this.trajectory.gravity = -2 * height / (timeOfFlight * timeOfFlight);

    this.animationTime = 0;
    
    console.log('⚾ Ball thrown - Speed:', this.ballSpeed.toFixed(2), 'Distance:', distance, 'Time:', timeOfFlight.toFixed(2));
  }

  updateBallFlight(deltaTime: number): void {
    try {
      this.animationTime += deltaTime;

      let x: number, y: number, z: number;

      if (this.ballWasHit) {
        // Ball was hit - follow hit trajectory
        const hitSpeed = 15;
        
        x = this.ball.position.x + this.ballHitDirection.x * hitSpeed * deltaTime;
        y = Math.max(
          this.ball.position.y + this.ballHitDirection.y * hitSpeed * deltaTime - 0.5 * 9.81 * deltaTime * deltaTime, 
          0.1
        );
        z = this.ball.position.z + this.ballHitDirection.z * hitSpeed * deltaTime;
        
        // Ball goes out of bounds after being hit
        if (Math.abs(x) > 50 || Math.abs(z) > 50 || y < 0.1) {
          setTimeout(() => this.resetForNextDelivery(), 1000);
          return;
        }
      } else {
        // Normal ball trajectory from bowler to batsman
        const totalDistance = this.trajectory.startZ - this.trajectory.endZ;
        const ballSpeed = BALL_CONFIG.speed;
        const totalTime = totalDistance / ballSpeed;
        
        const progress = Math.min(this.animationTime / totalTime, 1.0);
        
        // Linear movement along Z-axis
        x = this.trajectory.startX;
        z = this.trajectory.startZ - (progress * totalDistance);
        
        // Parabolic arc for Y (height)
        const maxHeight = BALL_CONFIG.maxHeight;
        y = this.trajectory.startY + 
            Math.sin(progress * Math.PI) * maxHeight - 
            (progress * (this.trajectory.startY - this.trajectory.endY));

        // Check if ball has reached batsman area without being hit
        if (progress >= 1.0 && !this.ballWasHit) {
          console.log('⚾ Ball reached batsman area - Progress:', progress.toFixed(2), 'Was hit:', this.ballWasHit, 'Ball Z:', z.toFixed(2));
          // Increment ball counter when ball completes delivery
          this.gameState.incrementBallsFaced();
          this.onMissCallback();
          return;
        }
      }

      // Update ball position
      this.ball.position.set(x, Math.max(y, 0.1), z);

      // Add spin rotation
      this.ball.rotation.x += deltaTime * 20;
      this.ball.rotation.y += deltaTime * 15;

      // Handle ball bouncing on pitch when missed
      if (y <= 0.2 && this.trajectory.initialVelocity > 2) {
        this.handleBounce();
      }

      // Check if ball should reset for next delivery
      if (z <= this.trajectory.endZ + 1 || (this.trajectory.initialVelocity < 1 && this.animationTime > 1)) {
        console.log('⚾ Ball delivery complete - triggering next delivery in', this.ballWasHit ? 2000 : 1500, 'ms');
        setTimeout(() => {
          // Signal animation controller to reset for next delivery
          this.resetForNextDelivery();
        }, this.ballWasHit ? 2000 : 1500);
      }
    } catch (error) {
      console.error('Error in updateBallFlight:', error);
      this.resetForNextDelivery();
    }
  }

  private handleBounce(): void {
    // Reduce velocity for bounce effect
    this.trajectory.initialVelocity *= 0.6;
    this.trajectory.angle *= 0.8;
    this.animationTime = 0;
  }

  private resetForNextDelivery(): void {
    // Signal animation controller to reset for next delivery
    if (this.onNextDeliveryCallback) {
      this.onNextDeliveryCallback();
    }
  }

  // Called when ball is hit by bat
  onBallHit(hitDirection: THREE.Vector3, hitQuality?: 'perfect' | 'good' | 'edge' | 'early'): void {
    this.ballWasHit = true;
    this.ballHitDirection.copy(hitDirection);
    // Increment ball counter when ball is hit
    this.gameState.incrementBallsFaced();
  }

  // Check if ball is in hitting zone
  isInHittingZone(): boolean {
    const ballProgress = (this.trajectory.startZ - this.ball.position.z) / 
                        (this.trajectory.startZ - this.trajectory.endZ);
    return ballProgress >= 0.4 && ballProgress <= 1.3;
  }

  getBallProgress(): number {
    return (this.trajectory.startZ - this.ball.position.z) / 
           (this.trajectory.startZ - this.trajectory.endZ);
  }

  reset(): void {
    this.ballWasHit = false;
    this.ballHitDirection.set(0, 0, 0);
    this.animationTime = 0;
    this.ballSpeed = 0;
    this.resetTrajectory();
  }
}
