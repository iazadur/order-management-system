import DashboardClient from "@/components/dashboard/layout/DashboardClient";
import ProtectedRoute from "@/components/dashboard/ProtectedRoute";

export const metadata = {
    title: "Dashboard",
    description: "Dashboard",
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <DashboardClient>
                {children}
            </DashboardClient>
        </ProtectedRoute>
    );
}