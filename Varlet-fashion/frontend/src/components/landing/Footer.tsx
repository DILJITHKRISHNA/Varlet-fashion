import { Logo } from "./Nav";

const links = [
  { href: "#snap", label: "Snap search" },
  { href: "#looks", label: "Looks" },
  { href: "#stores", label: "For stores" },
  { href: "#faq", label: "FAQ" },
];

export function Footer() {
  return (
    <footer className="overflow-hidden px-6 pt-16">
      <div className="mx-auto max-w-6xl border-t border-border pt-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Find the style you want. Discover the store that has it.
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Varlet. Made in India.
        </p>
      </div>
      <p
        aria-hidden="true"
        className="display mt-6 translate-y-[18%] select-none bg-gradient-to-b from-white/15 to-transparent bg-clip-text text-center text-[26vw] font-bold leading-none text-transparent"
      >
        Varlet
      </p>
    </footer>
  );
}
