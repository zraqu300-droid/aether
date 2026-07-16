import * as THREE from 'three';

export type Environment = {
  sun: THREE.DirectionalLight;
  ambient: THREE.AmbientLight;
  hemisphere: THREE.HemisphereLight;
  skyColors: THREE.Color;
  fog: THREE.Fog;
  stars: THREE.Points;
  particles: THREE.Points;
  particleVelocities: Float32Array;
};

export function createEnvironment(scene: THREE.Scene): Environment {
  // Sun
  const sun = new THREE.DirectionalLight(0xfff5e0, 1.2);
  sun.position.set(30, 40, 20);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 120;
  sun.shadow.camera.left = -50;
  sun.shadow.camera.right = 50;
  sun.shadow.camera.top = 50;
  sun.shadow.camera.bottom = -50;
  scene.add(sun);

  // Ambient
  const ambient = new THREE.AmbientLight(0x6b7d8a, 0.4);
  scene.add(ambient);

  // Hemisphere
  const hemisphere = new THREE.HemisphereLight(0x7dd3fc, 0x3a3530, 0.5);
  scene.add(hemisphere);

  // Fog
  const fog = new THREE.Fog(0x1a2a3a, 30, 90);
  scene.fog = fog;

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starCount = 200;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const r = 80;
    starPositions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
    starPositions[i * 3 + 1] = Math.cos(phi) * r;
    starPositions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.5,
    transparent: true,
    opacity: 0,
    sizeAttenuation: true,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Floating particles (ambient light motes)
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleVelocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 60;
    particlePositions[i * 3 + 1] = Math.random() * 15 + 1;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    particleVelocities[i * 3] = (Math.random() - 0.5) * 0.02;
    particleVelocities[i * 3 + 1] = Math.random() * 0.01;
    particleVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x5eead4,
    size: 0.3,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  return { sun, ambient, hemisphere, skyColors: new THREE.Color(), fog, stars, particles, particleVelocities };
}

export function updateEnvironment(env: Environment, timeOfDay: number, time: number) {
  // Sun position arc
  const sunAngle = (timeOfDay - 0.25) * Math.PI * 2;
  const sunHeight = Math.sin(sunAngle);
  const sunX = Math.cos(sunAngle) * 40;
  const sunY = Math.max(-5, sunHeight * 50);
  env.sun.position.set(sunX, sunY, 20);

  // Light intensity based on time of day
  const dayFactor = Math.max(0, Math.sin(sunAngle));
  env.sun.intensity = 0.3 + dayFactor * 1.2;
  env.ambient.intensity = 0.2 + dayFactor * 0.3;
  env.hemisphere.intensity = 0.2 + dayFactor * 0.4;

  // Sun color (warm at sunrise/sunset, white at noon)
  const warmth = 1 - Math.abs(sunHeight);
  const sunColor = new THREE.Color().setHSL(0.1 - warmth * 0.05, 0.5, 0.5 + dayFactor * 0.3);
  env.sun.color.copy(sunColor);

  // Fog color
  const fogColor = new THREE.Color().setHSL(
    0.55 - warmth * 0.05,
    0.3 + dayFactor * 0.2,
    0.1 + dayFactor * 0.3
  );
  env.fog.color.copy(fogColor);

  // Stars visible at night
  const starMat = env.stars.material as THREE.PointsMaterial;
  starMat.opacity = Math.max(0, 1 - dayFactor * 2);

  // Particle drift
  const positions = env.particles.geometry.attributes.position as THREE.BufferAttribute;
  const arr = positions.array as Float32Array;
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] += env.particleVelocities[i];
    arr[i + 1] += env.particleVelocities[i + 1] + Math.sin(time + i) * 0.005;
    arr[i + 2] += env.particleVelocities[i + 2];
    // Wrap
    if (arr[i + 1] > 16) arr[i + 1] = 1;
    if (Math.abs(arr[i]) > 30) env.particleVelocities[i] *= -1;
    if (Math.abs(arr[i + 2]) > 30) env.particleVelocities[i + 2] *= -1;
  }
  positions.needsUpdate = true;
}
