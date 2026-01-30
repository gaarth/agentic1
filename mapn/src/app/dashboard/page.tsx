import { MainLayout } from "@/components/layout/main-layout";
import { DashboardView } from "@/components/views/dashboard-view";
import { ProtectedRoute } from "@/components/layout/protected-route";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function Dashboard() {
    return (
        <ProtectedRoute>
            <DashboardHeader />
            <MainLayout>
                <DashboardView />
            </MainLayout>
        </ProtectedRoute>
    );
}
