import { Heart, MapPin, Search, Star } from "lucide-react";
import cargo from "@/assets/cat-cargo.jpg";
import sneakers from "@/assets/cat-sneakers.jpg";
import korean from "@/assets/cat-korean.jpg";
import oversized from "@/assets/cat-oversized.jpg";

function Phone({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto aspect-[9/19] w-[260px] rounded-[2.5rem] border border-border bg-surface p-2 shadow-soft ${className}`}>
      <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-primary" />
      <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
        {children}
      </div>
    </div>
  );
}

export function AppPreview() {
  return (
    <section className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">App preview</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Built for the way you discover.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Search */}
          <Phone className="md:mt-12">
            <div className="p-5 pt-12">
              <p className="text-xs text-muted-foreground">Hi, Aanya</p>
              <h3 className="mt-1 text-2xl font-semibold leading-tight">What's your vibe today?</h3>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-muted px-3 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">oversized tee</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Korean", "Cargo", "Streetwear", "Y2K", "Formal"].map((t) => (
                  <span key={t} className="rounded-full bg-surface px-3 py-1 text-xs hairline">{t}</span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                {[oversized, korean].map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-2xl bg-muted">
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </Phone>

          {/* Product detail */}
          <Phone>
            <div className="relative h-1/2 overflow-hidden">
              <img src={cargo} alt="" className="h-full w-full object-cover" loading="lazy" />
              <button className="absolute right-4 top-12 grid h-9 w-9 place-items-center rounded-full glass">
                <Heart className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5">
              <p className="text-xs text-muted-foreground">Urban Thread Co.</p>
              <h3 className="mt-1 text-lg font-semibold">Wide-Leg Cargo Pants</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-xl font-semibold">₹1,890</span>
                <span className="rounded-full bg-success/10 px-2 py-1 text-xs font-medium text-success">In stock</span>
              </div>
              <div className="mt-4 flex gap-2">
                {["S", "M", "L", "XL"].map((s, i) => (
                  <span key={s} className={`grid h-9 w-9 place-items-center rounded-xl text-sm ${i === 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{s}</span>
                ))}
              </div>
              <button className="mt-4 w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground">
                Get directions
              </button>
            </div>
          </Phone>

          {/* Store profile */}
          <Phone className="md:mt-12">
            <div className="relative h-32 overflow-hidden bg-gradient-accent">
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
            </div>
            <div className="-mt-10 px-5 pb-5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground hairline">U</div>
              <div className="mt-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Urban Thread</h3>
                <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground">Follow</button>
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Koramangala · 0.8 km
              </p>
              <div className="mt-2 flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="font-medium">4.8</span>
                <span className="text-muted-foreground">· 312 reviews</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[sneakers, korean, oversized, cargo].map((src, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-xl bg-muted">
                    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </Phone>
        </div>
      </div>
    </section>
  );
}
