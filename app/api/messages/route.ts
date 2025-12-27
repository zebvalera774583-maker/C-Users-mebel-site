export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { loadConversations, getMessagesByChatId } from '@/lib/storage';

// GET /api/messages - получить список диалогов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const chatId = searchParams.get('chatId');

    if (chatId) {
      // Получить сообщения конкретного диалога
      const messages = await getMessagesByChatId(parseInt(chatId));
      return NextResponse.json({ messages });
    } else {
      // Получить список всех диалогов
      const conversations = await loadConversations();
      // Сортируем по последнему сообщению (новые сверху)
      conversations.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
      return NextResponse.json({ conversations });
    }
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



