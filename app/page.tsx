'use client';

import { useState } from 'react';

type Case = {
  id: string;
  photos: string[];
  note: string;
};

export default function HomePage() {
  const isAdmin = true; // временно, позже привяжем к паролю
  const [cases, setCases] = useState<Case[]>([]);

  return (
    <main className="container">
      {isAdmin && (
        <button className="add-btn">
          + Добавить кейс
        </button>
      )}

      <div className="grid">
        {cases.map((item) => (
          <CaseCard key={item.id} item={item} />
        ))}
      </div>
    </main>
  );
}

function CaseCard({ item }: { item: Case }) {
  const [index, setIndex] = useState(0);

  return (
    <div className="case-card">
      <div className="photo-wrapper">
        <img src={item.photos[index]} alt="" />

        {item.photos.length > 1 && (
          <>
            <button
              className="nav left"
              onClick={() =>
                setIndex((index - 1 + item.photos.length) % item.photos.length)
              }
            >
              ‹
            </button>
            <button
              className="nav right"
              onClick={() =>
                setIndex((index + 1) % item.photos.length)
              }
            >
              ›
            </button>
          </>
        )}
      </div>

      <div className="note">
        {item.note}
      </div>
    </div>
  );
}
