/**
 * Game configuration constants and settings
 */

// Game Rules
export const BALLS_PER_OVER = 6;
export const MAX_WICKETS = 2;

// Animation States
export enum AnimationState {
  IDLE = 'idle',
  RUNNING = 'running',
  THROWING = 'throwing',
  BALL_IN_FLIGHT = 'ball_in_flight',
  RESET = 'reset'
}

// Ball Trajectory Configuration
export const BALL_CONFIG = {
  startX: 0,
  startY: 1,
  startZ: 10,
  endX: 0,
  endY: 0.5,
  endZ: -10,
  gravity: -9.81,
  initialVelocity: 8,
  angle: Math.PI / 4,
  speed: 12,
  maxHeight: 1.5
} as const;

// Collision Detection
export const COLLISION_CONFIG = {
  hitZone: 3.0,
  perfectTimingMin: 0.60,
  perfectTimingMax: 1.1,
  goodTimingMin: 0.50,
  goodTimingMax: 1.2,
  edgeTimingMin: 0.40,
  edgeTimingMax: 1.3,
  earlyTimingMin: 0.20,
  earlyTimingMax: 0.70
} as const;

// Scene Configuration
export const SCENE_CONFIG = {
  backgroundColor: 0x1e293b, // Dark slate for night stadium effect
  cameraPosition: { x: 0, y: 8, z: -25 }, // Higher and further back to see stadium
  cameraLookAt: { x: 0, y: 0, z: 0 }, // Look at center of field
  fieldSize: 100,
  pitchSize: { width: 3, height: 0.1, length: 40 },
  pitchPosition: { x: 0, y: 0, z: 10 }
} as const;

// Character Positions
export const CHARACTER_POSITIONS = {
  batsman: { x: 0, y: 0, z: -10 }, // Simple batsman position
  bowler: { x: 0, y: 0, z: 30 },
  bat: { x: 0.5, y: 1, z: -10 }, // Original working bat position
  ball: { x: 0, y: 1, z: 10 },
  batsmanWicket: { x: 0, y: 0.5, z: -10 },
  bowlerWicket: { x: 0, y: 0.5, z: 30 }
} as const;

// Colors
export const COLORS = {
  field: 0x228B22,
  pitch: 0x8B4513,
  stumps: 0x654321,
  ball: 0xffffff,
  batsmanBody: 0x000080,
  bowlerBody: 0x4169E1,
  skin: 0xDEB887,
  bat: 0x8B4513
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOTAL_SIXES: 'cricket_total_sixes',
  HIGH_SCORE: 'cricket_high_score',
  BOOSTERS: 'cricket_boosters',
  LAST_PLAYED: 'cricket_last_played',
  MILESTONES: 'cricket_milestones'
} as const;
