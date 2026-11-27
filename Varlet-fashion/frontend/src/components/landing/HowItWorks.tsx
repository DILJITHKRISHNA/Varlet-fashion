import { useRef } from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { MapPin, Navigation, Search } from "lucide-react";
import { Reveal, SectionTitle } from "./fx";

const steps = [
  {
    icon: Search,
    title: "Search your style",
    desc: "Type what you want — oversized tees, cargos, a festive kurta.",
  },
  {
    icon: MapPin,
    title: "See who has it nearby",
    desc: "Stores around you, sorted by distance, with their products.",
  },
  {
    icon: Navigation,
    title: "Walk in and wear it",
    desc: "Save what you like, pick a store and try it on today.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const line = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return (
    <section id="how" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow="How it works">
          From scroll to <span className="serif-accent text-gradient">fitting room.</span>
        </SectionTitle>

        <ol ref={ref} className="relative mt-16 space-y-6 pl-8 md:pl-16">
          <span className="absolute inset-y-0 left-0 w-px bg-border md:left-5" />
          <motion.span
            className="absolute inset-y-0 left-0 w-px origin-top bg-gradient-accent md:left-5"
            style={{ scaleY: line }}
          />
          {steps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 0.05}>
                <div className="group flex flex-col gap-6 rounded-3xl border border-border bg-surface p-7 transition-colors hover:border-accent/40 md:flex-row md:items-center md:p-10">
                  <span className="serif-accent text-gradient text-7xl leading-none md:w-32 md:text-8xl">
                    0{i + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="display text-2xl font-semibold md:text-3xl">{step.title}</h3>
                    <p className="mt-2 max-w-md text-muted-foreground">{step.desc}</p>
                  </div>
                  <span className="grid h-16 w-16 place-items-center rounded-full border border-border transition-all duration-500 group-hover:rotate-12 group-hover:bg-gradient-accent group-hover:text-accent-foreground">
                    <step.icon className="h-6 w-6" />
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
