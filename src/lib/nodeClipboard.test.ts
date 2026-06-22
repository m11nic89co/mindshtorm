import { describe, expect, it } from 'vitest';
import type { Node } from '@xyflow/react';
import type { CardNodeData } from '../types/jsonCanvas';
import { cloneNodeForPaste, isCopyableNode, mergePastedNodes } from './nodeClipboard';

function textNode(id: string, x: number, y: number): Node<CardNodeData> {
  return {
    id,
    type: 'textCard',
    position: { x, y },
    width: 260,
    height: 140,
    data: { canvasType: 'text', text: 'body', label: 'title', color: '12' },
  };
}

describe('nodeClipboard', () => {
  it('detects copyable card and group nodes', () => {
    expect(isCopyableNode(textNode('a', 0, 0))).toBe(true);
    expect(
      isCopyableNode({
        id: 'g',
        type: 'groupCard',
        position: { x: 0, y: 0 },
        data: { canvasType: 'group', label: 'G' },
      }),
    ).toBe(true);
  });

  it('clones node with offset and new id', () => {
    const source = textNode('c1', 100, 80);
    const clone = cloneNodeForPaste(source, 'c2', { x: 28, y: 28 });
    expect(clone.id).toBe('c2');
    expect(clone.position).toEqual({ x: 128, y: 108 });
    expect(clone.selected).toBe(true);
    expect(clone.data).toEqual(source.data);
  });

  it('places pasted groups before cards and deselects existing nodes', () => {
    const existing = [
      textNode('old', 0, 0),
      { ...textNode('sel', 10, 10), selected: true },
    ];
    const pasted = [
      {
        id: 'g2',
        type: 'groupCard' as const,
        position: { x: 50, y: 50 },
        selected: true,
        data: { canvasType: 'group' as const, label: 'G' },
      },
      { ...textNode('c2', 60, 60), selected: true },
    ];

    const next = mergePastedNodes(existing, pasted);
    expect(next.map((n) => n.id)).toEqual(['g2', 'c2', 'old', 'sel']);
    expect(next.every((n) => n.id === 'g2' || n.id === 'c2' ? n.selected : !n.selected)).toBe(true);
  });
});
