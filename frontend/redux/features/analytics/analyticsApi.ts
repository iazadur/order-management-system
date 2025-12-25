import apiSlice from "../api/apiSlice";

/* =======================
   Types
======================= */

export interface DashboardStats {
    orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
        totalRevenue: number;
        todayRevenue: number;
        thisWeekRevenue: number;
        thisMonthRevenue: number;
        averageOrderValue: number;
    };
    products: {
        total: number;
        active: number;
        inactive: number;
    };
    promotions: {
        total: number;
        active: number;
        inactive: number;
    };
    revenue: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        allTime: number;
    };
}

export interface DashboardStatsResponse {
    success: boolean;
    data: DashboardStats;
}

/* =======================
   Analytics API
======================= */

export const analyticsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // GET DASHBOARD STATS
        getDashboardStats: builder.query<DashboardStats, void>({
            query: () => ({
                url: "/api/analytics/dashboard",
                method: "GET",
            }),
            providesTags: ["Analytics"],
            transformResponse: (response: DashboardStatsResponse) => response.data,
        }),
    }),
});

/* =======================
   Export Hooks
======================= */

export const {
    useGetDashboardStatsQuery,
} = analyticsApi;

