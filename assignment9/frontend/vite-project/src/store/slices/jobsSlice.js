import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../api/client';

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async () => {
  const res = await client.get('/api/jobs');
  return res.data.jobs;
});

export const createJob = createAsyncThunk(
  'jobs/createJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const res = await client.post('/api/create/job', jobData);
      return res.data.job;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create job');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'jobs/deleteJob',
  async (id, { rejectWithValue }) => {
    try {
      await client.delete(`/api/delete/job/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete job');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { items: [], loading: false, error: null, deleteError: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; state.deleteError = null; })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(deleteJob.pending, (state) => {
        state.deleteError = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((job) => job._id !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.deleteError = action.payload || 'Failed to delete job';
      });
  }
});

export default jobsSlice.reducer;
