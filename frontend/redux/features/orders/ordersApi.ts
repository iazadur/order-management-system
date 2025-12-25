import { ORDERS } from "@/app.config";
import apiSlice from "../api/apiSlice";
import { errorHandler, successHandler } from "@/lib/utils";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
}

export interface CreateOrderDto {
    items: OrderItem[];
    customerInfo: CustomerInfo;
    promotionId?: string | null;
}

export interface AppliedPromotion {
    title: string;
    type: string;
    discount: number;
}

export interface OrderItemResponse {
    product: {
        id: string;
        name: string;
        sku: string;
        price: number;
    };
    quantity: number;
    price: number; // unitPrice in BDT
    appliedPromotions: AppliedPromotion[];
    itemDiscount: number;
    itemTotal: number;
}

export interface Order {
    id: string;
    customerInfo: CustomerInfo;
    items: OrderItemResponse[];
    subtotal: number;
    totalDiscount: number;
    grandTotal: number;
    createdAt: string;
    promotion?: {
        id: string;
        name: string;
        description?: string | null;
        startsAt: string | null;
        endsAt: string | null;
        isActive: boolean;
        slabs?: Array<{
            id: string;
            promotionId: string;
            weight: number;
            minOrderValue: number | null;
            type: string;
            value: number;
        }>;
    } | null;
    status?: string;
}

export interface OrderResponse {
    success: boolean;
    data: Order;
}

export interface OrdersResponse {
    success: boolean;
    data: Order[];
}

export interface OrderListParams {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: "createdAt" | "grandTotal";
    sortOrder?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
    customerSearch?: string;
}

export interface OrderStats {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    todaysOrders: number;
    todaysRevenue: number;
}

export interface OrderStatsResponse {
    success: boolean;
    data: OrderStats;
}

export const ordersApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        createOrder: build.mutation<Order, CreateOrderDto>({
            query: (data) => ({
                url: ORDERS.CREATE_ORDER,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: OrderResponse) => response.data,
            invalidatesTags: ["Orders", "Analytics"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    successHandler({
                        data: {
                            success: true,
                            message: "Order created successfully",
                        },
                    });
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        getMyOrders: build.query<Order[], void>({
            query: () => ({
                url: ORDERS.GET_MY_ORDERS,
            }),
            transformResponse: (response: OrdersResponse) => response.data || [],
            providesTags: ["Orders"],
        }),

        getOrderById: build.query<Order, string>({
            query: (id) => ORDERS.GET_ORDER_BY_ID(id),
            transformResponse: (response: OrderResponse) => response.data,
            providesTags: (result, error, id) => [{ type: "Orders", id }],
        }),

        getOrders: build.query<{ orders: Order[]; total: number }, OrderListParams>({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.page) searchParams.append("page", params.page.toString());
                if (params.limit) searchParams.append("limit", params.limit.toString());
                if (params.status) searchParams.append("status", params.status);
                if (params.sortBy) searchParams.append("sortBy", params.sortBy);
                if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);
                if (params.startDate) searchParams.append("startDate", params.startDate);
                if (params.endDate) searchParams.append("endDate", params.endDate);
                if (params.customerSearch) searchParams.append("customerSearch", params.customerSearch);

                const queryString = searchParams.toString();
                return {
                    url: `${ORDERS.GET_ORDERS}${queryString ? `?${queryString}` : ""}`,
                };
            },
            transformResponse: (response: OrdersResponse) => {
                // Backend returns all orders, we'll paginate on frontend for now
                return {
                    orders: response.data || [],
                    total: response.data?.length || 0,
                };
            },
            providesTags: ["Orders"],
        }),

        getOrderStats: build.query<OrderStats, void>({
            query: () => ({
                url: ORDERS.GET_ORDER_STATS,
            }),
            transformResponse: (response: OrderStatsResponse) => response.data,
            providesTags: ["Orders"],
        }),
    }),
});

export const {
    useCreateOrderMutation,
    useGetMyOrdersQuery,
    useGetOrderByIdQuery,
    useGetOrdersQuery,
    useGetOrderStatsQuery,
} = ordersApi;

