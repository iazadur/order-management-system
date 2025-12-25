// import type { TypedUseSelectorHook } from 'react-redux';
import { configureStore } from "@reduxjs/toolkit";

import { setupListeners } from "@reduxjs/toolkit/query";
import apiSlice from "./features/api/apiSlice";
import configReducer from "./features/config/configSlice";
import cartReducer from "./features/cart/cartSlice";

// Create the Redux store
const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        config: configReducer,
        cart: cartReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat([apiSlice.middleware]),
});

setupListeners(store.dispatch);

// Declare Typed Definitions
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

export const makeStore = () => store;

// Export hooks for convenience
export { useAppDispatch, useAppSelector, useAppStore } from "./lib/hook";