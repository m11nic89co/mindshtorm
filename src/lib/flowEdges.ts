import type { Connection, Edge } from '@xyflow/react';
import { PRESET_COLORS } from './colors';
import { createId } from './id';
import type { JsonCanvasEdge } from '../types/jsonCanvas';

export const FLOW_EDGE_STYLE = {
  stroke: 'rgba(165, 180, 252, 0.65)',
  strokeWidth: 2,
};

export const FLOW_EDGE_LABELS = {
  labelStyle: { fill: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: 500 },
  labelBgStyle: { fill: 'rgba(11, 13, 20, 0.88)', fillOpacity: 1 },
  labelBgPadding: [6, 10] as [number, number],
  labelBgBorderRadius: 8,
};

export function strokeForEdge(color?: JsonCanvasEdge['color']) {
  if (color && color in PRESET_COLORS) {
    return { stroke: PRESET_COLORS[color].border, strokeWidth: 2 };
  }
  return FLOW_EDGE_STYLE;
}

const FLOW_EDGE_BASE = {
  type: 'smoothstep' as const,
  animated: true,
};

export function normalizeFlowEdge(edge: Edge): Edge {
  const color = edge.data?.color as JsonCanvasEdge['color'] | undefined;
  return {
    ...edge,
    ...FLOW_EDGE_BASE,
    style: { ...strokeForEdge(color), ...edge.style },
  };
}

function isSameNodePair(
  sourceA: string,
  targetA: string,
  sourceB: string,
  targetB: string,
): boolean {
  return (
    (sourceA === sourceB && targetA === targetB) || (sourceA === targetB && targetA === sourceB)
  );
}

/** Одна связь на пару карточек; обратное направление переворачивает существующую. */
export function applyConnection(edges: Edge[], connection: Connection): Edge[] {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return edges;

  const idx = edges.findIndex((edge) => isSameNodePair(edge.source, edge.target, source, target));

  const nextEdge: Edge = normalizeFlowEdge({
    id: idx >= 0 ? edges[idx].id : createId('edge'),
    source,
    target,
    sourceHandle,
    targetHandle,
  });

  if (idx >= 0) {
    return edges.map((edge, i) => (i === idx ? { ...edges[idx], ...nextEdge } : edge));
  }

  return [...edges, nextEdge];
}
