import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

/** Fades and lifts content into place the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Card that leans toward the pointer in 3D. */
export function Tilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 180, damping: 18 });
  const rotateY = useSpring(ry, { stiffness: 180, damping: 18 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    rx.set(-((e.clientY - rect.top) / rect.height - 0.5) * 10);
    ry.set(((e.clientX - rect.left) / rect.width - 0.5) * 12);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </motion.div>
  );
}

/** Number that counts up when scrolled into view. */
export function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Math.round(v).toLocaleString("en-IN");
      },
    });
    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>0</span>;
}

export function SectionTitle({
  eyebrow,
  children,
  note,
}: {
  eyebrow: string;
  children: ReactNode;
  note?: string;
}) {
  return (
    <Reveal className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display mt-4 max-w-2xl text-balance text-4xl font-semibold leading-[1.02] md:text-6xl">
          {children}
        </h2>
      </div>
      {note && <p className="max-w-sm text-pretty text-muted-foreground">{note}</p>}
    </Reveal>
  );
}

export function SoonBadge({ label = "Coming soon" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-wider text-accent">
      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
      {label}
    </span>
  );
}
