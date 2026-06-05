/** Abstract line-art illustration: surgical scalpel with face contour profile and precision diamond — plastic surgery */
export default function PlasticSurgeryIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Scalpel handle */}
      <rect x="68" y="12" width="12" height="70" rx="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Handle grip marks */}
      <line x1="70" y1="28" x2="78" y2="28" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
      <line x1="70" y1="35" x2="78" y2="35" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
      <line x1="70" y1="42" x2="78" y2="42" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
      <line x1="70" y1="49" x2="78" y2="49" stroke="currentColor" strokeWidth="0.7" opacity="0.3" />
      {/* Blade ferrule */}
      <rect x="68" y="82" width="12" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      {/* Blade — curved cutting edge */}
      <path d="M68 89 Q62 102 68 120 L80 120 L80 89" stroke="currentColor" strokeWidth="1.4" opacity="0.5" strokeLinejoin="round" />
      <path d="M68 89 Q58 105 66 122" stroke="currentColor" strokeWidth="1" opacity="0.35" strokeLinecap="round" />
      {/* Blade tip */}
      <path d="M68 120 L74 130 L80 120" stroke="currentColor" strokeWidth="1" opacity="0.45" strokeLinejoin="round" />
      {/* Face profile contour — right side */}
      <path d="M108 18 Q122 22 128 38 Q132 52 128 66 Q124 78 126 90 Q128 100 122 112 Q116 122 108 128" stroke="currentColor" strokeWidth="1.4" opacity="0.45" strokeLinecap="round" />
      {/* Secondary contour */}
      <path d="M116 18 Q132 24 138 44 Q142 62 136 80 Q132 96 138 112" stroke="currentColor" strokeWidth="1" opacity="0.28" strokeLinecap="round" />
      {/* Precision diamond */}
      <path d="M148 55 L160 46 L172 55 L160 78 Z" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinejoin="round" />
      <line x1="148" y1="55" x2="172" y2="55" stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
      <circle cx="160" cy="55" r="2" fill="currentColor" opacity="0.2" />
      {/* Precision grid dots */}
      <circle cx="150" cy="90" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="162" cy="94" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="174" cy="90" r="1.5" fill="currentColor" opacity="0.13" />
      <circle cx="150" cy="104" r="1.5" fill="currentColor" opacity="0.12" />
      <circle cx="162" cy="108" r="1.5" fill="currentColor" opacity="0.12" />
      <circle cx="174" cy="104" r="1.5" fill="currentColor" opacity="0.1" />
      {/* Contour nodes */}
      <circle cx="128" cy="38" r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="126" cy="90" r="2.5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
    </svg>
  );
}
