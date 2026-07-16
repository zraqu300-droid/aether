/**
 * Multi-Level Architecture — Level Definitions
 * نظام المراحل المتعددة
 *
 * Each level is a self-contained config object. To add a new level,
 * append a new entry to the LEVELS array. The LevelSelector reads
 * this array dynamically — no hardcoded count anywhere.
 *
 * Fields:
 * - id:            unique identifier (used for progress tracking)
 * - name:          Arabic display name
 * - subtitle:      short Arabic description
 * - icon:          emoji shown in the level card
 * - mapSize:       terrain size in world units
 * - healNodes:     array of { x, z, radius, type } — positions of healable zones
 * - echoes:        array of { id, name, emoji, x, z, questType, questText, partnerId? }
 * - timeOfDay:     starting time-of-day (0=midnight, 0.5=noon)
 * - biome:         'meadow' | 'desert' | 'forest' | 'highlands' | 'oasis'
 * - insightEnabled: whether the Insight Lens mechanic is available
 * - objective:     Arabic text shown in the HUD
 * - difficulty:    1-5 star rating
 */

export type EchoQuestType = 'meet' | 'heal' | 'protect';

export type LevelEcho = {
  id: string;
  name: string;
  emoji: string;
  x: number;
  z: number;
  questType: EchoQuestType;
  questText: string;
  partnerId: string | null;
};

export type LevelHealNode = { x: number; z: number; radius: number; type: string };

export type Level = {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  mapSize: number;
  biome: string;
  timeOfDay: number;
  insightEnabled: boolean;
  objective: string;
  difficulty: number;
  healNodes: LevelHealNode[];
  echoes: LevelEcho[];
};

export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'مهد الأصداء',
    subtitle: 'بداية الرحلة — تعلّم المشي والإحياء',
    icon: '🌱',
    mapSize: 40,
    biome: 'meadow',
    timeOfDay: 0.35,
    insightEnabled: false,
    objective: 'اقترب من نقطة النور وأحياها',
    difficulty: 1,
    healNodes: [
      { x: 0, z: 0, radius: 7, type: 'grass' },
    ],
    echoes: [],
  },
  {
    id: 2,
    name: 'وادي الأمل الجاف',
    subtitle: 'صحراء قاحلة — اختر أولويتك بحكمة',
    icon: '🏜️',
    mapSize: 60,
    biome: 'desert',
    timeOfDay: 0.45,
    insightEnabled: false,
    objective: 'أحيا ثلاث نقاط ماء وازرع شجرة',
    difficulty: 2,
    healNodes: [
      { x: 10, z: 8, radius: 6, type: 'water' },
      { x: -12, z: 5, radius: 6, type: 'water' },
      { x: 5, z: -14, radius: 6, type: 'grass' },
    ],
    echoes: [
      { id: 'echo-thirsty', name: 'صدى العطش', emoji: '💧', x: 10, z: 12, questType: 'heal', questText: 'أحيا نقطة الماء قربي لأرتوي', partnerId: null },
    ],
  },
  {
    id: 3,
    name: 'الغابة الهامسة',
    subtitle: 'غابة مظلمة — استمع للأصداء وأشفِ جراحهم',
    icon: '🌲',
    mapSize: 70,
    biome: 'forest',
    timeOfDay: 0.2,
    insightEnabled: false,
    objective: 'أشفِ الأصداء المصابة بالاستماع والتعاطف',
    difficulty: 3,
    healNodes: [
      { x: 8, z: 10, radius: 7, type: 'grass' },
      { x: -10, z: -8, radius: 7, type: 'grass' },
      { x: 15, z: -12, radius: 6, type: 'grass' },
      { x: -15, z: 12, radius: 6, type: 'grass' },
    ],
    echoes: [
      { id: 'echo-lost-1', name: 'صدى تائه', emoji: '🦊', x: -10, z: -8, questType: 'meet', questText: 'اسعِ بيني وبين شريكي لنلتقي', partnerId: 'echo-lost-2' },
      { id: 'echo-lost-2', name: 'صدى تائه', emoji: '🦌', x: 15, z: -12, questType: 'meet', questText: 'أنتظر شريكي عند النقطة الوسطى', partnerId: 'echo-lost-1' },
      { id: 'echo-wounded', name: 'صدى جريح', emoji: '🦢', x: 8, z: 10, questType: 'heal', questText: 'أحيا الأرض حولي لأُشفى', partnerId: null },
    ],
  },
  {
    id: 4,
    name: 'هضبة البصيرة',
    subtitle: 'مرتفعات شديدة — استخدم عدسة الاستشراف قبل القرار',
    icon: '⛰️',
    mapSize: 80,
    biome: 'highlands',
    timeOfDay: 0.5,
    insightEnabled: true,
    objective: 'استخدم عدسة البصيرة لتجنّب الانزلاقات',
    difficulty: 4,
    healNodes: [
      { x: 12, z: 10, radius: 5, type: 'grass' },
      { x: -14, z: 8, radius: 5, type: 'grass' },
      { x: 6, z: -16, radius: 5, type: 'grass' },
      { x: -8, z: -14, radius: 5, type: 'grass' },
      { x: 18, z: -4, radius: 5, type: 'grass' },
    ],
    echoes: [
      { id: 'echo-sage', name: 'صدى الحكيم', emoji: '🦉', x: 18, z: -4, questType: 'protect', questText: 'ازرع شجرة تثبّت التربة وتحميني', partnerId: null },
    ],
  },
  {
    id: 5,
    name: 'واحة السلام',
    subtitle: 'واحة كبرى — اجمع كل المهارات لتحقيق الانسجام',
    icon: '🌴',
    mapSize: 100,
    biome: 'oasis',
    timeOfDay: 0.3,
    insightEnabled: true,
    objective: 'أحيا كل النقاط ووافق بين كل الأصداء',
    difficulty: 5,
    healNodes: [
      { x: 14, z: 12, radius: 6, type: 'water' },
      { x: -16, z: 8, radius: 6, type: 'grass' },
      { x: 8, z: -18, radius: 6, type: 'grass' },
      { x: -12, z: -16, radius: 6, type: 'water' },
      { x: 22, z: -6, radius: 6, type: 'grass' },
      { x: -22, z: -2, radius: 6, type: 'grass' },
      { x: 4, z: 22, radius: 6, type: 'water' },
    ],
    echoes: [
      { id: 'echo-peace-1', name: 'صدى السلام', emoji: '🕊️', x: -16, z: 8, questType: 'meet', questText: 'اسعِ بيني وبين شريكي لنلتقي', partnerId: 'echo-peace-2' },
      { id: 'echo-peace-2', name: 'صدى السلام', emoji: '🕊️', x: 22, z: -6, questType: 'meet', questText: 'أنتظر شريكي عند النقطة الوسطى', partnerId: 'echo-peace-1' },
      { id: 'echo-gardener', name: 'صدى البستان', emoji: '🐝', x: 14, z: 12, questType: 'heal', questText: 'أحيا نقطة الماء قربي لتُزهر الأرض', partnerId: null },
      { id: 'echo-guardian', name: 'صدى الحارس', emoji: '🦅', x: 4, z: 22, questType: 'protect', questText: 'ازرع شجرة عتيقة تحمي الواحة', partnerId: null },
    ],
  },
];

export const TOTAL_LEVELS = LEVELS.length;

export function getLevel(id: number): Level | null {
  return LEVELS.find((l) => l.id === id) || null;
}
