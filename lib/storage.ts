import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const CONVERSATIONS_FILE = path.join(DATA_DIR, 'conversations.json');

export interface Message {
  id: string;
  chatId: number;
  messageId: number;
  from: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
  };
  text?: string;
  photoUrl?: string;
  documentUrl?: string;
  timestamp: number;
  direction: 'incoming' | 'outgoing';
  aiState?: string;
}

export interface Conversation {
  chatId: number;
  userId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  name?: string;
  aiState: 'greeting' | 'qualify' | 'contact' | 'handover' | 'active';
  currentQuestion?: number;
  answers: Record<string, any>;
  lastMessageAt: number;
  createdAt: number;
  unreadCount: number;
}

// Инициализация директории данных
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // Директория уже существует
  }
}

// Загрузка сообщений
export async function loadMessages(): Promise<Message[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Сохранение сообщения
export async function saveMessage(message: Message): Promise<void> {
  await ensureDataDir();
  const messages = await loadMessages();
  messages.push(message);
  await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Загрузка диалогов
export async function loadConversations(): Promise<Conversation[]> {
  await ensureDataDir();
  try {
    const data = await fs.readFile(CONVERSATIONS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Сохранение диалога
export async function saveConversation(
  conversation: Conversation
): Promise<void> {
  await ensureDataDir();
  const conversations = await loadConversations();
  const index = conversations.findIndex((c) => c.chatId === conversation.chatId);

  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }

  await fs.writeFile(
    CONVERSATIONS_FILE,
    JSON.stringify(conversations, null, 2)
  );
}

// Получить диалог по chatId
export async function getConversation(
  chatId: number
): Promise<Conversation | null> {
  const conversations = await loadConversations();
  return conversations.find((c) => c.chatId === chatId) || null;
}

// Получить сообщения диалога
export async function getMessagesByChatId(
  chatId: number
): Promise<Message[]> {
  const messages = await loadMessages();
  return messages.filter((m) => m.chatId === chatId);
}

// Обновить счетчик непрочитанных
export async function markConversationAsRead(chatId: number): Promise<void> {
  const conversation = await getConversation(chatId);
  if (conversation) {
    conversation.unreadCount = 0;
    await saveConversation(conversation);
  }
}



