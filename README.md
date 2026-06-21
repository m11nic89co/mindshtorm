# MindStorm

Интерактивная доска для брейншторма в стиле Obsidian Canvas.

**Онлайн:** https://m11nic89co.github.io/mindshtorm/

## Как пользоваться

1. **Двойной клик** по холсту — новая карточка
2. **Перетащите от точки** на карточке — связь
3. **Сохранить** — скачать файл `.mindstorm` на компьютер
4. **Загрузить** — открыть сохранённый файл с диска
5. Черновик автоматически хранится в браузере (localStorage)

## Формат файла `.mindstorm`

JSON-файл с метаданными и схемой:

```json
{
  "format": "mindstorm-board",
  "version": 1,
  "title": "моя-схема",
  "savedAt": "2026-06-21T12:00:00.000Z",
  "canvas": { "nodes": [], "edges": [] }
}
```

Поле `canvas` — стандарт **JSON Canvas** (совместим с Obsidian `.canvas`).

Старые файлы `.mindshtorm` по-прежнему открываются.

## Локальный запуск

```bash
npm install
npm run dev
```

## Деплой на GitHub Pages

```bash
npm run deploy:pages
```

## Лицензия

MIT
