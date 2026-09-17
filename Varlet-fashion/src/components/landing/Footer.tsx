import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground font-semibold">V</span>
              <span className="text-lg font-semibold tracking-tight">Varlet</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Find the style you want. Discover the store that has it.
            </p>
            <div className="mt-6 flex gap-2">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:bg-secondary">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: ["Shoppers", "Stores", "Categories", "Download"] },
            { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
            { title: "Legal", links: ["Privacy Policy", "Terms", "Cookies", "Licenses"] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Varlet. Crafted for fashion-first discovery.</p>
          <p>Made in India.</p>
        </div>
      </div>
    </footer>
  );
}
