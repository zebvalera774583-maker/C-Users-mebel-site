'use client';

import Link from 'next/link';

export default function HomePage() {

  return (
    <>
      <header className="profile-header">
        <div className="header-top">
          <div className="header-title">
            <span className="username">ashot.zebelyan</span>
          </div>
          <Link href="/inbox" className="inbox-link">
            💬 Inbox
          </Link>
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
            <a href="#" className="profile-link">Москва - Питер - СОчи - Краснодар</a>
          </div>

          <div className="profile-actions">
            <button className="action-btn">Редактировать</button>
            <button className="action-btn">Поделиться</button>
            <button className="action-btn">Связаться</button>
          </div>
        </div>
      </main>
    </>
  );
}


