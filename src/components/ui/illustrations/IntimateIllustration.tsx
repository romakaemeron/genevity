/** Abstract line-art illustration: delicate bloom with renewal orbits — intimate rejuvenation */
export default function IntimateIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Central bloom — larger */}
      <circle cx="100" cy="80" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="100" cy="80" r="3" fill="currentColor" opacity="0.3" />
      {/* Primary petals — much larger, reaching edges */}
      <path d="M100 72 Q86 48 100 28 Q114 48 100 72" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M108 80 Q132 66 152 80 Q132 94 108 80" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M100 88 Q114 112 100 132 Q86 112 100 88" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path d="M92 80 Q68 66 48 80 Q68 94 92 80" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      {/* Diagonal petals — larger */}
      <path d="M106 74 Q122 56 135 40" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
      <path d="M106 86 Q122 104 135 120" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
      <path d="M94 86 Q78 104 65 120" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
      <path d="M94 74 Q78 56 65 40" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" />
      {/* Petal tips */}
      <circle cx="135" cy="40" r="2.5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <circle cx="135" cy="120" r="2.5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <circle cx="65" cy="120" r="2.5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <circle cx="65" cy="40" r="2.5" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      {/* Inner petal veins */}
      <path d="M100 72 Q96 58 100 45" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <path d="M108 80 Q120 78 135 80" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <path d="M100 88 Q104 102 100 115" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      <path d="M92 80 Q80 82 65 80" stroke="currentColor" strokeWidth="0.7" opacity="0.25" />
      {/* Orbital rings — spanning full width */}
      <ellipse cx="100" cy="80" rx="55" ry="35" stroke="currentColor" strokeWidth="1" opacity="0.2" transform="rotate(-25 100 80)" />
      <ellipse cx="100" cy="80" rx="55" ry="35" stroke="currentColor" strokeWidth="1" opacity="0.18" transform="rotate(25 100 80)" />
      <ellipse cx="100" cy="80" rx="68" ry="45" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
      {/* Particles on orbits */}
      <circle cx="42" cy="52" r="3" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="42" cy="52" r="1" fill="currentColor" opacity="0.2" />
      <circle cx="158" cy="52" r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="158" cy="108" r="3" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      <circle cx="158" cy="108" r="1" fill="currentColor" opacity="0.15" />
      <circle cx="42" cy="108" r="2.5" stroke="currentColor" strokeWidth="1" opacity="0.25" />
      {/* Top & bottom particles */}
      <circle cx="100" cy="18" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="100" cy="142" r="2" fill="currentColor" opacity="0.2" />
      <circle cx="160" cy="80" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="40" cy="80" r="1.5" fill="currentColor" opacity="0.15" />
    </svg>
  );
}
