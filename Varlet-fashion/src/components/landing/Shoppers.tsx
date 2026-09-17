import { Bookmark, Clock, Compass, Heart, Scale, Search } from "lucide-react";

const benefits = [
  { icon: Search, title: "Find exact styles faster", desc: "Search by style, color or vibe and skip the scroll." },
  { icon: Compass, title: "Discover local stores", desc: "Uncover hidden gems and boutiques around the corner." },
  { icon: Clock, title: "Save time", desc: "Know what's in stock before you leave the house." },
  { icon: Scale, title: "Compare nearby options", desc: "See prices and availability across stores instantly." },
  { icon: Heart, title: "Follow your favorites", desc: "Get notified when your favorite stores drop new pieces." },
  { icon: Bookmark, title: "Wishlist anything", desc: "Save styles for later and revisit them anytime." },
];

export function Shoppers() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">For shoppers</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Less scrolling. More wearing.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b) => (
            <div key={b.title} className="group bg-surface p-8 transition-colors hover:bg-secondary/50">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent-soft text-accent transition-transform group-hover:scale-110">
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-6 text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
