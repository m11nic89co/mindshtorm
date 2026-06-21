# MindShtorm

Интерактивная доска для брейншторма в стиле Obsidian Canvas. Формат **JSON Canvas** — доски открываются в Obsidian.

**Онлайн:** https://m11nic89co.github.io/mindshtorm/

**Репозиторий:** https://github.com/m11nic89co/mindshtorm

## Как пользоваться (онлайн)

1. Откройте https://m11nic89co.github.io/mindshtorm/
2. **Двойной клик** по холсту — новая карточка
3. **Перетащите от точки** на карточке — связь с другой
4. **Двойной клик по карточке** — редактировать текст
5. **↓ Экспорт** — скачать `.canvas` для Obsidian
6. **↑ Импорт** — загрузить `.canvas` из Obsidian

Доска сохраняется автоматически в браузере (localStorage).

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте http://localhost:5173

## Обновить сайт в облаке

После изменений в коде:

```bash
npm run deploy:pages
```

## Сборка

```bash
npm run build
npm run preview
```

## Лицензия

MIT
