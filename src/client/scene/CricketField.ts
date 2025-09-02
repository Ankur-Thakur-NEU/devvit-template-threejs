/**
 * Cricket field, pitch, and stadium setup
 */

import * as THREE from 'three';
import { SCENE_CONFIG, CHARACTER_POSITIONS, COLORS } from '../core/GameConfig';

export class CricketField {
  private field: THREE.Mesh;
  private pitch: THREE.Mesh;
  private batsmanWicket: THREE.Group;
  private bowlerWicket: THREE.Group;
  private stadiumStands: THREE.Mesh[];
  private boundary: THREE.Mesh;
  private innerCircle: THREE.Mesh;
  private pitchMarkings: THREE.Group;
  private floodLights: THREE.Group[];

  constructor(scene: THREE.Scene) {
    this.createCircularField();
    this.createBoundary();
    this.createInnerCircle();
    this.createPitch();
    this.createPitchMarkings();
    this.createWickets();
    this.createModernStadium();
    this.createFloodLights();
    this.addToScene(scene);
  }

  private createCircularField(): void {
    // Create circular grass field (main playing area)
    const fieldRadius = 45;
    const fieldGeometry = new THREE.CircleGeometry(fieldRadius, 64);
    const fieldMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d5016, // Rich dark green
      transparent: false
    });
    this.field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    this.field.rotation.x = -Math.PI / 2;
    this.field.receiveShadow = true;
    this.field.position.y = -0.01; // Slightly below other elements
  }

  private createBoundary(): void {
    // Create boundary rope (white circle)
    const boundaryRadius = 44;
    const boundaryGeometry = new THREE.RingGeometry(boundaryRadius - 0.5, boundaryRadius, 64);
    const boundaryMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff, // White boundary rope
      transparent: false
    });
    this.boundary = new THREE.Mesh(boundaryGeometry, boundaryMaterial);
    this.boundary.rotation.x = -Math.PI / 2;
    this.boundary.position.y = 0.01; // Slightly above field
  }

  private createInnerCircle(): void {
    // Create 30-yard circle marking
    const innerRadius = 25;
    const innerGeometry = new THREE.RingGeometry(innerRadius - 0.2, innerRadius, 64);
    const innerMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff, // White circle
      transparent: true,
      opacity: 0.8
    });
    this.innerCircle = new THREE.Mesh(innerGeometry, innerMaterial);
    this.innerCircle.rotation.x = -Math.PI / 2;
    this.innerCircle.position.y = 0.02; // Above field and boundary
  }

  private createPitch(): void {
    // Create a more realistic pitch with better proportions
    const pitchLength = 22; // 22 yards (actual cricket pitch length)
    const pitchWidth = 3.2;
    const pitchGeometry = new THREE.BoxGeometry(pitchWidth, 0.05, pitchLength);
    const pitchMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xd2b48c, // Sandy brown for realistic pitch color
      transparent: false
    });
    this.pitch = new THREE.Mesh(pitchGeometry, pitchMaterial);
    this.pitch.position.set(0, 0.025, 0); // Centered at origin
    this.pitch.receiveShadow = true;
    this.pitch.castShadow = false;
  }

  private createPitchMarkings(): void {
    this.pitchMarkings = new THREE.Group();

    // Create crease lines (white lines on pitch)
    const creaseGeometry = new THREE.PlaneGeometry(3.2, 0.1);
    const creaseMaterial = new THREE.MeshLambertMaterial({ 
      color: 0xffffff, // White lines
      transparent: false
    });

    // Batting crease (batsman end)
    const batsmanCrease = new THREE.Mesh(creaseGeometry, creaseMaterial);
    batsmanCrease.rotation.x = -Math.PI / 2;
    batsmanCrease.position.set(0, 0.06, -10);
    this.pitchMarkings.add(batsmanCrease);

    // Bowling crease (bowler end)  
    const bowlerCrease = new THREE.Mesh(creaseGeometry, creaseMaterial);
    bowlerCrease.rotation.x = -Math.PI / 2;
    bowlerCrease.position.set(0, 0.06, 10);
    this.pitchMarkings.add(bowlerCrease);

    // Return creases (side lines)
    const returnCreaseGeometry = new THREE.PlaneGeometry(0.05, 2.5);
    const returnCreaseMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });

    for (let side of [-1, 1]) {
      const returnCrease = new THREE.Mesh(returnCreaseGeometry, returnCreaseMaterial);
      returnCrease.rotation.x = -Math.PI / 2;
      returnCrease.position.set(side * 1.6, 0.06, -10);
      this.pitchMarkings.add(returnCrease);
    }
  }

  private createWickets(): void {
    this.batsmanWicket = this.createWicket(new THREE.Vector3(
      CHARACTER_POSITIONS.batsmanWicket.x,
      CHARACTER_POSITIONS.batsmanWicket.y,
      CHARACTER_POSITIONS.batsmanWicket.z
    ));

    this.bowlerWicket = this.createWicket(new THREE.Vector3(
      CHARACTER_POSITIONS.bowlerWicket.x,
      CHARACTER_POSITIONS.bowlerWicket.y,
      CHARACTER_POSITIONS.bowlerWicket.z
    ));
  }

  private createWicket(position: THREE.Vector3): THREE.Group {
    const wicketGroup = new THREE.Group();
    
    // Create stumps
    const stumpGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
    const stumpMaterial = new THREE.MeshLambertMaterial({ color: COLORS.stumps });

    for (let i = 0; i < 3; i++) {
      const stump = new THREE.Mesh(stumpGeometry, stumpMaterial);
      stump.position.x = (i - 1) * 0.2; // Space stumps 0.2 units apart
      stump.position.y = 0.35;
      stump.castShadow = true;
      wicketGroup.add(stump);
    }

    // Create bails
    const bailGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6);
    const bailMaterial = new THREE.MeshLambertMaterial({ color: COLORS.stumps });

    for (let i = 0; i < 2; i++) {
      const bail = new THREE.Mesh(bailGeometry, bailMaterial);
      bail.rotation.z = Math.PI / 2;
      bail.position.x = (i - 0.5) * 0.6;
      bail.position.y = 0.75;
      bail.castShadow = true;
      wicketGroup.add(bail);
    }

    wicketGroup.position.copy(position);
    return wicketGroup;
  }

  private createModernStadium(): void {
    this.stadiumStands = [];

    // Create circular stadium tiers
    const stadiumRadius = 55;
    const segments = 32;
    
    // Lower tier (main seating)
    const lowerTierGeometry = new THREE.RingGeometry(stadiumRadius, stadiumRadius + 8, segments);
    const lowerTierMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x4a5568, // Dark blue-grey
      transparent: false
    });
    const lowerTier = new THREE.Mesh(lowerTierGeometry, lowerTierMaterial);
    lowerTier.rotation.x = -Math.PI / 2;
    lowerTier.position.y = 3;
    this.stadiumStands.push(lowerTier);

    // Upper tier
    const upperTierGeometry = new THREE.RingGeometry(stadiumRadius + 8, stadiumRadius + 12, segments);
    const upperTierMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x2d3748, // Darker blue-grey
      transparent: false
    });
    const upperTier = new THREE.Mesh(upperTierGeometry, upperTierMaterial);
    upperTier.rotation.x = -Math.PI / 2;
    upperTier.position.y = 8;
    this.stadiumStands.push(upperTier);

    // Stadium roof structure
    const roofGeometry = new THREE.RingGeometry(stadiumRadius + 12, stadiumRadius + 15, segments);
    const roofMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x1a202c, // Very dark grey
      transparent: false
    });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = 12;
    this.stadiumStands.push(roof);

    // Add some stadium walls for depth
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * (stadiumRadius + 6);
      const z = Math.sin(angle) * (stadiumRadius + 6);
      
      const wallGeometry = new THREE.BoxGeometry(2, 15, 1);
      const wallMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x718096, // Medium grey
        transparent: false
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.position.set(x, 7.5, z);
      wall.lookAt(0, 7.5, 0); // Face towards center
      wall.castShadow = true;
      this.stadiumStands.push(wall);
    }
  }

  private createFloodLights(): void {
    this.floodLights = [];
    const lightPositions = [
      { x: 40, z: 40 },
      { x: -40, z: 40 },
      { x: 40, z: -40 },
      { x: -40, z: -40 }
    ];

    lightPositions.forEach(pos => {
      const floodLightGroup = new THREE.Group();
      
      // Light pole
      const poleGeometry = new THREE.CylinderGeometry(0.3, 0.5, 25, 8);
      const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x2d3748 });
      const pole = new THREE.Mesh(poleGeometry, poleMaterial);
      pole.position.y = 12.5;
      pole.castShadow = true;
      floodLightGroup.add(pole);
      
      // Light fixture
      const fixtureGeometry = new THREE.BoxGeometry(3, 1, 1);
      const fixtureMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const fixture = new THREE.Mesh(fixtureGeometry, fixtureMaterial);
      fixture.position.y = 24;
      floodLightGroup.add(fixture);
      
      floodLightGroup.position.set(pos.x, 0, pos.z);
      this.floodLights.push(floodLightGroup);
    });
  }

  private addToScene(scene: THREE.Scene): void {
    // Add field elements
    scene.add(this.field);
    scene.add(this.boundary);
    scene.add(this.innerCircle);
    scene.add(this.pitch);
    scene.add(this.pitchMarkings);
    
    // Add wickets
    scene.add(this.batsmanWicket);
    scene.add(this.bowlerWicket);
    
    // Add stadium elements
    this.stadiumStands.forEach(stand => scene.add(stand));
    this.floodLights.forEach(light => scene.add(light));
  }

  // Public API
  getBatsmanWicket(): THREE.Group {
    return this.batsmanWicket;
  }

  getBowlerWicket(): THREE.Group {
    return this.bowlerWicket;
  }

  dispose(): void {
    // Dispose field elements
    this.field.geometry.dispose();
    (this.field.material as THREE.Material).dispose();
    
    this.boundary.geometry.dispose();
    (this.boundary.material as THREE.Material).dispose();
    
    this.innerCircle.geometry.dispose();
    (this.innerCircle.material as THREE.Material).dispose();
    
    this.pitch.geometry.dispose();
    (this.pitch.material as THREE.Material).dispose();
    
    // Dispose pitch markings
    this.pitchMarkings.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        (child.material as THREE.Material).dispose();
      }
    });
    
    // Dispose stadium elements
    this.stadiumStands.forEach(stand => {
      stand.geometry.dispose();
      (stand.material as THREE.Material).dispose();
    });
    
    // Dispose flood lights
    this.floodLights.forEach(lightGroup => {
      lightGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
    });
  }
}
