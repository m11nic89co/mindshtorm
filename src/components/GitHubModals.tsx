import { useCallback, useEffect, useState } from 'react';
import type { JsonCanvas } from '../types/jsonCanvas';
import {
  clearGitHubToken,
  getActiveBoard,
  getGitHubToken,
  listGitHubBoards,
  loadGitHubBoard,
  saveGitHubBoard,
  setGitHubToken,
  type GitHubBoardMeta,
} from '../lib/githubStorage';

type ModalShellProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

function ModalShell({ title, onClose, children }: ModalShellProps) {
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#12162a]/95 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

export function GitHubSettingsModal({ onClose }: { onClose: () => void }) {
  const [token, setToken] = useState(getGitHubToken() ?? '');

  return (
    <ModalShell title="GitHub — настройки" onClose={onClose}>
      <p className="mb-3 text-xs leading-relaxed text-white/55">
        Токен нужен только для <strong className="text-white/75">сохранения</strong> схем в репозиторий{' '}
        <code className="text-indigo-300">m11nic89co/mindshtorm</code>. Чтение списка работает без токена.
      </p>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">
        Personal Access Token
      </label>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="github_pat_..."
        className="mb-3 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-indigo-400/40 focus:ring-2"
      />
      <p className="mb-4 text-[11px] text-white/40">
        Создайте токен: GitHub → Settings → Developer settings → Fine-grained token → доступ{' '}
        <strong>Contents: Read and write</strong> для репозитория mindshtorm.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setGitHubToken(token);
            onClose();
          }}
          className="flex-1 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-400"
        >
          Сохранить токен
        </button>
        <button
          type="button"
          onClick={() => {
            clearGitHubToken();
            setToken('');
          }}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/5"
        >
          Очистить
        </button>
      </div>
    </ModalShell>
  );
}

export function SaveToGitHubModal({
  defaultName,
  canvas,
  onClose,
  onSaved,
}: {
  defaultName?: string;
  canvas: JsonCanvas;
  onClose: () => void;
  onSaved: (name: string) => void;
}) {
  const active = getActiveBoard();
  const [name, setName] = useState(defaultName ?? active?.name ?? 'моя-схема');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setBusy(true);
    setError(null);
    try {
      const saved = await saveGitHubBoard(name, canvas);
      onSaved(saved.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="↑ Сохранить в GitHub" onClose={onClose}>
      <p className="mb-3 text-xs text-white/55">
        Схема будет сохранена в папку <code className="text-cyan-300">canvases/</code> вашего репозитория.
      </p>
      <label className="mb-1 block text-[10px] uppercase tracking-wider text-white/40">Название</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none ring-indigo-400/40 focus:ring-2"
        placeholder="брейншторм-2026"
      />
      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={handleSave}
        className="w-full rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-400 disabled:opacity-50"
      >
        {busy ? 'Сохраняю…' : 'Сохранить в GitHub'}
      </button>
    </ModalShell>
  );
}

export function LoadFromGitHubModal({
  onClose,
  onLoad,
}: {
  onClose: () => void;
  onLoad: (canvas: JsonCanvas, name: string) => void;
}) {
  const [boards, setBoards] = useState<GitHubBoardMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPath, setBusyPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBoards(await listGitHubBoards());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить список');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openBoard = async (meta: GitHubBoardMeta) => {
    setBusyPath(meta.path);
    setError(null);
    try {
      const canvas = await loadGitHubBoard(meta);
      onLoad(canvas, meta.name);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка открытия');
    } finally {
      setBusyPath(null);
    }
  };

  return (
    <ModalShell title="↓ Открыть из GitHub" onClose={onClose}>
      <p className="mb-3 text-xs text-white/55">
        Схемы из папки <code className="text-cyan-300">canvases/</code> в репозитории GitHub.
      </p>

      {loading && <p className="text-sm text-white/45">Загружаю список…</p>}
      {error && <p className="mb-3 text-xs text-red-300">{error}</p>}

      {!loading && boards.length === 0 && (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/40">
          Пока нет сохранённых схем. Нажмите ↑ Импорт, чтобы сохранить первую.
        </p>
      )}

      <ul className="space-y-2">
        {boards.map((board) => (
          <li key={board.path}>
            <button
              type="button"
              disabled={busyPath === board.path}
              onClick={() => void openBoard(board)}
              className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left transition hover:border-indigo-400/40 hover:bg-white/8 disabled:opacity-50"
            >
              <span className="text-sm font-medium text-white">{board.name}</span>
              <span className="text-[11px] text-white/35">
                {busyPath === board.path ? 'Открываю…' : `${Math.round(board.size / 1024) || 1} KB`}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => void refresh()}
        className="mt-4 w-full rounded-xl border border-white/10 py-2 text-xs text-white/50 transition hover:bg-white/5"
      >
        Обновить список
      </button>
    </ModalShell>
  );
}
