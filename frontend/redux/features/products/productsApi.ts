import { PRODUCTS } from "@/app.config";
import apiSlice from "../api/apiSlice";
import { errorHandler, successHandler } from "@/lib/utils";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface Product {
    id: string;
    name: string;
    slug: string;
    sku: string;
    description: string | null;
    price: number;
    currency: string;
    isActive: boolean;
    weight: number; // Weight in grams
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductDto {
    name: string;
    slug: string;
    sku: string;
    description?: string | null;
    price: number;
    weight: number;
    currency?: string;
    isActive?: boolean;
}

export interface UpdateProductDto {
    name?: string;
    slug?: string;
    sku?: string;
    description?: string | null;
    price?: number;
    weight?: number;
    currency?: string;
    isActive?: boolean;
}

export interface ToggleProductDto {
    isEnabled: boolean;
}

export interface ProductsResponse {
    success: boolean;
    data: Product[];
}

export interface ProductResponse {
    success: boolean;
    data: Product;
}

export const productsApi = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getProducts: build.query<Product[], { includeDisabled?: boolean }>({
            query: (params) => ({
                url: PRODUCTS.GET_PRODUCTS,
                params: {
                    includeDisabled: params.includeDisabled ? "true" : "false",
                },
            }),
            transformResponse: (response: ProductsResponse) => response.data || [],
            providesTags: ["Products"],
        }),

        getProductById: build.query<Product, string>({
            query: (id) => PRODUCTS.GET_PRODUCT_BY_ID(id),
            transformResponse: (response: ProductResponse) => response.data,
            providesTags: (result, error, id) => [{ type: "Products", id }],
        }),

        createProduct: build.mutation<Product, CreateProductDto>({
            query: (data) => ({
                url: PRODUCTS.CREATE_PRODUCT,
                method: "POST",
                body: data,
            }),
            transformResponse: (response: ProductResponse) => response.data,
            invalidatesTags: ["Products"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        updateProduct: build.mutation<Product, { id: string; data: UpdateProductDto }>({
            query: ({ id, data }) => ({
                url: PRODUCTS.UPDATE_PRODUCT(id),
                method: "PUT",
                body: data,
            }),
            transformResponse: (response: ProductResponse) => response.data,
            invalidatesTags: (result, error, { id }) => [
                { type: "Products", id },
                "Products",
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

        toggleProduct: build.mutation<Product, { id: string; data: ToggleProductDto }>({
            query: ({ id, data }) => ({
                url: PRODUCTS.TOGGLE_PRODUCT(id),
                method: "PATCH",
                body: data,
            }),
            transformResponse: (response: ProductResponse) => response.data,
            async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
                // Optimistic update for all query variants
                const patchResults = [
                    // Update query with includeDisabled: true
                    dispatch(
                        productsApi.util.updateQueryData("getProducts", { includeDisabled: true }, (draft) => {
                            const product = draft.find((p) => p.id === id);
                            if (product) {
                                product.isActive = data.isEnabled;
                            }
                        })
                    ),
                    // Update query with includeDisabled: false
                    dispatch(
                        productsApi.util.updateQueryData("getProducts", { includeDisabled: false }, (draft) => {
                            const product = draft.find((p) => p.id === id);
                            if (product) {
                                product.isActive = data.isEnabled;
                            }
                        })
                    ),
                ];

                try {
                    await queryFulfilled;
                    // Show success toast
                    successHandler({
                        data: {
                            success: true,
                            message: `Product ${data.isEnabled ? "enabled" : "disabled"} successfully`
                        }
                    });
                } catch (error) {
                    // Revert all optimistic updates on error
                    patchResults.forEach((patchResult) => patchResult.undo());
                    errorHandler(error as FetchBaseQueryError);
                }
            },
            invalidatesTags: (result, error, { id }) => [
                { type: "Products", id },
                "Products",
            ],
        }),

        deleteProduct: build.mutation<void, string>({
            query: (id) => ({
                url: PRODUCTS.DELETE_PRODUCT(id),
                method: "DELETE",
            }),
            invalidatesTags: ["Products"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useToggleProductMutation,
    useDeleteProductMutation,
} = productsApi;

