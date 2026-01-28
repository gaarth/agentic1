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
  );
}
