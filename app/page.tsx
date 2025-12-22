"use client";

import { useRef } from "react";
import Image from "next/image";

export default function HomePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const tiles = Array.from({ length: 18 });

  return (
    <main className="wrap">
      <div className="card">

        {/* TOP BAR */}
        <div className="topBar">
          <div className="brand">Ashot Zebelyan</div>

          <div className="topActions">
            <button className="chip">40 уникальных кейсов</button>
            <button className="chip">2578 проектов</button>
            <button className="chip">4 города</button>
          </div>
        </div>

        {/* HEADER */}
        <div className="header">
          <div className="left">
            <div className="avatar">
              <Image
                src="/ashot.jpg"
                alt="Ashot Zebelyan"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
            </div>

            <div className="info">
              <h1 className="title">Проектная реализация</h1>

              <ul className="list">
                <li>Дизайн интерьера</li>
                <li>Мебель на заказ</li>
                <li>Комплектация</li>
              </ul>

              <div className="cities">
                Москва – Сочи – Краснодар – Санкт-Петербург
              </div>
            </div>
          </div>

          <div className="right">
            <div className="ctaRow">
              <button className="btn ghost">Поделиться</button>
              <button className="btn ghost">Контакты</button>
              <button className="btn primary">Связаться</button>
            </div>
          </div>
        </div>

        {/* GALLERY */}
        <section className="gallery">
          <input ref={inputRef} type="file" accept="image/*" multiple hidden />

          <div className="grid">
            {tiles.map((_, i) => (
              <button
                key={i}
                className="tile"
                onClick={() => inputRef.current?.click()}
              >
                <span className="plus">+</span>
              </button>
            ))}
          </div>
        </section>

      </div>

      <style jsx>{`
        .wrap {
          min-height: 100vh;
          background: #f6f7f8;
          padding: 24px 18px 60px;
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
          color: #111;
        }

        .card {
          max-width: 920px;
          margin: 0 auto;
        }

        /* TOP BAR */
        .topBar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
        }

        .brand {
          font-size: 18px;
          font-weight: 600;
        }

        .topActions {
          display: flex;
          gap: 10px;
        }

        .chip {
          border: 1px solid rgba(0, 0, 0, 0.12);
          background: #fff;
          border-radius: 999px;
          padding: 10px 16px;
          font-size: 14px;
          cursor: default;
          white-space: nowrap;
        }

        /* HEADER */
        .header {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 18px;
          align-items: start;
        }

        .left {
          display: grid;
          grid-template-columns: 96px 1fr;
          gap: 18px;
        }

        .avatar {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          overflow: hidden;
          background: #e2e2e2;
        }

        .title {
          font-size: 22px;
          font-weight: 700;
          margin: 0 0 8px;
        }

        .list {
          margin: 0;
          padding-left: 18px;
          line-height: 1.55;
          font-size: 16px;
        }

        .cities {
          margin-top: 14px;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.6);
        }

        .right {
          padding-top: 40px;
        }

        .ctaRow {
          display: flex;
          gap: 12px;
        }

        .btn {
          border-radius: 999px;
          padding: 12px 18px;
          font-size: 14px;
          cursor: pointer;
          white-space: nowrap;
        }

        .ghost {
          background: #fff;
          border: 1px solid rgba(0, 0, 0, 0.12);
        }

        .primary {
          background: #111;
          color: #fff;
          border: 1px solid #111;
        }

        /* GALLERY */
        .gallery {
          margin-top: 48px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
        }

        .tile {
          aspect-ratio: 1 / 1;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.14);
          background: #fff;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .plus {
          font-size: 18px;
          opacity: 0.45;
          user-select: none;
        }

        @media (max-width: 720px) {
          .topBar {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .header {
            grid-template-columns: 1fr;
          }

          .right {
            padding-top: 12px;
          }

          .ctaRow {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
