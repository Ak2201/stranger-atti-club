type Props = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  children: React.ReactNode;
  id?: string;
  className?: string;
};

export default function Section({
  eyebrow,
  title,
  intro,
  children,
  id,
  className = '',
}: Props) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:py-20 ${className}`}
    >
      {(eyebrow || title || intro) && (
        <header className="mb-8 max-w-2xl sm:mb-10">
          {eyebrow && (
            <p className="font-display text-xs uppercase tracking-[0.25em] text-crimson sm:text-sm">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="balance mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">
              {title}
            </h2>
          )}
          {intro && (
            <p className="mt-3 text-base text-ink-soft sm:mt-4 sm:text-lg">
              {intro}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
