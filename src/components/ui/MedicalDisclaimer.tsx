export default function MedicalDisclaimer({ text }: { text: string }) {
  return (
    <p className="body-s text-muted italic border-l-2 border-line pl-4 mt-8">
      {text}
    </p>
  );
}
