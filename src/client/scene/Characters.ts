/**
 * Character creation and management (batsman, bowler, bat, ball)
 */

import * as THREE from 'three';
import { CHARACTER_POSITIONS, COLORS } from '../core/GameConfig';

export class CharacterManager {
  private batsman: THREE.Group;
  private bowler: THREE.Group;
  private bat: THREE.Mesh;
  private ball: THREE.Mesh;
  private batsmanRightHand: THREE.Group;
  private batsmanLeftHand: THREE.Group;

  constructor(scene: THREE.Scene) {
    this.createBatsman();
    this.createBowler();
    this.createBat();
    this.createBall();
    this.addToScene(scene);
  }

  private createBatsman(): void {
    this.batsman = new THREE.Group();

    // Body (torso) - proper right-handed batting stance
    const torsoGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.batsmanBody });
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 0.4;
    torso.rotation.y = Math.PI / 2; // Face sideways (right-handed stance)
    torso.castShadow = true;
    this.batsman.add(torso);

    // Head with helmet
    const headGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: COLORS.skin });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.9;
    head.castShadow = true;
    this.batsman.add(head);

    // Cricket helmet
    const helmetGeometry = new THREE.SphereGeometry(0.17, 8, 8);
    const helmetMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d3748, // Dark helmet
      transparent: true,
      opacity: 0.9
    });
    const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
    helmet.position.y = 0.92;
    helmet.scale.y = 0.8; // Flatten slightly
    helmet.castShadow = true;
    this.batsman.add(helmet);

    // Create detailed arms with proper batting position
    this.createBatsmanArms();

    // Legs in proper cricket batting stance
    const legGeometry = new THREE.CylinderGeometry(0.07, 0.07, 0.8, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: COLORS.batsmanBody });

    // Left leg (off-side leg for right-handed batsman)
    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(0, -0.4, 0.3); // Back towards bowler
    leftLeg.castShadow = true;
    this.batsman.add(leftLeg);

    // Right leg (leg-side leg for right-handed batsman)
    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0, -0.4, -0.3); // Forward towards stumps
    rightLeg.castShadow = true;
    this.batsman.add(rightLeg);

    // Pads (cricket leg protection)
    this.createCricketPads();

    // Position batsman
    const { x, y, z } = CHARACTER_POSITIONS.batsman;
    this.batsman.position.set(x, y, z);
  }

  private createBatsmanArms(): void {
    // Upper arms for right-handed batsman
    const upperArmGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: COLORS.skin });

    // Left upper arm (top hand for right-handed batsman)
    const leftUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    leftUpperArm.position.set(0, 0.65, -0.18); // Positioned for sideways stance
    leftUpperArm.rotation.x = Math.PI / 4; // Forward angle for batting
    leftUpperArm.castShadow = true;
    this.batsman.add(leftUpperArm);

    // Right upper arm (bottom hand for right-handed batsman)
    const rightUpperArm = new THREE.Mesh(upperArmGeometry, armMaterial);
    rightUpperArm.position.set(0, 0.65, 0.18); // Positioned for sideways stance
    rightUpperArm.rotation.x = Math.PI / 6; // Slight forward angle
    rightUpperArm.castShadow = true;
    this.batsman.add(rightUpperArm);

    // Forearms with hands that will hold the bat
    const forearmGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
    const handGeometry = new THREE.SphereGeometry(0.06, 6, 6);
    
    // Left hand group (top hand - guides direction)
    this.batsmanLeftHand = new THREE.Group();
    const leftForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    leftForearm.position.y = -0.15;
    leftForearm.castShadow = true;
    this.batsmanLeftHand.add(leftForearm);
    
    const leftHand = new THREE.Mesh(handGeometry, armMaterial);
    leftHand.position.y = -0.3;
    leftHand.castShadow = true;
    this.batsmanLeftHand.add(leftHand);
    
    this.batsmanLeftHand.position.set(0.15, 0.45, -0.25);
    this.batsmanLeftHand.rotation.x = Math.PI / 3;
    this.batsman.add(this.batsmanLeftHand);

    // Right hand group (bottom hand - provides power)
    this.batsmanRightHand = new THREE.Group();
    const rightForearm = new THREE.Mesh(forearmGeometry, armMaterial);
    rightForearm.position.y = -0.15;
    rightForearm.castShadow = true;
    this.batsmanRightHand.add(rightForearm);
    
    const rightHand = new THREE.Mesh(handGeometry, armMaterial);
    rightHand.position.y = -0.3;
    rightHand.castShadow = true;
    this.batsmanRightHand.add(rightHand);
    
    this.batsmanRightHand.position.set(-0.15, 0.35, 0.25);
    this.batsmanRightHand.rotation.x = Math.PI / 4;
    this.batsman.add(this.batsmanRightHand);
  }

  private createCricketPads(): void {
    // Pads for sideways stance
    const padGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.12);
    const padMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff }); // White pads
    
    // Left pad (back leg)
    const leftPad = new THREE.Mesh(padGeometry, padMaterial);
    leftPad.position.set(-0.05, -0.2, 0.3);
    leftPad.castShadow = true;
    this.batsman.add(leftPad);
    
    // Right pad (front leg)
    const rightPad = new THREE.Mesh(padGeometry, padMaterial);
    rightPad.position.set(-0.05, -0.2, -0.3);
    rightPad.castShadow = true;
    this.batsman.add(rightPad);
  }

  private createBowler(): void {
    this.bowler = new THREE.Group();

    // Body (torso)
    const torsoGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.8, 8);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: COLORS.bowlerBody });
    const torso = new THREE.Mesh(torsoGeometry, bodyMaterial);
    torso.position.y = 0.4;
    torso.castShadow = true;
    this.bowler.add(torso);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.12, 8, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: COLORS.skin });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 0.9;
    head.castShadow = true;
    this.bowler.add(head);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: COLORS.skin });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.2, 0.6, 0);
    leftArm.rotation.z = Math.PI / 4;
    leftArm.castShadow = true;
    this.bowler.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.2, 0.6, 0);
    rightArm.rotation.z = -Math.PI / 4;
    rightArm.castShadow = true;
    this.bowler.add(rightArm);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: COLORS.bowlerBody });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-0.1, -0.35, 0);
    leftLeg.castShadow = true;
    this.bowler.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(0.1, -0.35, 0);
    rightLeg.castShadow = true;
    this.bowler.add(rightLeg);

    // Position bowler
    const { x, y, z } = CHARACTER_POSITIONS.bowler;
    this.bowler.position.set(x, y, z);
    this.bowler.rotation.y = Math.PI; // Face towards batsman
  }

  private createBat(): void {
    // Create simple floating bat (original working version)
    const batGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 8);
    const batMaterial = new THREE.MeshLambertMaterial({ color: COLORS.bat });
    this.bat = new THREE.Mesh(batGeometry, batMaterial);
    
    // Position bat at original working location
    const { x, y, z } = CHARACTER_POSITIONS.bat;
    this.bat.position.set(x, y, z);
    this.bat.castShadow = true;
  }

  private createBall(): void {
    const ballGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const ballMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.ball,
      transparent: false,
      opacity: 1.0,
      roughness: 0.2,
      metalness: 0.05
    });
    this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
    
    const { x, y, z } = CHARACTER_POSITIONS.ball;
    this.ball.position.set(x, y, z);
    this.ball.castShadow = true;
  }

  private addToScene(scene: THREE.Scene): void {
    scene.add(this.batsman);
    scene.add(this.bowler);
    scene.add(this.bat); // Add bat directly to scene (floating bat)
    scene.add(this.ball);
  }

  // Public API
  getBatsman(): THREE.Group {
    return this.batsman;
  }

  getBowler(): THREE.Group {
    return this.bowler;
  }

  getBat(): THREE.Mesh {
    return this.bat;
  }

  getBall(): THREE.Mesh {
    return this.ball;
  }

  // Get hand groups for batting animations
  getBatsmanLeftHand(): THREE.Group {
    return this.batsmanLeftHand;
  }

  getBatsmanRightHand(): THREE.Group {
    return this.batsmanRightHand;
  }

  dispose(): void {
    // Dispose of geometries and materials
    this.batsman.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });

    this.bowler.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });

    this.bat.geometry.dispose();
    (this.bat.material as THREE.Material).dispose();

    this.ball.geometry.dispose();
    (this.ball.material as THREE.Material).dispose();
  }
}
