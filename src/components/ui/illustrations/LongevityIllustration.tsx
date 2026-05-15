/** Abstract line-art illustration: DNA helix with atomic orbital — longevity & anti-age */
export default function LongevityIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* DNA helix — left strand */}
      <path d="M72 10 Q55 30 72 50 Q89 70 72 90 Q55 110 72 130 Q89 150 72 160" stroke="currentColor" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      {/* DNA helix — right strand */}
      <path d="M98 10 Q115 30 98 50 Q81 70 98 90 Q115 110 98 130 Q81 150 98 160" stroke="currentColor" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
      {/* Base pairs — connecting rungs */}
      <line x1="76" y1="22" x2="94" y2="22" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="68" y1="36" x2="102" y2="36" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="76" y1="50" x2="94" y2="50" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="84" y1="64" x2="86" y2="64" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <line x1="68" y1="78" x2="102" y2="78" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="76" y1="92" x2="94" y2="92" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="68" y1="106" x2="102" y2="106" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="76" y1="120" x2="94" y2="120" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      <line x1="84" y1="134" x2="86" y2="134" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <line x1="68" y1="148" x2="102" y2="148" stroke="currentColor" strokeWidth="0.9" opacity="0.3" />
      {/* Base pair dots */}
      <circle cx="85" cy="22" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="85" cy="50" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="85" cy="78" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="85" cy="106" r="1.5" fill="currentColor" opacity="0.15" />
      {/* Atomic orbital — right side */}
      <ellipse cx="145" cy="70" rx="32" ry="32" stroke="currentColor" strokeWidth="0.9" opacity="0.2" />
      <ellipse cx="145" cy="70" rx="32" ry="14" stroke="currentColor" strokeWidth="1.1" opacity="0.3" transform="rotate(-30 145 70)" />
      <ellipse cx="145" cy="70" rx="32" ry="14" stroke="currentColor" strokeWidth="1.1" opacity="0.3" transform="rotate(30 145 70)" />
      <ellipse cx="145" cy="70" rx="32" ry="14" stroke="currentColor" strokeWidth="0.8" opacity="0.15" transform="rotate(90 145 70)" />
      {/* Nucleus */}
      <circle cx="145" cy="70" r="5" stroke="currentColor" strokeWidth="1.3" opacity="0.4" />
      <circle cx="145" cy="70" r="2" fill="currentColor" opacity="0.2" />
      {/* Electron dots on orbits */}
      <circle cx="170" cy="55" r="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="122" cy="85" r="2.5" fill="currentColor" opacity="0.2" />
      <circle cx="155" cy="95" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="135" cy="45" r="2" fill="currentColor" opacity="0.15" />
      <circle cx="170" cy="82" r="1.5" fill="currentColor" opacity="0.1" />
      {/* Connection — DNA to orbital */}
      <path d="M102 70 Q115 68 125 68" stroke="currentColor" strokeWidth="0.7" opacity="0.2" strokeDasharray="4 3" />
      <path d="M102 80 Q118 82 128 78" stroke="currentColor" strokeWidth="0.6" opacity="0.15" strokeDasharray="3 3" />
    </svg>
  );
}
