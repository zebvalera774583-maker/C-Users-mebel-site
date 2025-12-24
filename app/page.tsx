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
  const [activeTab, setActiveTab] = useState<'grid' | 'reels' | 'tagged'>('grid');

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
                <span className="stat-number">{cases.length}</span>
                <span className="stat-label">публикации</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">748</span>
                <span className="stat-label">подписчики</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">765</span>
                <span className="stat-label">подписки</span>
              </div>
            </div>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">ashot.zebelyan</h1>
            <p className="profile-bio">
              Деятель искусств<br />
              Дизайнер мебели<br />
              Мебельный менеджер<br />
              Делаю лучшую мебель в мире
            </p>
            <a href="#" className="profile-link">@ashot.zebelyan</a>
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

        <div className="content-tabs">
          <button 
            className={`tab ${activeTab === 'grid' ? 'active' : ''}`}
            onClick={() => setActiveTab('grid')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </button>
          <button 
            className={`tab ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 6v12l8-6z" fill="currentColor"/>
            </svg>
          </button>
          <button 
            className={`tab ${activeTab === 'tagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('tagged')}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 9h6v6H9z" fill="currentColor"/>
            </svg>
          </button>
        </div>

        {activeTab === 'grid' && (
          <div className="posts-grid">
            {cases.map((item) => (
              <PostCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {activeTab === 'reels' && (
          <div className="empty-tab">
            <p>Пока нет видео</p>
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="empty-tab">
            <p>Пока нет отметок</p>
          </div>
        )}
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

