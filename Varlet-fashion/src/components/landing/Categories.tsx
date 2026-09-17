import oversized from "@/assets/cat-oversized.jpg";
import streetwear from "@/assets/cat-streetwear.jpg";
import korean from "@/assets/cat-korean.jpg";
import formal from "@/assets/cat-formal.jpg";
import cargo from "@/assets/cat-cargo.jpg";
import denim from "@/assets/cat-denim.jpg";
import sneakers from "@/assets/cat-sneakers.jpg";
import accessories from "@/assets/cat-accessories.jpg";
import { ArrowUpRight } from "lucide-react";

const cats = [
  { name: "Oversized", img: oversized, span: "md:col-span-2 md:row-span-2" },
  { name: "Streetwear", img: streetwear },
  { name: "Korean Fashion", img: korean },
  { name: "Cargo Pants", img: cargo },
  { name: "Sneakers", img: sneakers, span: "md:col-span-2" },
  { name: "Denim", img: denim },
  { name: "Formal Wear", img: formal },
  { name: "Accessories", img: accessories },
];

export function Categories() {
  return (
    <section id="categories" className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">Featured categories</p>
            <h2 className="mt-3 max-w-xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Curated for the way Gen Z dresses.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground">
            From statement streetwear to quiet luxury — every category is sourced from real stores nearby.
          </p>
        </div>

        <div className="mt-12 grid auto-rows-[220px] grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {cats.map((c) => (
            <a
              key={c.name}
              href="#download"
              className={`group relative overflow-hidden rounded-3xl bg-muted ${c.span ?? ""}`}
            >
              <img
                src={c.img}
                alt={c.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
              <div className="absolute inset-x-5 bottom-4 flex items-end justify-between text-white">
                <span className="text-lg font-semibold tracking-tight">{c.name}</span>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform group-hover:scale-110">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
