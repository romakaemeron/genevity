/** Abstract line-art illustration: focused laser beam with precision grid — laser hair removal */
export default function LaserIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Laser source housing */}
      <rect x="75" y="12" width="50" height="24" rx="6" stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <circle cx="100" cy="24" r="7" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
      <circle cx="100" cy="24" r="3" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      <circle cx="100" cy="24" r="1" fill="currentColor" opacity="0.3" />
      {/* Lens detail */}
      <path d="M90 36 Q100 40 110 36" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
      {/* Beam — converging lines */}
      <line x1="88" y1="36" x2="94" y2="88" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
      <line x1="112" y1="36" x2="106" y2="88" stroke="currentColor" strokeWidth="1.1" opacity="0.45" />
      <line x1="100" y1="36" x2="100" y2="88" stroke="currentColor" strokeWidth="1.3" opacity="0.35" />
      {/* Secondary beam edges */}
      <line x1="92" y1="36" x2="96" y2="88" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      <line x1="108" y1="36" x2="104" y2="88" stroke="currentColor" strokeWidth="0.6" opacity="0.2" />
      {/* Focus point — impact */}
      <circle cx="100" cy="93" r="4" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
      <circle cx="100" cy="93" r="1.5" fill="currentColor" opacity="0.35" />
      {/* Impact ripples */}
      <circle cx="100" cy="93" r="10" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <circle cx="100" cy="93" r="17" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <circle cx="100" cy="93" r="25" stroke="currentColor" strokeWidth="0.6" opacity="0.12" />
      <circle cx="100" cy="93" r="34" stroke="currentColor" strokeWidth="0.4" opacity="0.07" />
      {/* Precision grid — skin surface */}
      <line x1="62" y1="115" x2="138" y2="115" stroke="currentColor" strokeWidth="0.7" opacity="0.2" />
      <line x1="60" y1="125" x2="140" y2="125" stroke="currentColor" strokeWidth="0.7" opacity="0.15" />
      <line x1="58" y1="135" x2="142" y2="135" stroke="currentColor" strokeWidth="0.6" opacity="0.1" />
      <line x1="58" y1="145" x2="142" y2="145" stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
      {/* Vertical grid */}
      <line x1="80" y1="108" x2="78" y2="148" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      <line x1="100" y1="98" x2="100" y2="148" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      <line x1="120" y1="108" x2="122" y2="148" stroke="currentColor" strokeWidth="0.5" opacity="0.12" />
      {/* Grid intersections */}
      <circle cx="80" cy="115" r="1" fill="currentColor" opacity="0.12" />
      <circle cx="100" cy="115" r="1" fill="currentColor" opacity="0.12" />
      <circle cx="120" cy="115" r="1" fill="currentColor" opacity="0.12" />
      <circle cx="80" cy="125" r="1" fill="currentColor" opacity="0.08" />
      <circle cx="100" cy="125" r="1" fill="currentColor" opacity="0.08" />
      <circle cx="120" cy="125" r="1" fill="currentColor" opacity="0.08" />
      {/* Scattered photons */}
      <circle cx="68" cy="50" r="2" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <circle cx="132" cy="50" r="1.5" stroke="currentColor" strokeWidth="0.8" opacity="0.2" />
      <circle cx="140" cy="72" r="2" stroke="currentColor" strokeWidth="0.7" opacity="0.15" />
      <circle cx="60" cy="78" r="1.5" stroke="currentColor" strokeWidth="0.7" opacity="0.15" />
      <circle cx="72" cy="62" r="1" fill="currentColor" opacity="0.12" />
      <circle cx="128" cy="62" r="1" fill="currentColor" opacity="0.12" />
    </svg>
  );
}
