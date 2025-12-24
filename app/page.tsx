'use client';

import { useState, useRef } from 'react';

type Case = {
  id: string;
  photos: string[];
  note: string;
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageUrl = e.target?.result as string;
          const newCase: Case = {
            id: `case-${Date.now()}-${index}`,
            photos: [imageUrl],
            note: file.name
          };
          
          setCases(prev => [...prev, newCase]);
        };
        reader.readAsDataURL(file);
      }
    });

    // Сброс input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

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

          <div className="upload-section">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              ref={fileInputRef}
            />
            <button className="upload-btn" onClick={triggerFileInput}>
              📷 Загрузить фото
            </button>
          </div>
        </div>
      </main>
    </>
  );
}


