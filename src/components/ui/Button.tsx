"use client";

import Link from "next/link";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "outline-light"
  | "ghost"
  | "dark"
  | "destructive"
  | "destructive-outline"
  | "destructive-ghost"
  | "neutral";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  icon?: boolean;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
  title?: string;
  ariaLabel?: string;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-main text-champagne hover:bg-main-dark",
  secondary:
    "bg-champagne-dark text-black hover:bg-champagne-darker",
  outline:
    "border border-main text-black hover:bg-main hover:text-champagne",
  "outline-light":
    "border border-champagne/40 text-champagne hover:bg-champagne hover:text-black",
  ghost:
    "text-main hover:bg-champagne-dark hover:text-main-dark",
  dark:
    "bg-black text-champagne hover:bg-surface-dark-elevated",
  // Filled red — dangerous confirmations ("Delete permanently", "Revoke access")
  destructive:
    "bg-error text-champagne hover:bg-error/90",
  // Outlined red — less-severe destructive actions ("Discard changes", "Remove row")
  "destructive-outline":
    "border border-error/30 text-error hover:bg-error/5",
  // Neutral/white, bordered — secondary choice alongside a primary CTA ("Cancel", "Stay on page")
  neutral:
    "bg-white border border-line text-ink hover:bg-champagne-dark hover:border-line-dark",
  // Subtle text-link red — inline delete actions next to page titles
  "destructive-ghost":
    "text-error hover:text-error/80 hover:bg-error/5",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  icon = false,
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
  title,
  ariaLabel,
}: ButtonProps) {
  const sizeClass = icon
    ? size === "xs" ? "w-7 h-7 p-0"
    : size === "sm" ? "w-9 h-9 p-0"
    : size === "lg" ? "w-13 h-13 p-0"
    : size === "xl" ? "w-15 h-15 p-0"
    : "w-11 h-11 p-0"
    : size === "xs" ? "px-3 py-1.5 text-xs"
    : size === "sm" ? "px-5 py-2 text-[13px]"
    : size === "lg" ? "px-9 py-4 text-base"
    : size === "xl" ? "px-12 py-5 text-base tracking-[0.05em]"
    : "px-6 py-2.5 text-base";

  const radius = pill
    ? "rounded-[var(--radius-pill)]"
    : "rounded-[var(--radius-button)]";

  const pressClass = icon ? "btn-press btn-press-icon" : "btn-press";

  const baseClasses = `inline-flex items-center justify-center gap-2 ${radius} font-[var(--font-body)] font-medium whitespace-nowrap cursor-pointer ${pressClass} disabled:opacity-50 disabled:cursor-not-allowed ${sizeClass}`;

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses} title={title} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
