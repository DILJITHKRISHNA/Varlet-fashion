import { createFileRoute } from "@tanstack/react-router";
import { MotionConfig } from "motion/react";

import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { StyleMarquee } from "@/components/landing/StyleMarquee";
import { SnapSearch } from "@/components/landing/SnapSearch";
import { Looks } from "@/components/landing/Looks";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Stores } from "@/components/landing/Stores";
import { FAQ } from "@/components/landing/FAQ";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";
import { AppCtaProvider } from "@/components/landing/AppCtaContext";
import { RegisterStoreDialog } from "@/components/landing/RegisterStoreDialog";
import { DownloadAppDialog } from "@/components/landing/DownloadAppDialog";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <MotionConfig reducedMotion="user">
      <AppCtaProvider>
        <Nav />
        <main className="grain min-h-screen overflow-x-clip">
          <Hero />
          <StyleMarquee />
          <SnapSearch />
          <Looks />
          <HowItWorks />
          <Stores />
          <FAQ />
          <FinalCTA />
        </main>
        <Footer />
        <RegisterStoreDialog />
        <DownloadAppDialog />
      </AppCtaProvider>
    </MotionConfig>
  );
}
