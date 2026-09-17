import storeImage from "@/assets/store-interior.jpg";
import { ArrowRight, Check } from "lucide-react";
import { useAppCta } from "./AppCtaContext";

const points = [
  "Increase store visibility in your neighborhood",
  "Reach shoppers actively searching nearby",
  "Showcase your inventory beautifully",
  "Receive direct customer inquiries",
  "Grow consistent foot traffic",
];

export function Stores() {
  const { openRegister } = useAppCta();
  return (
    <section id="stores" className="relative overflow-hidden bg-primary py-24 text-primary-foreground md:py-32">
      <div className="pointer-events-none absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">For store owners</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Your store, in everyone's pocket.
          </h2>
          <p className="mt-5 max-w-lg text-lg text-primary-foreground/70">
            Upload a product in under 20 seconds and start showing up in nearby searches today.
          </p>

          <ul className="mt-8 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-primary-foreground/90">{p}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openRegister}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-medium text-accent-foreground transition-all hover:translate-y-[-1px] hover:shadow-glow cursor-pointer"
          >
            Register your store <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-3xl">
            <img src={storeImage} alt="Boutique store interior" loading="lazy" className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 rounded-2xl glass-dark p-5 text-primary-foreground sm:left-auto sm:right-6 sm:w-72">
            <p className="text-xs text-primary-foreground/60">This week</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">+248 views</p>
            <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-3/4 rounded-full bg-accent" />
            </div>
            <p className="mt-2 text-xs text-primary-foreground/60">Across 12 nearby shoppers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
