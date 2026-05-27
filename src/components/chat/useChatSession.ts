"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "genevity_chat_session";

export function useChatSession(): { token: string | null; reset: () => void } {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let t = sessionStorage.getItem(SESSION_KEY);
    if (!t) {
      t = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, t);
    }
    setToken(t);
  }, []);

  const reset = () => {
    const t = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, t);
    sessionStorage.removeItem(`genevity_welcomed_${token}`);
    setToken(t);
  };

  return { token, reset };
}
