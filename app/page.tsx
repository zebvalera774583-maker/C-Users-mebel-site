export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Ashot Zebelyan</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>Мебель на заказ</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 12,
          maxWidth: 720,
        }}
      >
        {Array.from({ length: 18 }).map((_, i) => (
          <button
            key={i}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 18,
              border: "1px solid rgba(0,0,0,0.12)",
              background: "white",
              cursor: "pointer",
              fontSize: 14,
            }}
            title="Скоро здесь будет фото"
          >
            +
          </button>
        ))}
      </div>
    </main>
  );
}

