"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SITE_PASSWORD = "genevity2026";

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === SITE_PASSWORD) {
      document.cookie = `site_access=granted; path=/; max-age=${60 * 60 * 24 * 30}`;
      router.push("/");
    } else {
      setError(true);
    }
  };

  return (
    <html>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#FAF9F6",
          color: "#1a1a1a",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%",
            maxWidth: "320px",
            padding: "0 16px",
          }}
        >
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginBottom: "8px",
            }}
          >
            GENEVITY
          </h1>
          <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
            Сайт у розробці. Введіть пароль для доступу.
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(false);
            }}
            placeholder="Пароль"
            autoFocus
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              border: error ? "1px solid #e53e3e" : "1px solid #d4d0cb",
              fontSize: "16px",
              outline: "none",
              backgroundColor: "#fff",
            }}
          />
          {error && (
            <p style={{ fontSize: "13px", color: "#e53e3e", margin: 0 }}>
              Невірний пароль
            </p>
          )}
          <button
            type="submit"
            style={{
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#8B7B6B",
              color: "#FAF9F6",
              fontSize: "16px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Увійти
          </button>
        </form>
      </body>
    </html>
  );
}
