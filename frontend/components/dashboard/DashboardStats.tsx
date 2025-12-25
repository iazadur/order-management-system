"use client";

import { useGetDashboardStatsQuery } from "@/redux/features/analytics/analyticsApi";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Package,
    ShoppingCart,
    TrendingUp,
    DollarSign,
    Calendar,
    BarChart3,
    Tag,
    Box,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US").format(num);
};

/* ======================
   Stat Card Component
====================== */

interface StatCardProps {
    title: string;
    value: string;
    description?: string;
    icon: React.ElementType;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
    className?: string;
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}: StatCardProps) {
    return (
        <Card className={cn("relative overflow-hidden", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
                {trend && (
                    <div className="flex items-center gap-1 mt-2">
                        {trend.isPositive ? (
                            <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                        ) : (
                            <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                        )}
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.isPositive
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                            )}
                        >
                            {Math.abs(trend.value)}% {trend.label}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

/* ======================
   Main Component
====================== */

export default function DashboardStats() {
    const { data: stats, isLoading, error } = useGetDashboardStatsQuery();

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-32 mb-2" />
                                <Skeleton className="h-3 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error Loading Stats</CardTitle>
                    <CardDescription>
                        Unable to load dashboard statistics. Please try again later.
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Calculate trends (comparing this week to last week, this month to last month)
    // For now, we'll show placeholder trends - in production, you'd calculate these from historical data
    const weekTrend = stats.orders.thisWeek > 0 ? 12 : 0;
    const monthTrend = stats.orders.thisMonth > 0 ? 8 : 0;

    return (
        <div className="space-y-6">
            {/* Revenue Overview */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Revenue Overview</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Today's Revenue"
                        value={formatCurrency(stats.revenue.today)}
                        description="Revenue from today's orders"
                        icon={DollarSign}
                        className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                    />
                    <StatCard
                        title="This Week"
                        value={formatCurrency(stats.revenue.thisWeek)}
                        description="Revenue from last 7 days"
                        icon={TrendingUp}
                        trend={{
                            value: weekTrend,
                            label: "vs last week",
                            isPositive: weekTrend > 0,
                        }}
                    />
                    <StatCard
                        title="This Month"
                        value={formatCurrency(stats.revenue.thisMonth)}
                        description="Revenue from last 30 days"
                        icon={BarChart3}
                        trend={{
                            value: monthTrend,
                            label: "vs last month",
                            isPositive: monthTrend > 0,
                        }}
                    />
                    <StatCard
                        title="All Time Revenue"
                        value={formatCurrency(stats.revenue.allTime)}
                        description="Total revenue ever"
                        icon={DollarSign}
                        className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
                    />
                </div>
            </div>

            {/* Orders Overview */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Orders</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Orders"
                        value={formatNumber(stats.orders.total)}
                        description="All time orders"
                        icon={ShoppingCart}
                    />
                    <StatCard
                        title="Today's Orders"
                        value={formatNumber(stats.orders.today)}
                        description={`Revenue: ${formatCurrency(stats.orders.todayRevenue)}`}
                        icon={Calendar}
                        className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20"
                    />
                    <StatCard
                        title="This Week"
                        value={formatNumber(stats.orders.thisWeek)}
                        description={`Revenue: ${formatCurrency(stats.orders.thisWeekRevenue)}`}
                        icon={TrendingUp}
                    />
                    <StatCard
                        title="This Month"
                        value={formatNumber(stats.orders.thisMonth)}
                        description={`Revenue: ${formatCurrency(stats.orders.thisMonthRevenue)}`}
                        icon={BarChart3}
                    />
                </div>
            </div>

            {/* Products & Promotions */}
            <div className="grid gap-4 md:grid-cols-1">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Products</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Total Products"
                            value={formatNumber(stats.products.total)}
                            description="All products"
                            icon={Package}
                        />
                        <StatCard
                            title="Active"
                            value={formatNumber(stats.products.active)}
                            description="Currently active"
                            icon={Box}
                            className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                        />
                        <StatCard
                            title="Inactive"
                            value={formatNumber(stats.products.inactive)}
                            description="Disabled products"
                            icon={Package}
                            className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-4">Promotions</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Total Promotions"
                            value={formatNumber(stats.promotions.total)}
                            description="All promotions"
                            icon={Tag}
                        />
                        <StatCard
                            title="Active"
                            value={formatNumber(stats.promotions.active)}
                            description="Currently active"
                            icon={TrendingUp}
                            className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20"
                        />
                        <StatCard
                            title="Inactive"
                            value={formatNumber(stats.promotions.inactive)}
                            description="Disabled promotions"
                            icon={Tag}
                            className="border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/20"
                        />
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Key Metrics</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        title="Average Order Value"
                        value={formatCurrency(stats.orders.averageOrderValue)}
                        description="Per order average"
                        icon={TrendingUp}
                        className="border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20"
                    />
                    <StatCard
                        title="Total Orders"
                        value={formatNumber(stats.orders.total)}
                        description="All time"
                        icon={ShoppingCart}
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.orders.totalRevenue)}
                        description="All time"
                        icon={DollarSign}
                        className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
                    />
                </div>
            </div>
        </div>
    );
}

