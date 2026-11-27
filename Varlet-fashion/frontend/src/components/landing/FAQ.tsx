import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal } from "./fx";

const faqs = [
  {
    q: "Is Varlet free to use?",
    a: "Yes. Browsing, searching, following stores and saving products is free for shoppers.",
  },
  {
    q: "Can I order through Varlet?",
    a: "Varlet focuses on discovery and visits. You find the piece and the store, and checkout happens in person.",
  },
  { q: "Where can I use it?", a: "We're starting with Indian cities, beginning in Bengaluru." },
  {
    q: "Is photo and reel search available?",
    a: "It's in development. Text search and nearby stores come first.",
  },
  {
    q: "How do I register my store?",
    a: "Tap 'Register your store', create your owner account and add your store details. Use the same email and password to sign into the app.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="px-6 py-28 md:py-36">
      <div className="mx-auto max-w-3xl">
        <Reveal className="text-center">
          <p className="eyebrow">FAQ</p>
          <h2 className="display mt-4 text-4xl font-semibold md:text-6xl">
            Good <span className="serif-accent text-gradient">questions.</span>
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <Accordion type="single" collapsible className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem
                key={f.q}
                value={`item-${i}`}
                className="overflow-hidden rounded-2xl border border-border bg-surface px-5 data-[state=open]:border-accent/40"
              >
                <AccordionTrigger className="py-5 text-left text-base font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
