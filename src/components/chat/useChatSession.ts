"use client";

import { useEffect, useState } from "react";

export function useChatSession(): string | null {
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    const key = "genevity_chat_session";
    let token = sessionStorage.getItem(key);
    if (!token) {
      token = crypto.randomUUID();
      sessionStorage.setItem(key, token);
    }
    setSessionToken(token);
  }, []);

  return sessionToken;
}
