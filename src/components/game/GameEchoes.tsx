import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelEcho } from '../../data/levelsData';
import { isUsingFallback, FALLBACK_COLORS } from '../../game/fallback';

export type EchoData = LevelEcho;

type EchoProps = {
  echo: EchoData;
  index: number;
  satisfiedRef: React.MutableRefObject<Set<string>>;
};

const questColors: Record<string, number> = {
  meet: FALLBACK_COLORS.echoMeet,
  heal: FALLBACK_COLORS.echoHeal,
  protect: FALLBACK_COLORS.echoProtect,
};

function EchoSpirit({ echo, index, satisfiedRef }: EchoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = questColors[echo.questType] || FALLBACK_COLORS.echoProtect;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;
    groupRef.current.position.y = 1.5 + Math.sin(time * 1.2 + index * 0.8) * 0.3;
    groupRef.current.rotation.y = time * 0.5 + index;

    const satisfied = satisfiedRef.current.has(echo.id);
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (satisfied ? 0.3 : 0.15) + Math.sin(time * 2 + index) * 0.05;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.8 + index;
    }
  });

  // Fallback: glowing sphere spirit (no .glb loading)
  if (isUsingFallback) {
    return (
      <group ref={groupRef} position={[echo.x, 1.5, echo.z]}>
        {/* Core glowing sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.85}
          />
        </mesh>
        {/* Outer glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[1.2, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>
        {/* Orbiting ring */}
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.03, 8, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  // ── Production path (when real .glb exists) ──────────────────────
  // import { useGLTF } from '@react-three/drei';
  // import { getModelPath } from '../../game/fallback';
  // const { scene } = useGLTF(getModelPath('echoSpirit'));
  // return <primitive ref={groupRef} object={scene} position={[echo.x, 1.5, echo.z]} />;

  return null;
}

type EchoesProps = {
  echoes: EchoData[];
  satisfiedRef: React.MutableRefObject<Set<string>>;
};

export default function GameEchoes({ echoes, satisfiedRef }: EchoesProps) {
  return (
    <>
      {echoes.map((echo, i) => (
        <EchoSpirit key={echo.id} echo={echo} index={i} satisfiedRef={satisfiedRef} />
      ))}
    </>
  );
}
