"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { fadeInUp, staggerContainer, viewportConfig } from "@/lib/motion";
import { ChevronRight, Plus, Phone, MapPin, Clock } from "@/components/ui/Icons";

/* ─── Helpers ─── */
function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-20 border-b border-black-5 last:border-b-0 scroll-mt-[7.5rem] lg:scroll-mt-[8.5rem]">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)]">
        <h2 className="heading-2 text-black mb-4">{title}</h2>
        <p className="body-m text-black-40 mb-12 max-w-[600px]">{subtitle}</p>
        {children}
      </div>
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow text-black-40 mb-4">{children}</p>;
}

function ColorSwatch({
  name,
  bgClass,
  cssVar,
}: {
  name: string;
  bgClass: string;
  cssVar: string;
}) {
  return (
    <div className="rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-sm)] hover:-translate-y-1 hover:shadow-[var(--shadow-md)] transition-all duration-200 ease-out">
      <div className={`h-20 w-full ${bgClass}`} />
      <div className="bg-white p-3">
        <p className="text-[12px] font-semibold text-black">{name}</p>
        <p className="caption text-black-40 font-mono">{cssVar}</p>
      </div>
    </div>
  );
}

/* ─── Nav ─── */
const navItems = [
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "buttons", label: "Buttons" },
  { id: "spacing", label: "Spacing" },
  { id: "shadows", label: "Shadows" },
  { id: "radius", label: "Radius" },
  { id: "sections", label: "Sections" },
];

/* ─── Page ─── */
export default function UIKitPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="bg-black text-champagne py-24 relative overflow-hidden">
        <div className="absolute -top-1/2 -right-[20%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(160,136,120,.15)_0%,transparent_70%)] rounded-full" />
        <div className="absolute -bottom-[30%] -left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(195,216,231,.1)_0%,transparent_70%)] rounded-full" />
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] relative z-10">
          <p className="eyebrow text-main-light mb-6">GENEVITY</p>
          <h1 className="font-[var(--font-heading)] font-light text-[clamp(48px,6vw,80px)] leading-[0.9] tracking-[-0.03em] max-w-[800px] mb-6">
            Design <em className="italic text-ice">System</em>
          </h1>
          <p className="body-l text-white-60 max-w-[500px]">
            Visual language tokens, components, and patterns that form the GENEVITY brand identity.
          </p>
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-16 lg:top-20 z-40 bg-champagne/85 backdrop-blur-[20px] backdrop-saturate-[180%] border-b border-black-5 py-4">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-[var(--container-padding)] flex items-center gap-8 overflow-x-auto scrollbar-hide">
          <span className="font-[var(--font-heading)] text-[20px] font-semibold text-main-dark tracking-[0.08em] uppercase whitespace-nowrap">
            GENEVITY
            <span className="block text-[11px] font-[var(--font-body)] font-medium text-black-40 tracking-[0.2em] uppercase mt-0.5">
              Design System
            </span>
          </span>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="text-[13px] font-medium text-black-40 hover:text-main-dark transition-colors whitespace-nowrap tracking-[0.02em]"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ═══════════════════════════════════
         1. COLORS
         ═══════════════════════════════════ */}
      <Section id="colors" title="Color Palette" subtitle="All colors are defined as CSS custom properties. Use only the variable names — never hardcode hex values.">
        <Label>Brand Core — Warm Brown</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          <ColorSwatch name="Main" bgClass="bg-main" cssVar="--color-main" />
          <ColorSwatch name="Main Dark" bgClass="bg-main-dark" cssVar="--color-main-dark" />
          <ColorSwatch name="Main Darker" bgClass="bg-main-darker" cssVar="--color-main-darker" />
          <ColorSwatch name="Main Light" bgClass="bg-main-light" cssVar="--color-main-light" />
          <ColorSwatch name="Main Lighter" bgClass="bg-main-lighter" cssVar="--color-main-lighter" />
          <ColorSwatch name="Main Subtle" bgClass="bg-main-subtle" cssVar="--color-main-subtle" />
        </div>

        <Label>Champagne — Warm Cream</Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <ColorSwatch name="Champagne" bgClass="bg-champagne" cssVar="--color-champagne" />
          <ColorSwatch name="Champagne Dark" bgClass="bg-champagne-dark" cssVar="--color-champagne-dark" />
          <ColorSwatch name="Champagne Darker" bgClass="bg-champagne-darker" cssVar="--color-champagne-darker" />
          <ColorSwatch name="Champagne Warm" bgClass="bg-champagne-warm" cssVar="--color-champagne-warm" />
        </div>

        <Label>Ice — Cool Blue</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          <ColorSwatch name="Ice" bgClass="bg-ice" cssVar="--color-ice" />
          <ColorSwatch name="Ice Dark" bgClass="bg-ice-dark" cssVar="--color-ice-dark" />
          <ColorSwatch name="Ice Darker" bgClass="bg-ice-darker" cssVar="--color-ice-darker" />
          <ColorSwatch name="Ice Light" bgClass="bg-ice-light" cssVar="--color-ice-light" />
          <ColorSwatch name="Ice Lighter" bgClass="bg-ice-lighter" cssVar="--color-ice-lighter" />
          <ColorSwatch name="Ice Subtle" bgClass="bg-ice-subtle" cssVar="--color-ice-subtle" />
        </div>

        <Label>Stone — Neutral Gray</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          <ColorSwatch name="Stone" bgClass="bg-stone" cssVar="--color-stone" />
          <ColorSwatch name="Stone Dark" bgClass="bg-stone-dark" cssVar="--color-stone-dark" />
          <ColorSwatch name="Stone Darker" bgClass="bg-stone-darker" cssVar="--color-stone-darker" />
          <ColorSwatch name="Stone Light" bgClass="bg-stone-light" cssVar="--color-stone-light" />
          <ColorSwatch name="Stone Lighter" bgClass="bg-stone-lighter" cssVar="--color-stone-lighter" />
          <ColorSwatch name="Stone Subtle" bgClass="bg-stone-subtle" cssVar="--color-stone-subtle" />
        </div>

        <Label>Neutrals</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-10">
          <ColorSwatch name="Black" bgClass="bg-black" cssVar="--color-black" />
          <ColorSwatch name="Black 80" bgClass="bg-black-80" cssVar="--color-black-80" />
          <ColorSwatch name="Black 60" bgClass="bg-black-60" cssVar="--color-black-60" />
          <ColorSwatch name="Black 40" bgClass="bg-black-40" cssVar="--color-black-40" />
          <ColorSwatch name="Black 20" bgClass="bg-black-20" cssVar="--color-black-20" />
          <ColorSwatch name="Black 10" bgClass="bg-black-10" cssVar="--color-black-10" />
          <ColorSwatch name="Black 5" bgClass="bg-black-5" cssVar="--color-black-5" />
          <ColorSwatch name="White" bgClass="bg-white border border-black-5" cssVar="--color-white" />
          <ColorSwatch name="White 80" bgClass="bg-white-80 border border-black-5" cssVar="--color-white-80" />
          <ColorSwatch name="White 60" bgClass="bg-white-60 border border-black-5" cssVar="--color-white-60" />
        </div>

        <Label>Semantic</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-10">
          <ColorSwatch name="Error" bgClass="bg-error" cssVar="--color-error" />
          <ColorSwatch name="Error Light" bgClass="bg-error-light" cssVar="--color-error-light" />
          <ColorSwatch name="Success" bgClass="bg-success" cssVar="--color-success" />
          <ColorSwatch name="Success Light" bgClass="bg-success-light" cssVar="--color-success-light" />
          <ColorSwatch name="Warning" bgClass="bg-warning" cssVar="--color-warning" />
          <ColorSwatch name="Warning Light" bgClass="bg-warning-light" cssVar="--color-warning-light" />
        </div>

        <Label>Surfaces</Label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          <ColorSwatch name="Primary" bgClass="bg-surface-primary" cssVar="--color-surface-primary" />
          <ColorSwatch name="Secondary" bgClass="bg-surface-secondary" cssVar="--color-surface-secondary" />
          <ColorSwatch name="Tertiary" bgClass="bg-surface-tertiary" cssVar="--color-surface-tertiary" />
          <ColorSwatch name="Elevated" bgClass="bg-surface-elevated border border-black-5" cssVar="--color-surface-elevated" />
          <ColorSwatch name="Dark" bgClass="bg-surface-dark" cssVar="--color-surface-dark" />
          <ColorSwatch name="Dark Elevated" bgClass="bg-surface-dark-elevated" cssVar="--color-surface-dark-elevated" />
        </div>
      </Section>

      {/* ═══════════════════════════════════
         2. TYPOGRAPHY
         ═══════════════════════════════════ */}
      <Section id="typography" title="Typography" subtitle="Cormorant Garamond for headings, Montserrat for body text. All preset classes defined in globals.css.">
        <div className="flex flex-col">
          {/* H1 */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Heading 1</p>
              <p className="caption text-black-40 font-mono">.heading-1</p>
              <p className="caption text-black-40 font-mono">Cormorant 600</p>
              <p className="caption text-black-40 font-mono">40–64px / 0.85</p>
            </div>
            <p className="heading-1">Мистецтво довголіття</p>
          </div>

          {/* H2 */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Heading 2</p>
              <p className="caption text-black-40 font-mono">.heading-2</p>
              <p className="caption text-black-40 font-mono">Cormorant 600</p>
              <p className="caption text-black-40 font-mono">32–48px / 0.85</p>
            </div>
            <p className="heading-2">Наші послуги</p>
          </div>

          {/* H3 */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Heading 3</p>
              <p className="caption text-black-40 font-mono">.heading-3</p>
              <p className="caption text-black-40 font-mono">Cormorant 600</p>
              <p className="caption text-black-40 font-mono">24–36px / 0.9</p>
            </div>
            <p className="heading-3">Лазерна косметологія</p>
          </div>

          {/* Body L */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Body Large</p>
              <p className="caption text-black-40 font-mono">.body-l</p>
              <p className="caption text-black-40 font-mono">Montserrat 500</p>
              <p className="caption text-black-40 font-mono">16px / 1.6</p>
            </div>
            <p className="body-l max-w-xl">Індивідуальний підхід до кожного пацієнта з використанням найсучасніших технологій та методик anti-age медицини.</p>
          </div>

          {/* Body Strong */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Body Strong</p>
              <p className="caption text-black-40 font-mono">.body-strong</p>
              <p className="caption text-black-40 font-mono">Montserrat 600</p>
              <p className="caption text-black-40 font-mono">16px / 1.6</p>
            </div>
            <p className="body-strong max-w-xl">Використовуємо тільки сертифіковане обладнання та препарати.</p>
          </div>

          {/* Body M */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Body Medium</p>
              <p className="caption text-black-40 font-mono">.body-m</p>
              <p className="caption text-black-40 font-mono">Montserrat 500</p>
              <p className="caption text-black-40 font-mono">14px / 1.5</p>
            </div>
            <p className="body-m max-w-xl">Клініка естетичної медицини та довголіття у центрі Дніпра.</p>
          </div>

          {/* Body S */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Body Small</p>
              <p className="caption text-black-40 font-mono">.body-s</p>
              <p className="caption text-black-40 font-mono">Montserrat 500</p>
              <p className="caption text-black-40 font-mono">12px / 1.4</p>
            </div>
            <p className="body-s text-black-60 max-w-xl">Ліцензія МОЗ України. Працюємо з 2018 року.</p>
          </div>

          {/* Eyebrow */}
          <div className="py-8 border-b border-black-5 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Eyebrow</p>
              <p className="caption text-black-40 font-mono">.eyebrow</p>
              <p className="caption text-black-40 font-mono">Montserrat 600</p>
              <p className="caption text-black-40 font-mono">11px / 0.15em</p>
            </div>
            <p className="eyebrow text-main">LONGEVITY CENTER</p>
          </div>

          {/* Caption */}
          <div className="py-8 flex flex-col lg:flex-row lg:items-baseline gap-4 lg:gap-8">
            <div className="lg:w-40 shrink-0">
              <p className="text-[12px] font-semibold text-main">Caption</p>
              <p className="caption text-black-40 font-mono">.caption</p>
              <p className="caption text-black-40 font-mono">Montserrat 500</p>
              <p className="caption text-black-40 font-mono">11px / 1.4</p>
            </div>
            <p className="caption text-black-60">--color-main: #A08878</p>
          </div>
        </div>
      </Section>

      {/* ═══════════════════════════════════
         3. BUTTONS
         ═══════════════════════════════════ */}
      <Section id="buttons" title="Buttons" subtitle="All interactive button variants, sizes, shapes, and states available in the component system.">
        {/* Variants */}
        <Label>Variants</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="dark">Dark</Button>
        </div>

        {/* Sizes */}
        <Label>Sizes</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="md">Medium</Button>
          <Button variant="primary" size="lg">Large</Button>
          <Button variant="primary" size="xl">Extra Large</Button>
        </div>

        {/* Pill shape */}
        <Label>Pill Shape</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" pill>Записатися на прийом</Button>
          <Button variant="secondary" pill>Консультація</Button>
          <Button variant="outline" pill>Каталог послуг</Button>
        </div>

        {/* Icon buttons */}
        <Label>Icon Buttons</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" icon>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button variant="secondary" icon>
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="outline" icon>
            <MapPin className="w-5 h-5" />
          </Button>
          <Button variant="ghost" icon>
            <Plus className="w-5 h-5" />
          </Button>
          <Button variant="dark" icon>
            <Clock className="w-5 h-5" />
          </Button>
        </div>

        {/* Icon button sizes */}
        <Label>Icon Button Sizes</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" icon size="sm">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="primary" icon size="md">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button variant="primary" icon size="lg">
            <ChevronRight className="w-6 h-6" />
          </Button>
          <Button variant="primary" icon size="xl">
            <ChevronRight className="w-7 h-7" />
          </Button>
        </div>

        {/* Disabled */}
        <Label>Disabled State</Label>
        <div className="flex flex-wrap items-center gap-4 mb-10">
          <Button variant="primary" disabled>Primary</Button>
          <Button variant="secondary" disabled>Secondary</Button>
          <Button variant="outline" disabled>Outline</Button>
          <Button variant="ghost" disabled>Ghost</Button>
          <Button variant="dark" disabled>Dark</Button>
        </div>

        {/* On dark background */}
        <Label>On Dark Background</Label>
        <div className="bg-black rounded-[var(--radius-card)] p-8 flex flex-wrap items-center gap-4">
          <Button variant="outline-light">Outline Light</Button>
          <Button variant="primary" className="bg-champagne text-black hover:bg-champagne-dark">White</Button>
          <Button variant="primary" className="bg-champagne text-black hover:bg-champagne-dark" pill size="lg">Безкоштовна консультація</Button>
        </div>
      </Section>

      {/* ═══════════════════════════════════
         4. SPACING
         ═══════════════════════════════════ */}
      <Section id="spacing" title="Spacing Scale" subtitle="Consistent spacing tokens used throughout all components and layouts.">
        <div className="flex flex-col gap-3">
          {[
            { name: "Section", cssVar: "--spacing-section", value: "120px" },
            { name: "Block", cssVar: "--spacing-block", value: "64px" },
            { name: "Element", cssVar: "--spacing-element", value: "32px" },
            { name: "Card", cssVar: "--spacing-card", value: "24px" },
            { name: "Inner", cssVar: "--spacing-inner", value: "16px" },
            { name: "Tight", cssVar: "--spacing-tight", value: "12px" },
            { name: "XS", cssVar: "--spacing-xs", value: "8px" },
            { name: "2XS", cssVar: "--spacing-2xs", value: "4px" },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-4">
              <p className="body-m font-medium text-black-60 w-20 text-right shrink-0">{s.name}</p>
              <div
                className="h-6 bg-ice-lighter rounded-[4px] border border-ice"
                style={{ width: s.value }}
              />
              <p className="caption text-black-40 font-mono shrink-0">{s.cssVar}: {s.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════
         5. SHADOWS
         ═══════════════════════════════════ */}
      <Section id="shadows" title="Shadows & Elevation" subtitle="Elevation system from subtle to prominent. All defined as CSS custom properties.">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[
            { name: "Small", cssVar: "--shadow-sm", shadowClass: "shadow-[var(--shadow-sm)]" },
            { name: "Medium", cssVar: "--shadow-md", shadowClass: "shadow-[var(--shadow-md)]" },
            { name: "Large", cssVar: "--shadow-lg", shadowClass: "shadow-[var(--shadow-lg)]" },
            { name: "XL", cssVar: "--shadow-xl", shadowClass: "shadow-[var(--shadow-xl)]" },
            { name: "Card", cssVar: "--shadow-card", shadowClass: "shadow-[var(--shadow-card)]" },
            { name: "Card Hover", cssVar: "--shadow-card-hover", shadowClass: "shadow-[var(--shadow-card-hover)]" },
            { name: "Glow", cssVar: "--shadow-glow", shadowClass: "shadow-[var(--shadow-glow)]" },
          ].map((s) => (
            <div
              key={s.name}
              className={`bg-white rounded-[var(--radius-card)] h-[120px] flex flex-col items-center justify-center ${s.shadowClass}`}
            >
              <p className="body-m font-medium text-black-60">{s.name}</p>
              <p className="caption text-black-40 font-mono">{s.cssVar}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════
         6. BORDER RADIUS
         ═══════════════════════════════════ */}
      <Section id="radius" title="Border Radius" subtitle="Consistent rounding across all UI elements.">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {[
            { name: "SM", cssVar: "--radius-sm", value: "8px", radiusClass: "rounded-[var(--radius-sm)]" },
            { name: "Button", cssVar: "--radius-button", value: "12px", radiusClass: "rounded-[var(--radius-button)]" },
            { name: "Card", cssVar: "--radius-card", value: "16px", radiusClass: "rounded-[var(--radius-card)]" },
            { name: "Input", cssVar: "--radius-input", value: "16px", radiusClass: "rounded-[var(--radius-input)]" },
            { name: "Pill", cssVar: "--radius-pill", value: "999px", radiusClass: "rounded-[var(--radius-pill)]" },
          ].map((r) => (
            <div key={r.name} className="flex flex-col items-center gap-3">
              <div
                className={`w-24 h-24 bg-main flex items-center justify-center text-champagne body-s ${r.radiusClass}`}
              >
                {r.value}
              </div>
              <div className="text-center">
                <p className="body-m font-medium text-black">{r.name}</p>
                <p className="caption text-black-40 font-mono">{r.cssVar}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ═══════════════════════════════════
         7. SECTION SAMPLES — using actual project card patterns
         ═══════════════════════════════════ */}
      <Section id="sections" title="Section Samples" subtitle="Real component patterns from the GENEVITY website. Each card type is pulled from actual sections.">

        {/* --- Hero-style section --- */}
        <Label>Hero Banner</Label>
        <div className="rounded-[var(--radius-card)] overflow-hidden mb-12">
          <div className="bg-black text-champagne p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 bottom-0 w-[40%] bg-[linear-gradient(135deg,transparent_0%,rgba(195,216,231,.08)_100%)]" />
            <p className="eyebrow text-ice mb-5 relative pl-10 before:content-[''] before:absolute before:left-0 before:top-1/2 before:w-7 before:h-px before:bg-ice">
              LONGEVITY CENTER
            </p>
            <h2 className="font-[var(--font-heading)] font-light text-[clamp(36px,4vw,56px)] leading-[0.95] tracking-[-0.02em] max-w-[600px] mb-5 relative">
              Мистецтво <em className="italic text-ice">довголіття</em>
            </h2>
            <p className="body-l text-white-60 max-w-[420px] mb-8 relative">
              Індивідуальний підхід до кожного пацієнта з використанням найсучасніших технологій.
            </p>
            <div className="flex flex-wrap gap-3 relative">
              <Button variant="primary" className="bg-champagne text-black hover:bg-white">Записатися</Button>
              <Button variant="outline-light">Наші послуги</Button>
            </div>
          </div>
        </div>

        {/* --- Stats grid (from Stats section) --- */}
        <Label>Stats Grid</Label>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mb-12">
          <div className="bg-main rounded-[var(--radius-card)] p-8 lg:p-12">
            <div className="grid grid-cols-2 gap-8">
              {[
                { value: "15+", label: "Років досвіду" },
                { value: "5000+", label: "Пацієнтів" },
                { value: "50+", label: "Процедур" },
                { value: "12", label: "Лікарів" },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="font-[var(--font-heading)] text-champagne text-4xl lg:text-5xl font-semibold">{stat.value}</p>
                  <p className="body-m text-champagne/60 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-main rounded-[var(--radius-card)] min-h-[233px] flex items-center justify-center text-champagne/20 body-m">
            Image
          </div>
        </div>

        {/* --- Doctor cards (from Experts section) --- */}
        <Label>Doctor Cards</Label>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide mb-12">
          {[
            { name: "Др. Олена Коваленко", exp: "15 років досвіду", specs: ["Дерматологія", "Anti-Age"] },
            { name: "Др. Андрій Мельник", exp: "12 років досвіду", specs: ["Косметологія", "Ін'єкції"] },
            { name: "Др. Марина Шевченко", exp: "10 років досвіду", specs: ["Лазерна терапія", "Естетика"] },
          ].map((doc, i) => (
            <div key={i} className="shrink-0 w-[280px] lg:w-[300px] bg-main rounded-[var(--radius-card)] overflow-hidden pb-3">
              <div className="h-[280px] lg:h-[308px] bg-gradient-to-b from-main-light/40 to-main-dark/40 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">Photo</div>
              </div>
              <div className="px-3 pt-3 flex flex-col gap-2">
                <p className="body-strong text-champagne">{doc.name}</p>
                <p className="body-strong text-champagne/80">{doc.exp}</p>
                {doc.specs.map((s, j) => (
                  <p key={j} className="body-strong text-champagne/60">{s}</p>
                ))}
                <Button variant="primary" className="mt-2 bg-champagne text-black hover:bg-champagne-dark w-full">
                  Записатися
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* --- Technology cards (from Technology section) --- */}
        <Label>Technology Cards</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { name: "Morpheus8", desc: "RF-мікронідлінг для підтяжки та омолодження шкіри обличчя та тіла." },
            { name: "Lumenis M22", desc: "Платформа для фотоомолодження, видалення судин та пігментації." },
            { name: "HydraFacial", desc: "Глибоке зволоження та очищення шкіри обличчя." },
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -8 }} className="group cursor-pointer">
              <div className="bg-main rounded-[var(--radius-card)] aspect-[352/252] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-main-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">{item.name}</div>
              </div>
              <div className="mt-3 px-3">
                <p className="text-black">
                  <span className="body-strong">{item.name}. </span>
                  <span className="body-l text-black-60">{item.desc}</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Service pills (from Services section) --- */}
        <Label>Service Tag Pills</Label>
        <div className="flex flex-wrap gap-3 mb-12">
          {[
            "Біоревіталізація", "Мезотерапія", "Ботулінотерапія", "Контурна пластика",
            "PRP-терапія", "IV-терапія", "Check-Up", "Лазерне омолодження",
            "Трихологія", "HydraFacial", "Morpheus8", "Lumenis M22",
          ].map((item, i) => (
            <button
              key={i}
              className="px-4 py-2 rounded-[var(--radius-button)] border border-main text-black body-l hover:bg-main hover:text-champagne transition-colors duration-300 cursor-pointer"
            >
              {item}
            </button>
          ))}
        </div>

        {/* --- FAQ accordion (from FAQ section) --- */}
        <Label>FAQ Accordion</Label>
        <FAQSample />

        {/* --- CTA section --- */}
        <Label>CTA Banner</Label>
        <div className="rounded-[var(--radius-card)] overflow-hidden mb-12 bg-[linear-gradient(135deg,var(--color-main)_0%,var(--color-main-dark)_100%)] text-champagne p-12 lg:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-[100px] -right-[100px] w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(255,255,255,.06)_0%,transparent_70%)] rounded-full" />
          <h2 className="font-[var(--font-heading)] font-normal text-[clamp(32px,3.5vw,48px)] leading-none mb-4 relative">Почніть шлях до довголіття</h2>
          <p className="body-l text-white-60 max-w-[500px] mx-auto mb-8 relative">Запишіться на безкоштовну консультацію та отримайте індивідуальний план оздоровлення.</p>
          <div className="relative">
            <Button variant="outline-light" size="lg" pill className="bg-champagne text-main-dark border-champagne hover:bg-white hover:text-black hover:border-white">
              Безкоштовна консультація
            </Button>
          </div>
        </div>

        {/* --- Concern cards (from Concerns section) --- */}
        <Label>Concern Cards</Label>
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide mb-12">
          {[
            { title: "Зморшки", desc: "Корекція мімічних та вікових зморшок сучасними методами." },
            { title: "Пігментація", desc: "Видалення пігментних плям та вирівнювання тону шкіри." },
            { title: "Овал обличчя", desc: "Підтяжка та корекція контурів обличчя без хірургії." },
            { title: "Випадіння волосся", desc: "Діагностика та лікування алопеції різного типу." },
          ].map((item, i) => (
            <div key={i} className="shrink-0 w-[280px] lg:w-[300px]">
              <div className="bg-main rounded-[var(--radius-card)] h-[300px] lg:h-[350px] overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center text-champagne/20 body-m">{item.title}</div>
              </div>
              <div className="mt-3 px-3">
                <p className="text-black">
                  <span className="body-strong">{item.title}: </span>
                  <span className="body-l text-black-60">{item.desc}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Badges --- */}
        <Label>Badges</Label>
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-main-subtle text-main-dark">Main</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-ice-lighter text-ice-darker">Ice</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-success-light text-success">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Success
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-error-light text-error">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Error
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-warning-light text-warning">
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            Warning
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-black text-champagne">Dark</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-pill)] text-[11px] font-semibold tracking-[0.05em] bg-transparent shadow-[inset_0_0_0_1px_var(--color-black-10)] text-black-60">Outline</span>
        </div>

        {/* --- Form panel (from CTAForm section) --- */}
        <Label>Form Panel</Label>
        <div className="max-w-md bg-white rounded-[20px] p-10 shadow-[0_2px_8px_rgba(45,45,45,.03),0_12px_40px_rgba(45,45,45,.06)] relative overflow-hidden mb-12">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[linear-gradient(90deg,var(--color-main),var(--color-ice),var(--color-main-light))]" />
          <div className="text-center mb-10">
            <h3 className="font-[var(--font-heading)] text-[32px] font-semibold text-black tracking-[-0.01em] mb-2">Запис на прийом</h3>
            <p className="body-m text-black-40 max-w-[360px] mx-auto">Залиште свої дані і ми зв&apos;яжемось з вами протягом 15 хвилин.</p>
          </div>
          <div className="flex flex-col gap-7">
            <div>
              <label className="block eyebrow text-main mb-2.5">Ім&apos;я</label>
              <input
                type="text"
                placeholder="Ваше ім'я"
                className="w-full px-5 py-4 border border-champagne-darker rounded-[var(--radius-button)] bg-champagne font-[var(--font-body)] text-[15px] text-black placeholder:text-stone-light outline-none hover:border-main-lighter hover:bg-champagne-dark focus:border-main focus:bg-white focus:shadow-[0_0_0_4px_rgba(160,136,120,.1),0_4px_16px_rgba(160,136,120,.06)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]"
              />
            </div>
            <div>
              <label className="block eyebrow text-main mb-2.5">Телефон</label>
              <input
                type="tel"
                placeholder="+380"
                className="w-full px-5 py-4 border border-champagne-darker rounded-[var(--radius-button)] bg-champagne font-[var(--font-body)] text-[15px] text-black placeholder:text-stone-light outline-none hover:border-main-lighter hover:bg-champagne-dark focus:border-main focus:bg-white focus:shadow-[0_0_0_4px_rgba(160,136,120,.1),0_4px_16px_rgba(160,136,120,.06)] transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]"
              />
            </div>
            <div>
              <label className="block eyebrow text-main mb-2.5">Послуга</label>
              <div className="flex flex-wrap gap-2.5">
                {["Консультація", "Anti-Age", "Лазер"].map((opt, i) => (
                  <span
                    key={i}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 border rounded-[var(--radius-pill)] text-[13px] font-medium cursor-pointer transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)] select-none ${
                      i === 1
                        ? "bg-main border-main text-champagne shadow-[0_2px_8px_rgba(160,136,120,.2)]"
                        : "border-champagne-darker bg-champagne text-black-60 hover:border-main-lighter hover:text-main-dark"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full border-[1.5px] shrink-0 transition-all duration-[var(--duration-fast)] ${
                      i === 1 ? "bg-champagne border-champagne" : "border-current"
                    }`} />
                    {opt}
                  </span>
                ))}
              </div>
            </div>
            <button className="w-full py-[18px] px-8 border-none rounded-[var(--radius-button)] bg-main text-champagne font-[var(--font-body)] text-[14px] font-semibold tracking-[0.08em] uppercase cursor-pointer hover:bg-main-dark hover:shadow-[0_4px_20px_rgba(160,136,120,.25)] hover:-translate-y-px active:scale-[0.98] active:translate-y-0 transition-all duration-[var(--duration-fast)] ease-[var(--ease-out)]">
              Записатися
            </button>
          </div>
        </div>

        {/* --- Footer sample --- */}
        <Label>Footer</Label>
        <div className="bg-black text-champagne p-10 lg:p-16 rounded-[var(--radius-card)]">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
            <div>
              <p className="font-[var(--font-heading)] text-[28px] font-semibold tracking-[0.06em] uppercase mb-3">GENEVITY</p>
              <p className="body-m text-white-60 max-w-[280px]">Клініка естетичної медицини та довголіття у центрі Дніпра.</p>
            </div>
            <div>
              <p className="eyebrow text-white-60 mb-4">Послуги</p>
              <ul className="flex flex-col gap-2.5">
                {["Anti-Age", "Косметологія", "Лазер", "IV-терапія"].map((link) => (
                  <li key={link}><span className="body-m text-white-60 hover:text-champagne transition-colors cursor-pointer">{link}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-white-60 mb-4">Клініка</p>
              <ul className="flex flex-col gap-2.5">
                {["Про нас", "Лікарі", "Блог", "Контакти"].map((link) => (
                  <li key={link}><span className="body-m text-white-60 hover:text-champagne transition-colors cursor-pointer">{link}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-white-60 mb-4">Контакти</p>
              <ul className="flex flex-col gap-2.5">
                <li className="body-m text-white-60">+380 56 123 45 67</li>
                <li className="body-m text-white-60">вул. Грушевського 3, Дніпро</li>
                <li className="body-m text-white-60">Пн–Сб 09:00–20:00</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
            <p className="body-s text-white-60">&copy; 2025 GENEVITY. Всі права захищені.</p>
            <p className="body-s text-white-60">Ліцензія МОЗ України</p>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* ─── FAQ Sample sub-component ─── */
function FAQSample() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const items = [
    { q: "Як підготуватися до процедури?", a: "Рекомендуємо уникати сонячних ванн та алкоголю за 48 годин до процедури. Детальні інструкції надасть ваш лікар." },
    { q: "Скільки процедур потрібно?", a: "Кількість залежить від типу процедури та індивідуальних потреб. Зазвичай курс складає 3-6 сеансів." },
    { q: "Чи є протипоказання?", a: "Так, кожна процедура має свої протипоказання. Лікар оцінить їх на консультації." },
  ];

  return (
    <div className="max-w-2xl rounded-[var(--radius-button)] overflow-hidden mb-12">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between p-4 bg-main text-champagne border-b border-rosegold/30 cursor-pointer hover:bg-main-dark transition-colors"
            >
              <span className="body-l text-left">{item.q}</span>
              <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
                <Plus className="w-6 h-6 text-champagne" />
              </motion.span>
            </button>
            <div
              className="grid bg-main transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="p-4 bg-main-dark text-champagne/80 body-l">{item.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
