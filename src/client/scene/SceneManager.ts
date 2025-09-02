/**
 * Three.js scene setup and management
 */

import * as THREE from 'three';
import { SCENE_CONFIG } from '../core/GameConfig';
import { LightingManager } from './Lighting';
import { CricketField } from './CricketField';
import { CharacterManager } from './Characters';

export class SceneManager {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  
  private lightingManager: LightingManager;
  private cricketField: CricketField;
  private characterManager: CharacterManager;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Three.js components
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);

    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    this.setupCamera();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.setupRenderer();

    // Initialize sub-managers
    this.lightingManager = new LightingManager(this.scene);
    this.cricketField = new CricketField(this.scene);
    this.characterManager = new CharacterManager(this.scene);

    // Setup resize handler
    this.setupResizeHandler();
  }

  private setupCamera(): void {
    const { x, y, z } = SCENE_CONFIG.cameraPosition;
    this.camera.position.set(x, y, z);
    
    const { x: lx, y: ly, z: lz } = SCENE_CONFIG.cameraLookAt;
    this.camera.lookAt(lx, ly, lz);
  }

  private setupRenderer(): void {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  private setupResizeHandler(): void {
    window.addEventListener('resize', () => {
      const { innerWidth, innerHeight } = window;
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
  }

  // Public API for accessing game objects
  getBatsman(): THREE.Group | null {
    return this.characterManager.getBatsman();
  }

  getBowler(): THREE.Group | null {
    return this.characterManager.getBowler();
  }

  getBat(): THREE.Mesh | null {
    return this.characterManager.getBat();
  }

  getBall(): THREE.Mesh | null {
    return this.characterManager.getBall();
  }

  getBatsmanLeftHand(): THREE.Group | null {
    return this.characterManager.getBatsmanLeftHand();
  }

  getBatsmanRightHand(): THREE.Group | null {
    return this.characterManager.getBatsmanRightHand();
  }

  getBatsmanWicket(): THREE.Group | null {
    return this.cricketField.getBatsmanWicket();
  }

  getBowlerWicket(): THREE.Group | null {
    return this.cricketField.getBowlerWicket();
  }

  getScene(): THREE.Scene {
    return this.scene;
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.renderer.dispose();
    this.lightingManager.dispose();
    this.cricketField.dispose();
    this.characterManager.dispose();
  }
}
