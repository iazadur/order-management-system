import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// InitialState
interface AuthState {
  token: string | null;
  user: any;
  email_verified: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  email_verified: false,
};

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action to set the token in the state
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    // Action to set the user in the state
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    // set email verified
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.email_verified = action.payload;
    },
    // Action to logout the user
    logout: (state) => {
      // Clear localStorage
      localStorage.clear();
      // Reset Redux State
      state.token = null;
      state.user = null;
    },
  },
});

// Export individual action creators
export const {
  setToken,
  setUser,
  setEmailVerified,
  logout,
} = authSlice.actions;

// Other code such as selectors can use the imported `RootState` type
// export const selectCount = (state: RootState) => state.auth.value

export default authSlice.reducer;