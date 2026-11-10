
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client, { API_BASE_URL } from '../../api/client';

// Thunk to fetch all users for the admin Employees page
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
     
      const res = await client.get('/user/users');
      return res.data.users || [];
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch users'
      );
    }
  }
);

// Thunk for the Company Showcase page: users that have an uploaded image
export const fetchCompanies = createAsyncThunk(
  'users/fetchCompanies',
  async (_, { rejectWithValue }) => {
    try {
      const res = await client.get('/user/getAll');
      return (res.data.users || [])
        .filter((user) => user.imagePath)
        .map((user) => ({
          id: user.email,
          name: user.fullName,
          description: user.email,
          imageUrl: `${API_BASE_URL}${user.imagePath}`,
        }));
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error || 'Failed to fetch companies'
      );
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    list: [],
    loading: false,
    error: null,
    companies: [],
    companiesLoading: true,
    companiesError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
        state.companiesError = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companiesLoading = false;
        state.companiesError = action.payload;
      });
  },
});

export default usersSlice.reducer;
