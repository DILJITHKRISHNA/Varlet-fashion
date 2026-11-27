import { motion } from "motion/react";
import {
  ArrowRight,
  BadgePercent,
  FileSpreadsheet,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";

import storeImage from "@/assets/store-interior.jpg";
import { useAppCta } from "./AppCtaContext";
import { CountUp, Reveal, SectionTitle, SoonBadge } from "./fx";

const enquiries = [
  { icon: MessageCircle, label: "WhatsApp taps", value: 184 },
  { icon: Phone, label: "Calls", value: 67 },
  { icon: Navigation, label: "Directions", value: 129 },
];

const week = [38, 52, 44, 68, 61, 92, 80];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const card = "ring-gradient h-full rounded-3xl bg-surface p-7";

export function Stores() {
  const { openRegister } = useAppCta();

  return (
    <section id="stores" className="relative overflow-hidden px-6 py-28 md:py-36">
      <div className="pointer-events-none absolute -right-40 top-1/4 h-[560px] w-[560px] rounded-full bg-ember/15 blur-[140px]" />
      <div className="relative mx-auto max-w-6xl">
        <SectionTitle
          eyebrow="For store owners"
          note="Register in minutes with one account that also signs you into the Varlet app."
        >
          Your shopfront, <span className="serif-accent text-gradient">in every pocket.</span>
        </SectionTitle>

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-6">
          <Reveal className="lg:col-span-4">
            <div className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="display text-2xl font-semibold">Customer enquiry tracking</h3>
                <SoonBadge />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                See who tapped WhatsApp, called, or asked for directions. Figures below are sample
                data.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {enquiries.map((e) => (
                  <div
                    key={e.label}
                    className="rounded-2xl border border-border bg-background/60 p-4"
                  >
                    <e.icon className="h-4 w-4 text-accent" />
                    <p className="display mt-3 text-3xl font-bold md:text-4xl">
                      <CountUp to={e.value} />
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{e.label}</p>
                  </div>
                ))}
              </div>
              <div
                className="mt-6 flex h-36 items-end gap-2"
                role="img"
                aria-label="Sample chart of enquiries over a week"
              >
                {week.map((value, i) => (
                  <div key={days[i]} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <motion.div
                      className="rounded-t-lg bg-gradient-accent"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${value}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <span className="text-center text-[0.65rem] text-muted-foreground">
                      {days[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-2">
            <div className="ring-gradient relative h-full min-h-80 overflow-hidden rounded-3xl">
              <img
                src={storeImage}
                alt="Boutique store interior"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-6 bottom-6">
                <p className="display text-2xl font-semibold leading-tight">
                  Get found by shoppers around the corner.
                </p>
                <button
                  type="button"
                  onClick={openRegister}
                  className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-gradient-accent px-6 py-3.5 text-sm font-semibold text-accent-foreground shadow-glow transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Register your store <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-3">
            <div className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FileSpreadsheet className="h-7 w-7 text-accent" />
                <SoonBadge />
              </div>
              <h3 className="display mt-5 text-2xl font-semibold">Bulk upload</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your whole catalogue from one spreadsheet instead of one product at a time.
              </p>
              <div className="mt-5 space-y-2">
                {[96, 78, 52].map((width, i) => (
                  <div key={width} className="h-2.5 overflow-hidden rounded-full bg-background">
                    <motion.div
                      className="h-full rounded-full bg-gradient-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 * i, duration: 1.2 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <div className={card}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <BadgePercent className="h-7 w-7 text-accent" />
                <SoonBadge />
              </div>
              <h3 className="display mt-5 text-2xl font-semibold">Your own offers</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Publish festival deals and clearance offers on your store page whenever you like.
              </p>
              <div className="mt-5 flex items-center justify-between rounded-2xl border border-dashed border-accent/50 bg-accent-soft p-4">
                <span className="text-sm">Festive weekend</span>
                <span className="serif-accent text-gradient text-4xl">30% off</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
