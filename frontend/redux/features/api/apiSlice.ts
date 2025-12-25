
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
} from "@reduxjs/toolkit/query";
import { getSession, signOut } from "next-auth/react";
import type { Session } from "next-auth";
import type { RootState } from "@/redux/store";
import { logout } from "../auth/authSlice";

type SessionWithAccessToken = Session & { accessToken?: string };

// Dynamic base query reads the apiUrl from Redux state each time
const dynamicBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  object,
  FetchBaseQueryMeta
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const baseUrl: string = state.config.apiUrl || "";

  const rawBaseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: async (headers) => {
      // get token from next auth
      const session = (await getSession()) as SessionWithAccessToken | null;
      const token = session?.accessToken;
      // Set the Authorization header if a token is available
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      // headers.set("Accept", "application/json");
      // headers.set("Content-Type", "application/json");

      return headers;
    },
  });

  return rawBaseQuery(args, api, extraOptions);
};

// Create the API slice
const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const result = await dynamicBaseQuery(args, api, extraOptions);

    // If the response has a 401 status code, dispatch the logout action
    if (result?.error?.status === 401) {
      api.dispatch(logout());
      // Call the logout API endpoint
      await dynamicBaseQuery({ url: "/company/logout", method: "POST" }, api, extraOptions);
      await signOut();
      window.location.replace("/login");
    }
    return result;
  },
  tagTypes: [
    "Auth",
    "Products",
    "Orders",
    "Promotions",
    "Analytics",
  ],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  endpoints: (builder) => ({}),
});

export default apiSlice;