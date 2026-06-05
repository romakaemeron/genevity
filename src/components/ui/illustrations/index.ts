export { default as InjectableIllustration } from "./InjectableIllustration";
export { default as ApparatusIllustration } from "./ApparatusIllustration";
export { default as IntimateIllustration } from "./IntimateIllustration";
export { default as LaserIllustration } from "./LaserIllustration";
export { default as LongevityIllustration } from "./LongevityIllustration";
export { default as SkincareIllustration } from "./SkincareIllustration";
export { default as PodologyIllustration } from "./PodologyIllustration";
export { default as DiagnosticsIllustration } from "./DiagnosticsIllustration";
export { default as PlasticSurgeryIllustration } from "./PlasticSurgeryIllustration";
export { default as GynaecologyIllustration } from "./GynaecologyIllustration";

import type { ComponentType } from "react";
import InjectableIllustration from "./InjectableIllustration";
import ApparatusIllustration from "./ApparatusIllustration";
import IntimateIllustration from "./IntimateIllustration";
import LaserIllustration from "./LaserIllustration";
import LongevityIllustration from "./LongevityIllustration";
import SkincareIllustration from "./SkincareIllustration";
import PodologyIllustration from "./PodologyIllustration";
import DiagnosticsIllustration from "./DiagnosticsIllustration";
import PlasticSurgeryIllustration from "./PlasticSurgeryIllustration";
import GynaecologyIllustration from "./GynaecologyIllustration";

/** Map category slugs to their illustration component */
export const categoryIllustrations: Record<string, ComponentType<{ className?: string }>> = {
  "injectable-cosmetology": InjectableIllustration,
  "apparatus-cosmetology": ApparatusIllustration,
  "intimate-rejuvenation": IntimateIllustration,
  "laser-hair-removal": LaserIllustration,
  "longevity": LongevityIllustration,
  "skincare": SkincareIllustration,
  "podology": PodologyIllustration,
  "diagnostics": DiagnosticsIllustration,
  "plastic-surgery": PlasticSurgeryIllustration,
  "gynaecology": GynaecologyIllustration,
};
