/**
 * Bat-ball collision detection system
 */

import * as THREE from 'three';
import { COLLISION_CONFIG } from '../core/GameConfig';
import { BallPhysics } from './BallPhysics';

export interface HitResult {
  hit: boolean;
  quality: 'miss' | 'early' | 'edge' | 'good' | 'perfect';
  power: number;
}

export class CollisionDetection {
  constructor(
    private bat: THREE.Mesh,
    private ball: THREE.Mesh,
    private ballPhysics: BallPhysics
  ) {}

  checkBatBallCollision(): HitResult {
    if (!this.bat || !this.ball) {
      return { hit: false, quality: 'miss', power: 0 };
    }

    // Calculate distance between bat and ball
    const batPosition = this.bat.position.clone();
    const ballPosition = this.ball.position.clone();
    const distance = batPosition.distanceTo(ballPosition);

    // Hit detection zone
    const isInHitZone = distance <= COLLISION_CONFIG.hitZone;

    console.log('🏏 Collision Check - Distance:', distance.toFixed(2), 'Hit zone:', COLLISION_CONFIG.hitZone, 'In zone:', isInHitZone);

    if (!isInHitZone) {
      console.log('❌ Ball not in hit zone');
      return { hit: false, quality: 'miss', power: 0 };
    }

    // Get ball progress from ball physics
    const ballProgress = this.ballPhysics.getBallProgress();
    
    console.log('⚾ Ball progress:', ballProgress.toFixed(2), 'Ball Z:', this.ball.position.z.toFixed(2));

    // Determine hit quality based on timing
    let quality: HitResult['quality'] = 'miss';
    let power = 0;

    if (ballProgress >= COLLISION_CONFIG.perfectTimingMin && ballProgress <= COLLISION_CONFIG.perfectTimingMax) {
      quality = 'perfect';
      power = 1.0;
    } else if (ballProgress >= COLLISION_CONFIG.goodTimingMin && ballProgress <= COLLISION_CONFIG.goodTimingMax) {
      quality = 'good';
      power = 0.75;
    } else if (ballProgress >= COLLISION_CONFIG.edgeTimingMin && ballProgress <= COLLISION_CONFIG.edgeTimingMax) {
      quality = 'edge';
      power = 0.5;
    } else if (ballProgress >= COLLISION_CONFIG.earlyTimingMin && ballProgress <= COLLISION_CONFIG.earlyTimingMax) {
      quality = 'early';
      power = 0.3;
    } else {
      quality = 'miss';
      power = 0;
    }

    // Additional factors for hit quality
    if (quality !== 'miss') {
      // Height factor - ball should be at reasonable height
      const ballHeight = this.ball.position.y;
      if (ballHeight < 0.2 || ballHeight > 2.0) {
        power *= 0.6;
        quality = this.reduceQuality(quality);
      }

      // Lateral position factor - ball should be near center
      const lateralDistance = Math.abs(this.ball.position.x);
      if (lateralDistance > 0.5) {
        power *= 0.8;
      }
    }

    console.log(`Hit Detection: Distance=${distance.toFixed(2)}, Progress=${ballProgress.toFixed(2)}, Quality=${quality}, Power=${power.toFixed(2)}`);

    return { 
      hit: quality !== 'miss', 
      quality, 
      power: Math.max(0, Math.min(1, power))
    };
  }

  private reduceQuality(quality: HitResult['quality']): HitResult['quality'] {
    switch (quality) {
      case 'perfect': return 'good';
      case 'good': return 'edge';
      case 'edge': return 'early';
      default: return quality;
    }
  }

  // Generate hit direction based on timing and power
  generateHitDirection(hitResult: HitResult): THREE.Vector3 {
    if (!hitResult.hit) {
      return new THREE.Vector3(0, 0, 0);
    }

    const hitAngle = (Math.random() - 0.5) * Math.PI * 0.8;
    const hitPower = hitResult.power;
    
    return new THREE.Vector3(
      Math.sin(hitAngle) * hitPower, // Left/right direction
      0.3 + (hitPower * 0.7), // Upward trajectory based on power
      -Math.cos(hitAngle) * hitPower * 0.4 // Backward movement
    );
  }
}
