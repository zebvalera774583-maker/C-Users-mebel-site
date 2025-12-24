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
  const isAdmin = true; // временно, позже привяжем к паролю
  const [cases, setCases] = useState<Case[]>(initialCases);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Ashot Zebelyan</h1>
          <p className="tagline">Мебель на заказ</p>
        </div>
      </header>

      <main className="container">
        {isAdmin && (
          <div className="admin-bar">
            <button className="add-btn">
              + Добавить кейс
            </button>
          </div>
        )}

        <div className="grid">
          {cases.map((item) => (
            <CaseCard key={item.id} item={item} />
          ))}
        </div>

        {cases.length === 0 && (
          <div className="empty-state">
            <p>Пока нет кейсов</p>
            {isAdmin && (
              <button className="add-btn">
                + Добавить первый кейс
              </button>
            )}
          </div>
        )}
      </main>
    </>
  );
}

function CaseCard({ item }: { item: Case }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="case-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="photo-wrapper">
        <img src={item.photos[index]} alt={item.note} />

        {item.photos.length > 1 && (
          <>
            <button
              className={`nav left ${isHovered ? 'visible' : ''}`}
              onClick={() =>
                setIndex((index - 1 + item.photos.length) % item.photos.length)
              }
            >
              ‹
            </button>
            <button
              className={`nav right ${isHovered ? 'visible' : ''}`}
              onClick={() =>
                setIndex((index + 1) % item.photos.length)
              }
            >
              ›
            </button>
            <div className="photo-indicator">
              {item.photos.map((_, i) => (
                <span 
                  key={i} 
                  className={i === index ? 'active' : ''}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="note">
        {item.note}
      </div>
    </div>
  );
}
