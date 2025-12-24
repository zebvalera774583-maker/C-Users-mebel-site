'use client';

import { useState } from 'react';

type Case = {
  id: string;
  photos: string[];
  note: string;
};

// Примерные данные для демонстрации
const initialCases: Case[] = [
  {
    id: '1',
    photos: ['/ashot.jpg'],
    note: 'Кухня на заказ из массива дуба'
  },
  {
    id: '2',
    photos: ['/ashot.jpg'],
    note: 'Гардеробная комната с зеркальными фасадами'
  },
  {
    id: '3',
    photos: ['/ashot.jpg'],
    note: 'Спальня в классическом стиле'
  },
  {
    id: '4',
    photos: ['/ashot.jpg'],
    note: 'Офисная мебель из натурального дерева'
  },
  {
    id: '5',
    photos: ['/ashot.jpg'],
    note: 'Детская комната с функциональной мебелью'
  },
  {
    id: '6',
    photos: ['/ashot.jpg'],
    note: 'Гостиная с камином и встроенными шкафами'
  }
];

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>(initialCases);

  return (
    <>
      <header className="profile-header">
        <div className="header-top">
          <div className="header-title">
            <span className="username">ashot.zebelyan</span>
          </div>
        </div>
      </header>

      <main className="profile-container">
        <div className="profile-section">
          <div className="profile-top">
            <div className="profile-photo-wrapper">
              <img src="/ashot.jpg" alt="Ashot Zebelyan" className="profile-photo" />
              <button className="story-add-btn">+</button>
            </div>
            
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">40</span>
                <span className="stat-label">уникальных кейсов</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">2578</span>
                <span className="stat-label">проектов</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">4</span>
                <span className="stat-label">города</span>
              </div>
            </div>
          </div>

          <div className="profile-info">
            <p className="profile-bio">
              Проектная реализация<br />
              Дизайн интерьера<br />
              Мебель на заказ<br />
              Комплектация
            </p>
            <a href="#" className="profile-link">Москва - Питер - Сочи - Краснодар</a>
          </div>

          <div className="profile-actions">
            <button className="action-btn">Редактировать</button>
            <button className="action-btn">Поделиться</button>
            <button className="action-btn">Связаться</button>
          </div>

          <div className="highlights">
            <div className="highlight-item">
              <div className="highlight-circle">А</div>
              <span className="highlight-label">Актуальное</span>
            </div>
          </div>
        </div>

        <div className="posts-grid">
          {cases.map((item) => (
            <PostCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </>
  );
}

function PostCard({ item }: { item: Case }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div 
      className="post-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="post-image-wrapper">
        {!imageError ? (
          <img 
            src={item.photos[index]} 
            alt={item.note}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="placeholder-image">
            <span>📷</span>
          </div>
        )}

        {item.photos.length > 1 && !imageError && (
          <>
            <button
              className={`post-nav left ${isHovered ? 'visible' : ''}`}
              onClick={() =>
                setIndex((index - 1 + item.photos.length) % item.photos.length)
              }
            >
              ‹
            </button>
            <button
              className={`post-nav right ${isHovered ? 'visible' : ''}`}
              onClick={() =>
                setIndex((index + 1) % item.photos.length)
              }
            >
              ›
            </button>
            <div className="post-indicator">
              {item.photos.map((_, i) => (
                <span 
                  key={i} 
                  className={i === index ? 'active' : ''}
                />
              ))}
            </div>
          </>
        )}

        {isHovered && (
          <div className="post-overlay">
            <span className="post-likes">❤️ 0</span>
            <span className="post-comments">💬 0</span>
          </div>
        )}
      </div>
    </div>
  );
}

