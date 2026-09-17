import { Star } from "lucide-react";

const items = [
  { name: "Aanya R.", role: "College Student, Bengaluru", quote: "Found the exact oversized tee I'd been hunting for at a store 10 minutes away. Honestly life-changing." },
  { name: "Kabir M.", role: "Designer, Mumbai", quote: "Varlet feels like Pinterest for real stores. The local discovery is something Amazon can never give me." },
  { name: "Priya S.", role: "Store Owner, Delhi", quote: "Foot traffic doubled in a month. Uploading a product takes me 15 seconds — that's all I need." },
  { name: "Rhea T.", role: "Stylist, Pune", quote: "I find pieces I'd never stumble on otherwise. The store profiles feel like editorial features." },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Loved by</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Shoppers and store owners alike.
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {items.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-3xl border border-border bg-surface p-6 transition-shadow hover:shadow-soft">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-pretty text-foreground">"{t.quote}"</blockquote>
              <figcaption className="mt-6">
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
