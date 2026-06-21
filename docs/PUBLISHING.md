# Публикация MindStorm (бесплатно)

MindStorm уже **опубликован** как веб-приложение:

**https://m11nic89co.github.io/mindstorm/**

Репозиторий открыт: https://github.com/m11nic89co/mindstorm  
Лицензия: **MIT** — любой может пользоваться; авторство указано в коде и в footer сайта.

---

## Что уже сделано без оплат

| Канал | Статус | Стоимость |
|-------|--------|-----------|
| **GitHub Pages** | Live, CI при push в `main` | $0 |
| **PWA** | Установка из Chrome/Edge («Установить приложение») | $0 |
| **Open Graph** | Превью при шаринге в Telegram, VK, Twitter | $0 |
| **robots.txt** | Индексация поисковиками | $0 |
| **MIT LICENSE** | Юридически открытый код | $0 |

---

## Как люди находят приложение

1. **Ссылка** — отправьте https://m11nic89co.github.io/mindstorm/
2. **GitHub** — README, Topics на репо (`mindmap`, `brainstorm`, `obsidian`, `react`)
3. **Соцсети** — пост с скриншотом; OG-теги подтянут иконку и описание
4. **Установка на ПК** — Edge/Chrome → меню → «Установить MindStorm»

Платные магазины (Microsoft Store ~$19, Apple $99/год, Google Play $25) **не обязательны** для бесплатного распространения.

---

## Кнопка «Донат»

Внизу экрана, рядом с авторством: **by m11nic89co · ☕ Донат · mindstorm**

### Настройка (один раз)

**Вариант A — в коде** (`src/config/donate.ts`):

```typescript
export const DONATE_WALLETS: DonateWallet[] = [
  { label: 'USDT TRC-20', wallet: 'TYourWalletAddress...' },
  { label: 'TON', wallet: 'UQ...' },
];

export const DONATE_LINK = 'https://boosty.to/yourname'; // опционально
```

**Вариант B — через `.env`** (для локальной сборки, не коммитить секреты не нужно — адрес публичный):

```env
VITE_DONATE_WALLET=TYour...
VITE_DONATE_LABEL=USDT TRC-20
VITE_DONATE_LINK=https://boosty.to/...
```

После `git push origin main` кнопка появится на live-сайте (если указан хотя бы один кошелёк или ссылка).

Пользователь нажимает **Донат** → копирует адрес → переводит в своём кошельке. Комиссий посредникам нет.

### Бесплатные альтернативы донату

- **GitHub Sponsors** — https://github.com/sponsors (бесплатно для open source)
- **Boosty** — бесплатный тариф для авторов
- **Ko-fi** — бесплатный tier

Можно указать ссылку в `DONATE_LINK` вместо крипто-кошелька.

---

## Деплой после изменений

```powershell
git add .
git commit -m "..."
git push origin main
```

CI: `.github/workflows/deploy.yml` → ~30–60 с → Ctrl+Shift+R на сайте.

---

## Авторство

- Copyright: **m11nic89co** (см. `LICENSE`)
- Footer на сайте: `by m11nic89co`
- `package.json`: `"author": "m11nic89co"`

При форке сохраняйте copyright и лицензию MIT.
