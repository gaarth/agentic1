import { MainLayout } from "@/components/layout/main-layout";
import { DashboardView } from "@/components/views/dashboard-view";

export default function Home() {
  return (
    <MainLayout>
      <DashboardView />
    </MainLayout>
  );
}
