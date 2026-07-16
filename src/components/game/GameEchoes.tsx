import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { LevelEcho } from '../../data/levelsData';

export type EchoData = LevelEcho;

type EchoProps = {
  echo: EchoData;
  index: number;
  satisfiedRef: React.MutableRefObject<Set<string>>;
};

const questColors: Record<string, number> = {
  meet: 0xfbbf24,
  heal: 0x38bdf8,
  protect: 0x5eead4,
};

function EchoSpirit({ echo, index, satisfiedRef }: EchoProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = questColors[echo.questType] || 0x5eead4;

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

  return (
    <group ref={groupRef} position={[echo.x, 1.5, echo.z]}>
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
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.8, 0.03, 8, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
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
