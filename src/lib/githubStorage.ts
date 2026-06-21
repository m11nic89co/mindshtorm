import type { JsonCanvas } from '../types/jsonCanvas';
import { parseCanvasFile } from './jsonCanvas';

export const GITHUB_OWNER = 'm11nic89co';
export const GITHUB_REPO = 'mindshtorm';
export const GITHUB_CANVASES_DIR = 'canvases';
export const GITHUB_TOKEN_KEY = 'mindshtorm.github.token';
export const GITHUB_ACTIVE_BOARD_KEY = 'mindshtorm.github.activeBoard';

export type GitHubBoardMeta = {
  name: string;
  path: string;
  sha: string;
  size: number;
};

export type ActiveBoard = {
  name: string;
  sha: string;
};

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(base64: string): string {
  const binary = atob(base64.replace(/\n/g, ''));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function getGitHubToken(): string | null {
  return localStorage.getItem(GITHUB_TOKEN_KEY)?.trim() || null;
}

export function setGitHubToken(token: string) {
  localStorage.setItem(GITHUB_TOKEN_KEY, token.trim());
}

export function clearGitHubToken() {
  localStorage.removeItem(GITHUB_TOKEN_KEY);
}

export function getActiveBoard(): ActiveBoard | null {
  try {
    const raw = localStorage.getItem(GITHUB_ACTIVE_BOARD_KEY);
    return raw ? (JSON.parse(raw) as ActiveBoard) : null;
  } catch {
    return null;
  }
}

export function setActiveBoard(board: ActiveBoard | null) {
  if (board) {
    localStorage.setItem(GITHUB_ACTIVE_BOARD_KEY, JSON.stringify(board));
  } else {
    localStorage.removeItem(GITHUB_ACTIVE_BOARD_KEY);
  }
}

async function githubRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getGitHubToken();
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init?.headers) {
    Object.assign(headers, init.headers as Record<string, string>);
  }

  const response = await fetch(`https://api.github.com${path}`, { ...init, headers });
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    const message = payload?.message ?? `GitHub: ошибка ${response.status}`;
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

type GitHubContentFile = {
  type: 'file';
  name: string;
  path: string;
  sha: string;
  size: number;
};

type GitHubContentResponse = GitHubContentFile | GitHubContentFile[];

export async function listGitHubBoards(): Promise<GitHubBoardMeta[]> {
  try {
    const data = await githubRequest<GitHubContentResponse>(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_CANVASES_DIR}`,
    );
    if (!Array.isArray(data)) return [];
    return data
      .filter((file) => file.type === 'file' && file.name.endsWith('.canvas'))
      .map((file) => ({
        name: file.name.replace(/\.canvas$/i, ''),
        path: file.path,
        sha: file.sha,
        size: file.size,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  } catch (error) {
    if (error instanceof Error && /404|not found/i.test(error.message)) return [];
    throw error;
  }
}

export async function loadGitHubBoard(meta: GitHubBoardMeta): Promise<JsonCanvas> {
  const data = await githubRequest<{ content: string }>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${meta.path}`,
  );
  const canvas = parseCanvasFile(fromBase64(data.content));
  setActiveBoard({ name: meta.name, sha: meta.sha });
  return canvas;
}

export async function saveGitHubBoard(name: string, canvas: JsonCanvas): Promise<GitHubBoardMeta> {
  const token = getGitHubToken();
  if (!token) {
    throw new Error('Для сохранения в GitHub нужен токен. Нажмите ⚙ в панели.');
  }

  const safeName = name.trim().replace(/[\\/:*?"<>|]/g, '-');
  if (!safeName) throw new Error('Введите название схемы');

  const filename = `${safeName}.canvas`;
  const path = `${GITHUB_CANVASES_DIR}/${filename}`;
  const active = getActiveBoard();
  let sha: string | undefined;

  if (active?.name === safeName) {
    sha = active.sha;
  } else {
    const existing = (await listGitHubBoards()).find((b) => b.name === safeName);
    sha = existing?.sha;
  }

  const body = {
    message: sha ? `Update canvas: ${filename}` : `Add canvas: ${filename}`,
    content: toBase64(JSON.stringify(canvas, null, 2)),
    ...(sha ? { sha } : {}),
  };

  const result = await githubRequest<{ content: GitHubContentFile }>(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );

  const saved: GitHubBoardMeta = {
    name: safeName,
    path: result.content.path,
    sha: result.content.sha,
    size: result.content.size,
  };
  setActiveBoard({ name: saved.name, sha: saved.sha });
  return saved;
}

export async function deleteGitHubBoard(meta: GitHubBoardMeta): Promise<void> {
  const token = getGitHubToken();
  if (!token) throw new Error('Для удаления нужен GitHub-токен');

  await githubRequest(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${meta.path}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Delete canvas: ${meta.name}.canvas`,
      sha: meta.sha,
    }),
  });

  const active = getActiveBoard();
  if (active?.sha === meta.sha) setActiveBoard(null);
}
