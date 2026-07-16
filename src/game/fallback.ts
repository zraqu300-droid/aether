/**
 * Bulletproof 3D Fallback System
 *
 * Since the .glb model files and texture files don't exist yet on disk,
 * we must NOT pass their paths to useGLTF / useTexture — doing so crashes
 * the R3F Canvas with a loading error that suspends the tree indefinitely.
 *
 * Instead, every 3D component checks `isUsingFallback`. When true (the
 * current state — no asset files exist), components render beautiful
 * glowing primitive geometries (sphereGeometry, capsuleGeometry, etc.)
 * with neon emissive materials. The canvas loads instantly, zero network
 * requests, zero suspense crashes.
 *
 * When real assets are added to /public/assets/, simply set
 * `isUsingFallback = false` in this file and the components will switch
 * to loading the GLB / texture paths from ASSETS_CONFIG.
 */

import { ASSETS_CONFIG } from '../data/assetsConfig';

// ── Master switch ──────────────────────────────────────────────
// Set to `false` once real .glb / texture files are placed in /public/assets/.
export const isUsingFallback: boolean = true;

// ── Asset path accessor (safe — only used when isUsingFallback is false) ──
export function getModelPath(key: keyof typeof ASSETS_CONFIG.models): string {
  return ASSETS_CONFIG.models[key];
}

export function getTexturePath(key: keyof typeof ASSETS_CONFIG.textures): string {
  return ASSETS_CONFIG.textures[key];
}

// ── Fallback color palette (neon-pastel) ────────────────────────
export const FALLBACK_COLORS = {
  envoy: 0x5eead4,
  envoyEmissive: 0x14b8a6,
  envoyHead: 0x7dd3fc,
  envoyHeadEmissive: 0x0ea5e9,
  echoMeet: 0xfbbf24,
  echoHeal: 0x38bdf8,
  echoProtect: 0x5eead4,
  healNode: 0x5eead4,
  healBeam: 0x2dd4bf,
  tree: 0x22c55e,
  treeEmissive: 0x16a34a,
  aura: 0x2dd4bf,
} as const;
