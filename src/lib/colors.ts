import type { CanvasColor } from '../types/jsonCanvas';

export const PRESET_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  '1': { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(248, 113, 113, 0.45)', glow: 'rgba(239, 68, 68, 0.2)' },
  '2': { bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(251, 146, 60, 0.45)', glow: 'rgba(249, 115, 22, 0.2)' },
  '3': { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(250, 204, 21, 0.45)', glow: 'rgba(234, 179, 8, 0.2)' },
  '4': { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(74, 222, 128, 0.45)', glow: 'rgba(34, 197, 94, 0.2)' },
  '5': { bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(34, 211, 238, 0.45)', glow: 'rgba(6, 182, 212, 0.2)' },
  '6': { bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(192, 132, 252, 0.45)', glow: 'rgba(168, 85, 247, 0.2)' },
};

export const DEFAULT_CARD = {
  bg: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.14)',
  glow: 'rgba(99, 102, 241, 0.15)',
};

export const COLOR_IDS = ['1', '2', '3', '4', '5', '6'] as const satisfies readonly CanvasColor[];

export function resolveColor(color?: CanvasColor) {
  if (!color) return DEFAULT_CARD;
  if (color in PRESET_COLORS) return PRESET_COLORS[color];
  return {
    bg: `${color}20`,
    border: `${color}66`,
    glow: `${color}33`,
  };
}

export function swatchFill(color: CanvasColor): string {
  return PRESET_COLORS[color]?.border ?? DEFAULT_CARD.border;
}
