/** Abstract line-art illustration: syringe with flowing molecular curves — injectable cosmetology */
export default function InjectableIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Syringe body */}
      <rect x="68" y="28" width="18" height="85" rx="3" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <rect x="72" y="22" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" opacity="0.55" />
      <line x1="77" y1="113" x2="77" y2="130" stroke="currentColor" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      {/* Needle tip */}
      <path d="M75 130 L77 140 L79 130" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      {/* Plunger */}
      <rect x="73" y="10" width="8" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <line x1="73" y1="28" x2="81" y2="28" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      {/* Measurement lines */}
      <line x1="68" y1="45" x2="74" y2="45" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="68" y1="55" x2="74" y2="55" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="68" y1="65" x2="72" y2="65" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="68" y1="75" x2="74" y2="75" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="68" y1="85" x2="74" y2="85" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      <line x1="68" y1="95" x2="72" y2="95" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
      <line x1="68" y1="105" x2="74" y2="105" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      {/* Molecular flow — primary */}
      <path d="M98 35 Q115 25 125 45 Q135 65 122 82 Q109 99 128 118" stroke="currentColor" strokeWidth="1.4" opacity="0.5" strokeLinecap="round" />
      {/* Secondary flow */}
      <path d="M105 30 Q128 18 140 48 Q152 78 135 98 Q125 110 140 130" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
      {/* Third flow */}
      <path d="M95 50 Q108 42 115 55 Q122 68 112 82" stroke="currentColor" strokeWidth="0.9" opacity="0.3" strokeLinecap="round" />
      {/* Molecular nodes */}
      <circle cx="125" cy="45" r="4" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="125" cy="45" r="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="122" cy="82" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <circle cx="122" cy="82" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="128" cy="118" r="3.5" stroke="currentColor" strokeWidth="1.1" opacity="0.5" />
      <circle cx="140" cy="48" r="3" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="135" cy="98" r="3.5" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      {/* Bond lines between nodes */}
      <line x1="129" y1="47" x2="137" y2="48" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <line x1="126" y1="78" x2="133" y2="95" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      {/* Droplets at needle */}
      <circle cx="77" cy="145" r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="73" cy="150" r="1.5" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      {/* Orbital rings */}
      <ellipse cx="48" cy="72" rx="22" ry="38" stroke="currentColor" strokeWidth="0.9" opacity="0.2" transform="rotate(-12 48 72)" />
      <ellipse cx="48" cy="72" rx="16" ry="30" stroke="currentColor" strokeWidth="0.8" opacity="0.15" transform="rotate(18 48 72)" />
      <circle cx="48" cy="42" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="35" cy="85" r="1.5" fill="currentColor" opacity="0.12" />
    </svg>
  );
}
