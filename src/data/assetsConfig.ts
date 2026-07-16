/**
 * Centralized Assets Configuration
 * نظام إدارة الأصول المركزي
 *
 * All 3D model paths and 2D texture/image paths are defined here.
 * To add a new asset, simply add a new key to the appropriate category.
 * Components reference assets through this config — never hardcode paths.
 */

export const ASSETS_CONFIG = {
  models: {
    envoy: '/assets/models/envoy.glb',
    echoSpirit: '/assets/models/echo.glb',
    healedTree: '/assets/models/tree.glb',
    barrenWell: '/assets/models/well.glb',
    flower: '/assets/models/flower.glb',
    rock: '/assets/models/rock.glb',
  },
  textures: {
    skybox: '/assets/images/sky.jpg',
    barrenGround: '/assets/images/dirt.jpg',
    healedGround: '/assets/images/grass.jpg',
    waterNormal: '/assets/images/water_normal.jpg',
    bark: '/assets/images/bark.jpg',
    particle: '/assets/images/particle.png',
  },
  audio: {
    bgm: '/assets/audio/ambient.mp3',
    heal: '/assets/audio/heal.mp3',
    echo: '/assets/audio/echo.mp3',
    victory: '/assets/audio/victory.mp3',
  },
} as const;

/**
 * Get an asset path by dot-notation key.
 * Example: getAsset('models.envoy') => '/assets/models/envoy.glb'
 */
export function getAsset(key: string): string {
  const parts = key.split('.');
  let current: unknown = ASSETS_CONFIG;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      console.warn(`[assetsConfig] Asset not found: ${key}`);
      return '';
    }
  }
  return current as string;
}
