import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelHealNode } from '../../data/levelsData';

export type HealNodeData = LevelHealNode;

type HealNodesProps = {
  nodes: HealNodeData[];
  avatarPosRef: React.MutableRefObject<THREE.Vector3>;
  healedRef: React.MutableRefObject<number[]>;
  onNodeHealed: (index: number) => void;
};

function HealNodeIndicator({ node, index, avatarPosRef, healedRef, onNodeHealed }: {
  node: HealNodeData;
  index: number;
  avatarPosRef: React.MutableRefObject<THREE.Vector3>;
  healedRef: React.MutableRefObject<number[]>;
  onNodeHealed: (index: number) => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const wasHealed = useRef(false);

  useFrame((_, dt) => {
    if (!ringRef.current) return;

    // Update healed amount based on proximity
    const dist = avatarPosRef.current.distanceTo(new THREE.Vector3(node.x, 0, node.z));
    const inRange = dist < node.radius + 3;

    if (inRange) {
      healedRef.current[index] = Math.min(1, (healedRef.current[index] || 0) + dt * 0.15);
    } else if ((healedRef.current[index] || 0) > 0 && (healedRef.current[index] || 0) < 1) {
      healedRef.current[index] = Math.max(0, (healedRef.current[index] || 0) - dt * 0.02);
    }

    const healed = healedRef.current[index] || 0;

    // Ring grows and brightens with healing
    ringRef.current.scale.setScalar(0.5 + healed * 0.5);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.2 + healed * 0.6;

    // Beam
    if (beamRef.current) {
      beamRef.current.scale.y = healed * 3;
      const beamMat = beamRef.current.material as THREE.MeshBasicMaterial;
      beamMat.opacity = healed * 0.3;
    }

    // Notify when fully healed
    if (healed >= 0.99 && !wasHealed.current) {
      wasHealed.current = true;
      onNodeHealed(index);
    }
  });

  return (
    <group position={[node.x, 0, node.z]}>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[node.radius * 0.8, node.radius, 32]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={beamRef} position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
        <meshBasicMaterial color="#5eead4" transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function GameHealNodes({ nodes, avatarPosRef, healedRef, onNodeHealed }: HealNodesProps) {
  return (
    <>
      {nodes.map((node, i) => (
        <HealNodeIndicator
          key={i}
          node={node}
          index={i}
          avatarPosRef={avatarPosRef}
          healedRef={healedRef}
          onNodeHealed={onNodeHealed}
        />
      ))}
    </>
  );
}
