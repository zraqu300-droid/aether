import * as THREE from 'three';

export type Avatar = {
  group: THREE.Group;
  aura: THREE.Mesh;
  trailPositions: THREE.Vector3[];
  trailLine: THREE.Line;
  trailGeometry: THREE.BufferGeometry;
};

export function createAvatar(): Avatar {
  const group = new THREE.Group();

  // Body — stylized humanoid (capsule)
  const bodyGeo = new THREE.CapsuleGeometry(0.4, 1.0, 8, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x5eead4,
    emissive: 0x14b8a6,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    metalness: 0.1,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.0;
  body.castShadow = true;
  group.add(body);

  // Head — glowing sphere
  const headGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.y = 1.9;
  head.castShadow = true;
  group.add(head);

  // Aura — transparent glowing sphere
  const auraGeo = new THREE.SphereGeometry(2.5, 16, 16);
  const auraMat = new THREE.MeshBasicMaterial({
    color: 0x2dd4bf,
    transparent: true,
    opacity: 0.08,
    side: THREE.BackSide,
  });
  const aura = new THREE.Mesh(auraGeo, auraMat);
  aura.position.y = 1.0;
  group.add(aura);

  // Trail line
  const trailGeometry = new THREE.BufferGeometry();
  const trailPositions: THREE.Vector3[] = [];
  trailGeometry.setFromPoints([new THREE.Vector3()]);
  const trailMat = new THREE.LineBasicMaterial({
    color: 0x5eead4,
    transparent: true,
    opacity: 0.4,
  });
  const trailLine = new THREE.Line(trailGeometry, trailMat);
  trailLine.frustumCulled = false;

  return { group, aura, trailPositions, trailLine, trailGeometry };
}

export function updateAvatar(
  avatar: Avatar,
  time: number,
  isMoving: boolean,
  isRunning: boolean
) {
  // Idle float
  if (!isMoving) {
    avatar.group.position.y = Math.sin(time * 1.5) * 0.15;
    avatar.group.rotation.y += 0.005;
  }

  // Aura pulse
  const auraMat = avatar.aura.material as THREE.MeshBasicMaterial;
  const pulse = Math.sin(time * 2) * 0.03 + 0.08;
  auraMat.opacity = pulse + (isMoving ? 0.05 : 0);
  avatar.aura.scale.setScalar(1 + Math.sin(time * 2) * 0.05);

  // Body emissive flicker
  const body = avatar.group.children[0] as THREE.Mesh;
  const bodyMat = body.material as THREE.MeshStandardMaterial;
  bodyMat.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.1 + (isRunning ? 0.2 : 0);
}

export function updateTrail(avatar: Avatar, pos: THREE.Vector3, maxPoints = 40) {
  avatar.trailPositions.push(pos.clone());
  if (avatar.trailPositions.length > maxPoints) {
    avatar.trailPositions.shift();
  }
  avatar.trailGeometry.setFromPoints(avatar.trailPositions);
  avatar.trailGeometry.attributes.position.needsUpdate = true;
}
