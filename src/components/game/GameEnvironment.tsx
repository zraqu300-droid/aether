import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type EnvironmentProps = {
  timeOfDayRef: React.MutableRefObject<number>;
};

export default function GameEnvironment({ timeOfDayRef }: EnvironmentProps) {
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const starMatRef = useRef<THREE.PointsMaterial>(null);

  const starGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5;
      const r = 80;
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r;
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame(() => {
    const tod = timeOfDayRef.current;
    const sunAngle = (tod - 0.25) * Math.PI * 2;
    const sunHeight = Math.sin(sunAngle);

    if (sunRef.current) {
      sunRef.current.position.set(Math.cos(sunAngle) * 40, Math.max(-5, sunHeight * 50), 20);
      const dayFactor = Math.max(0, sunHeight);
      sunRef.current.intensity = 0.3 + dayFactor * 1.2;
      const warmth = 1 - Math.abs(sunHeight);
      const hue = 0.1 - warmth * 0.05;
      sunRef.current.color.setHSL(hue, 0.5, 0.5 + dayFactor * 0.3);
    }

    if (starMatRef.current) {
      const dayFactor = Math.max(0, sunHeight);
      starMatRef.current.opacity = Math.max(0, 1 - dayFactor * 2);
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} color="#6b7d8a" />
      <hemisphereLight args={['#7dd3fc', '#3a3530', 0.5]} />
      <directionalLight
        ref={sunRef}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        intensity={1.2}
        color="#fff5e0"
      />
      <fog attach="fog" args={['#1a2a3a', 30, 90]} />
      <points geometry={starGeometry}>
        <pointsMaterial
          ref={starMatRef}
          color="#ffffff"
          size={0.5}
          transparent
          opacity={0}
          sizeAttenuation
        />
      </points>
    </>
  );
}
