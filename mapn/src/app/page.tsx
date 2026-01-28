import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { LogosBar } from "@/components/sections/logos-bar";
import { FeaturesSection } from "@/components/sections/features-section";
import { BentoGrid } from "@/components/sections/bento-grid";
import { ServicesSection } from "@/components/sections/services-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CTASection } from "@/components/sections/cta-section";

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <LogosBar />
        <FeaturesSection />
        <BentoGrid />
        <ServicesSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

