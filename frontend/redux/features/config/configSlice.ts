import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ConfigState {
  apiUrl: string;
  loaded: boolean;
}

const initialState: ConfigState = {
  apiUrl: '',
  loaded: false,
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    setConfig(state, action: PayloadAction<string>) {
      // eslint-disable-next-line no-param-reassign
      state.apiUrl = action.payload;
      // eslint-disable-next-line no-param-reassign
      state.loaded = true;
    },
  },
});

export const { setConfig } = configSlice.actions;
export default configSlice.reducer;