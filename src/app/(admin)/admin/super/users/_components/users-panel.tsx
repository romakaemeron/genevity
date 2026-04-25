"use client";

import { useActionState, useState } from "react";
import { createUser, updateUserRole, resetUserPassword, deleteUser } from "../../../_actions/super";
import { Shield, Plus, Key, Trash2, ChevronDown } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  admin:     { label: "Admin",     color: "bg-error/15 text-error",       desc: "Full access — content, settings, users, logs" },
  marketing: { label: "Marketing", color: "bg-main/15 text-main",         desc: "Content editing + form submissions" },
  support:   { label: "Support",   color: "bg-success/15 text-success",   desc: "Form submissions only" },
};

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  last_login: string | null;
  created_at: string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function UsersPanel({ users, currentUserId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [createState, createAction] = useActionState(createUser, null as any);
  const [roleState, roleAction] = useActionState(updateUserRole, null as any);
  const [pwState, pwAction] = useActionState(resetUserPassword, null as any);
  const [delState, delAction] = useActionState(deleteUser, null as any);
  const [resetUserId, setResetUserId] = useState<string | null>(null);

  const inputClass = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";
  const btnPrimary = "px-4 py-2 bg-main text-champagne rounded-xl text-sm font-medium hover:bg-main-dark transition-colors cursor-pointer";
  const btnSecondary = "px-4 py-2 border border-line bg-champagne-dark text-ink rounded-xl text-sm font-medium hover:bg-champagne transition-colors cursor-pointer";

  return (
    <div className="flex flex-col gap-8 mt-6">

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Object.entries(ROLE_LABELS).map(([role, { label, color, desc }]) => (
          <div key={role} className="p-4 rounded-2xl border border-line bg-champagne-dark flex flex-col gap-1.5">
            <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>{label}</span>
            <p className="body-s text-muted">{desc}</p>
          </div>
        ))}
      </div>

      {/* User list */}
      <div className="flex flex-col gap-3">
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.support;
          return (
            <div key={user.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border border-line bg-champagne-dark">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full bg-main/20 flex items-center justify-center text-main font-semibold text-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="body-strong text-ink truncate">{user.name} {isSelf && <span className="text-xs text-muted">(you)</span>}</p>
                  <p className="body-s text-muted truncate">{user.email}</p>
                  {user.last_login && (
                    <p className="body-s text-black-40 mt-0.5">
                      Last login: {new Date(user.last_login).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {/* Role selector */}
                {!isSelf ? (
                  <form action={roleAction} className="flex items-center gap-2">
                    <input type="hidden" name="userId" value={user.id} />
                    <div className="relative">
                      <select
                        name="role"
                        defaultValue={user.role}
                        onChange={(e) => e.currentTarget.form?.requestSubmit()}
                        className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium border border-line bg-champagne-dark text-ink cursor-pointer outline-none focus:border-main ${roleInfo.color}`}
                      >
                        <option value="admin">Admin</option>
                        <option value="marketing">Marketing</option>
                        <option value="support">Support</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                  </form>
                ) : (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleInfo.color}`}>{roleInfo.label}</span>
                )}

                {/* Reset password */}
                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => setResetUserId(resetUserId === user.id ? null : user.id)}
                    className="p-2 rounded-lg text-muted hover:text-ink hover:bg-champagne transition-colors cursor-pointer"
                    title="Reset password"
                  >
                    <Key size={15} />
                  </button>
                )}

                {/* Delete */}
                {!isSelf && (
                  <form action={delAction}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      onClick={(e) => { if (!confirm(`Delete ${user.name}?`)) e.preventDefault(); }}
                      className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors cursor-pointer"
                      title="Delete user"
                    >
                      <Trash2 size={15} />
                    </button>
                  </form>
                )}
              </div>

              {/* Inline password reset */}
              {resetUserId === user.id && (
                <div className="w-full border-t border-line pt-4 mt-1">
                  <form action={pwAction} className="flex gap-2" onSubmit={() => setResetUserId(null)}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input type="password" name="password" placeholder="New password (min 8 chars)" minLength={8} required className={`${inputClass} flex-1`} />
                    <button type="submit" className={btnPrimary}>Set password</button>
                    <button type="button" onClick={() => setResetUserId(null)} className={btnSecondary}>Cancel</button>
                  </form>
                  {pwState?.error && <p className="text-error text-xs mt-1">{pwState.error}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Errors */}
      {(roleState?.error || delState?.error) && (
        <p className="text-error text-sm">{roleState?.error || delState?.error}</p>
      )}

      {/* Create user */}
      <div className="rounded-2xl border border-line bg-champagne-dark overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="w-full flex items-center gap-3 px-5 py-4 hover:bg-champagne/30 transition-colors cursor-pointer text-left"
        >
          <Plus size={16} className="text-main" />
          <span className="body-strong text-ink">Add new user</span>
          <ChevronDown size={14} className={`ml-auto text-muted transition-transform ${showCreate ? "rotate-180" : ""}`} />
        </button>

        {showCreate && (
          <div className="border-t border-line p-5">
            <form action={createAction} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Name</label>
                  <input name="name" type="text" required placeholder="Full name" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Email</label>
                  <input name="email" type="email" required placeholder="email@example.com" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Password</label>
                  <input name="password" type="password" required minLength={8} placeholder="Min 8 characters" className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Role</label>
                  <select name="role" required className={`${inputClass} cursor-pointer`}>
                    <option value="marketing">Marketing</option>
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              {createState?.error && <p className="text-error text-sm">{createState.error}</p>}
              {createState?.ok && <p className="text-success text-sm">User created successfully.</p>}
              <div className="flex gap-3">
                <button type="submit" className={btnPrimary}>Create user</button>
                <button type="button" onClick={() => setShowCreate(false)} className={btnSecondary}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
