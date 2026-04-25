"use client";

import Image from "next/image";
import { useActionState, useState, useRef } from "react";
import { createUser, updateUserProfile, updateUserRole, resetUserPassword, deleteUser } from "../../../_actions/super";
import { ChevronDown, Plus, Pencil, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";

const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  admin:     { label: "Admin",     color: "bg-error/15 text-error",     desc: "Full access — content, settings, users, logs" },
  marketing: { label: "Marketing", color: "bg-main/15 text-main",       desc: "Content editing + form submissions" },
  support:   { label: "Support",   color: "bg-success/15 text-success", desc: "Form submissions only" },
};

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  last_login: string | null;
  created_at: string;
}

interface Props {
  users: User[];
  currentUserId: string;
}

const inputClass = "w-full px-3 py-2 rounded-lg bg-champagne-dark border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20";

function UserAvatar({ user, size = 36 }: { user: User; size?: number }) {
  if (user.avatar) {
    return (
      <Image
        src={user.avatar}
        alt={user.name}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-main/20 flex items-center justify-center text-main font-semibold shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {user.name.charAt(0).toUpperCase()}
    </div>
  );
}

function UserRow({ user, currentUserId }: { user: User; currentUserId: string }) {
  const isSelf = user.id === currentUserId;
  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.support;
  const [editing, setEditing] = useState(false);
  const [showPwReset, setShowPwReset] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [profileState, profileAction] = useActionState(updateUserProfile, null as any);
  const [roleState, roleAction] = useActionState(updateUserRole, null as any);
  const [pwState, pwAction] = useActionState(resetUserPassword, null as any);
  const [delState, delAction] = useActionState(deleteUser, null as any);

  return (
    <div className="rounded-2xl border border-line bg-champagne-dark overflow-hidden">
      {/* Main row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <UserAvatar user={user} size={36} />
          <div className="min-w-0">
            <p className="body-strong text-ink truncate">
              {user.name} {isSelf && <span className="text-xs text-muted">(you)</span>}
            </p>
            <p className="body-s text-muted truncate">{user.email}</p>
            {user.last_login && (
              <p className="body-s text-black-40 mt-0.5">
                Last login: {new Date(user.last_login).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Role selector */}
          {!isSelf ? (
            <form action={roleAction}>
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

          {/* Edit profile */}
          <Button
            variant={editing ? "outline" : "ghost"}
            icon
            size="sm"
            onClick={() => { setEditing(!editing); setShowPwReset(false); }}
            title="Edit profile"
          >
            <Pencil size={15} />
          </Button>

          {/* Delete */}
          {!isSelf && (
            <form action={delAction}>
              <input type="hidden" name="userId" value={user.id} />
              <Button
                variant="destructive-ghost"
                icon
                size="sm"
                type="submit"
                title="Delete user"
                onClick={(e) => { if (!confirm(`Delete ${user.name}?`)) e.preventDefault(); }}
              >
                <Trash2 size={15} />
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Edit drawer */}
      {editing && (
        <div className="border-t border-line p-5 flex flex-col gap-5">
          {/* Profile: name + avatar */}
          <form action={profileAction} onSubmit={() => { setAvatarPreview(null); setEditing(false); }} className="flex flex-col gap-4">
            <input type="hidden" name="userId" value={user.id} />
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Profile</p>
            <div className="flex items-start gap-4">
              {/* Avatar picker */}
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-line hover:border-main transition-colors relative"
                  onClick={() => fileRef.current?.click()}
                  title="Click to upload avatar"
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="preview" className="w-full h-full object-cover" />
                  ) : user.avatar ? (
                    <Image src={user.avatar} alt={user.name} width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-main/20 flex items-center justify-center text-main text-xl font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Pencil size={14} className="text-white" />
                  </div>
                </div>
                <input
                  ref={fileRef}
                  name="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setAvatarPreview(URL.createObjectURL(f));
                  }}
                />
                <span className="text-[10px] text-muted">Avatar</span>
              </div>

              {/* Name */}
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-muted uppercase tracking-wider">Name</label>
                <input name="name" type="text" required defaultValue={user.name} className={inputClass} />
              </div>
            </div>

            {profileState?.error && <p className="text-error text-xs">{profileState.error}</p>}

            <div className="flex items-center gap-2">
              <Button variant="primary" size="sm" type="submit">Save profile</Button>
              <Button
                variant="neutral"
                size="sm"
                type="button"
                onClick={() => setShowPwReset(!showPwReset)}
              >
                {showPwReset ? "Hide password" : "Change password"}
              </Button>
              <Button
                variant="ghost"
                icon
                size="sm"
                type="button"
                className="ml-auto"
                onClick={() => { setEditing(false); setShowPwReset(false); setAvatarPreview(null); }}
                title="Close"
              >
                <X size={15} />
              </Button>
            </div>
          </form>

          {/* Password reset */}
          {showPwReset && (
            <form action={pwAction} onSubmit={() => setShowPwReset(false)} className="flex flex-col gap-3 border-t border-line pt-4">
              <input type="hidden" name="userId" value={user.id} />
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">New password</p>
              <div className="flex gap-2">
                <input type="password" name="password" placeholder="Min 8 characters" minLength={8} required className={`${inputClass} flex-1`} />
                <Button variant="primary" size="sm" type="submit">Set</Button>
              </div>
              {pwState?.error && <p className="text-error text-xs">{pwState.error}</p>}
            </form>
          )}
        </div>
      )}

      {(roleState?.error || delState?.error) && (
        <p className="text-error text-xs px-5 pb-3">{roleState?.error || delState?.error}</p>
      )}
    </div>
  );
}

export default function UsersPanel({ users, currentUserId }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [createState, createAction] = useActionState(createUser, null as any);

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
        {users.map((user) => (
          <UserRow key={user.id} user={user} currentUserId={currentUserId} />
        ))}
      </div>

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
                <Button variant="primary" size="sm" type="submit">Create user</Button>
                <Button variant="neutral" size="sm" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
