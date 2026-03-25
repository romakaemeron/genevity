"use client";

import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "outline-light" | "ghost" | "dark";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  icon?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-main text-champagne hover:bg-main-dark",
  secondary:
    "bg-ice text-black hover:bg-ice-dark",
  outline:
    "border border-main text-black hover:bg-main hover:text-champagne",
  "outline-light":
    "border border-champagne/40 text-champagne hover:bg-champagne hover:text-black",
  ghost:
    "text-main hover:bg-champagne-dark hover:text-main-dark",
  dark:
    "bg-black text-champagne hover:bg-surface-dark-elevated",
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
}: ButtonProps) {
  const sizeClass = icon
    ? size === "sm" ? "w-9 h-9 p-0"
    : size === "lg" ? "w-13 h-13 p-0"
    : size === "xl" ? "w-15 h-15 p-0"
    : "w-11 h-11 p-0"
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
      <Link href={href} className={combinedClasses}>
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
    >
      {children}
    </button>
  );
}
