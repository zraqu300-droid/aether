import * as THREE from 'three';
import { createTerrain, updateTerrainUniforms } from './terrain';
import { createAvatar, updateAvatar, updateTrail, type Avatar } from './avatar';
import { createEchoes, updateEchoes } from './echoes';
import type { EchoSpirit } from './echoes';
import { createEnvironment, updateEnvironment, type Environment } from './environment';
import type { HealNode, GameWorldState } from './types';

export type EngineCallbacks = {
  onStatsUpdate: (state: GameWorldState) => void;
  onEchoInteract: (echo: EchoSpirit) => void;
  onHeal: (node: HealNode) => void;
};

export class GameEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  terrain: THREE.Mesh;
  avatar: Avatar;
  echoes: EchoSpirit[];
  env: Environment;
  healNodes: HealNode[];
  worldState: GameWorldState;
  callbacks: EngineCallbacks;
  clock: THREE.Clock;
  input: { moveX: number; moveY: number; running: boolean };
  cameraOffset: THREE.Vector3;
  private animationId: number | null = null;
  private resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();
    this.input = { moveX: 0, moveY: 0, running: false };
    this.cameraOffset = new THREE.Vector3(0, 12, 16);

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 15, 20);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Terrain
    this.terrain = createTerrain(100, 128);
    this.scene.add(this.terrain);

    // Avatar
    this.avatar = createAvatar();
    this.scene.add(this.avatar.group);
    this.scene.add(this.avatar.trailLine);

    // Echoes
    this.echoes = createEchoes();
    this.echoes.forEach((e) => this.scene.add(e.mesh));

    // Environment
    this.env = createEnvironment(this.scene);

    // Heal nodes
    this.healNodes = this.createHealNodes();

    // World state
    this.worldState = {
      timeOfDay: 0.35,
      dayCount: 1,
      lightEnergy: 50,
      maxEnergy: 50,
      message: 10,
      responsibility: 10,
      harmony: 10,
      compassAlignment: 0.5,
      insightLensActive: false,
      insightPreviewTime: 0,
      totalHealed: 0,
      echoQuestsCompleted: 0,
    };

    // Resize
    this.resizeHandler = () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', this.resizeHandler);
  }

  private createHealNodes(): HealNode[] {
    const nodes: HealNode[] = [];
    const positions = [
      [12, 10], [-15, 6], [6, -14], [-18, -8], [20, -3],
      [-8, 18], [14, 20], [-22, 12],
    ];
    positions.forEach(([x, z]) => {
      nodes.push({
        position: new THREE.Vector3(x, 0, z),
        radius: 6,
        healed: 0,
        targetHealed: 0,
        echo: null,
      });
    });
    return nodes;
  }

  start() {
    this.animate();
  }

  stop() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeHandler);
    this.renderer.dispose();
  }

  setInput(moveX: number, moveY: number, running: boolean) {
    this.input.moveX = moveX;
    this.input.moveY = moveY;
    this.input.running = running;
  }

  toggleInsightLens(active: boolean) {
    this.worldState.insightLensActive = active;
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);
    const dt = Math.min(this.clock.getDelta(), 0.05);
    const time = this.clock.elapsedTime;

    this.updateMovement(dt);
    this.updateHealing(dt);
    this.updateTimeOfDay(dt);
    this.updateCamera(dt);
    this.updateCompass();

    updateAvatar(this.avatar, time, this.input.moveX !== 0 || this.input.moveY !== 0, this.input.running);
    updateEchoes(this.echoes, time);
    updateEnvironment(this.env, this.worldState.timeOfDay, time);
    updateTerrainUniforms(
      this.terrain, time, this.avatar.group.position,
      this.healNodes, this.worldState.timeOfDay
    );

    // Insight lens visual effect
    if (this.worldState.insightLensActive) {
      this.renderer.toneMappingExposure = 0.6;
      this.scene.fog = new THREE.Fog(0x1a3a4a, 10, 50);
    } else {
      this.renderer.toneMappingExposure = 1.1;
      this.scene.fog = this.env.fog;
    }

    this.callbacks.onStatsUpdate({ ...this.worldState });
    this.renderer.render(this.scene, this.camera);
  };

  private updateMovement(dt: number) {
    const speed = this.input.running ? 12 : 6;
    const moveX = this.input.moveX;
    const moveY = this.input.moveY;
    const mag = Math.sqrt(moveX * moveX + moveY * moveY);

    if (mag > 0.01) {
      const dirX = moveX / mag;
      const dirZ = moveY / mag;
      this.avatar.group.position.x += dirX * speed * dt;
      this.avatar.group.position.z += dirZ * speed * dt;

      // Clamp to terrain bounds
      const bound = 45;
      this.avatar.group.position.x = THREE.MathUtils.clamp(this.avatar.group.position.x, -bound, bound);
      this.avatar.group.position.z = THREE.MathUtils.clamp(this.avatar.group.position.z, -bound, bound);

      // Rotation
      const targetRot = Math.atan2(dirX, dirZ);
      this.avatar.group.rotation.y = THREE.MathUtils.lerp(this.avatar.group.rotation.y, targetRot, 0.15);

      // Trail
      if (Math.floor(this.clock.elapsedTime * 10) % 2 === 0) {
        updateTrail(this.avatar, this.avatar.group.position.clone().setY(0.1));
      }

      // Energy cost
      this.worldState.lightEnergy = Math.max(0, this.worldState.lightEnergy - (this.input.running ? 0.3 : 0.1) * dt);
    }
  }

  private updateHealing(dt: number) {
    const avatarPos = this.avatar.group.position;

    this.healNodes.forEach((node) => {
      const dist = avatarPos.distanceTo(new THREE.Vector3(node.position.x, avatarPos.y, node.position.z));
      const inRange = dist < node.radius + 3;

      if (inRange && this.worldState.lightEnergy > 0) {
        node.targetHealed = 1;
        node.healed = Math.min(1, node.healed + dt * 0.15);
        if (this.worldState.lightEnergy > 0) {
          this.worldState.lightEnergy = Math.max(0, this.worldState.lightEnergy - 0.5 * dt);
          this.worldState.message = Math.min(100, this.worldState.message + 0.1 * dt);
        }
      } else if (node.healed > 0 && node.healed < 1) {
        // Degradation if abandoned partially healed
        node.healed = Math.max(0, node.healed - dt * 0.02);
      }

      if (node.healed >= 0.99 && node.targetHealed < 1) {
        node.targetHealed = 1;
        this.worldState.totalHealed++;
        this.worldState.responsibility = Math.min(100, this.worldState.responsibility + 2);
        this.worldState.harmony = Math.min(100, this.worldState.harmony + 1.5);
        this.callbacks.onHeal(node);
      }
    });
  }

  private updateTimeOfDay(dt: number) {
    this.worldState.timeOfDay += dt * 0.008;
    if (this.worldState.timeOfDay >= 1) {
      this.worldState.timeOfDay -= 1;
      this.worldState.dayCount++;
      // Restore energy each new day
      this.worldState.lightEnergy = Math.min(this.worldState.maxEnergy, this.worldState.lightEnergy + 20);
    }
  }

  private updateCamera(_dt: number) {
    const target = this.avatar.group.position;
    const desired = new THREE.Vector3(
      target.x + this.cameraOffset.x,
      target.y + this.cameraOffset.y,
      target.z + this.cameraOffset.z
    );
    this.camera.position.lerp(desired, 0.06);
    this.camera.lookAt(target.x, target.y + 1, target.z);
  }

  private updateCompass() {
    const avg = (this.worldState.message + this.worldState.responsibility + this.worldState.harmony) / 3;
    this.worldState.compassAlignment = avg / 100;
  }

  interactWithEcho(): EchoSpirit | null {
    const avatarPos = this.avatar.group.position;
    let nearest: EchoSpirit | null = null;
    let minDist = 5;

    this.echoes.forEach((echo) => {
      if (echo.satisfied) return;
      const dist = avatarPos.distanceTo(echo.position);
      if (dist < minDist) {
        minDist = dist;
        nearest = echo;
      }
    });

    if (nearest) {
      this.handleEchoQuest(nearest);
      this.callbacks.onEchoInteract(nearest);
    }

    return nearest;
  }

  private handleEchoQuest(echo: EchoSpirit) {
    if (echo.satisfied) return;

    if (echo.questType === 'meet' && echo.partnerId) {
      const partner = this.echoes.find((e) => e.id === echo.partnerId);
      if (partner && !partner.satisfied) {
        // Check if avatar is near midpoint
        const midpoint = echo.position.clone().add(partner.position).multiplyScalar(0.5);
        const distToMid = this.avatar.group.position.distanceTo(midpoint);
        if (distToMid < 8) {
          echo.satisfied = true;
          partner.satisfied = true;
          this.worldState.harmony = Math.min(100, this.worldState.harmony + 5);
          this.worldState.message = Math.min(100, this.worldState.message + 3);
          this.worldState.echoQuestsCompleted++;
        }
      }
    } else if (echo.questType === 'heal') {
      // Check if nearby heal node is healed
      const nearbyNode = this.healNodes.find((n) => n.position.distanceTo(echo.position) < 10);
      if (nearbyNode && nearbyNode.healed > 0.8) {
        echo.satisfied = true;
        this.worldState.harmony = Math.min(100, this.worldState.harmony + 4);
        this.worldState.message = Math.min(100, this.worldState.message + 4);
        this.worldState.echoQuestsCompleted++;
      }
    } else if (echo.questType === 'protect') {
      // Satisfied when a nearby heal node is fully healed
      const nearbyNode = this.healNodes.find((n) => n.position.distanceTo(echo.position) < 12);
      if (nearbyNode && nearbyNode.healed > 0.9) {
        echo.satisfied = true;
        this.worldState.harmony = Math.min(100, this.worldState.harmony + 4);
        this.worldState.responsibility = Math.min(100, this.worldState.responsibility + 3);
        this.worldState.echoQuestsCompleted++;
      }
    }
  }

  plantTree() {
    if (this.worldState.lightEnergy < 10) return false;
    this.worldState.lightEnergy -= 10;
    // Create a tree mesh near avatar
    const treeGroup = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const leafGeo = new THREE.SphereGeometry(1.2, 12, 12);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x2dd4a0,
      emissive: 0x14b8a6,
      emissiveIntensity: 0.2,
      roughness: 0.6,
    });
    const leaves = new THREE.Mesh(leafGeo, leafMat);
    leaves.position.y = 2.5;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    treeGroup.position.copy(this.avatar.group.position);
    treeGroup.position.y = 0;
    this.scene.add(treeGroup);

    this.worldState.responsibility = Math.min(100, this.worldState.responsibility + 3);
    this.worldState.harmony = Math.min(100, this.worldState.harmony + 2);
    return true;
  }

  getHealProgress(): number {
    const healed = this.healNodes.filter((n) => n.healed > 0.9).length;
    return healed / this.healNodes.length;
  }

  getEchoProgress(): number {
    return this.worldState.echoQuestsCompleted / this.echoes.length;
  }
}
