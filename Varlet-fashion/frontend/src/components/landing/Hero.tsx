import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Camera, MapPin, Search, Store } from "lucide-react";

import oversized from "@/assets/cat-oversized.jpg";
import korean from "@/assets/cat-korean.jpg";
import { useAppCta } from "./AppCtaContext";
import { FabricScene } from "./FabricScene";
import { Tilt } from "./fx";

const queries = [
  "oversized graphic tee",
  "cargo pants under ₹1,500",
  "festive kurta near me",
  "white sneakers",
  "linen blazer in navy",
];

function useTypedQuery() {
  const [text, setText] = useState(queries[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let query = 0;
    let length = queries[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      length += deleting ? -1 : 1;
      setText(queries[query].slice(0, length));
      let wait = deleting ? 28 : 62;
      if (deleting && length === 0) {
        deleting = false;
        query = (query + 1) % queries.length;
        wait = 260;
      } else if (!deleting && length === queries[query].length) {
        deleting = true;
        wait = 1700;
      }
      timer = setTimeout(tick, wait);
    };
    timer = setTimeout(tick, 1800);
    return () => clearTimeout(timer);
  }, []);

  return text;
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 1, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const { openDownload, openRegister } = useAppCta();
  const query = useTypedQuery();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const cardsY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);

  return (
    <section
      id="top"
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-32"
    >
      <div className="pointer-events-none absolute right-[-10%] top-[10%] h-[640px] w-[640px] rounded-full bg-ember/20 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-[-20%] left-[-10%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-[140px]" />
      <motion.div className="absolute inset-0" style={{ opacity: sceneOpacity }}>
        <FabricScene className="h-full w-full" />
      </motion.div>
      {/* Keeps the headline readable over bright folds */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <motion.p {...rise(0.05)} className="eyebrow">
            Local fashion discovery
          </motion.p>
          <h1 className="display mt-6 text-[3.6rem] font-bold leading-[0.9] sm:text-8xl lg:text-[6.4rem]">
            <motion.span {...rise(0.15)} className="block">
              Fashion
            </motion.span>
            <motion.span {...rise(0.28)} className="block">
              near you. <span className="serif-accent text-gradient pr-3">Instantly.</span>
            </motion.span>
          </h1>
          <motion.p
            {...rise(0.42)}
            className="mt-7 max-w-xl text-pretty text-lg text-muted-foreground"
          >
            Search a style and see which stores around you carry it — streetwear, ethnic, sneakers
            and more, from real shops you can walk into today.
          </motion.p>

          <motion.button
            {...rise(0.54)}
            type="button"
            onClick={openDownload}
            className="glass ring-gradient mt-9 flex w-full max-w-xl cursor-pointer items-center gap-3 rounded-full p-2 pl-5 text-left"
          >
            <Search className="h-5 w-5 shrink-0 text-accent" />
            <span className="min-w-0 flex-1 truncate text-[0.95rem]">
              {query}
              <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse bg-accent" />
            </span>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-accent text-accent-foreground">
              <Camera className="h-5 w-5" />
            </span>
          </motion.button>

          <motion.div {...rise(0.66)} className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openDownload}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-accent px-7 py-4 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
            >
              Download App
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              type="button"
              onClick={openRegister}
              className="glass inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-4 text-sm font-semibold transition-colors hover:bg-white/10"
            >
              <Store className="h-4 w-4" />
              Register your store
            </button>
          </motion.div>
        </div>

        <motion.div
          style={{ y: cardsY }}
          className="relative hidden h-[580px] lg:col-span-4 lg:block"
        >
          <motion.div {...rise(0.7)} className="absolute right-0 top-0 w-56">
            <Tilt>
              <HeroCard
                image={oversized}
                name="Oversized Graphic Tee"
                price="₹799"
                distance="0.8 km"
              />
            </Tilt>
          </motion.div>
          <motion.div {...rise(0.9)} className="absolute -bottom-4 -left-16 w-44">
            <div className="float-slow">
              <Tilt>
                <HeroCard
                  image={korean}
                  name="Korean Layered Set"
                  price="₹2,799"
                  distance="1.4 km"
                />
              </Tilt>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroCard(props: { image: string; name: string; price: string; distance: string }) {
  return (
    <div className="glass ring-gradient rounded-3xl p-2.5 shadow-soft">
      <div className="aspect-[4/5] overflow-hidden rounded-2xl">
        <img src={props.image} alt={props.name} className="h-full w-full object-cover" />
      </div>
      <div className="px-1.5 pb-1 pt-3">
        <p className="truncate text-sm font-medium">{props.name}</p>
        <p className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span className="text-sm font-semibold text-foreground">{props.price}</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-accent" />
            {props.distance}
          </span>
        </p>
      </div>
    </div>
  );
}
