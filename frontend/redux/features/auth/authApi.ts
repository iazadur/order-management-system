import { AUTH } from "@/app.config";
import apiSlice from "../api/apiSlice";
import { errorHandler, successHandler } from "@/lib/utils";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

/* =======================
   Request Types
======================= */

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

/* =======================
   Response Types (match backend shape)
======================= */

export interface ApiUser {
    id: string;
    email: string;
    isVerified: boolean;
    createdAt: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        user: ApiUser;
        accessToken: string;
        refreshToken: string;
    };
}

export type RegisterResponse = LoginResponse;

export interface RefreshResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

export interface MeResponse {
    success: boolean;
    data: {
        user: ApiUser;
    };
}

export interface BasicResponse {
    success: boolean;
    message?: string;
}

/* =======================
   Auth API
======================= */

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({

        // LOGIN
        login: builder.mutation<LoginResponse, LoginRequest>({
            query: (data) => ({
                url: AUTH.LOGIN,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Auth"],
        }),

        // REGISTER
        register: builder.mutation<RegisterResponse, RegisterRequest>({
            query: (data) => ({
                url: AUTH.REGISTER,
                method: "POST",
                body: data,
            }),
            invalidatesTags: ["Auth"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        // REFRESH TOKEN
        refresh: builder.mutation<RefreshResponse, void>({
            query: () => ({
                url: AUTH.REFRESH,
                method: "POST",
            }),
            invalidatesTags: ["Auth"],
        }),

        // LOGOUT
        logout: builder.mutation<BasicResponse, void>({
            query: () => ({
                url: AUTH.LOGOUT,
                method: "POST",
            }),
            invalidatesTags: ["Auth"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        // LOGOUT ALL
        logoutAll: builder.mutation<BasicResponse, void>({
            query: () => ({
                url: AUTH.LOGOUT_ALL,
                method: "POST",
            }),
            invalidatesTags: ["Auth"],
            async onQueryStarted(_, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    successHandler(data);
                } catch (error) {
                    errorHandler(error as FetchBaseQueryError);
                }
            },
        }),

        // ME
        me: builder.query<ApiUser, void>({
            query: () => ({
                url: AUTH.ME,
                method: "GET",
            }),
            providesTags: ["Auth"],
            transformResponse: (response: MeResponse) => response.data.user,
        }),
    }),
});

/* =======================
   Export Hooks
======================= */

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useLogoutAllMutation,
    useMeQuery,
    useRefreshMutation,
} = authApi;
