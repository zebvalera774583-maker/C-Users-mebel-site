'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

type Case = {
  id: string;
  photos: string[];
  caption: string;
};

export default function HomePage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<{ [key: string]: number }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const caseId = Date.now().toString();
    const uploadedPhotos: string[] = [];

    try {
      // Загружаем все выбранные файлы
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}:`, file.name, file.type, file.size);
        
        // Генерируем уникальное имя файла
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `photos/${timestamp}-${randomString}.${fileExtension}`;

        // 1. Получаем presigned URL от сервера
        console.log('Getting presigned URL from /api/presign...');
        const presignResponse = await fetch('/api/presign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName,
            contentType: file.type,
          }),
        });

        if (!presignResponse.ok) {
          const text = await presignResponse.text();
          let errorData;
          try {
            errorData = JSON.parse(text);
          } catch (e) {
            console.error('Failed to parse presign error response:', text);
            throw new Error(`HTTP ${presignResponse.status}: ${presignResponse.statusText} - ${text}`);
          }
          console.error('Presign error:', errorData);
          throw new Error(errorData.error || errorData.details || 'Ошибка получения presigned URL');
        }

        const presignData = await presignResponse.json();
        const { presignedUrl, publicUrl } = presignData;
        console.log('Presigned URL received:', presignedUrl.substring(0, 50) + '...');

        // 2. Загружаем файл напрямую в R2 используя presigned URL
        // ВАЖНО: Только Content-Type header, никаких других!
        console.log('Uploading file directly to R2...');
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type, // ОБЯЗАТЕЛЬНО совпадает с ContentType при presign
          },
        });

        if (!uploadResponse.ok) {
          const text = await uploadResponse.text();
          console.error('R2 upload error:', text);
          throw new Error(`Ошибка загрузки в R2: HTTP ${uploadResponse.status} - ${text}`);
        }

        console.log('Upload successful, public URL:', publicUrl);
        uploadedPhotos.push(publicUrl);
      }

      // Создаем новый кейс с загруженными фотографиями
      const newCase: Case = {
        id: caseId,
        photos: uploadedPhotos,
        caption: '',
      };

      setCases((prev) => [...prev, newCase]);
      setCurrentPhotoIndex((prev) => ({ ...prev, [caseId]: 0 }));
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке фото. Попробуйте еще раз.');
    } finally {
      setUploading(false);
      // Сбрасываем input, чтобы можно было загрузить те же файлы снова
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const updateCaption = (caseId: string, caption: string) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, caption } : c))
    );
  };

  const nextPhoto = (caseId: string) => {
    const caseItem = cases.find((c) => c.id === caseId);
    if (!caseItem) return;

    setCurrentPhotoIndex((prev) => {
      const current = prev[caseId] || 0;
      const next = current < caseItem.photos.length - 1 ? current + 1 : 0;
      return { ...prev, [caseId]: next };
    });
  };

  const prevPhoto = (caseId: string) => {
    const caseItem = cases.find((c) => c.id === caseId);
    if (!caseItem) return;

    setCurrentPhotoIndex((prev) => {
      const current = prev[caseId] || 0;
      const prevIndex = current > 0 ? current - 1 : caseItem.photos.length - 1;
      return { ...prev, [caseId]: prevIndex };
    });
  };

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = (caseId: string) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextPhoto(caseId);
    }
    if (isRightSwipe) {
      prevPhoto(caseId);
    }
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

          {/* Upload Section */}
          <div className="upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              className="upload-btn"
              onClick={triggerFileInput}
              disabled={uploading}
            >
              {uploading ? '⏳ Загрузка...' : '📷 Загрузить фото'}
            </button>
          </div>

          {/* Display Cases */}
          {cases.length > 0 && (
            <div className="cases-section">
              {cases.map((caseItem) => {
                const currentIndex = currentPhotoIndex[caseItem.id] || 0;
                return (
                  <div key={caseItem.id} className="case-card">
                    <div
                      className="photo-slider"
                      onTouchStart={onTouchStart}
                      onTouchMove={onTouchMove}
                      onTouchEnd={() => onTouchEnd(caseItem.id)}
                    >
                      <div
                        className="photo-slides"
                        style={{
                          transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                      >
                        {caseItem.photos.map((photo, index) => (
                          <div key={index} className="photo-slide">
                            <img src={photo} alt={`Photo ${index + 1}`} />
                          </div>
                        ))}
                      </div>

                      {caseItem.photos.length > 1 && (
                        <>
                          <button
                            className="slider-nav left"
                            onClick={() => prevPhoto(caseItem.id)}
                            aria-label="Предыдущее фото"
                          >
                            ‹
                          </button>
                          <button
                            className="slider-nav right"
                            onClick={() => nextPhoto(caseItem.id)}
                            aria-label="Следующее фото"
                          >
                            ›
                          </button>
                          <div className="slider-indicator">
                            {caseItem.photos.map((_, index) => (
                              <span
                                key={index}
                                className={index === currentIndex ? 'active' : ''}
                                onClick={() =>
                                  setCurrentPhotoIndex((prev) => ({
                                    ...prev,
                                    [caseItem.id]: index,
                                  }))
                                }
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="caption-input-wrapper">
                      <input
                        type="text"
                        className="caption-input"
                        placeholder="Добавить подпись..."
                        value={caseItem.caption}
                        onChange={(e) => updateCaption(caseItem.id, e.target.value)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}


