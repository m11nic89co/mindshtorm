export function createId(prefix = 'node'): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}
