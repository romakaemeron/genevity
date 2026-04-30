"use client";

import { useState, useTransition } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { submitPublicReview } from "@/app/(admin)/admin/_actions/reviews";

interface ServiceOption { slug: string; title: string; }

interface Props {
  doctorId: string;
  doctorName: string;
  locale: string;
  services: ServiceOption[];
  onClose: () => void;
}

const ML = {
  uk: {
    title: "Поділитися враженням",
    subtitle: "Ваш відгук допомагає іншим зробити правильний вибір",
    nameLabel: "Ім'я", namePlaceholder: "Наприклад: Олена К.",
    procLabel: "Процедура", procPlaceholder: "Оберіть процедуру", procOther: "Інша процедура",
    textLabel: "Ваш відгук", textPlaceholder: "Розкажіть про свій досвід…",
    submit: "Надіслати відгук", submitting: "Надсилання…",
    successTitle: "Дякуємо за відгук!", successText: "Він буде опублікований після перевірки модератором.",
    close: "Закрити", required: "Обов'язкове поле", minChars: "Мінімум 10 символів",
    ratingLabel: "Оцінка",
  },
  ru: {
    title: "Поделиться впечатлением",
    subtitle: "Ваш отзыв помогает другим сделать правильный выбор",
    nameLabel: "Имя", namePlaceholder: "Например: Елена К.",
    procLabel: "Процедура", procPlaceholder: "Выберите процедуру", procOther: "Другая процедура",
    textLabel: "Ваш отзыв", textPlaceholder: "Расскажите о своём опыте…",
    submit: "Отправить отзыв", submitting: "Отправка…",
    successTitle: "Спасибо за отзыв!", successText: "Он будет опубликован после проверки модератором.",
    close: "Закрыть", required: "Обязательное поле", minChars: "Минимум 10 символов",
    ratingLabel: "Оценка",
  },
  en: {
    title: "Share Your Experience",
    subtitle: "Your review helps others make the right choice",
    nameLabel: "Name", namePlaceholder: "e.g. Elena K.",
    procLabel: "Procedure", procPlaceholder: "Select a procedure", procOther: "Other procedure",
    textLabel: "Your review", textPlaceholder: "Tell us about your experience…",
    submit: "Submit review", submitting: "Submitting…",
    successTitle: "Thank you for your review!", successText: "It will be published after moderation.",
    close: "Close", required: "Required field", minChars: "Minimum 10 characters",
    ratingLabel: "Rating",
  },
};
const t = (locale: string) => ML[locale as keyof typeof ML] ?? ML.uk;

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1" role="group">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-main transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill={n <= active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewFormModal({ doctorId, doctorName, locale, services, onClose }: Props) {
  const labels = t(locale);
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [procedure, setProcedure] = useState("");
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = labels.required;
    if (text.trim().length < 10) e.text = labels.minChars;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setServerError("");
    startTransition(async () => {
      const res = await submitPublicReview({
        doctorId, reviewerName: name, rating,
        reviewText: text, procedureTag: procedure || null, locale,
      });
      if (res.ok) setSuccess(true);
      else setServerError(res.error ?? "Error");
    });
  };

  return (
    <Modal open onClose={onClose} maxWidth="sm:max-w-md">
      {success ? (
        <div className="flex flex-col items-center gap-4 p-8 pt-10 text-center">
          <div className="w-14 h-14 rounded-full bg-main/10 text-main flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p className="heading-3 text-black">{labels.successTitle}</p>
            <p className="body-m text-black-50 mt-2">{labels.successText}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-2 px-6 py-2.5 rounded-[var(--radius-pill)] bg-main text-champagne body-m hover:bg-main-dark transition-colors cursor-pointer"
          >
            {labels.close}
          </button>
        </div>
      ) : (
        <div className="p-6 pt-10">
          {/* Heading */}
          <div className="mb-6">
            <h2 className="heading-3 text-black">{labels.title}</h2>
            <p className="body-s text-black-50 mt-1">{doctorName} · {labels.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Star rating */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-black-50 uppercase tracking-wider">{labels.ratingLabel}</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-black-50 uppercase tracking-wider">{labels.nameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder={labels.namePlaceholder}
                className={`w-full rounded-xl border bg-champagne-dark px-4 py-3 body-m text-black placeholder:text-black-30 focus:outline-none focus:ring-2 focus:ring-main/30 transition-shadow ${errors.name ? "border-red-400" : "border-champagne-darker"}`}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Procedure */}
            {services.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-black-50 uppercase tracking-wider">{labels.procLabel}</label>
                <select
                  value={procedure}
                  onChange={(e) => setProcedure(e.target.value)}
                  className="w-full rounded-xl border border-champagne-darker bg-champagne-dark px-4 py-3 body-m text-black focus:outline-none focus:ring-2 focus:ring-main/30 appearance-none cursor-pointer transition-shadow"
                >
                  <option value="">{labels.procPlaceholder}</option>
                  {services.map((s) => <option key={s.slug} value={s.title}>{s.title}</option>)}
                  <option value={labels.procOther}>{labels.procOther}</option>
                </select>
              </div>
            )}

            {/* Review text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-black-50 uppercase tracking-wider">{labels.textLabel}</label>
              <textarea
                value={text}
                onChange={(e) => { setText(e.target.value); setErrors((p) => ({ ...p, text: "" })); }}
                rows={4}
                placeholder={labels.textPlaceholder}
                className={`w-full rounded-xl border bg-champagne-dark px-4 py-3 body-m text-black placeholder:text-black-30 focus:outline-none focus:ring-2 focus:ring-main/30 resize-none transition-shadow ${errors.text ? "border-red-400" : "border-champagne-darker"}`}
              />
              <div className="flex items-center justify-between">
                {errors.text ? <p className="text-xs text-red-500">{errors.text}</p> : <span />}
                <p className="text-[11px] text-black-30 tabular-nums">{text.length}</p>
              </div>
            </div>

            {serverError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{serverError}</p>
            )}

            <Button type="submit" variant="primary" size="md" disabled={isPending} className="w-full">
              {isPending ? labels.submitting : labels.submit}
            </Button>
          </form>
        </div>
      )}
    </Modal>
  );
}
