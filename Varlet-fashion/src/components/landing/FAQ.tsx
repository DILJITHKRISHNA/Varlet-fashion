import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is Varlet free to use?", a: "Yes. Browsing, searching, following stores and saving products is completely free for shoppers." },
  { q: "How do I know stock is accurate?", a: "Store owners update availability in seconds from their dashboard. You'll always see In Stock or Out of Stock before visiting." },
  { q: "Can I order through Varlet?", a: "Varlet focuses on discovery and visits. You can reserve, contact the store, or get directions — checkout happens in-store." },
  { q: "Which cities are supported?", a: "We're launching across major Indian metros first, with rapid expansion to tier 2 cities through 2026." },
  { q: "How do I register my store?", a: "Tap 'Register your store', share a few details and your storefront goes live within 24 hours after a quick review." },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-secondary/40 py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">FAQ</p>
          <h2 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            Good questions, clear answers.
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="overflow-hidden rounded-2xl border border-border bg-surface px-5 data-[state=open]:shadow-soft"
            >
              <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
