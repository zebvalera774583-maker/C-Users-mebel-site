import { Conversation } from './storage';
import { sendTelegramMessage } from './telegram';

// Вопросы для квалификации
const QUALIFY_QUESTIONS = [
  'Какой тип мебели вас интересует? (кухня, шкаф, диван и т.д.)',
  'В каком стиле вы предпочитаете? (модерн, классика, минимализм)',
  'Какой у вас бюджет примерно?',
  'Нужна ли помощь с дизайном?',
  'В каком городе планируете заказ?',
];

// Сообщения для состояний
const GREETING_MESSAGE = `👋 Здравствуйте! 

Я помогаю с вопросами по дизайну и мебели на заказ.

Расскажите, что вас интересует?`;

const CONTACT_MESSAGE = `📞 Отлично! 

Чтобы мы могли связаться с вами, укажите, пожалуйста:
• Ваше имя
• Номер телефона

Или отправьте контакт через кнопку "Поделиться контактом" в Telegram.`;

const HANDOVER_MESSAGE = `✅ Спасибо за информацию!

Я передал вашу заявку владельцу. Скоро с вами свяжутся.

Если есть срочные вопросы, можете написать напрямую.`;

// Извлечение телефона из текста
function extractPhone(text: string): string | null {
  const phoneRegex = /(\+?7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}/;
  const match = text.match(phoneRegex);
  return match ? match[0].replace(/\s|-|\(|\)/g, '') : null;
}

// Извлечение имени из текста
function extractName(text: string): string | null {
  const words = text.trim().split(/\s+/);
  if (words.length >= 2) {
    return words.slice(0, 2).join(' ');
  } else if (words.length === 1 && words[0].length > 2) {
    return words[0];
  }
  return null;
}

// Обработка сообщения через state machine
export async function processMessage(
  conversation: Conversation,
  messageText: string,
  chatId: number
): Promise<{ newState: Conversation['aiState']; response?: string }> {
  const currentState = conversation.aiState;

  switch (currentState) {
    case 'greeting':
      // Переход к квалификации
      conversation.aiState = 'qualify';
      conversation.currentQuestion = 0;
      await sendTelegramMessage(chatId, QUALIFY_QUESTIONS[0]);
      return {
        newState: 'qualify',
      };

    case 'qualify':
      // Сохраняем ответ на текущий вопрос
      const questionIndex = conversation.currentQuestion || 0;
      conversation.answers[`question_${questionIndex}`] = messageText;

      // Переходим к следующему вопросу
      if (questionIndex < QUALIFY_QUESTIONS.length - 1) {
        conversation.currentQuestion = questionIndex + 1;
        await sendTelegramMessage(
          chatId,
          QUALIFY_QUESTIONS[questionIndex + 1]
        );
        return {
          newState: 'qualify',
        };
      } else {
        // Все вопросы заданы, переходим к сбору контакта
        conversation.aiState = 'contact';
        await sendTelegramMessage(chatId, CONTACT_MESSAGE);
        return {
          newState: 'contact',
        };
      }

    case 'contact':
      // Пытаемся извлечь контактные данные
      const phone = extractPhone(messageText);
      const name = extractName(messageText);

      if (phone) {
        conversation.phone = phone;
      }
      if (name) {
        conversation.name = name;
      }

      // Если есть и телефон и имя, передаем владельцу
      if (conversation.phone && conversation.name) {
        conversation.aiState = 'handover';
        await sendTelegramMessage(chatId, HANDOVER_MESSAGE);
        return {
          newState: 'handover',
        };
      } else {
        // Просим уточнить данные
        const missing = [];
        if (!conversation.phone) missing.push('телефон');
        if (!conversation.name) missing.push('имя');

        await sendTelegramMessage(
          chatId,
          `Пожалуйста, укажите ${missing.join(' и ')}.`
        );
        return {
          newState: 'contact',
        };
      }

    case 'handover':
    case 'active':
      // После передачи владельцу или в активном режиме - просто пересылаем
      // AI не отвечает автоматически
      return {
        newState: currentState,
      };

    default:
      return {
        newState: 'greeting',
      };
  }
}

// Обработка контакта из Telegram
export function processContact(
  conversation: Conversation,
  contact: {
    phone_number: string;
    first_name: string;
    last_name?: string;
  }
): void {
  conversation.phone = contact.phone_number;
  conversation.name = contact.first_name;
  if (contact.last_name) {
    conversation.name += ` ${contact.last_name}`;
  }
}



