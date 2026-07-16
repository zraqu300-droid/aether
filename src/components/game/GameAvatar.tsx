import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isUsingFallback, FALLBACK_COLORS } from '../../game/fallback';

type AvatarProps = {
  positionRef: React.MutableRefObject<THREE.Vector3>;
  inputRef: React.MutableRefObject<{ x: number; y: number; running: boolean }>;
  bounds: number;
};

export default function GameAvatar({ positionRef, inputRef, bounds }: AvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Line>(null);
  const trailPositions = useRef<THREE.Vector3[]>([]);
  const rotation = useRef(0);

  const trailGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setFromPoints([new THREE.Vector3()]);
    return geo;
  }, []);

  useFrame(({ clock }, dt) => {
    if (!groupRef.current) return;
    const time = clock.elapsedTime;
    const input = inputRef.current;
    const speed = input.running ? 12 : 6;
    const mag = Math.sqrt(input.x * input.x + input.y * input.y);
    const isMoving = mag > 0.01;

    if (isMoving) {
      const dirX = input.x / mag;
      const dirZ = input.y / mag;
      positionRef.current.x = THREE.MathUtils.clamp(positionRef.current.x + dirX * speed * dt, -bounds, bounds);
      positionRef.current.z = THREE.MathUtils.clamp(positionRef.current.z + dirZ * speed * dt, -bounds, bounds);
      rotation.current = Math.atan2(dirX, dirZ);
    }

    groupRef.current.position.copy(positionRef.current);
    groupRef.current.position.y = isMoving ? 0 : Math.sin(time * 1.5) * 0.15;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.current, 0.15);

    if (auraRef.current) {
      const mat = auraRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.08 + Math.sin(time * 2) * 0.03 + (isMoving ? 0.05 : 0);
      auraRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }

    if (bodyRef.current) {
      const mat = bodyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time * 3) * 0.1 + (input.running ? 0.2 : 0);
    }

    if (headRef.current) {
      const mat = headRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(time * 2.5) * 0.15;
    }

    if (isMoving && Math.floor(time * 10) % 2 === 0) {
      trailPositions.current.push(positionRef.current.clone().setY(0.1));
      if (trailPositions.current.length > 40) trailPositions.current.shift();
      trailGeometry.setFromPoints(trailPositions.current);
      trailGeometry.attributes.position.needsUpdate = true;
    }
  });

  // Fallback: glowing primitive geometry (no .glb loading)
  if (isUsingFallback) {
    return (
      <>
        <group ref={groupRef}>
          {/* Body — glowing capsule */}
          <mesh ref={bodyRef} position={[0, 1.0, 0]} castShadow>
            <capsuleGeometry args={[0.4, 1.0, 8, 16]} />
            <meshStandardMaterial
              color={FALLBACK_COLORS.envoy}
              emissive={FALLBACK_COLORS.envoyEmissive}
              emissiveIntensity={0.4}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>

          {/* Head — glowing sphere */}
          <mesh ref={headRef} position={[0, 1.9, 0]} castShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshStandardMaterial
              color={FALLBACK_COLORS.envoyHead}
              emissive={FALLBACK_COLORS.envoyHeadEmissive}
              emissiveIntensity={0.6}
              roughness={0.2}
            />
          </mesh>

          {/* Aura — transparent glowing sphere */}
          <mesh ref={auraRef} position={[0, 1.0, 0]}>
            <sphereGeometry args={[2.5, 16, 16]} />
            <meshBasicMaterial color={FALLBACK_COLORS.aura} transparent opacity={0.08} side={THREE.BackSide} />
          </mesh>
        </group>

        {/* Trail */}
        {/* @ts-expect-error R3F line element */}
        <line ref={trailRef} geometry={trailGeometry} frustumCulled={false}>
          <lineBasicMaterial color={FALLBACK_COLORS.envoy} transparent opacity={0.4} />
        </line>
      </>
    );
  }

  // ── Production path (when real .glb exists) ──────────────────────
  // To activate: set isUsingFallback = false in src/game/fallback.ts
  // and ensure /public/assets/models/envoy.glb exists.
  //
  // import { useGLTF } from '@react-three/drei';
  // import { getModelPath } from '../../game/fallback';
  // const { scene } = useGLTF(getModelPath('envoy'));
  // return <primitive ref={groupRef} object={scene} />;

  return null;
}
