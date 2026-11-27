import { ArrowRight } from "lucide-react";
import { useAppCta } from "./AppCtaContext";
import { Reveal } from "./fx";

export function FinalCTA() {
  const { openDownload, openRegister } = useAppCta();
  return (
    <section id="download" className="px-4 py-16">
      <Reveal>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.75rem] bg-gradient-accent px-8 py-20 text-center text-accent-foreground md:py-28">
          <div className="pointer-events-none absolute -left-24 -top-32 h-96 w-96 rounded-full bg-white/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-black/30 blur-3xl" />
          <div className="relative">
            <h2 className="display mx-auto max-w-3xl text-balance text-5xl font-bold leading-[0.95] md:text-7xl">
              Your next fit is <span className="serif-accent">around the corner.</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={openDownload}
                className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-background px-8 py-4 text-sm font-semibold text-foreground transition-transform hover:scale-[1.04] active:scale-95"
              >
                Download App
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={openRegister}
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/40 px-8 py-4 text-sm font-semibold transition-colors hover:bg-black/10"
              >
                Register Store
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
