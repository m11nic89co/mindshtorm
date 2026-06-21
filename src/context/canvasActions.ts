import { createContext, useContext } from 'react';
import type { CardNodeData } from '../types/jsonCanvas';

type CanvasActions = {
  updateNode: (id: string, patch: Partial<CardNodeData>) => void;
  onGroupResizeStart?: (groupId: string) => void;
  onGroupResize?: (
    groupId: string,
    params: { x: number; y: number; width: number; height: number },
  ) => void;
  onGroupResizeEnd?: (groupId: string) => void;
};

export const CanvasActionsContext = createContext<CanvasActions | null>(null);

export function useCanvasActions() {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx) throw new Error('CanvasActionsContext missing');
  return ctx;
}
