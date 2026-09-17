import { createFileRoute } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Categories } from "@/components/landing/Categories";
import { Shoppers } from "@/components/landing/Shoppers";
import { Stores } from "@/components/landing/Stores";
import { AppPreview } from "@/components/landing/AppPreview";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { AppCtaProvider } from "@/components/landing/AppCtaContext";
import { RegisterStoreDialog } from "@/components/landing/RegisterStoreDialog";
import { DownloadAppDialog } from "@/components/landing/DownloadAppDialog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Varlet — Fashion Near You. Instantly." },
      { name: "description", content: "Discover oversized tees, cargos, streetwear, Korean fashion and more from nearby stores. Local fashion discovery for Gen Z." },
      { property: "og:title", content: "Varlet — Fashion Near You. Instantly." },
      { property: "og:description", content: "Find the style you want. Discover the store that has it." },
    ],
    links: [
      { rel: "preconnect", href: "https://rsms.me" },
      { rel: "stylesheet", href: "https://rsms.me/inter/inter.css" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppCtaProvider>
      <main className="min-h-screen bg-background">
        <Nav />
        <Hero />
        <HowItWorks />
        <Categories />
        <Shoppers />
        <Stores />
        <AppPreview />
        <Testimonials />
        <FAQ />
        <FinalCTA />
        <Footer />
      </main>
      <RegisterStoreDialog />
      <DownloadAppDialog />
    </AppCtaProvider>
  );
}
