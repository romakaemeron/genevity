/** Abstract line-art illustration: foot sole print with toes and care tool — podology */
export default function PodologyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Heel */}
      <ellipse cx="86" cy="130" rx="22" ry="16" stroke="currentColor" strokeWidth="1.4" opacity="0.48" />
      {/* Arch — connect heel to ball via side guides */}
      <path d="M64 130 Q62 106 66 92" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      <path d="M108 130 Q114 112 112 92" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      {/* Ball of foot */}
      <ellipse cx="88" cy="84" rx="26" ry="14" stroke="currentColor" strokeWidth="1.4" opacity="0.48" />
      {/* Big toe */}
      <ellipse cx="68" cy="60" rx="9" ry="12" stroke="currentColor" strokeWidth="1.3" opacity="0.48" />
      {/* 2nd toe */}
      <ellipse cx="80" cy="54" rx="7.5" ry="10" stroke="currentColor" strokeWidth="1.2" opacity="0.43" />
      {/* 3rd toe */}
      <ellipse cx="91" cy="52" rx="7" ry="10" stroke="currentColor" strokeWidth="1.2" opacity="0.43" />
      {/* 4th toe */}
      <ellipse cx="102" cy="55" rx="6.5" ry="9" stroke="currentColor" strokeWidth="1.1" opacity="0.38" />
      {/* Pinky toe */}
      <ellipse cx="111" cy="60" rx="5.5" ry="8" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      {/* Nail care tool — right side */}
      <line x1="152" y1="22" x2="138" y2="78" stroke="currentColor" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
      <rect x="147" y="14" width="11" height="13" rx="3" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      {/* Tool angled tip */}
      <path d="M138 78 L132 88 L141 85 Z" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinejoin="round" />
      {/* Precision dashes around nail area */}
      <circle cx="88" cy="84" r="30" stroke="currentColor" strokeWidth="0.6" opacity="0.14" strokeDasharray="4 5" />
      {/* Accent dots */}
      <circle cx="160" cy="90" r="2" fill="currentColor" opacity="0.14" />
      <circle cx="155" cy="108" r="1.5" fill="currentColor" opacity="0.12" />
    </svg>
  );
}
