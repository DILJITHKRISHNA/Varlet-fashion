const styles = [
  "Streetwear",
  "Ethnic",
  "Korean",
  "Sneakers",
  "Denim",
  "Formal",
  "Party",
  "Accessories",
];

export function StyleMarquee() {
  return (
    <div className="overflow-hidden py-4">
      <div
        className="relative -rotate-1 border-y border-border bg-surface/60 py-5"
        aria-hidden="true"
      >
        <div className="marquee flex w-max items-center">
          {[...styles, ...styles].map((style, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`px-7 text-3xl md:text-5xl ${i % 2 ? "serif-accent text-gradient" : "display font-semibold"}`}
              >
                {style}
              </span>
              <span className="h-2 w-2 rotate-45 bg-accent" />
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
