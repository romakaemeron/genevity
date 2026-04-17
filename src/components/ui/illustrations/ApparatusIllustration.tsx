/** Abstract line-art illustration: device with energy waves and frequency — apparatus cosmetology */
export default function ApparatusIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Device head */}
      <rect x="55" y="40" width="44" height="60" rx="9" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <rect x="61" y="46" width="32" height="22" rx="5" stroke="currentColor" strokeWidth="1.1" opacity="0.4" />
      {/* Screen details */}
      <line x1="65" y1="52" x2="89" y2="52" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="65" y1="56" x2="82" y2="56" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
      <line x1="65" y1="60" x2="75" y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      {/* Handle */}
      <rect x="67" y="100" width="20" height="35" rx="5" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <line x1="67" y1="112" x2="87" y2="112" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <line x1="67" y1="120" x2="87" y2="120" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      {/* Energy waves — primary */}
      <path d="M104 48 Q116 42 122 55" stroke="currentColor" strokeWidth="1.3" opacity="0.5" strokeLinecap="round" />
      <path d="M108 42 Q126 32 135 52" stroke="currentColor" strokeWidth="1.1" opacity="0.4" strokeLinecap="round" />
      <path d="M112 36 Q136 24 148 50" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <path d="M116 30 Q145 16 160 48" stroke="currentColor" strokeWidth="0.8" opacity="0.2" strokeLinecap="round" />
      {/* RF frequency circles */}
      <circle cx="145" cy="65" r="6" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
      <circle cx="145" cy="65" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="145" cy="65" r="13" stroke="currentColor" strokeWidth="0.9" opacity="0.25" />
      <circle cx="145" cy="65" r="21" stroke="currentColor" strokeWidth="0.7" opacity="0.18" />
      <circle cx="145" cy="65" r="30" stroke="currentColor" strokeWidth="0.5" opacity="0.1" />
      {/* Pulse/heartbeat line */}
      <path d="M105 88 L115 88 L119 76 L124 100 L129 82 L133 92 L138 85 L150 85" stroke="currentColor" strokeWidth="1.2" opacity="0.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* Skin layers */}
      <path d="M35 62 Q45 60 55 62" stroke="currentColor" strokeWidth="0.9" opacity="0.25" strokeLinecap="round" />
      <path d="M32 72 Q43 70 55 72" stroke="currentColor" strokeWidth="0.9" opacity="0.2" strokeLinecap="round" />
      <path d="M30 82 Q42 80 55 82" stroke="currentColor" strokeWidth="0.8" opacity="0.15" strokeLinecap="round" />
      <path d="M28 92 Q40 90 55 92" stroke="currentColor" strokeWidth="0.7" opacity="0.1" strokeLinecap="round" />
      {/* Particle dots */}
      <circle cx="120" cy="55" r="1.5" fill="currentColor" opacity="0.2" />
      <circle cx="135" cy="48" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="155" cy="50" r="1" fill="currentColor" opacity="0.15" />
    </svg>
  );
}
