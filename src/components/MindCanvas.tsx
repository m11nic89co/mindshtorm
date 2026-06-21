import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CanvasActionsContext } from '../context/canvasActions';
import { SaveBoardModal } from './FileModals';
import { DemoSplash, DEMO_WELCOME_SEEN_KEY } from './DemoSplash';
import { Toast } from './Toast';
import { canvasToFlow, flowToCanvas } from '../lib/jsonCanvas';
import { applyConnection, FLOW_EDGE_STYLE } from '../lib/flowEdges';
import { DEMO_BOARD_NAME, demoFlowPresentation, demoStats } from '../lib/demoCanvas';
import { createId } from '../lib/id';
import {
  CANVAS_STORAGE_KEY,
  LEGACY_CANVAS_STORAGE_KEY,
  loadStoredCanvas,
  readBoardName,
  writeBoardName,
} from '../lib/boardStorage';
import {
  BOARD_FILE_ACCEPT,
  SaveCancelledError,
  canUseSaveFilePicker,
  readBoardFromFile,
  saveBoardToDisk,
  saveSuccessMessage,
  titleFromFilename,
} from '../lib/localBoardFile';
import type { CardNodeData, JsonCanvas } from '../types/jsonCanvas';
import { HintBar, SelectionPanel, Toolbar } from './Toolbar';
import { GroupCardNode, TextCardNode } from './nodes/CardNodes';
import { useCanvasHistory } from '../hooks/useCanvasHistory';
import { useCanvasShortcuts } from '../hooks/useCanvasShortcuts';
import { useDebouncedPersist } from '../hooks/useDebouncedPersist';

const nodeTypes: NodeTypes = {
  textCard: TextCardNode,
  groupCard: GroupCardNode,
};

function MindCanvasInner() {
  const initialFlow = useMemo(() => canvasToFlow(loadStoredCanvas()), []);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CardNodeData>>(initialFlow.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialFlow.edges);
  const { canUndo, canRedo, undo, redo, resetHistory } = useCanvasHistory(nodes, edges, setNodes, setEdges);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [demoRevealing, setDemoRevealing] = useState(false);
  const [demoSplash, setDemoSplash] = useState(false);
  const demoStatsMemo = useMemo(() => demoStats(), []);
  const [activeBoardName, setActiveBoardName] = useState<string | null>(() => readBoardName());

  useDebouncedPersist(nodes, edges);

  const selectedNode = nodes.find((n) => n.selected);

  const showToast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current);
    setToastMessage(message);
    toastTimer.current = window.setTimeout(() => setToastMessage(null), 4500);
  }, []);

  useEffect(() => writeBoardName(activeBoardName), [activeBoardName]);

  useEffect(() => {
    return () => window.clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(CANVAS_STORAGE_KEY) || localStorage.getItem(LEGACY_CANVAS_STORAGE_KEY)) {
        return;
      }
      if (localStorage.getItem(DEMO_WELCOME_SEEN_KEY)) return;
    } catch {
      return;
    }
    setDemoSplash(true);
  }, []);

  const closeDemoSplash = useCallback(() => {
    setDemoSplash(false);
    try {
      localStorage.setItem(DEMO_WELCOME_SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
  }, []);

  const updateNode = useCallback(
    (id: string, patch: Partial<CardNodeData>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [setNodes],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => applyConnection(eds, connection));
    },
    [setEdges],
  );

  const addTextCard = useCallback(
    (position?: { x: number; y: number }) => {
      const center = screenToFlowPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      const node: Node<CardNodeData> = {
        id: createId('text'),
        type: 'textCard',
        position: position ?? { x: center.x - 130, y: center.y - 60 },
        style: { width: 260, height: 120 },
        data: {
          canvasType: 'text',
          text: '## Новая идея\nОпишите мысль...',
          color: '5',
        },
        zIndex: 1,
      };
      setNodes((nds) => [...nds, node]);
    },
    [screenToFlowPosition, setNodes],
  );

  const addGroup = useCallback(() => {
    const center = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const node: Node<CardNodeData> = {
      id: createId('group'),
      type: 'groupCard',
      position: { x: center.x - 200, y: center.y - 120 },
      style: { width: 420, height: 260 },
      data: { canvasType: 'group', label: 'Группа', color: '5' },
      zIndex: -1,
      selectable: true,
      draggable: true,
    };
    setNodes((nds) => [node, ...nds]);
  }, [screenToFlowPosition, setNodes]);

  const paneClickRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now();
      const prev = paneClickRef.current;

      if (
        prev &&
        now - prev.time < 400 &&
        Math.hypot(event.clientX - prev.x, event.clientY - prev.y) < 12
      ) {
        paneClickRef.current = null;
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
        addTextCard({ x: position.x - 130, y: position.y - 60 });
        return;
      }

      paneClickRef.current = { time: now, x: event.clientX, y: event.clientY };
    },
    [addTextCard, screenToFlowPosition],
  );

  const applyFlow = useCallback(
    (flow: { nodes: Node<CardNodeData>[]; edges: Edge[] }) => {
      setNodes(flow.nodes);
      setEdges(flow.edges);
      resetHistory(flow.nodes, flow.edges);
    },
    [resetHistory, setEdges, setNodes],
  );

  const loadCanvas = useCallback(
    (canvas: JsonCanvas, name?: string) => {
      applyFlow(canvasToFlow(canvas));
      setActiveBoardName(name ?? null);
      setLoadError(null);
    },
    [applyFlow],
  );

  const onReset = useCallback(() => {
    const flow = demoFlowPresentation();
    applyFlow(flow);
    setActiveBoardName(DEMO_BOARD_NAME);
    setLoadError(null);
    setDemoRevealing(true);
    setDemoSplash(true);

    window.setTimeout(() => {
      void fitView({ padding: 0.1, duration: 1100, maxZoom: 1.05 });
    }, 60);

    window.setTimeout(() => setDemoRevealing(false), 2800);
  }, [applyFlow, fitView]);

  const onSave = useCallback(async () => {
    const title = activeBoardName?.trim() || 'моя-схема';

    if (canUseSaveFilePicker()) {
      try {
        const result = await saveBoardToDisk(title, flowToCanvas(nodes, edges));
        const savedTitle = titleFromFilename(result.filename);
        setActiveBoardName(savedTitle);
        showToast(saveSuccessMessage(result));
        return;
      } catch (err) {
        if (err instanceof SaveCancelledError) return;
      }
    }

    setSaveModalOpen(true);
  }, [activeBoardName, nodes, edges, showToast]);

  const onPickFile = useCallback(() => {
    setLoadError(null);
    fileInputRef.current?.click();
  }, []);

  const onFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;

      try {
        const { title, canvas } = await readBoardFromFile(file);
        loadCanvas(canvas, title);
        showToast(`Открыто: ${file.name}`);
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить файл');
      }
    },
    [loadCanvas, showToast],
  );

  const deleteSelection = useCallback(() => {
    setNodes((nds) => nds.filter((n) => !n.selected));
    setEdges((eds) => eds.filter((e) => !e.selected));
  }, [setEdges, setNodes]);

  useCanvasShortcuts({ undo, redo, onDeleteSelection: deleteSelection });

  const actions = useMemo(() => ({ updateNode }), [updateNode]);
  const currentCanvas = useMemo(() => flowToCanvas(nodes, edges), [nodes, edges]);

  return (
    <CanvasActionsContext.Provider value={actions}>
      <div
        className="relative h-dvh w-screen overflow-hidden bg-[#0b0d14]"
        data-demo-welcome={demoSplash || undefined}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(99,102,241,0.18),transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(168,85,247,0.12),transparent_50%)]" />

        <Toolbar
          onAddText={() => addTextCard()}
          onAddGroup={addGroup}
          onSave={() => void onSave()}
          onLoad={onPickFile}
          onReset={onReset}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          activeBoardName={activeBoardName}
        />

        <DemoSplash
          visible={demoSplash}
          onClose={closeDemoSplash}
          nodeCount={demoStatsMemo.nodes}
          edgeCount={demoStatsMemo.edges}
          groupCount={demoStatsMemo.groups}
        />

        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}

        {loadError && (
          <Toast message={loadError} variant="error" onClose={() => setLoadError(null)} />
        )}

        {selectedNode && (
          <SelectionPanel
            nodeType={selectedNode.data.canvasType}
            color={selectedNode.data.color}
            label={selectedNode.data.label}
            onColorChange={(color) => updateNode(selectedNode.id, { color })}
            onLabelChange={(label) => updateNode(selectedNode.id, { label })}
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={BOARD_FILE_ACCEPT}
          className="hidden"
          onChange={(e) => void onFileSelected(e)}
        />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2}
          panOnScroll={false}
          zoomOnScroll
          zoomActivationKeyCode={null}
          zoomOnPinch
          zoomOnDoubleClick={false}
          selectionOnDrag={false}
          zIndexMode="manual"
          elevateNodesOnSelect={false}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: FLOW_EDGE_STYLE,
          }}
          connectionLineStyle={FLOW_EDGE_STYLE}
          proOptions={{ hideAttribution: true }}
          className={`mind-canvas${demoRevealing ? ' mind-canvas--demo-reveal' : ''}`}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="rgba(255,255,255,0.06)" />
          <Controls
            showInteractive={false}
            position="bottom-left"
            className="!mb-[calc(3.5rem+env(safe-area-inset-bottom))] !ml-2 !rounded-xl !border !border-white/10 !bg-white/5 !shadow-xl !backdrop-blur-xl [&>button]:!h-8 [&>button]:!w-8 [&>button]:!border-white/10 [&>button]:!bg-transparent [&>button]:!text-white/70 [&>button:hover]:!bg-white/10 sm:!mb-4 sm:!ml-4"
          />
          <MiniMap
            nodeColor={() => 'rgba(99, 102, 241, 0.55)'}
            maskColor="rgba(0,0,0,0.65)"
            className="!mb-[calc(3.5rem+env(safe-area-inset-bottom))] !mr-2 !hidden !rounded-xl !border !border-white/10 !bg-black/40 !backdrop-blur-md sm:!mb-4 sm:!mr-4 sm:!block"
          />
        </ReactFlow>

        <HintBar />

        {saveModalOpen && (
          <SaveBoardModal
            canvas={currentCanvas}
            defaultName={activeBoardName ?? undefined}
            onClose={() => setSaveModalOpen(false)}
            onSaved={(name, message) => {
              setActiveBoardName(name);
              showToast(message);
            }}
          />
        )}
      </div>
    </CanvasActionsContext.Provider>
  );
}

export function MindCanvas() {
  return (
    <ReactFlowProvider>
      <MindCanvasInner />
    </ReactFlowProvider>
  );
}
