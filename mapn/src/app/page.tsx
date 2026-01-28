<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> cf1e09b481221c4c8a09f0430f2ebcaac6ee5d2a
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
<<<<<<< HEAD
=======
=======
>>>>>>> cf1e09b481221c4c8a09f0430f2ebcaac6ee5d2a
import { MainLayout } from "@/components/layout/main-layout";
import { DashboardView } from "@/components/views/dashboard-view";
import { FeaturesSection } from "@/components/views/features-section";

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-20">
        <DashboardView />
        <FeaturesSection />
      </div>
    </MainLayout>
<<<<<<< HEAD
>>>>>>> 730f146e1d55f38aa1c9e7bfd26a8aa81056acf0
=======
>>>>>>> cf1e09b481221c4c8a09f0430f2ebcaac6ee5d2a
  );
}

