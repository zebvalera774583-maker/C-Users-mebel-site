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
4. ✅ **Загрузка фото** - фото загружаются через веб-интерфейс с телефона в Vercel Blob Storage (не из Telegram)
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

4. Запустите dev сервер:
```bash
npm run dev
```

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

