import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { loginAccount } from '@/modules/onboarding/service';
import { ApiError } from '@/utils/apiError';
import type { LoginPayload, RegisterAccountResponse } from '@/modules/onboarding/@types';
import type { RootState } from '../index';

export type AuthUser = RegisterAccountResponse;

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const loginThunk = createAsyncThunk<
  { user: AuthUser; token: string },
  LoginPayload,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await loginAccount(credentials);
  } catch (error) {
    return rejectWithValue(error instanceof ApiError ? error.message : 'Login failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
          state.isLoading = false;
          state.user = action.payload.user;
          state.token = action.payload.token;
        },
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      });
  },
});

export const { clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState): AuthUser | null => state.auth.user;
export const selectIsAuthenticated = (state: RootState): boolean => state.auth.token !== null;
