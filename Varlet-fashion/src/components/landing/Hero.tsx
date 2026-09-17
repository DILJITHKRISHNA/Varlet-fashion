import heroImage from "@/assets/hero-fashion.jpg";
import { ArrowRight, MapPin, Search, Sparkles } from "lucide-react";
import { useAppCta } from "./AppCtaContext";

export function Hero() {
  const { openDownload, openRegister } = useAppCta();
  return (
    <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32">
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-accent-soft blur-3xl opacity-60" />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-12">
        <div className="lg:col-span-7 fade-up">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Local fashion discovery
          </span>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[0.95]">
            Fashion Near You.
            <span className="block bg-gradient-accent bg-clip-text text-transparent">Instantly.</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl">
            Discover oversized tees, cargos, streetwear, Korean fashion, sneakers and more — from real stores around you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openDownload}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-soft transition-all hover:translate-y-[-1px] hover:shadow-glow cursor-pointer"
            >
              Download App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
            >
              Register your store
            </button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["#FF6B35", "#0F0F0F", "#10B981", "#111827"].map((c) => (
                <div key={c} className="h-8 w-8 rounded-full border-2 border-background" style={{ background: c }} />
              ))}
            </div>
            <span><span className="font-semibold text-foreground">12,000+</span> shoppers discovering near them</span>
          </div>
        </div>

        {/* Visual */}
        <div className="lg:col-span-5">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
            <div className="absolute inset-0 overflow-hidden rounded-3xl bg-secondary shadow-soft">
              <img
                src={heroImage}
                alt="Fashion discovery"
                className="h-full w-full object-cover"
                width={1280}
                height={1600}
              />
            </div>

            {/* Floating search chip */}
            <div className="absolute -left-6 top-10 hidden w-72 rounded-2xl bg-surface p-3 shadow-soft hairline sm:block fade-up">
              <div className="flex items-center gap-3 rounded-xl bg-muted px-3 py-2.5">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">oversized tee</span>
              </div>
            </div>

            {/* Floating store card */}
            <div className="absolute -bottom-6 -right-2 w-64 rounded-2xl bg-surface p-4 shadow-soft hairline sm:-right-8 fade-up">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-accent" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">Urban Thread Co.</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> 0.8 km away
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded-full bg-success/10 px-2 py-1 font-medium text-success">In stock</span>
                <span className="text-muted-foreground">12 styles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
