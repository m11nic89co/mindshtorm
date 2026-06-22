/** Размер шрифта метки группы по умолчанию (px, ≈ Tailwind text-xs). */
export const DEFAULT_GROUP_LABEL_FONT_SIZE = 12;

export const MIN_GROUP_LABEL_FONT_SIZE = 8;

/** Максимальный размер шрифта и бейджа названия группы (px). */
export const MAX_GROUP_LABEL_FONT_SIZE = 200;

export const GROUP_LABEL_BADGE_MAX_SIZE = MAX_GROUP_LABEL_FONT_SIZE;

export function clampGroupLabelFontSize(size: number): number {
  return Math.min(
    MAX_GROUP_LABEL_FONT_SIZE,
    Math.max(MIN_GROUP_LABEL_FONT_SIZE, Math.round(size)),
  );
}

export function resolveGroupLabelFontSize(size?: number): number {
  if (size == null || !Number.isFinite(size)) return DEFAULT_GROUP_LABEL_FONT_SIZE;
  return clampGroupLabelFontSize(size);
}

export type GroupLabelBadgeStyle = {
  fontSize: number;
  maxWidth: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  top: number;
};

/** Стили бейджа названия группы: масштабируются с размером шрифта, cap — 200 px. */
export function groupLabelBadgeStyle(fontSize?: number): GroupLabelBadgeStyle {
  const fs = resolveGroupLabelFontSize(fontSize);
  const padX = Math.max(8, Math.round(fs * 0.35));
  const padY = Math.max(2, Math.round(fs * 0.12));
  return {
    fontSize: fs,
    maxWidth: GROUP_LABEL_BADGE_MAX_SIZE,
    paddingLeft: padX,
    paddingRight: padX,
    paddingTop: padY,
    paddingBottom: padY,
    top: -Math.round(fs * 0.45),
  };
}
