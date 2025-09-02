/**
 * Lighting setup for the cricket scene
 */

import * as THREE from 'three';

export class LightingManager {
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private pointLight: THREE.PointLight;

  constructor(scene: THREE.Scene) {
    this.setupLighting();
    this.addToScene(scene);
  }

  private setupLighting(): void {
    // Ambient light for overall stadium illumination
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.4);

    // Main directional light (sun/floodlight effect)
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    this.directionalLight.position.set(10, 25, 5);
    this.directionalLight.castShadow = true;
    
    // Enhanced shadow camera for larger stadium
    this.directionalLight.shadow.mapSize.width = 4096;
    this.directionalLight.shadow.mapSize.height = 4096;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 100;
    this.directionalLight.shadow.camera.left = -60;
    this.directionalLight.shadow.camera.right = 60;
    this.directionalLight.shadow.camera.top = 60;
    this.directionalLight.shadow.camera.bottom = -60;

    // Stadium floodlight effect - warm white light
    this.pointLight = new THREE.PointLight(0xfff8dc, 0.8); // Warm white
    this.pointLight.position.set(0, 20, 0);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize.width = 2048;
    this.pointLight.shadow.mapSize.height = 2048;
  }

  private addToScene(scene: THREE.Scene): void {
    scene.add(this.ambientLight);
    scene.add(this.directionalLight);
    scene.add(this.pointLight);
  }

  dispose(): void {
    this.ambientLight.dispose();
    this.directionalLight.dispose();
    this.pointLight.dispose();
  }
}
