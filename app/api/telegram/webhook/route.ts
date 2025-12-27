import { NextRequest, NextResponse } from 'next/server';
import { TelegramUpdate } from '@/lib/telegram';
import {
  saveMessage,
  getConversation,
  saveConversation,
  Conversation,
  Message,
} from '@/lib/storage';
import { processMessage, processContact } from '@/lib/ai-state-machine';
import { sendTelegramMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json();

    // Проверяем секретный токен (опционально, для безопасности)
    const secretToken = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (process.env.TELEGRAM_SECRET_TOKEN && secretToken !== process.env.TELEGRAM_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Обрабатываем только сообщения
    if (!update.message) {
      return NextResponse.json({ ok: true });
    }

    const message = update.message;
    const chatId = message.chat.id;

    // Получаем или создаем диалог
    let conversation = await getConversation(chatId);

    if (!conversation) {
      // Создаем новый диалог
      conversation = {
        chatId: chatId,
        userId: message.from.id,
        firstName: message.from.first_name,
        lastName: message.from.last_name,
        username: message.from.username,
        aiState: 'greeting',
        currentQuestion: undefined,
        answers: {},
        lastMessageAt: message.date * 1000,
        createdAt: message.date * 1000,
        unreadCount: 1,
      };

      // Отправляем приветствие
      await sendTelegramMessage(chatId, '👋 Здравствуйте! \n\nЯ помогаю с вопросами по дизайну и мебели на заказ.\n\nРасскажите, что вас интересует?');
    } else {
      conversation.lastMessageAt = message.date * 1000;
      conversation.unreadCount = (conversation.unreadCount || 0) + 1;
    }

    // Обрабатываем контакт, если есть
    if (message.contact) {
      processContact(conversation, {
        phone_number: message.contact.phone_number,
        first_name: message.contact.first_name,
        last_name: message.contact.last_name,
      });
      
      // Если контакт отправлен и это состояние contact, переходим к handover
      if (conversation.aiState === 'contact' && conversation.phone && conversation.name) {
        conversation.aiState = 'handover';
        await sendTelegramMessage(
          chatId,
          '✅ Спасибо за информацию!\n\nЯ передал вашу заявку владельцу. Скоро с вами свяжутся.\n\nЕсли есть срочные вопросы, можете написать напрямую.'
        );
      }
    }

    // Фото загружаются только через веб-интерфейс с телефона, не из Telegram
    // Если в Telegram отправлено фото, оно не загружается автоматически

    // Сохраняем входящее сообщение
    const savedMessage: Message = {
      id: `msg-${message.message_id}-${chatId}`,
      chatId: chatId,
      messageId: message.message_id,
      from: {
        id: message.from.id,
        firstName: message.from.first_name,
        lastName: message.from.last_name,
        username: message.from.username,
      },
      text: message.text || (message.photo ? '📷 Фото отправлено' : message.document ? '📎 Документ отправлен' : undefined),
      photoUrl: undefined, // Фото не загружаются из Telegram, только через веб-интерфейс
      documentUrl: undefined, // Документы не загружаются из Telegram
      timestamp: message.date * 1000,
      direction: 'incoming',
      aiState: conversation.aiState,
    };

    await saveMessage(savedMessage);

    // Обрабатываем через AI state machine (только если есть текст и не в активном/handover режиме)
    if (message.text && conversation.aiState !== 'active' && conversation.aiState !== 'handover') {
      const result = await processMessage(
        conversation,
        message.text,
        chatId
      );
      conversation.aiState = result.newState;
    } else if (conversation.aiState === 'greeting' && !message.text) {
      // Если первое сообщение без текста (только фото), начинаем квалификацию
      conversation.aiState = 'qualify';
      conversation.currentQuestion = 0;
      await sendTelegramMessage(
        chatId,
        'Спасибо за фото! Какой тип мебели вас интересует? (кухня, шкаф, диван и т.д.)'
      );
    }

    // Сохраняем обновленный диалог
    await saveConversation(conversation);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Telegram требует GET для проверки webhook
export async function GET() {
  return NextResponse.json({ ok: true });
}

