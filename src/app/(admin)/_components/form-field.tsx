"use client";

interface Props {
  label: string;
  name: string;
  type?: "text" | "textarea" | "number";
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

export default function FormField({
  label, name, type = "text", defaultValue = "", placeholder, required, rows = 4, hint,
}: Props) {
  const baseClass = "w-full px-4 py-2.5 rounded-xl bg-white border border-line text-ink text-sm outline-none focus:border-main focus:ring-1 focus:ring-main/20 transition-all placeholder:text-stone-light";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs font-medium text-muted uppercase tracking-wider">
        {label}
        {required && <span className="text-error ml-0.5">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className={`${baseClass} resize-y`}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className={baseClass}
        />
      )}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}
