# Настройка 5 способов доната

Панель **☕ Донат** показывает **ровно 5 способов** (лучшие практики 2026 для статического сайта без своей кассы):

| # | Способ | Кому | Кликов до оплаты |
|---|--------|------|------------------|
| 1 | **PayPal** | Весь мир | 2 — сумма → оплатить |
| 2 | **Ko-fi** | Мир, 0% комиссии платформы | 2 — «Support» → карта/PayPal |
| 3 | **Buy Me a Coffee** | Мир, привычный UX | 2 — «Buy a coffee» → карта |
| 4 | **Boosty** | Россия, СНГ, СБП | 2 — Donate → карта |
| 5 | **USDT** | Крипто | 3 — сеть → копировать → перевод |

Конфиг: `src/config/donate.ts`  
Ник по умолчанию: **`m11nic89co`**

---

## 1. PayPal (у вас уже есть аккаунт)

1. Войдите на https://www.paypal.com  
2. **Настройки** → **PayPal.Me** (или https://www.paypal.me)  
3. Создайте ссылку, например **`paypal.me/m11nic89co`**  
4. Проверьте в браузере — открывается поле «сумма»  
5. Если ник другой — измените в `donate.ts`:

```typescript
url: 'https://paypal.me/ВАШ_НИК',
```

**Совет:** ссылка **не меняется** после создания — выбирайте ник один раз.

---

## 2. Ko-fi (рекомендуется для карты + Apple Pay)

1. https://ko-fi.com → **Start my Ko-fi Page**  
2. Username: **`m11nic89co`**  
3. **Settings → Payments** → подключить **Stripe** и/или **PayPal**  
4. Страница: https://ko-fi.com/m11nic89co  

**Почему Ko-fi:** 0% комиссии платформы на разовые донаты (2026).

---

## 3. Buy Me a Coffee

1. https://www.buymeacoffee.com → **Start a page**  
2. Username: **`m11nic89co`**  
3. Подключить **Stripe** (карта, Apple/Google Pay)  
4. Страница: https://buymeacoffee.com/m11nic89co  

**Почему BMC:** узнаваемый бренд «купи кофе», быстрый checkout на мобильном.

---

## 4. Boosty (Россия)

1. https://boosty.to → регистрация  
2. Ник: **`m11nic89co`**  
3. **Платежи** → карта для **вывода**  
4. Включить **разовые донаты**  
5. Ссылка: https://boosty.to/m11nic89co/donate  

---

## 5. USDT (уже работает)

Адреса в `donate.ts` — Tron TRC20 и TON. Менять не нужно, если кошельки те же.

---

## Переменные окружения (опционально)

```env
VITE_PAYPAL_ME=https://paypal.me/m11nic89co
VITE_DONATE_KOFI=https://ko-fi.com/m11nic89co
VITE_DONATE_BMC=https://buymeacoffee.com/m11nic89co
VITE_DONATE_BOOSTY=https://boosty.to/m11nic89co/donate
```

---

## Деплой

```powershell
git push origin main
```

Сайт: https://m11nic89co.github.io/mindstorm/

---

## Почему не 10 способов?

Исследования UX (2025–2026): **5±1 вариант** — оптимум. Больше → люди уходят без оплаты.  
Patreon, Stripe Payment Link, DonationAlerts — добавим позже, если понадобится.
