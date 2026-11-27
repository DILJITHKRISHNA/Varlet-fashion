import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { useAppCta } from "./AppCtaContext";

const links = [
  { href: "#snap", label: "Snap search" },
  { href: "#looks", label: "Looks" },
  { href: "#how", label: "How it works" },
  { href: "#stores", label: "For stores" },
  { href: "#faq", label: "FAQ" },
];

export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-accent text-lg font-bold text-accent-foreground">
        V
      </span>
      <span className="display text-xl font-semibold">Varlet</span>
    </span>
  );
}

export function Nav() {
  const { openDownload, openRegister } = useAppCta();
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3">
      <motion.div
        className="fixed inset-x-0 top-0 h-0.5 origin-left bg-gradient-accent"
        style={{ scaleX: progress }}
      />
      <div
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full px-3 pl-4 transition-colors duration-500 ${
          scrolled ? "glass shadow-soft" : "border border-transparent"
        }`}
      >
        <a href="#top" aria-label="Varlet home">
          <Logo />
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openRegister}
            className="hidden cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/5 sm:block"
          >
            List your store
          </button>
          <button
            type="button"
            onClick={openDownload}
            className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03] active:scale-95"
          >
            Get the app
          </button>
        </div>
      </div>
    </header>
  );
}
