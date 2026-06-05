/** Abstract line-art illustration: Venus symbol with orbital rings and molecular nodes — gynaecology */
export default function GynaecologyIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Venus circle — main form */}
      <circle cx="100" cy="68" r="38" stroke="currentColor" strokeWidth="1.5" opacity="0.48" />
      {/* Inner ring */}
      <circle cx="100" cy="68" r="26" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      {/* Centre nucleus */}
      <circle cx="100" cy="68" r="5" stroke="currentColor" strokeWidth="1.2" opacity="0.42" />
      <circle cx="100" cy="68" r="2" fill="currentColor" opacity="0.22" />
      {/* Vertical stem */}
      <line x1="100" y1="106" x2="100" y2="134" stroke="currentColor" strokeWidth="1.4" opacity="0.48" strokeLinecap="round" />
      {/* Crossbar */}
      <line x1="84" y1="124" x2="116" y2="124" stroke="currentColor" strokeWidth="1.4" opacity="0.48" strokeLinecap="round" />
      {/* Orbital ellipse — tilted left */}
      <ellipse cx="100" cy="68" rx="58" ry="20" stroke="currentColor" strokeWidth="1.1" opacity="0.28" transform="rotate(-30 100 68)" />
      {/* Orbital ellipse — tilted right */}
      <ellipse cx="100" cy="68" rx="58" ry="20" stroke="currentColor" strokeWidth="1.1" opacity="0.28" transform="rotate(30 100 68)" />
      {/* Orbital ellipse — near horizontal */}
      <ellipse cx="100" cy="68" rx="58" ry="14" stroke="currentColor" strokeWidth="0.7" opacity="0.14" transform="rotate(0 100 68)" />
      {/* Electron / node dots */}
      <circle cx="150" cy="50" r="3" fill="currentColor" opacity="0.22" />
      <circle cx="50" cy="86" r="3" fill="currentColor" opacity="0.22" />
      <circle cx="158" cy="82" r="2.5" fill="currentColor" opacity="0.16" />
      <circle cx="42" cy="54" r="2.5" fill="currentColor" opacity="0.16" />
      {/* Outer background ring */}
      <circle cx="100" cy="68" r="54" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
      {/* Accent dots top */}
      <circle cx="100" cy="10" r="1.8" fill="currentColor" opacity="0.14" />
      <circle cx="88" cy="14" r="1.5" fill="currentColor" opacity="0.1" />
      <circle cx="112" cy="14" r="1.5" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
