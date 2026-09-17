import { MapPin, MessageCircle, Search } from "lucide-react";

const steps = [
  { icon: Search, title: "Search your style", desc: "Type what you want — oversized tees, cargos, Korean fashion." },
  { icon: MapPin, title: "Discover nearby stores", desc: "See which stores around you actually have it in stock." },
  { icon: MessageCircle, title: "Visit, reserve or contact", desc: "Get directions, message the store, or hold the piece." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">How Varlet works</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            From idea to outfit — in under 30 seconds.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-5xl font-semibold text-muted/40">0{i + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted-foreground">{step.desc}</p>
              <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
