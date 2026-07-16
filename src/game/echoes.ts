import * as THREE from 'three';
import type { EchoSpirit } from './types';

export type { EchoSpirit };

const echoData = [
  { id: 'echo-water', name: 'صدى الماء', emoji: '💧', x: 15, z: 12, questType: 'heal' as const, questText: 'أحيا الأرض الجافة حولي', partnerId: null },
  { id: 'echo-peace', name: 'صدى الصلح', emoji: '🕊️', x: -18, z: 8, questType: 'meet' as const, questText: 'اسعِ بيني وبين شريكي لنلتقي', partnerId: 'echo-peace-2' },
  { id: 'echo-peace-2', name: 'صدى الصلح الآخر', emoji: '🕊️', x: -10, z: -15, questType: 'meet' as const, questText: 'أنتظر شريكي عند النقطة الوسطى', partnerId: 'echo-peace' },
  { id: 'echo-growth', name: 'صدى الغرس', emoji: '🌱', x: 8, z: -18, questType: 'protect' as const, questText: 'ازرع شجرة تحميني من العاصفة', partnerId: null },
  { id: 'echo-warmth', name: 'صدى الدفء', emoji: '🌙', x: -20, z: -5, questType: 'heal' as const, questText: 'أحيا الأرض حولي لأدفأ', partnerId: null },
];

export function createEchoes(): EchoSpirit[] {
  return echoData.map((data) => {
    const group = new THREE.Group();

    // Core glowing sphere
    const coreGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const color = data.questType === 'meet' ? 0xfbbf24 : data.questType === 'heal' ? 0x38bdf8 : 0x5eead4;
    const coreMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer glow
    const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // Orbiting ring
    const ringGeo = new THREE.TorusGeometry(0.8, 0.03, 8, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    group.position.set(data.x, 1.5, data.z);

    return {
      id: data.id,
      name: data.name,
      emoji: data.emoji,
      position: new THREE.Vector3(data.x, 1.5, data.z),
      mesh: group,
      satisfied: false,
      partnerId: data.partnerId,
      questType: data.questType,
      questText: data.questText,
    };
  });
}

export function updateEchoes(echoes: EchoSpirit[], time: number) {
  echoes.forEach((echo, i) => {
    echo.mesh.position.y = 1.5 + Math.sin(time * 1.2 + i * 0.8) * 0.3;
    echo.mesh.rotation.y = time * 0.5 + i;

    // Pulse glow when satisfied
    const glow = echo.mesh.children[1] as THREE.Mesh;
    const glowMat = glow.material as THREE.MeshBasicMaterial;
    const baseOpacity = echo.satisfied ? 0.3 : 0.15;
    glowMat.opacity = baseOpacity + Math.sin(time * 2 + i) * 0.05;

    // Ring rotation
    const ring = echo.mesh.children[2] as THREE.Mesh;
    ring.rotation.z = time * 0.8 + i;
  });
}
