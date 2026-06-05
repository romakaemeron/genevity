/** Abstract line-art illustration: ECG heartbeat wave inside a circular monitor with data bars — diagnostics */
export default function DiagnosticsIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Monitor circle */}
      <circle cx="88" cy="78" r="54" stroke="currentColor" strokeWidth="1.3" opacity="0.28" />
      <circle cx="88" cy="78" r="44" stroke="currentColor" strokeWidth="0.8" opacity="0.17" />
      {/* ECG baseline */}
      <line x1="40" y1="78" x2="52" y2="78" stroke="currentColor" strokeWidth="1.3" opacity="0.45" strokeLinecap="round" />
      {/* ECG spike */}
      <path d="M52 78 L58 62 L63 96 L70 78 L76 78 L80 68 L86 90 L92 78" stroke="currentColor" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
      {/* ECG tail */}
      <line x1="92" y1="78" x2="136" y2="78" stroke="currentColor" strokeWidth="1.3" opacity="0.4" strokeLinecap="round" />
      {/* Pulse dot */}
      <circle cx="92" cy="78" r="3.5" stroke="currentColor" strokeWidth="1.3" opacity="0.5" />
      <circle cx="92" cy="78" r="1.5" fill="currentColor" opacity="0.28" />
      {/* Pulse ripple rings */}
      <circle cx="92" cy="78" r="9" stroke="currentColor" strokeWidth="0.8" opacity="0.22" />
      <circle cx="92" cy="78" r="17" stroke="currentColor" strokeWidth="0.6" opacity="0.13" />
      {/* Grid reference lines */}
      <line x1="40" y1="62" x2="136" y2="62" stroke="currentColor" strokeWidth="0.5" opacity="0.12" strokeDasharray="3 5" />
      <line x1="40" y1="94" x2="136" y2="94" stroke="currentColor" strokeWidth="0.5" opacity="0.12" strokeDasharray="3 5" />
      {/* Data bar chart — bottom right */}
      <rect x="148" y="102" width="7" height="28" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="158" y="90" width="7" height="40" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      <rect x="168" y="96" width="7" height="34" rx="1.5" stroke="currentColor" strokeWidth="1" opacity="0.28" />
      {/* Bar base line */}
      <line x1="146" y1="130" x2="177" y2="130" stroke="currentColor" strokeWidth="0.8" opacity="0.25" />
      {/* Small decorative dots */}
      <circle cx="155" cy="75" r="1.5" fill="currentColor" opacity="0.13" />
      <circle cx="165" cy="68" r="1.5" fill="currentColor" opacity="0.11" />
      <circle cx="175" cy="60" r="2" fill="currentColor" opacity="0.1" />
    </svg>
  );
}
