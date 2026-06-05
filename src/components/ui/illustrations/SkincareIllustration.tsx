/** Abstract line-art illustration: serum dropper bottle with skin moisture waves — skincare treatments */
export default function SkincareIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Dropper bottle body */}
      <rect x="70" y="50" width="28" height="78" rx="9" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Bottle neck */}
      <rect x="78" y="34" width="12" height="19" rx="3" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
      {/* Dropper bulb */}
      <ellipse cx="84" cy="24" rx="7" ry="5" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      {/* Dropper tip line */}
      <line x1="84" y1="12" x2="84" y2="21" stroke="currentColor" strokeWidth="1.2" opacity="0.5" strokeLinecap="round" />
      {/* Falling drop */}
      <path d="M84 4 Q82 8 84 12 Q86 8 84 4" stroke="currentColor" strokeWidth="1" opacity="0.4" strokeLinejoin="round" />
      {/* Liquid level inside */}
      <line x1="72" y1="90" x2="96" y2="90" stroke="currentColor" strokeWidth="0.8" opacity="0.22" strokeDasharray="4 3" />
      {/* Moisture wave curves — right side */}
      <path d="M112 38 Q128 30 140 46 Q150 62 138 76 Q126 90 140 106 Q148 118 136 130" stroke="currentColor" strokeWidth="1.3" opacity="0.45" strokeLinecap="round" />
      <path d="M118 32 Q138 24 152 44 Q162 62 148 78 Q138 90 150 108" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      {/* Wave nodes */}
      <circle cx="140" cy="46" r="3.5" stroke="currentColor" strokeWidth="1.1" opacity="0.42" />
      <circle cx="140" cy="106" r="3" stroke="currentColor" strokeWidth="1" opacity="0.38" />
      <circle cx="138" cy="76" r="4" stroke="currentColor" strokeWidth="1.1" opacity="0.35" />
      <circle cx="140" cy="46" r="1.4" fill="currentColor" opacity="0.2" />
      {/* Bond / connection dashes */}
      <line x1="144" y1="48" x2="152" y2="44" stroke="currentColor" strokeWidth="0.7" opacity="0.22" />
      <line x1="142" y1="78" x2="150" y2="78" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      {/* Botanical leaf — bottom left */}
      <path d="M38 118 Q48 96 60 106 Q48 122 38 118" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <line x1="38" y1="118" x2="58" y2="106" stroke="currentColor" strokeWidth="0.7" opacity="0.18" />
      {/* Small flora dots */}
      <circle cx="52" cy="128" r="2" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <circle cx="42" cy="136" r="1.5" fill="currentColor" opacity="0.14" />
      <circle cx="36" cy="96" r="1.5" fill="currentColor" opacity="0.12" />
    </svg>
  );
}
