import { describe, expect, it } from 'vitest';
import {
  clampGroupLabelFontSize,
  groupLabelBadgeStyle,
  MAX_GROUP_LABEL_FONT_SIZE,
  resolveGroupLabelFontSize,
} from './groupLabel';

describe('groupLabel', () => {
  it('defaults to 12px and clamps up to 200px', () => {
    expect(resolveGroupLabelFontSize()).toBe(12);
    expect(clampGroupLabelFontSize(500)).toBe(MAX_GROUP_LABEL_FONT_SIZE);
    expect(clampGroupLabelFontSize(3)).toBe(8);
  });

  it('scales badge padding and caps badge width at 200px', () => {
    const small = groupLabelBadgeStyle(12);
    const large = groupLabelBadgeStyle(200);
    expect(small.maxWidth).toBe(200);
    expect(large.maxWidth).toBe(200);
    expect(large.fontSize).toBe(200);
    expect(large.paddingLeft).toBeGreaterThan(small.paddingLeft);
  });
});
