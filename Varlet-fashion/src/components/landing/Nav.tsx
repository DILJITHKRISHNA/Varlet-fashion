import { useEffect, useState } from "react";
import { useAppCta } from "./AppCtaContext";

export function Nav() {
  const { openDownload } = useAppCta();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "glass border-b border-border" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold">
            V
          </span>
          <span className="text-lg font-semibold tracking-tight">Varlet</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          <a href="#categories" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Categories</a>
          <a href="#stores" className="text-sm text-muted-foreground transition-colors hover:text-foreground">For stores</a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openDownload}
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:inline-block cursor-pointer"
          >
            Get the app
          </button>
        </div>
      </div>
    </header>
  );
}
