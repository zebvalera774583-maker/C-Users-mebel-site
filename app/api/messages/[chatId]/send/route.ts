import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import {
  saveMessage,
  getConversation,
  saveConversation,
  markConversationAsRead,
  Message,
} from '@/lib/storage';

export const dynamic = 'force-dynamic';

// POST /api/messages/[chatId]/send - отправить ответ
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId);
    const body = await request.json();
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Текст сообщения обязателен' },
        { status: 400 }
      );
    }

    // Отправляем сообщение в Telegram
    const success = await sendTelegramMessage(chatId, text);

    if (!success) {
      return NextResponse.json(
        { error: 'Не удалось отправить сообщение' },
        { status: 500 }
      );
    }

    // Сохраняем исходящее сообщение
    const conversation = await getConversation(chatId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Диалог не найден' },
        { status: 404 }
      );
    }

    const savedMessage: Message = {
      id: `msg-out-${Date.now()}-${chatId}`,
      chatId: chatId,
      messageId: Date.now(), // Временный ID
      from: {
        id: 0, // Система
        firstName: 'Admin',
      },
      text: text,
      timestamp: Date.now(),
      direction: 'outgoing',
      aiState: 'active', // После ответа админа переводим в активный режим
    };

    await saveMessage(savedMessage);

    // Переводим диалог в активный режим и сбрасываем счетчик непрочитанных
    conversation.aiState = 'active';
    conversation.unreadCount = 0;
    await saveConversation(conversation);

    return NextResponse.json({ success: true, message: savedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



