"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel, FormDescription } from "@/components/ui/form";

interface Props {
  label: string;
  name: string;
  type?: "text" | "textarea" | "number" | "email" | "url" | "tel" | "date";
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  hint?: string;
}

export default function FormField({
  label, name, type = "text", defaultValue = "", placeholder, required, rows = 4, hint,
}: Props) {
  return (
    <FormItem>
      <FormLabel htmlFor={name} required={required}>{label}</FormLabel>
      {type === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={rows}
          className="resize-y bg-background"
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          className="bg-background"
        />
      )}
      {hint && <FormDescription>{hint}</FormDescription>}
    </FormItem>
  );
}
