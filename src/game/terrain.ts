import * as THREE from 'three';

const terrainVertexShader = `
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

const terrainFragmentShader = `
  uniform float uTime;
  uniform vec3 uAvatarPos;
  uniform float uAvatarRadius;
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

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  float computeHeal(vec2 worldXZ) {
    float heal = 0.0;
    for (int i = 0; i < 16; i++) {
      if (i >= uHealCount) break;
      vec2 centerXZ = uHealCenters[i].xz;
      float dist = distance(worldXZ, centerXZ);
      float radius = uHealRadii[i];
      float amount = uHealAmounts[i];
      float contribution = smoothstep(radius, radius * 0.4, dist) * amount;
      heal = max(heal, contribution);
    }
    return heal;
  }

  void main() {
    vec2 worldXZ = vWorldPos.xz;
    float heal = computeHeal(worldXZ);

    // Base terrain colors
    float n = fbm(worldXZ * 0.15);
    float n2 = fbm(worldXZ * 0.3 + 100.0);

    // Barren (ash-grey, cold)
    vec3 barren = mix(uBarrenColor * 0.6, uBarrenColor, n);

    // Rock (higher elevation)
    vec3 rock = mix(uRockColor * 0.7, uRockColor, n2);

    // Grass (healed)
    vec3 grass = mix(uGrassColor * 0.7, uGrassColor, n);
    grass = mix(grass, uGrassColor * 1.2, n2 * 0.5);

    // Flowers in healed areas
    float flowerNoise = fbm(worldXZ * 1.5);
    vec3 flowerColor = uFlowerColor;
    vec3 withFlowers = mix(grass, flowerColor, smoothstep(0.65, 0.8, flowerNoise) * heal * 0.6);

    // Slope-based rock on steep surfaces
    float slope = 1.0 - max(0.0, vNormal.y);
    vec3 baseColor = mix(withFlowers, rock, smoothstep(0.35, 0.6, slope));

    // Transition barren -> healed
    vec3 finalColor = mix(barren, baseColor, heal);

    // Avatar aura glow (proximity light)
    float avatarDist = distance(worldXZ, uAvatarPos.xz);
    float auraGlow = smoothstep(uAvatarRadius, uAvatarRadius * 0.3, avatarDist) * 0.3;
    finalColor += vec3(0.1, 0.25, 0.2) * auraGlow;

    // Day/night ambient
    float dayFactor = smoothstep(0.2, 0.5, uTimeOfDay) * (1.0 - smoothstep(0.6, 0.85, uTimeOfDay));
    finalColor *= 0.4 + 0.6 * dayFactor;

    // Subtle sparkle on healed areas
    float sparkle = sin(uTime * 3.0 + worldXZ.x * 5.0 + worldXZ.z * 3.0) * 0.5 + 0.5;
    finalColor += vec3(0.08, 0.15, 0.1) * heal * sparkle * 0.3;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export function createTerrain(size: number, segments: number): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  // Add elevation via noise
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dist = Math.sqrt(x * x + z * z);
    const elevation =
      Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.0 +
      Math.sin(x * 0.02 + z * 0.03) * 3.0 +
      Math.cos(dist * 0.04) * 1.5;
    // Flatten center for play area
    const centerFactor = Math.max(0, 1 - dist / (size * 0.25));
    pos.setY(i, elevation * (1 - centerFactor * 0.6));
  }
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    vertexShader: terrainVertexShader,
    fragmentShader: terrainFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uAvatarPos: { value: new THREE.Vector3() },
      uAvatarRadius: { value: 8 },
      uHealCenters: { value: Array.from({ length: 16 }, () => new THREE.Vector3()) },
      uHealRadii: { value: new Array(16).fill(0) },
      uHealAmounts: { value: new Array(16).fill(0) },
      uHealCount: { value: 0 },
      uBarrenColor: { value: new THREE.Color(0x3a3530) },
      uGrassColor: { value: new THREE.Color(0x2dd4a0) },
      uRockColor: { value: new THREE.Color(0x6b6258) },
      uFlowerColor: { value: new THREE.Color(0xf5a623) },
      uTimeOfDay: { value: 0.5 },
    },
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  return mesh;
}

export function updateTerrainUniforms(
  mesh: THREE.Mesh,
  time: number,
  avatarPos: THREE.Vector3,
  healNodes: { position: THREE.Vector3; radius: number; healed: number }[],
  timeOfDay: number
) {
  const mat = mesh.material as THREE.ShaderMaterial;
  const uniforms = mat.uniforms;
  uniforms.uTime.value = time;
  uniforms.uAvatarPos.value.copy(avatarPos);
  uniforms.uTimeOfDay.value = timeOfDay;

  const count = Math.min(16, healNodes.length);
  uniforms.uHealCount.value = count;
  for (let i = 0; i < count; i++) {
    (uniforms.uHealCenters.value as THREE.Vector3[])[i].copy(healNodes[i].position);
    (uniforms.uHealRadii.value as number[])[i] = healNodes[i].radius;
    (uniforms.uHealAmounts.value as number[])[i] = healNodes[i].healed;
  }
}
