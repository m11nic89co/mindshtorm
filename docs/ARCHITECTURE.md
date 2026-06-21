# Архитектура MindStorm

## Обзор

```
┌─────────────────────────────────────────────────────────┐
│  Browser                                                │
│  LocaleProvider (RU/EN)                                 │
│  ┌─────────────┐    ┌─────────────────────────────────┐ │
│  │ Toolbar     │    │ React Flow (MindCanvas)         │ │
│  │ Undo/Redo   │    │  · TextCardNode (z=1)           │ │
│  │ Save/Open   │    │  · GroupCardNode (z=-1)         │ │
│  │ Сначала/Демо│    │  · Edges (z=0, animated)        │ │
│  │ RU | EN     │    └─────────────────────────────────┘ │
│  └─────────────┘                                        │
│  SelectionPanel ──► название + 12 цветов                │
│  EdgeSelectionPanel ► подпись связи                     │
│         │                                               │
│         ▼                                               │
│  localStorage ◄──────── flowToCanvas / canvasToFlow     │
│  .mindstorm file ◄────── localBoardFile.ts              │
└─────────────────────────────────────────────────────────┘
```

## Поток данных

1. **Старт:** `mindstorm.canvas.v1` → `canvasToFlow` → state; если пусто — `getDemoCanvas(readLocale())`.
2. **Редактирование:** debounce 400 ms → localStorage; history commit на drag stop.
3. **Сохранить:** `flowToCanvas` → `MindStormBoardFile` → диск.
4. **Загрузить:** File → `parseBoardFile` → state.
5. **Сначала:** confirm → `commitNow()` → пустые nodes/edges **без** `resetHistory` → Undo.
6. **Демо:** `demoFlowPresentation(locale)` → анимация появления.

## Локализация

| Модуль | Роль |
|--------|------|
| `messages.ts` | Словари `messagesRu` / `messagesEn` |
| `LocaleProvider.tsx` | React-контекст, `document.documentElement.lang` |
| `localeStorage.ts` | Ключ `mindstorm.locale.v1` |

Компоненты: `const { locale, m } = useLocale()` — все видимые строки из `m.*`.

Демо-контент на доске — отдельно: `getDemoCanvas(locale)` (не переводится автоматически при смене языка).

## React Flow

- Узлы: `textCard`, `groupCard`.
- Рёбра: `smoothstep`, `animated`, цвет от **source**, стрелка на **target**.
- Handles: `EdgeHandles` — 8 точек (`source-{side}-{a|b}`), `ConnectionMode.Loose`.
- `zIndexMode="manual"`, `elevateNodesOnSelect={false}`.

## Слои (z-index)

- `.react-flow__node-groupCard` → `z-index: -1`
- `.react-flow__edges` → `z-index: 0`
- Карточки → `z-index: 1+`

Метки групп и badge карточек — внутри узла (`absolute`, `-top-3`).

## Панели выделения

| Панель | Когда | Содержимое |
|--------|-------|------------|
| `SelectionPanel` | Выбран узел | Название, 12 цветов (6×2) |
| `EdgeSelectionPanel` | Выбрана связь | Подпись, удаление |

## Контекст React

- `CanvasActionsContext` — `updateNode(id, patch)`.
- `useCanvasHistory` — undo/redo; пауза при drag.
- `useRightClickMarquee` — ПКМ-рамка; группы по границе.
- `boardStorage.ts` — черновик и имя доски.

## Toolbar: стили кнопок

| Кнопка | Стиль |
|--------|--------|
| **Сначала** / **New** | `accent` (бирюзовая рамка) |
| **↺ Демо** / **↺ Demo** | обычная |
| **RU \| EN** | компактный переключатель справа |

## PWA

- `public/manifest.webmanifest`, иконки — имя **MindStorm**.
