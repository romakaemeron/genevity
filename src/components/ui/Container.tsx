interface Props {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className = "" }: Props) {
  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-12 ${className}`}
      style={{ maxWidth: 1200 }}
    >
      {children}
    </div>
  );
}
