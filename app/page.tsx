'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type Case = {
  id: string;
  photos: string[];
  note: string;
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Загружаем файлы последовательно
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            let errorMessage = 'Неизвестная ошибка';
            try {
              const error = await response.json();
              errorMessage = error.error || error.message || JSON.stringify(error);
            } catch (e) {
              errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            console.error('Ошибка загрузки:', errorMessage);
            alert(`Ошибка при загрузке ${file.name}: ${errorMessage}`);
            continue;
          }

          const data = await response.json();
          
          const newCase: Case = {
            id: `case-${Date.now()}-${Math.random()}`,
            photos: [data.url],
            note: file.name
          };
          
          setCases(prev => [...prev, newCase]);
        }
      }
    } catch (error) {
      console.error('Ошибка:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      alert(`Произошла ошибка при загрузке файлов: ${errorMessage}`);
    } finally {
      setUploading(false);
      // Сброс input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            <button 
              className="upload-btn" 
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? '⏳ Загрузка...' : '📷 Загрузить фото'}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}


