"use client";

import { useState } from "react";
import { MultiPicker, type PickerOption } from "../../_components/multi-picker";

interface Props {
  options: PickerOption[];
  initial: string[];   // slugs
  inputName: string;
}

export default function RelatedServicesPicker({ options, initial, inputName }: Props) {
  const [slugs, setSlugs] = useState<string[]>(initial);

  return (
    <div>
      <MultiPicker
        label="Related Services"
        options={options}
        value={slugs}
        onChange={setSlugs}
      />
      <input type="hidden" name={inputName} value={slugs.join(", ")} />
    </div>
  );
}
