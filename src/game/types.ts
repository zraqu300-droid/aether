import * as THREE from 'three';

export type HealNode = {
  position: THREE.Vector3;
  radius: number;
  healed: number; // 0..1
  targetHealed: number;
  echo: EchoSpirit | null;
};

export type EchoSpirit = {
  id: string;
  name: string;
  emoji: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  satisfied: boolean;
  partnerId: string | null;
  questType: 'meet' | 'heal' | 'protect';
  questText: string;
};

export type AvatarState = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  isMoving: boolean;
  isRunning: boolean;
  isGrounded: boolean;
  auraIntensity: number;
};

export type GameWorldState = {
  timeOfDay: number; // 0..1 (0=midnight, 0.5=noon)
  dayCount: number;
  lightEnergy: number;
  maxEnergy: number;
  message: number;
  responsibility: number;
  harmony: number;
  compassAlignment: number; // 0..1
  insightLensActive: boolean;
  insightPreviewTime: number; // simulated future time offset
  totalHealed: number;
  echoQuestsCompleted: number;
};
