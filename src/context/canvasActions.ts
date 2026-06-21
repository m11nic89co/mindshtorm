import { createContext, useContext } from 'react';
import type { CardNodeData } from '../types/jsonCanvas';

type CanvasActions = {
  updateNode: (id: string, patch: Partial<CardNodeData>) => void;
};

export const CanvasActionsContext = createContext<CanvasActions | null>(null);

export function useCanvasActions() {
  const ctx = useContext(CanvasActionsContext);
  if (!ctx) throw new Error('CanvasActionsContext missing');
  return ctx;
}
