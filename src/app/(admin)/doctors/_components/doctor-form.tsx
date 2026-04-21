"use client";

import { useActionState } from "react";
import { saveDoctor, deleteDoctor } from "../../_actions/doctors";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";

interface Doctor {
  id: string;
  name_uk: string; name_ru: string; name_en: string;
  role_uk: string; role_ru: string; role_en: string;
  experience_uk: string; experience_ru: string; experience_en: string;
  photo_card: string | null;
  photo_full: string | null;
  sort_order: number;
}

interface Props {
  doctor?: Doctor;
}

export default function DoctorForm({ doctor }: Props) {
  const [state, formAction] = useActionState(saveDoctor, null as any);
  const isNew = !doctor;

  return (
    <form action={formAction}>
      {doctor && <input type="hidden" name="id" value={doctor.id} />}

      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-ink">{isNew ? "New Doctor" : doctor.name_uk}</h1>
          {!isNew && (
            <button
              type="button"
              onClick={() => { if (confirm("Delete this doctor?")) deleteDoctor(doctor.id); }}
              className="text-sm text-error hover:text-error/80 transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>

        {state?.error && (
          <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>
        )}

        {/* Photos */}
        <div className="flex gap-6 mb-8">
          <ImageUpload
            name="photo_card"
            label="Card Photo (900px)"
            currentUrl={doctor?.photo_card}
          />
          <ImageUpload
            name="photo_full"
            label="Full Photo (1800px)"
            currentUrl={doctor?.photo_full}
          />
        </div>

        {/* Sort order */}
        <div className="mb-8 max-w-[120px]">
          <FormField
            label="Sort Order"
            name="sort_order"
            type="number"
            defaultValue={doctor?.sort_order ?? 0}
          />
        </div>

        {/* Trilingual fields */}
        <TranslationTabs>
          {(locale: LocaleKey) => (
            <div className="flex flex-col gap-5" key={locale}>
              <FormField
                label="Full Name"
                name={`name_${locale}`}
                defaultValue={(doctor as any)?.[`name_${locale}`] || ""}
                placeholder={locale === "uk" ? "Прізвище Ім'я По батькові" : locale === "ru" ? "Фамилия Имя Отчество" : "Full Name"}
                required={locale === "uk"}
              />
              <FormField
                label="Role / Specialty"
                name={`role_${locale}`}
                defaultValue={(doctor as any)?.[`role_${locale}`] || ""}
                placeholder={locale === "uk" ? "Лікар дерматолог, косметолог" : locale === "ru" ? "Врач дерматолог, косметолог" : "Dermatologist, cosmetologist"}
              />
              <FormField
                label="Experience"
                name={`experience_${locale}`}
                defaultValue={(doctor as any)?.[`experience_${locale}`] || ""}
                placeholder={locale === "uk" ? "10 років" : locale === "ru" ? "10 лет" : "10 years"}
              />
            </div>
          )}
        </TranslationTabs>
      </div>

      <SaveBar label={isNew ? "Create Doctor" : "Save Changes"} />
    </form>
  );
}
