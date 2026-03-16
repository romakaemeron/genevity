"use client";

import { motion } from "framer-motion";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
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
    "bg-rosegold text-champagne hover:bg-rosegold-dark",
  outline:
    "border border-main text-black hover:bg-main hover:text-champagne",
  ghost:
    "text-main hover:text-main-dark",
};

export default function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[var(--radius-button)] font-[var(--font-body)] font-medium text-base transition-all duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const combinedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={className.includes("w-full") ? "w-full" : undefined}>
        <Link href={href} className={combinedClasses}>
          {children}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={combinedClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
