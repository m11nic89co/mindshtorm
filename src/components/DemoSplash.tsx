import { useEffect } from 'react';

type DemoSplashProps = {
  visible: boolean;
  onDone: () => void;
  nodeCount: number;
  edgeCount: number;
  groupCount: number;
};

export function DemoSplash({
  visible,
  onDone,
  nodeCount,
  edgeCount,
  groupCount,
}: DemoSplashProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(onDone, 2800);
    return () => window.clearTimeout(timer);
  }, [visible, onDone]);

  if (!visible) return null;

  return (
    <div className="demo-splash pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
      <div className="demo-splash-card flex flex-col items-center gap-3 rounded-3xl border border-white/15 bg-[#12162a]/92 px-8 py-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="demo-splash-glow flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl text-cyan-300">
          ✦
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Демо MindStorm</h2>
          <p className="mt-1 text-sm text-white/55">Запуск продукта — исследуйте схему</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-white/45">
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            {nodeCount} карточек
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            {groupCount} группы
          </span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
            {edgeCount} связи
          </span>
        </div>
      </div>
    </div>
  );
}
