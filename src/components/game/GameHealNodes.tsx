import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelHealNode } from '../../data/levelsData';
import { isUsingFallback, FALLBACK_COLORS } from '../../game/fallback';

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

    const dist = avatarPosRef.current.distanceTo(new THREE.Vector3(node.x, 0, node.z));
    const inRange = dist < node.radius + 3;

    if (inRange) {
      healedRef.current[index] = Math.min(1, (healedRef.current[index] || 0) + dt * 0.15);
    } else if ((healedRef.current[index] || 0) > 0 && (healedRef.current[index] || 0) < 1) {
      healedRef.current[index] = Math.max(0, (healedRef.current[index] || 0) - dt * 0.02);
    }

    const healed = healedRef.current[index] || 0;

    ringRef.current.scale.setScalar(0.5 + healed * 0.5);
    const mat = ringRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.2 + healed * 0.6;

    if (beamRef.current) {
      beamRef.current.scale.y = healed * 3;
      const beamMat = beamRef.current.material as THREE.MeshBasicMaterial;
      beamMat.opacity = healed * 0.3;
    }

    if (healed >= 0.99 && !wasHealed.current) {
      wasHealed.current = true;
      onNodeHealed(index);
    }
  });

  // Fallback: glowing ring + beam (no .glb loading)
  if (isUsingFallback) {
    return (
      <group position={[node.x, 0, node.z]}>
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
          <ringGeometry args={[node.radius * 0.8, node.radius, 32]} />
          <meshBasicMaterial color={FALLBACK_COLORS.healNode} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={beamRef} position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.3, 0.5, 1, 8]} />
          <meshBasicMaterial color={FALLBACK_COLORS.healBeam} transparent opacity={0} />
        </mesh>
      </group>
    );
  }

  // ── Production path (when real .glb exists) ──────────────────────
  // For water nodes, load well.glb; for grass nodes, load tree.glb
  // import { useGLTF } from '@react-three/drei';
  // import { getModelPath } from '../../game/fallback';
  // const modelKey = node.type === 'water' ? 'barrenWell' : 'healedTree';
  // const { scene } = useGLTF(getModelPath(modelKey));
  // return <primitive object={scene} position={[node.x, 0, node.z]} />;

  return null;
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
