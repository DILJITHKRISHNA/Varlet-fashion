import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart } from "lucide-react";

import accessories from "@/assets/cat-accessories.jpg";
import cargo from "@/assets/cat-cargo.jpg";
import denim from "@/assets/cat-denim.jpg";
import formal from "@/assets/cat-formal.jpg";
import korean from "@/assets/cat-korean.jpg";
import oversized from "@/assets/cat-oversized.jpg";
import sneakers from "@/assets/cat-sneakers.jpg";
import streetwear from "@/assets/cat-streetwear.jpg";
import { SectionTitle, Tilt } from "./fx";

const looks = [
  { image: oversized, name: "Oversized edit", tag: "Relaxed fits", price: 499 },
  { image: accessories, name: "Finishing touches", tag: "Accessories", price: 399 },
  { image: denim, name: "Denim days", tag: "Everyday", price: 999 },
  { image: cargo, name: "Cargo club", tag: "Utility", price: 949 },
  { image: streetwear, name: "Street uniform", tag: "Streetwear", price: 1499 },
  { image: korean, name: "Seoul layers", tag: "K-fashion", price: 1899 },
  { image: formal, name: "Sharp hours", tag: "Formal", price: 2499 },
  { image: sneakers, name: "Sole mates", tag: "Footwear", price: 1999 },
];

const budgets = [
  { label: "Everything", max: Infinity },
  { label: "Under ₹499", max: 499 },
  { label: "Under ₹999", max: 999 },
  { label: "Under ₹1,999", max: 1999 },
];

export function Looks() {
  const [budget, setBudget] = useState(budgets[0]);
  const [saved, setSaved] = useState<string[]>([]);
  const visible = looks.filter((l) => l.price <= budget.max);

  const toggle = (name: string) =>
    setSaved((s) => (s.includes(name) ? s.filter((n) => n !== name) : [...s, name]));

  return (
    <section id="looks" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Shop the budget"
          note="A preview with sample collections. Pick a price point and the rail reshuffles."
        >
          Looks that fit <span className="serif-accent text-gradient">your wallet.</span>
        </SectionTitle>

        <div className="mt-10 flex flex-wrap gap-2">
          {budgets.map((b) => (
            <button
              key={b.label}
              type="button"
              aria-pressed={budget.label === b.label}
              onClick={() => setBudget(b)}
              className={`cursor-pointer rounded-full border px-5 py-2.5 text-sm font-medium transition-colors ${
                budget.label === b.label
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((look, i) => (
              <motion.li
                layout
                key={look.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: "spring", stiffness: 170, damping: 22 }}
                className={i % 2 ? "md:translate-y-8" : ""}
              >
                <Tilt>
                  <article className="group relative aspect-[3/4] overflow-hidden rounded-3xl bg-surface">
                    <img
                      src={look.image}
                      alt={look.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                    <button
                      type="button"
                      onClick={() => toggle(look.name)}
                      aria-pressed={saved.includes(look.name)}
                      aria-label={`Save ${look.name}`}
                      className="glass absolute right-3 top-3 grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-transform active:scale-75"
                    >
                      <Heart
                        className={`h-4 w-4 ${saved.includes(look.name) ? "fill-ember text-ember" : ""}`}
                      />
                    </button>
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                        {look.tag}
                      </p>
                      <h3 className="display mt-1 text-lg font-semibold leading-tight md:text-xl">
                        {look.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/70">
                        from ₹{look.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </article>
                </Tilt>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
