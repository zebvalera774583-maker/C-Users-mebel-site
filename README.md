# Мебель на заказ - Telegram Bot Integration

Проект для управления диалогами с клиентами через Telegram бота.

## Возможности

1. ✅ **Telegram Bot Integration** - получение и отправка сообщений через Telegram
2. ✅ **Хранение диалогов** - все сообщения сохраняются локально
3. ✅ **AI State Machine** - автоматическая квалификация клиентов:
   - Приветствие
   - 3-5 уточняющих вопросов
   - Сбор контактных данных (имя, телефон)
   - Передача владельцу
4. ✅ **Загрузка фото** - фото загружаются через веб-интерфейс с телефона в Cloudflare R2 (множественные фото, слайдер, подпись)
5. ✅ **Админка Inbox** - веб-интерфейс для просмотра и ответов на сообщения

## Установка

1. Установите зависимости:
```bash
npm install
```

2. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

3. Получите токен бота у [@BotFather](https://t.me/BotFather) и добавьте в `.env`:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

4. Настройте Cloudflare R2 для хранения фотографий. Добавьте в `.env`:
```
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=ashot-zebelyan-photos
R2_PUBLIC_URL=https://pub-f0552636863240bd98bc6780dd915dae.r2.dev
```

**Где найти эти данные:**
- `R2_ACCOUNT_ID` - ваш Account ID из Cloudflare dashboard (находится в endpoint URL)
- `R2_ACCESS_KEY_ID` и `R2_SECRET_ACCESS_KEY` - создайте через Cloudflare dashboard: R2 → API Tokens → Create API Token (Object Read & Write permissions)
- `R2_BUCKET_NAME` - название вашего bucket в R2
- `R2_PUBLIC_URL` - Public URL вашего bucket (включите Public Access в настройках bucket)

5. Запустите dev сервер:
```bash
npm run dev
```

## Настройка для Production (Vercel)

После деплоя на Vercel добавьте все переменные окружения в настройках проекта:
1. Откройте проект в Vercel Dashboard
2. Settings → Environment Variables
3. Добавьте все переменные из `.env` файла (TELEGRAM_BOT_TOKEN, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL)

## Настройка Telegram Webhook

После запуска проекта на сервере (например, на Vercel), настройте webhook:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/api/telegram/webhook"}'
```

Или для локальной разработки используйте ngrok:
```bash
ngrok http 3000
# Затем установите webhook на https://your-ngrok-url.ngrok.io/api/telegram/webhook
```

## Структура проекта

- `lib/telegram.ts` - клиент для работы с Telegram Bot API
- `lib/storage.ts` - сохранение и загрузка сообщений/диалогов
- `lib/ai-state-machine.ts` - логика автоматических ответов
- `app/api/telegram/webhook/route.ts` - webhook endpoint для Telegram
- `app/api/messages/route.ts` - API для получения диалогов/сообщений
- `app/api/messages/[chatId]/send/route.ts` - API для отправки ответов
- `app/inbox/page.tsx` - веб-интерфейс админки

## Использование

1. Откройте `/inbox` в браузере для доступа к админке
2. Клиенты пишут боту в Telegram
3. Бот автоматически задает вопросы и собирает информацию
4. После сбора контакта диалог передается владельцу (статус "handover")
5. Владелец отвечает через админку `/inbox`

## Хранение данных

Данные хранятся в директории `data/`:
- `messages.json` - все сообщения
- `conversations.json` - информация о диалогах

Для продакшена рекомендуется использовать базу данных (PostgreSQL, MongoDB и т.д.)

