import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clapperboard, ImageUp, Share2 } from "lucide-react";

import cargo from "@/assets/cat-cargo.jpg";
import denim from "@/assets/cat-denim.jpg";
import korean from "@/assets/cat-korean.jpg";
import oversized from "@/assets/cat-oversized.jpg";
import sneakers from "@/assets/cat-sneakers.jpg";
import streetwear from "@/assets/cat-streetwear.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import { Reveal, SectionTitle, SoonBadge, Tilt } from "./fx";

const modes = [
  {
    id: "screenshot",
    icon: ImageUp,
    label: "Screenshot",
    text: "Upload a screenshot and get the closest pieces from stores near you.",
    source: streetwear,
    matches: [
      { image: oversized, name: "Oversized tee", price: "₹799" },
      { image: cargo, name: "Utility cargo", price: "₹1,499" },
      { image: sneakers, name: "Chunky sneaker", price: "₹3,499" },
    ],
  },
  {
    id: "reel",
    icon: Clapperboard,
    label: "Reel",
    text: "Add a fashion reel or screen recording and we pick out what's being worn.",
    source: korean,
    matches: [
      { image: korean, name: "Layered set", price: "₹2,799" },
      { image: denim, name: "Wide denim", price: "₹1,899" },
      { image: accessories, name: "Sunglasses", price: "₹699" },
    ],
  },
  {
    id: "post",
    icon: Share2,
    label: "Post",
    text: "Share a look from your feed and compare similar options by brand and price.",
    source: oversized,
    matches: [
      { image: streetwear, name: "Relaxed hoodie", price: "₹2,150" },
      { image: sneakers, name: "Court sneaker", price: "₹2,499" },
      { image: cargo, name: "Relaxed cargo", price: "₹1,299" },
    ],
  },
] as const;

const pairings = [
  { name: "Olive", color: "#6b7b3a" },
  { name: "Washed blue", color: "#7d9bc1" },
  { name: "Stone", color: "#bfb3a2" },
  { name: "Jet black", color: "#17151a" },
];

export function SnapSearch() {
  const [active, setActive] = useState<(typeof modes)[number]["id"]>("screenshot");
  const mode = modes.find((m) => m.id === active) ?? modes[0];

  return (
    <section id="snap" className="relative px-6 py-28 md:py-40">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="Snap · Share · Find"
          note="Saw it on someone? Skip the guesswork over what to type."
        >
          Show us the look. <span className="serif-accent text-gradient">We'll find it.</span>
        </SectionTitle>
        <div className="mt-5">
          <SoonBadge label="In development" />
        </div>

        <div className="mt-14 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Tilt className="mx-auto max-w-sm">
              <div className="ring-gradient relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-surface shadow-soft">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={mode.id}
                    src={mode.source}
                    alt={`Example ${mode.label.toLowerCase()} being scanned`}
                    className="absolute inset-0 h-full w-full object-cover"
                    initial={{ opacity: 0, scale: 1.12 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                  />
                </AnimatePresence>
                <div className="scan-line absolute inset-x-0 h-px bg-accent shadow-[0_0_28px_6px_rgb(255_107_53/0.65)]" />
                {["left-[44%] top-[28%]", "left-[56%] top-[58%]", "left-[30%] top-[78%]"].map(
                  (position) => (
                    <span
                      key={position}
                      className={`hotspot absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-accent ${position}`}
                    />
                  ),
                )}
                {[
                  "left-4 top-4 border-l-2 border-t-2",
                  "right-4 top-4 border-r-2 border-t-2",
                  "bottom-4 left-4 border-b-2 border-l-2",
                  "bottom-4 right-4 border-b-2 border-r-2",
                ].map((corner) => (
                  <span
                    key={corner}
                    className={`absolute h-9 w-9 rounded-sm border-white/80 ${corner}`}
                  />
                ))}
              </div>
            </Tilt>
          </Reveal>

          <Reveal delay={0.12}>
            <div
              className="glass inline-flex rounded-full p-1.5"
              role="tablist"
              aria-label="Search type"
            >
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={active === m.id}
                  onClick={() => setActive(m.id)}
                  className={`relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors sm:px-5 ${
                    active === m.id
                      ? "text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active === m.id && (
                    <motion.span
                      layoutId="snap-pill"
                      className="absolute inset-0 rounded-full bg-gradient-accent"
                    />
                  )}
                  <m.icon className="relative h-4 w-4" />
                  <span className="relative">{m.label}</span>
                </button>
              ))}
            </div>

            <p className="mt-6 min-h-14 max-w-md text-lg text-muted-foreground">{mode.text}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {mode.matches.map((match, i) => (
                  <motion.div
                    key={`${mode.id}-${match.name}`}
                    initial={{ opacity: 0, y: 30, rotate: 4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: 0.12 * i, type: "spring", stiffness: 160, damping: 18 }}
                    className="rounded-2xl border border-border bg-surface p-2"
                  >
                    <img
                      src={match.image}
                      alt={match.name}
                      loading="lazy"
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <p className="mt-2 truncate text-xs text-muted-foreground">{match.name}</p>
                    <p className="text-sm font-semibold">{match.price}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-6 rounded-3xl border border-border bg-surface p-5">
              <p className="text-sm font-semibold">Combination finder</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan a shirt, get bottom colours that go with it.
              </p>
              <ul className="mt-4 flex flex-wrap gap-2">
                {pairings.map((p) => (
                  <li
                    key={p.name}
                    className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-xs"
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white/20"
                      style={{ background: p.color }}
                    />
                    {p.name}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
