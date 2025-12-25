import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardStats from "@/components/dashboard/DashboardStats";
import DashboardSkeleton from "@/components/dashboard/skeletons/DashboardSkeleton";

export const metadata: Metadata = {
    title: "Dashboard | Analytics",
    description: "View comprehensive analytics and statistics for orders, products, promotions, and revenue.",
};

export default function DashboardPage() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Overview of your business analytics and key metrics
                    </p>
                </div>
            </div>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardStats />
            </Suspense>
        </div>
    );
}