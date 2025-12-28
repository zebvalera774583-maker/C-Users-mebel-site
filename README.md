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
4. ✅ **Загрузка фото** - фото загружаются через веб-интерфейс с телефона в Supabase Storage (множественные фото, слайдер, подпись)
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

4. Настройте Supabase Storage для хранения фотографий. Добавьте в `.env`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_BUCKET_NAME=photos
```

**Где найти эти данные:**
- `SUPABASE_URL` - ваш Project URL из Supabase Dashboard (Settings → API)
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key из Supabase Dashboard (Settings → API, секция Service Role - **НЕ используйте в браузере!**)
- `SUPABASE_ANON_KEY` - Anon/Public Key из Supabase Dashboard (Settings → API)
- `SUPABASE_BUCKET_NAME` - название вашего bucket в Supabase Storage (по умолчанию `photos`)

**Настройка Supabase Storage:**
1. Создайте проект на [supabase.com](https://supabase.com)
2. Перейдите в Storage → Create a new bucket
3. Создайте bucket с именем `photos` (или используйте другое имя и укажите его в `SUPABASE_BUCKET_NAME`)
4. Сделайте bucket **публичным** (Public bucket: ON) для публичного доступа к файлам
5. (Опционально) Настройте RLS политики для контроля доступа

**⚠️ ВАЖНО:**
- Service Role Key имеет полный доступ к проекту - используйте только на сервере
- Anon Key используется для браузерной загрузки (если bucket публичный)
- Для приватных buckets настройте RLS политики в Supabase Dashboard

5. Запустите dev сервер:
```bash
npm run dev
```

## Настройка для Production (Vercel)

После деплоя на Vercel добавьте все переменные окружения в настройках проекта:
1. Откройте проект в Vercel Dashboard
2. Settings → Environment Variables
3. Добавьте все переменные из `.env` файла (TELEGRAM_BOT_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SUPABASE_BUCKET_NAME)

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

