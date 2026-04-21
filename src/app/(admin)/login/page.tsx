"use client";

import { useActionState } from "react";
import { login } from "../_actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="min-h-screen bg-champagne flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-heading text-2xl text-ink tracking-tight">GENEVITY</h1>
          <p className="text-muted text-sm mt-1">Content Management System</p>
        </div>

        <form action={formAction} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all"
              placeholder="admin@genevity.com.ua"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted uppercase tracking-wider">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <p className="text-error text-sm text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 rounded-xl bg-main text-champagne text-sm font-medium hover:bg-main-dark transition-colors disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Вхід..." : "Увійти"}
          </button>
        </form>
      </div>
    </div>
  );
}
