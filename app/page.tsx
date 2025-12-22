"use client";

import { useRef } from "react";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tiles = Array.from({ length: 18 });

  const openPicker = () => {
    inputRef.current?.click();
  };

  return (
    <main className="wrap">
      <div className="container">
        {/* TOP ACTIONS */}
        <div className="topActions">
          <button className="chip">Кнопка 1</button>
          <button className="chip">Кнопка 2</button>
          <button className="chip">Кнопка 3</button>
        </div>

        {/* HERO */}
        <section className="hero">
          <div className="avatar" aria-hidden="true" />
          <div className="heroText">
            <h1 className="title">Проектная реализация</h1>

            <ul className="list">
              <li>Дизайн интерьера</li>
              <li>Мебель на заказ</li>
              <li>Комплектация</li>
            </ul>

            <div className="cities">Москва – Сочи – Краснодар – Санкт-Петербург</div>
          </div>
        </section>

        {/* CTA */}
        <div className="ctaRow">
          <button className="btn ghost">Поделиться</button>
          <button className="btn ghost">Контакты</button>
          <button className="btn primary">Связаться</button>
        </div>

        {/* GALLERY */}
        <section className="gallery">
          {/* hidden input for future uploads */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={() => {
              // позже подключим реальную загрузку и сохранение
            }}
          />

          <div className="grid">
            {tiles.map((_, i) => (
              <button
                key={i}
                className="tile"
                onClick={openPicker}
                title="Нажми, чтобы выбрать фото"
              >
                <span className="plus">+</span>
              </button>
            ))}
          </div>
        </section>

        <style jsx>{`
          .wrap {
            min-height: 100vh;
            padding: 28px 18px 40px;
            background: #f6f7f8;
            color: #111;
            font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
          }

          .container {
            max-width: 980px;
            margin: 0 auto;
          }

          .topActions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-bottom: 26px;
          }

          .chip {
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: white;
            border-radius: 999px;
            padding: 10px 16px;
            font-size: 14px;
            cursor: pointer;
          }

          .hero {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 22px;
            align-items: start;
            padding: 14px 0;
          }

          .avatar {
            width: 96px;
            height: 96px;
            border-radius: 999px;
            background: #e2e2e2;
            margin-top: 6px;
          }

          .title {
            font-size: 22px;
            font-weight: 650;
            margin: 0 0 8px;
          }

          .list {
            margin: 0;
            padding-left: 18px;
            line-height: 1.55;
            font-size: 16px;
          }

          .cities {
            margin-top: 10px;
            font-size: 13px;
            opacity: 0.7;
          }

          .ctaRow {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 18px;
            padding: 10px 0 0;
          }

          .btn {
            border-radius: 999px;
            padding: 12px 18px;
            font-size: 14px;
            cursor: pointer;
          }

          .ghost {
            background: white;
            border: 1px solid rgba(0, 0, 0, 0.12);
          }

          .primary {
            background: #111;
            color: white;
            border: 1px solid #111;
          }

          .gallery {
            margin-top: 26px;
            padding: 0;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            max-width: 820px;
          }

          .tile {
            aspect-ratio: 1 / 1;
            border-radius: 18px;
            border: 1px solid rgba(0, 0, 0, 0.12);
            background: white;
            display: grid;
            place-items: center;
            cursor: pointer;
          }

          .plus {
            font-size: 18px;
            opacity: 0.45;
            user-select: none;
          }
        `}</style>
      </div>
    </main>
  );
}
