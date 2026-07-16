import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type TerrainProps = {
  size: number;
  biome: string;
  avatarPosRef: React.MutableRefObject<THREE.Vector3>;
  healNodesRef: React.MutableRefObject<{ position: THREE.Vector3; radius: number; healed: number }[]>;
  timeOfDayRef: React.MutableRefObject<number>;
};

const biomeColors: Record<string, { barren: number; grass: number; rock: number; flower: number }> = {
  meadow: { barren: 0x4a4540, grass: 0x2dd4a0, rock: 0x6b6258, flower: 0xf5a623 },
  desert: { barren: 0x8b7355, grass: 0x4ade80, rock: 0xa08866, flower: 0xfbbf24 },
  forest: { barren: 0x2a2520, grass: 0x16a34a, rock: 0x4a4038, flower: 0xa78bfa },
  highlands: { barren: 0x5a5550, grass: 0x22c55e, rock: 0x808080, flower: 0xfb923c },
  oasis: { barren: 0x6b6258, grass: 0x2dd4bf, rock: 0x807060, flower: 0xf59e0b },
};

const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    vElevation = position.y;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uAvatarPos;
  uniform vec3 uHealCenters[16];
  uniform float uHealRadii[16];
  uniform float uHealAmounts[16];
  uniform int uHealCount;
  uniform vec3 uBarrenColor;
  uniform vec3 uGrassColor;
  uniform vec3 uRockColor;
  uniform vec3 uFlowerColor;
  uniform float uTimeOfDay;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying vec3 vNormal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), f.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  float computeHeal(vec2 worldXZ) {
    float heal = 0.0;
    for (int i = 0; i < 16; i++) {
      if (i >= uHealCount) break;
      float dist = distance(worldXZ, uHealCenters[i].xz);
      float radius = uHealRadii[i];
      float contribution = smoothstep(radius, radius * 0.35, dist) * uHealAmounts[i];
      heal = max(heal, contribution);
    }
    return heal;
  }

  void main() {
    vec2 worldXZ = vWorldPos.xz;
    float heal = computeHeal(worldXZ);
    float n = fbm(worldXZ * 0.15);
    float n2 = fbm(worldXZ * 0.3 + 100.0);

    vec3 barren = mix(uBarrenColor * 0.6, uBarrenColor, n);
    vec3 rock = mix(uRockColor * 0.7, uRockColor, n2);
    vec3 grass = mix(uGrassColor * 0.7, uGrassColor, n);
    grass = mix(grass, uGrassColor * 1.2, n2 * 0.5);

    float flowerNoise = fbm(worldXZ * 1.5);
    vec3 withFlowers = mix(grass, uFlowerColor, smoothstep(0.65, 0.8, flowerNoise) * heal * 0.6);

    float slope = 1.0 - max(0.0, vNormal.y);
    vec3 baseColor = mix(withFlowers, rock, smoothstep(0.35, 0.6, slope));
    vec3 finalColor = mix(barren, baseColor, heal);

    float avatarDist = distance(worldXZ, uAvatarPos.xz);
    float auraGlow = smoothstep(8.0, 2.0, avatarDist) * 0.25;
    finalColor += vec3(0.1, 0.25, 0.2) * auraGlow;

    float dayFactor = smoothstep(0.2, 0.5, uTimeOfDay) * (1.0 - smoothstep(0.6, 0.85, uTimeOfDay));
    finalColor *= 0.4 + 0.6 * dayFactor;

    float sparkle = sin(uTime * 3.0 + worldXZ.x * 5.0 + worldXZ.z * 3.0) * 0.5 + 0.5;
    finalColor += vec3(0.08, 0.15, 0.1) * heal * sparkle * 0.3;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function GameTerrain({ size, biome, avatarPosRef, healNodesRef, timeOfDayRef }: TerrainProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const colors = biomeColors[biome] || biomeColors.meadow;

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(size, size, 128, 128);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.sqrt(x * x + z * z);
      const elevation =
        Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.0 +
        Math.sin(x * 0.02 + z * 0.03) * 3.0 +
        Math.cos(dist * 0.04) * 1.5;
      const centerFactor = Math.max(0, 1 - dist / (size * 0.25));
      pos.setY(i, elevation * (1 - centerFactor * 0.6));
    }
    geo.computeVertexNormals();
    return geo;
  }, [size]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uAvatarPos: { value: new THREE.Vector3() },
    uHealCenters: { value: Array.from({ length: 16 }, () => new THREE.Vector3()) },
    uHealRadii: { value: new Array(16).fill(0) },
    uHealAmounts: { value: new Array(16).fill(0) },
    uHealCount: { value: 0 },
    uBarrenColor: { value: new THREE.Color(colors.barren) },
    uGrassColor: { value: new THREE.Color(colors.grass) },
    uRockColor: { value: new THREE.Color(colors.rock) },
    uFlowerColor: { value: new THREE.Color(colors.flower) },
    uTimeOfDay: { value: 0.5 },
  }), [colors]);

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const u = matRef.current.uniforms;
    u.uTime.value = clock.elapsedTime;
    u.uAvatarPos.value.copy(avatarPosRef.current);
    u.uTimeOfDay.value = timeOfDayRef.current;

    const nodes = healNodesRef.current;
    const count = Math.min(16, nodes.length);
    u.uHealCount.value = count;
    for (let i = 0; i < count; i++) {
      (u.uHealCenters.value as THREE.Vector3[])[i].copy(nodes[i].position);
      (u.uHealRadii.value as number[])[i] = nodes[i].radius;
      (u.uHealAmounts.value as number[])[i] = nodes[i].healed;
    }
  });

  return (
    <mesh geometry={geometry} receiveShadow frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
