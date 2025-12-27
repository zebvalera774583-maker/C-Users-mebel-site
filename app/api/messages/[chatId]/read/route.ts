import { NextRequest, NextResponse } from 'next/server';
import { markConversationAsRead } from '@/lib/storage';

// POST /api/messages/[chatId]/read - отметить диалог как прочитанный
export async function POST(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const chatId = parseInt(params.chatId);
    await markConversationAsRead(chatId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}



