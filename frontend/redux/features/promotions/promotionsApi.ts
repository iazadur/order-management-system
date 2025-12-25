import { PROMOTIONS } from "@/app.config";
import apiSlice from "../api/apiSlice";
import { errorHandler, successHandler } from "@/lib/utils";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type PromotionType = "PERCENTAGE" | "FIXED" | "WEIGHTED";

export interface PromotionSlab {
    id: string;
    promotionId: string;
    minWeight: number;
    maxWeight: number;
    discountPerUnit: number;
}

export interface Promotion {
    id: string;
    name: string;
    type: PromotionType;
    code?: string | null; // Promotion code (optional)
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
    description?: string | null; // Contains type and discount values
    slabs?: PromotionSlab[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateSlabDto {
    minWeight: number;
    maxWeight: number;
    discountPerUnit: number;
}

export interface CreatePromotionDto {
    title: string;
    type: PromotionType;
    startDate?: string | null;
    endDate?: string | null;
    isEnabled?: boolean;
    slabs?: CreateSlabDto[];
    percentageValue?: number;
    fixedValue?: number;
}

export interface UpdatePromotionDto {
    title?: string;
    startDate?: string | null;
    endDate?: string | null;
}

export interface TogglePromotionDto {
    isEnabled: boolean;
}

// Backend response types
interface BackendPromotionSlab {
    id: string;
    promotionId: string;
    weight: number; // Stores minWeight for weighted promotions
    minOrderValue: number | null; // Stores maxWeight for weighted promotions
    value: number; // Stores discountPerUnit
    type: string;
}

interface BackendPromotion {
    id: string;
    name: string;
    code: string | null;
    description: string | null;
    startsAt: string | null;
    endsAt: string | null;
    isActive: boolean;
    slabs: BackendPromotionSlab[];
    createdAt: string;
    updatedAt: string;
}

export interface PromotionResponse {
    success: boolean;
    data: BackendPromotion;
}

export interface PromotionsResponse {
    success: boolean;
    data: BackendPromotion[];
}

// Transform backend promotion to frontend format
function transformPromotion(backendPromo: BackendPromotion): Promotion {
    // Infer type from description
    let type: PromotionType = "PERCENTAGE";
    if (backendPromo.description?.startsWith("TYPE:")) {
        const typeStr = backendPromo.description.substring(5).split(",")[0] as PromotionType;
        if (["PERCENTAGE", "FIXED", "WEIGHTED"].includes(typeStr)) {
            type = typeStr;
        }
    } else if (backendPromo.slabs.length > 1) {
        type = "WEIGHTED";
    } else if (backendPromo.slabs.length === 1) {
        const slab = backendPromo.slabs[0];
        if (slab.type === "PERCENTAGE_DISCOUNT") {
            type = "PERCENTAGE";
        } else if (slab.type === "FIXED_AMOUNT_DISCOUNT") {
            if (slab.weight > 0 && slab.minOrderValue) {
                type = "WEIGHTED";
            } else {
                type = "FIXED";
            }
        }
    }

    // Transform slabs
    // Include slabs for all promotion types (PERCENTAGE, FIXED, WEIGHTED)
    const transformedSlabs: PromotionSlab[] = backendPromo.slabs
        .map((slab) => {
            // For WEIGHTED: use weight and minOrderValue as min/max weight
            // For PERCENTAGE/FIXED: weight is 0, minOrderValue is null (Infinity)
            const minWeight = slab.weight || 0;
            const maxWeight = slab.minOrderValue 
                ? Number(slab.minOrderValue) 
                : Infinity;
            
            return {
                id: slab.id,
                promotionId: slab.promotionId,
                minWeight,
                maxWeight,
                discountPerUnit: slab.value, // This is percentage for PERCENTAGE, fixed amount for FIXED, discountPerUnit for WEIGHTED
            };
        });

    return {
        id: backendPromo.id,
        name: backendPromo.name,
        type,
        code: backendPromo.code,
        startDate: backendPromo.startsAt,
        endDate: backendPromo.endsAt,
        isActive: backendPromo.isActive,
        description: backendPromo.description,
        slabs: transformedSlabs.length > 0 ? transformedSlabs : undefined,
        createdAt: backendPromo.createdAt,
        updatedAt: backendPromo.updatedAt,
    };
}

export const promotionsApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getPromotions: build.query<Promotion[], void>({
            query: () => ({
                url: PROMOTIONS.GET_PROMOTIONS,
            }),
            transformResponse: (response: PromotionsResponse) =>
                (response.data || []).map(transformPromotion),
            providesTags: ["Promotions"],
        }),

        getActivePromotions: build.query<Promotion[], void>({
            query: () => ({
                url: PROMOTIONS.GET_ACTIVE_PROMOTIONS,
            }),
            transformResponse: (response: PromotionsResponse) =>
                (response.data || []).map(transformPromotion),
            providesTags: ["Promotions"],
        }),

        getPromotionById: build.query<Promotion, string>({
            query: (id) => PROMOTIONS.GET_PROMOTION_BY_ID(id),
            transformResponse: (response: PromotionResponse) => transformPromotion(response.data),
            providesTags: (result, error, id) => [{ type: "Promotions", id }],
        }),

        createPromotion: build.mutation<Promotion, CreatePromotionDto>({
            query: (data) => ({
                url: PROMOTIONS.CREATE_PROMOTION,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: PromotionResponse) => transformPromotion(response.data),
            invalidatesTags: ["Promotions"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        updatePromotion: build.mutation<Promotion, { id: string; data: UpdatePromotionDto }>({
            query: ({ id, data }) => ({
                url: PROMOTIONS.UPDATE_PROMOTION(id),
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: PromotionResponse) => transformPromotion(response.data),
            invalidatesTags: (result, error, { id }) => [
                { type: "Promotions", id },
                "Promotions",
            ],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        togglePromotion: build.mutation<Promotion, { id: string; data: TogglePromotionDto }>({
            query: ({ id, data }) => ({
                url: PROMOTIONS.TOGGLE_PROMOTION(id),
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: PromotionResponse) => transformPromotion(response.data),
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                // Optimistic update
                const patchResult = dispatch(
                    promotionsApi.util.updateQueryData("getPromotions", undefined, (draft) => {
                        const promotion = draft.find((p) => p.id === id);
                        if (promotion) {
                            promotion.isActive = data.isEnabled;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                    successHandler({
                        data: {
                            success: true,
                            message: `Promotion ${data.isEnabled ? "enabled" : "disabled"} successfully`,
                        },
                    });
                } catch (error) {
                    patchResult.undo();
                    errorHandler(error as FetchBaseQueryError);
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: "Promotions", id },
                "Promotions",
            ],
        }),
    }),
});

export const {
    useGetPromotionsQuery,
    useGetActivePromotionsQuery,
    useGetPromotionByIdQuery,
    useCreatePromotionMutation,
    useUpdatePromotionMutation,
    useTogglePromotionMutation,
} = promotionsApi;

