import type { ReactNode } from 'react';

type ToolbarProps = {
  onAddText: () => void;
  onAddGroup: () => void;
  onImport: () => void;
  onExport: () => void;
  onReset: () => void;
  nodeCount: number;
  edgeCount: number;
};

export function Toolbar({
  onAddText,
  onAddGroup,
  onImport,
  onExport,
  onReset,
  nodeCount,
  edgeCount,
}: ToolbarProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
        <div className="mr-2 flex items-center gap-2 border-r border-white/10 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-lg">
            M
          </div>
          <div>
            <div className="text-sm font-semibold text-white">MindShtorm</div>
            <div className="text-[10px] text-white/45">JSON Canvas · Obsidian</div>
          </div>
        </div>

        <ToolbarButton onClick={onAddText} title="Добавить карточку">
          + Карточка
        </ToolbarButton>
        <ToolbarButton onClick={onAddGroup} title="Добавить группу">
          ◻ Группа
        </ToolbarButton>
        <ToolbarButton onClick={onImport} title="Импорт .canvas">
          ↑ Импорт
        </ToolbarButton>
        <ToolbarButton onClick={onExport} title="Экспорт .canvas">
          ↓ Экспорт
        </ToolbarButton>
        <ToolbarButton onClick={onReset} title="Сбросить к демо">
          ↺ Демо
        </ToolbarButton>

        <div className="ml-2 hidden border-l border-white/10 pl-3 text-xs text-white/40 sm:block">
          {nodeCount} узлов · {edgeCount} связей
        </div>
      </div>
    </header>
  );
}

function ToolbarButton({
  children,
  onClick,
  title,
}: {
  children: ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-xl px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95"
    >
      {children}
    </button>
  );
}

export function HintBar() {
  return (
    <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center p-4">
      <div className="rounded-full border border-white/8 bg-black/25 px-4 py-2 text-[11px] text-white/45 backdrop-blur-xl">
        Двойной клик — карточка · Перетащите от точки — связь · Delete — удалить · Колёсико — масштаб
      </div>
    </footer>
  );
}

export function ColorPicker({
  value,
  onChange,
}: {
  value?: string;
  onChange: (color: string) => void;
}) {
  const colors = ['1', '2', '3', '4', '5', '6'] as const;
  const swatches: Record<string, string> = {
    '1': '#f87171',
    '2': '#fb923c',
    '3': '#facc15',
    '4': '#4ade80',
    '5': '#22d3ee',
    '6': '#c084fc',
  };

  return (
    <div className="pointer-events-auto absolute right-4 top-24 z-20 flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/40">Цвет</span>
      <div className="flex flex-col gap-1.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`h-6 w-6 rounded-full border-2 transition hover:scale-110 ${
              value === c ? 'border-white scale-110' : 'border-transparent'
            }`}
            style={{ background: swatches[c] }}
            title={`Цвет ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
