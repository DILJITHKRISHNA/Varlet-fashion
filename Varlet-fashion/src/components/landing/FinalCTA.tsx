import { ArrowRight } from "lucide-react";
import { useAppCta } from "./AppCtaContext";

export function FinalCTA() {
  const { openDownload, openRegister } = useAppCta();
  return (
    <section id="download" className="px-6 py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-primary p-10 text-primary-foreground md:p-20">
        <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative max-w-2xl">
          <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-6xl">
            Start discovering fashion near you.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-primary-foreground/70">
            Join thousands of Gen Z shoppers and local boutiques making fashion feel personal again.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openDownload}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-all hover:translate-y-[-1px] hover:shadow-glow cursor-pointer"
            >
              Download App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-white/10 cursor-pointer"
            >
              Register Store
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
