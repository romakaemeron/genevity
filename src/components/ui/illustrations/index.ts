export { default as InjectableIllustration } from "./InjectableIllustration";
export { default as ApparatusIllustration } from "./ApparatusIllustration";
export { default as IntimateIllustration } from "./IntimateIllustration";
export { default as LaserIllustration } from "./LaserIllustration";
export { default as LongevityIllustration } from "./LongevityIllustration";

import type { ComponentType } from "react";
import InjectableIllustration from "./InjectableIllustration";
import ApparatusIllustration from "./ApparatusIllustration";
import IntimateIllustration from "./IntimateIllustration";
import LaserIllustration from "./LaserIllustration";
import LongevityIllustration from "./LongevityIllustration";

/** Map category slugs to their illustration component */
export const categoryIllustrations: Record<string, ComponentType<{ className?: string }>> = {
  "injectable-cosmetology": InjectableIllustration,
  "apparatus-cosmetology": ApparatusIllustration,
  "intimate-rejuvenation": IntimateIllustration,
  "laser-hair-removal": LaserIllustration,
  "longevity": LongevityIllustration,
};
