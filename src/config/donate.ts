/**
 * Пять способов доната MindStorm (2026).
 *
 * Порядок — по скорости checkout и мировому охвату:
 * PayPal → Ko-fi → Buy Me a Coffee → Boosty → USDT.
 *
 * PayPal: замените ник в URL, если paypal.me другой (Profile → PayPal.Me).
 * Остальное — зарегистрируйте страницу с тем же ником или обновите url.
 */

export type DonateWallet = {
  label: string;
  wallet: string;
  min?: string;
};

export type DonatePlatform =
  | 'paypal'
  | 'kofi'
  | 'buymeacoffee'
  | 'boosty'
  | 'crypto';

export type DonateLinkMethod = {
  id: string;
  kind: 'link';
  platform: Exclude<DonatePlatform, 'crypto'>;
  label: string;
  url: string;
  hintRu: string;
  hintEn: string;
};

export type DonateCryptoMethod = {
  id: string;
  kind: 'crypto';
  platform: 'crypto';
  label: string;
  hintRu: string;
  hintEn: string;
  wallets: DonateWallet[];
};

export type DonateMethod = DonateLinkMethod | DonateCryptoMethod;

const HANDLE = 'm11nic89co';

const envPaypal = import.meta.env.VITE_PAYPAL_ME?.trim() ?? '';
const envKofi = import.meta.env.VITE_DONATE_KOFI?.trim() ?? '';
const envBmc = import.meta.env.VITE_DONATE_BMC?.trim() ?? '';
const envBoosty = import.meta.env.VITE_DONATE_BOOSTY?.trim() ?? '';

const USDT_WALLETS: DonateWallet[] = [
  {
    label: 'Tron (TRC20)',
    wallet: 'TJDeM6zHao6jKUVhf2fLcACL3DmwqwP8aX',
    min: '0,01 USDT',
  },
  {
    label: 'TON',
    wallet: 'UQA1Xz5oPR3BhldHDfgxRQ8GIf3fDjYk-M4iidzdDaOd6Ylj',
    min: '0,001 USDT',
  },
];

/** Ровно 5 способов — одна панель, один клик до оплаты (кроме выбора сети USDT). */
export const DONATE_METHODS: DonateMethod[] = [
  {
    id: 'paypal',
    kind: 'link',
    platform: 'paypal',
    label: 'PayPal',
    url: envPaypal || `https://paypal.me/${HANDLE}`,
    hintRu: 'PayPal, карта — без регистрации у получателя',
    hintEn: 'PayPal balance or card — 1–2 taps',
  },
  {
    id: 'kofi',
    kind: 'link',
    platform: 'kofi',
    label: 'Ko-fi',
    url: envKofi || `https://ko-fi.com/${HANDLE}`,
    hintRu: 'Карта, PayPal, Apple Pay — 0% комиссии платформы',
    hintEn: 'Card, PayPal, Apple Pay — 0% platform fee',
  },
  {
    id: 'buymeacoffee',
    kind: 'link',
    platform: 'buymeacoffee',
    label: 'Buy Me a Coffee',
    url: envBmc || `https://buymeacoffee.com/${HANDLE}`,
    hintRu: 'Карта, Apple/Google Pay — привычный «кофе»-донат',
    hintEn: 'Card, Apple/Google Pay — familiar tip flow',
  },
  {
    id: 'boosty',
    kind: 'link',
    platform: 'boosty',
    label: 'Boosty',
    url: envBoosty || `https://boosty.to/${HANDLE}/donate`,
    hintRu: 'Россия и СНГ: карта, СБП',
    hintEn: 'Russia & CIS: card, local bank apps',
  },
  {
    id: 'usdt',
    kind: 'crypto',
    platform: 'crypto',
    label: 'USDT',
    hintRu: 'Криптовалюта — Tron или TON, скопировать адрес',
    hintEn: 'Crypto — Tron or TON, copy address',
    wallets: USDT_WALLETS,
  },
].filter((method) => {
  if (method.kind === 'link') return method.url.trim().length > 0;
  return method.wallets.some((w) => w.wallet.trim().length > 0);
});

export function hasDonateOptions(): boolean {
  return DONATE_METHODS.length > 0;
}
