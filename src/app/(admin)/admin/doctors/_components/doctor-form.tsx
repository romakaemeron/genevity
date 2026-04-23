"use client";

import { useActionState, useState, useRef } from "react";
import { saveDoctor, deleteDoctor } from "../../_actions/doctors";
import TranslationTabs, { type LocaleKey } from "../../_components/translation-tabs";
import FormField from "../../_components/form-field";
import ImageUpload from "../../_components/image-upload";
import SaveBar from "../../_components/save-bar";
import PhotoPositionEditor from "../../_components/photo-position-editor";
import CirclePhotoEditor from "../../_components/circle-photo-editor";
import { FormDirtyTracker } from "../../_components/unsaved-changes";
import Button from "@/components/ui/Button";

interface Doctor {
  id: string;
  name_uk: string; name_ru: string; name_en: string;
  role_uk: string; role_ru: string; role_en: string;
  experience_uk: string; experience_ru: string; experience_en: string;
  photo_card: string | null;
  photo_full: string | null;
  photo_circle: string | null;
  card_position?: string | null;
  modal_position?: string | null;
  circle_focal_point?: string | null;
  circle_scale?: number | string | null;
  sort_order: number;
}

interface Props {
  doctor?: Doctor;
}

export default function DoctorForm({ doctor }: Props) {
  const [state, formAction] = useActionState(saveDoctor, null as any);
  const isNew = !doctor;

  // Mirror uploaded-image URLs so the position previews update immediately after upload
  const [cardUrl, setCardUrl] = useState<string | null>(doctor?.photo_card ?? null);
  const [fullUrl, setFullUrl] = useState<string | null>(doctor?.photo_full ?? null);
  const [circleUrl, setCircleUrl] = useState<string | null>(doctor?.photo_circle ?? null);
  // Mirror focal-point positions so the small thumbnail reflects live edits
  const [cardPos, setCardPos] = useState(doctor?.card_position || "center center");
  const [modalPos, setModalPos] = useState(doctor?.modal_position || doctor?.card_position || "center center");
  const initialCirclePos = doctor?.circle_focal_point || doctor?.card_position || "center center";
  const initialCircleScaleRaw = doctor?.circle_scale;
  const initialCircleScale = typeof initialCircleScaleRaw === "string"
    ? parseFloat(initialCircleScaleRaw)
    : typeof initialCircleScaleRaw === "number" ? initialCircleScaleRaw : 1;
  const [circlePos, setCirclePos] = useState(initialCirclePos);
  const [circleScale, setCircleScale] = useState(
    Number.isFinite(initialCircleScale) && initialCircleScale > 0 ? initialCircleScale : 1,
  );

  const formRef = useRef<HTMLFormElement | null>(null);

  // Position state is React-managed (not a native form field) — track its
  // change against the initial snapshot so the guard notices focal-point tweaks
  const initialCardPos = doctor?.card_position || "center center";
  const initialModalPos = doctor?.modal_position || doctor?.card_position || "center center";
  const controlledDirty =
    cardPos !== initialCardPos ||
    modalPos !== initialModalPos ||
    circlePos !== initialCirclePos ||
    Math.abs(circleScale - (Number.isFinite(initialCircleScale) ? initialCircleScale : 1)) > 1e-3 ||
    cardUrl !== (doctor?.photo_card ?? null) ||
    fullUrl !== (doctor?.photo_full ?? null) ||
    circleUrl !== (doctor?.photo_circle ?? null);

  return (
    <form action={formAction} ref={formRef}>
      <FormDirtyTracker
        id={doctor ? `doctor:${doctor.id}` : "doctor:new"}
        label={`Doctor · ${doctor?.name_uk || "new"}`}
        formRef={formRef}
        externalDirty={controlledDirty}
        onSave={() => formRef.current?.requestSubmit()}
      />
      {doctor && <input type="hidden" name="id" value={doctor.id} />}

      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="heading-2 text-ink">{isNew ? "New Doctor" : doctor.name_uk}</h1>
          {!isNew && (
            <Button
              variant="destructive-ghost"
              size="xs"
              onClick={() => { if (confirm("Delete this doctor?")) deleteDoctor(doctor.id); }}
            >
              Delete
            </Button>
          )}
        </div>

        {state?.error && (
          <div className="mb-6 p-4 bg-error-light text-error rounded-xl text-sm">{state.error}</div>
        )}

        {/* ── Photos with live-preview position editors ── */}
        <div className="mb-3 text-xs text-muted">
          <span className="font-medium text-ink">Tip:</span> upload any photo (JPG / PNG / HEIC).
          If you only upload the <strong>Card</strong> image, the <strong>Modal</strong> image is generated from it automatically.
          Images are auto-converted to WebP and resized for performance
          (<span className="font-mono">card ≤ 900 px</span>, <span className="font-mono">modal ≤ 1800 px</span>, quality 88).
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-champagne-dark">
            <h3 className="font-heading text-base text-ink">Card photo (1:1 square)</h3>
            <p className="text-xs text-muted">Shown on the doctors grid. Uploading here alone is enough — the modal image will be generated from the same source.</p>
            <ImageUpload
              name="photo_card"
              label="Upload source photo"
              currentUrl={cardUrl}
              onUrlChange={setCardUrl}
              aspect="aspect-square"
              objectPosition={cardPos}
            />
            <PhotoPositionEditor
              name="card_position"
              label="Card focal point"
              photoUrl={cardUrl}
              defaultValue={doctor?.card_position || "center center"}
              aspect="square"
              alt={doctor?.name_uk}
              onPositionChange={setCardPos}
            />
          </div>
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-champagne-dark">
            <h3 className="font-heading text-base text-ink">Modal photo (16:10 horizontal)</h3>
            <p className="text-xs text-muted">Optional. Upload a separate photo only if you want the fullscreen modal to look different from the card.</p>
            <ImageUpload
              name="photo_full"
              label="Upload separate modal photo (optional)"
              currentUrl={fullUrl}
              onUrlChange={setFullUrl}
              aspect="aspect-[16/10]"
              objectPosition={modalPos}
            />
            <PhotoPositionEditor
              name="modal_position"
              label="Modal focal point (16:10 horizontal)"
              photoUrl={fullUrl || cardUrl}
              defaultValue={doctor?.modal_position || doctor?.card_position || "center center"}
              aspect="modal"
              alt={doctor?.name_uk}
              onPositionChange={setModalPos}
            />
          </div>
        </div>

        {/* ── Booking-modal circle thumbnail ── */}
        <div className="mb-10 p-5 rounded-2xl bg-champagne-dark flex flex-col gap-3">
          <div>
            <h3 className="font-heading text-base text-ink">Booking modal thumbnail (circle)</h3>
            <p className="text-xs text-muted mt-0.5 max-w-xl">
              The small round avatar rendered next to the doctor in the <strong>Book consultation</strong>
              form&apos;s dropdown. Uploading here is optional — if you skip it, the Card photo is used
              with its own crop. Use the zoom + focal point to isolate the face so a 36&nbsp;px circle
              still reads clearly.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">
            <ImageUpload
              name="photo_circle"
              label="Source photo (optional)"
              currentUrl={circleUrl}
              onUrlChange={setCircleUrl}
              aspect="aspect-square"
              objectPosition={circlePos}
              pickerFolder="doctors"
            />
            <CirclePhotoEditor
              name="circle"
              label="Circle crop (focal point + zoom)"
              photoUrl={circleUrl || cardUrl}
              defaultFocalPoint={initialCirclePos}
              defaultScale={Number.isFinite(initialCircleScale) ? initialCircleScale : 1}
              focalFieldName="circle_focal_point"
              scaleFieldName="circle_scale"
              alt={doctor?.name_uk}
              onChange={(pos, scale) => { setCirclePos(pos); setCircleScale(scale); }}
            />
          </div>
        </div>

        <div className="mb-8 w-32">
          <FormField label="Sort Order" name="sort_order" type="number" defaultValue={doctor?.sort_order ?? 0} />
        </div>

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
