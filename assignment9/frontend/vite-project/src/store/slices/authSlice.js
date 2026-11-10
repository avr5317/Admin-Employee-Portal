import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client, { TOKEN_KEY, USER_KEY } from '../../api/client';

// Restore a saved login; bad/corrupt data must never crash the app
const loadSaved = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY));
    if (token && user && typeof user === 'object') {
      return { user, token };
    }
  } catch {
    // fall through to logged-out state
  }
  return { user: null, token: null };
};

const clearSaved = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
};

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await client.post('/user/login', { email, password });
      const { user, token } = res.data;
      try {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } catch {
        // login still works for this session if storage is unavailable
      }
      return { user, token };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Login failed');
    }
  }
);

export const registerThunk = createAsyncThunk(
  'auth/register',
  async ({ fullName, email, password }, { rejectWithValue }) => {
    try {
      const res = await client.post('/user/register', { fullName, email, password });
      return res.data.user;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Registration failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    ...loadSaved(),
    loading: false,
    error: null,
    registerLoading: false,
    registerError: null
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      clearSaved();
    },
    resetRegister(state) {
      state.registerLoading = false;
      state.registerError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(registerThunk.pending, (state) => {
        state.registerLoading = true;
        state.registerError = null;
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.registerLoading = false;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.registerLoading = false;
        state.registerError = action.payload || 'Registration failed';
      });
  }
});

export const { logout, resetRegister } = authSlice.actions;
export default authSlice.reducer;
