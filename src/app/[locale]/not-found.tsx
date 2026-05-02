import MegaMenuHeader from "@/components/layout/MegaMenuHeader";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <MegaMenuHeader variant="solid" position="fixed" />
      <div className="min-h-screen bg-champagne flex flex-col items-center justify-center px-6 text-center pt-24 pb-20">
        <p className="body-s text-muted mb-4 tracking-widest uppercase">
          Сторінка не знайдена
        </p>
        <h1
          className="text-black mb-6"
          style={{
            fontFamily: "var(--font-heading, serif)",
            fontSize: "clamp(80px, 18vw, 160px)",
            lineHeight: 1,
          }}
        >
          404
        </h1>
        <p className="body-l text-muted max-w-md mb-10">
          Схоже, ця сторінка не існує або була переміщена. Поверніться на головну або скористайтеся навігацією.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Button href="/" variant="primary" size="lg">
            На головну
          </Button>
          <Button href="/services" variant="outline" size="lg">
            Послуги
          </Button>
        </div>
      </div>
    </>
  );
}
