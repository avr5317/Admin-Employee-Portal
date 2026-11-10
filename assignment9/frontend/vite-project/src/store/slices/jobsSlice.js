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

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => { state.loading = true; })
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
      });
  }
});

export default jobsSlice.reducer;
