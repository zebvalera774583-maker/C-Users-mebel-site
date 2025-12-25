'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Conversation {
  chatId: number;
  userId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  phone?: string;
  name?: string;
  aiState: string;
  currentQuestion?: number;
  answers: Record<string, any>;
  lastMessageAt: number;
  createdAt: number;
  unreadCount: number;
}

interface Message {
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

export default function InboxPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Загрузка списка диалогов
  const loadConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка сообщений диалога
  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`/api/messages?chatId=${chatId}`);
      const data = await response.json();
      setMessages(data.messages || []);

      // Отмечаем как прочитанное
      await fetch(`/api/messages/${chatId}/read`, { method: 'POST' });
      
      // Обновляем список диалогов
      loadConversations();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Отправка сообщения
  const sendMessage = async () => {
    if (!selectedChatId || !messageText.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/messages/${selectedChatId}/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: messageText }),
      });

      if (response.ok) {
        setMessageText('');
        loadMessages(selectedChatId);
        loadConversations();
      } else {
        alert('Ошибка при отправке сообщения');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadConversations();
    // Обновляем список каждые 5 секунд
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
      // Обновляем сообщения каждые 3 секунды
      const interval = setInterval(() => loadMessages(selectedChatId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChatId]);

  const selectedConversation = conversations.find(
    (c) => c.chatId === selectedChatId
  );

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    if (days < 7) return `${days} дн назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getStateLabel = (state: string) => {
    const labels: Record<string, string> = {
      greeting: 'Приветствие',
      qualify: 'Квалификация',
      contact: 'Контакт',
      handover: 'Передано',
      active: 'Активный',
    };
    return labels[state] || state;
  };

  return (
    <div className="inbox-container">
      <header className="inbox-header">
        <button className="back-btn" onClick={() => router.push('/')}>
          ← Назад
        </button>
        <h1>Inbox</h1>
      </header>

      <div className="inbox-layout">
        {/* Список диалогов */}
        <aside className="conversations-list">
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">Нет диалогов</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.chatId}
                className={`conversation-item ${
                  selectedChatId === conv.chatId ? 'active' : ''
                } ${conv.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => setSelectedChatId(conv.chatId)}
              >
                <div className="conversation-header">
                  <div className="conversation-name">
                    {conv.name || conv.firstName}{' '}
                    {conv.lastName && conv.lastName}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="conversation-meta">
                  <span className="conversation-state">
                    {getStateLabel(conv.aiState)}
                  </span>
                  <span className="conversation-time">
                    {formatDate(conv.lastMessageAt)}
                  </span>
                </div>
                {conv.phone && (
                  <div className="conversation-phone">📞 {conv.phone}</div>
                )}
              </div>
            ))
          )}
        </aside>

        {/* Окно чата */}
        <main className="chat-window">
          {selectedChatId ? (
            <>
              {selectedConversation && (
                <div className="chat-header">
                  <div>
                    <h2>
                      {selectedConversation.name ||
                        selectedConversation.firstName}{' '}
                      {selectedConversation.lastName}
                    </h2>
                    {selectedConversation.phone && (
                      <div className="chat-phone">
                        📞 {selectedConversation.phone}
                      </div>
                    )}
                    <div className="chat-state">
                      Статус: {getStateLabel(selectedConversation.aiState)}
                    </div>
                  </div>
                </div>
              )}

              <div className="messages-list">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message ${msg.direction === 'outgoing' ? 'outgoing' : 'incoming'}`}
                  >
                    <div className="message-content">
                      {msg.text && <div className="message-text">{msg.text}</div>}
                      {msg.photoUrl && (
                        <img
                          src={msg.photoUrl}
                          alt="Photo"
                          className="message-photo"
                        />
                      )}
                      {msg.documentUrl && (
                        <a
                          href={msg.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="message-document"
                        >
                          📎 Документ
                        </a>
                      )}
                    </div>
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString('ru-RU', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="message-input">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Написать сообщение..."
                  disabled={sending}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || !messageText.trim()}
                >
                  {sending ? '⏳' : '📤'}
                </button>
              </div>
            </>
          ) : (
            <div className="empty-chat">
              Выберите диалог для просмотра сообщений
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        .inbox-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .inbox-header {
          padding: 16px 20px;
          border-bottom: 1px solid #dbdbdb;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #262626;
          padding: 4px 8px;
        }

        .inbox-header h1 {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
        }

        .inbox-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .conversations-list {
          width: 320px;
          border-right: 1px solid #dbdbdb;
          overflow-y: auto;
          background: #fafafa;
        }

        .conversation-item {
          padding: 16px;
          border-bottom: 1px solid #dbdbdb;
          cursor: pointer;
          background: #fff;
          transition: background 0.2s;
        }

        .conversation-item:hover {
          background: #fafafa;
        }

        .conversation-item.active {
          background: #e3f2fd;
        }

        .conversation-item.unread {
          font-weight: 600;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .conversation-name {
          font-size: 14px;
          color: #262626;
        }

        .unread-badge {
          background: #0095f6;
          color: #fff;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .conversation-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #8e8e8e;
          margin-bottom: 4px;
        }

        .conversation-phone {
          font-size: 12px;
          color: #262626;
          margin-top: 4px;
        }

        .chat-window {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 16px 20px;
          border-bottom: 1px solid #dbdbdb;
        }

        .chat-header h2 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .chat-phone {
          font-size: 14px;
          color: #262626;
          margin-bottom: 4px;
        }

        .chat-state {
          font-size: 12px;
          color: #8e8e8e;
        }

        .messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 70%;
        }

        .message.outgoing {
          align-self: flex-end;
        }

        .message.incoming {
          align-self: flex-start;
        }

        .message-content {
          padding: 10px 14px;
          border-radius: 18px;
          background: #efefef;
        }

        .message.outgoing .message-content {
          background: #0095f6;
          color: #fff;
        }

        .message-text {
          word-wrap: break-word;
          line-height: 1.4;
        }

        .message-photo {
          max-width: 300px;
          border-radius: 12px;
          margin-top: 4px;
        }

        .message-document {
          display: inline-block;
          margin-top: 4px;
          color: #0095f6;
        }

        .message.outgoing .message-document {
          color: #fff;
        }

        .message-time {
          font-size: 11px;
          color: #8e8e8e;
          margin-top: 4px;
          padding: 0 4px;
        }

        .message-input {
          padding: 16px 20px;
          border-top: 1px solid #dbdbdb;
          display: flex;
          gap: 12px;
        }

        .message-input input {
          flex: 1;
          padding: 10px 16px;
          border: 1px solid #dbdbdb;
          border-radius: 24px;
          font-size: 14px;
          outline: none;
        }

        .message-input button {
          padding: 10px 20px;
          background: #0095f6;
          color: #fff;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          font-size: 18px;
          transition: background 0.2s;
        }

        .message-input button:hover:not(:disabled) {
          background: #0084d9;
        }

        .message-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-chat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8e8e8e;
        }

        .loading,
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: #8e8e8e;
        }
      `}</style>
    </div>
  );
}



