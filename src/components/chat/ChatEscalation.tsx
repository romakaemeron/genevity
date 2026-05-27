"use client";

import { motion } from "framer-motion";
import { X, Phone, MessageCircle, ArrowLeft } from "lucide-react";

interface Props {
  target: "genevity" | "helyos";
  summary: string;
  onClose: () => void;
  onBack: () => void;
  onOpenBinotel: () => void;
}

const PHONES = {
  genevity: "056 794 70 00",
  helyos: "+38 (067) 000 01 50",
};

export default function ChatEscalation({ target, summary, onClose, onBack, onOpenBinotel }: Props) {
  const isHelyos = target === "helyos";
  const phone = PHONES[target];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col w-[360px] rounded-2xl shadow-2xl overflow-hidden border border-[var(--color-champagne-darker,#e8e3db)]"
      style={{ background: "var(--color-champagne)", pointerEvents: "auto" }}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-main)] text-white">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)" }}>
            {isHelyos ? "Перенаправлення до Helyos" : "З'єднання з оператором"}
          </span>
        </div>
        <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="px-5 py-5 space-y-4">
        <p className="text-sm text-[var(--color-black)]">
          Передаю вас адміністратору {isHelyos ? "Helyos" : "GENEVITY"}...
        </p>

        {summary && (
          <div className="bg-[var(--color-champagne-dark,#f0ede7)] rounded-xl px-4 py-3 text-sm">
            <p className="text-xs text-[var(--color-stone,#8b7b6b)] mb-1 uppercase tracking-wide">
              Ваш запит
            </p>
            <p className="text-[var(--color-black)]">{summary}</p>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <button
            onClick={onOpenBinotel}
            className="w-full py-3 rounded-xl bg-[var(--color-main)] text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageCircle size={15} />
            Відкрити чат з оператором
          </button>

          <a
            href={`tel:${phone.replace(/[\s()]/g, "")}`}
            className="w-full py-3 rounded-xl border border-[var(--color-main)] text-[var(--color-main)] text-sm font-medium flex items-center justify-center gap-2 hover:bg-[var(--color-main)]/5 transition-colors block"
          >
            <Phone size={15} />
            Зателефонувати: {phone}
          </a>
        </div>
      </div>
    </motion.div>
  );
}
