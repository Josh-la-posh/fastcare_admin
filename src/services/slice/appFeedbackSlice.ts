import { createSlice } from '@reduxjs/toolkit';
import { fetchAppFeedbacks, exportAppFeedbacks } from '@/services/thunks';
import { AppFeedbackState } from '@/types';

const initialState: AppFeedbackState = {
  list: [],
  loading: false,
  error: null,
  exporting: false,
  exportError: null,
  metaData: null,
  filters: { Page: 1, PageSize: 10 },
};

const appFeedbackSlice = createSlice({
  name: 'appFeedback',
  initialState,
  reducers: {
    setFeedbackPage(state, action) {
      state.filters.Page = action.payload;
    },
    setFeedbackPageSize(state, action) {
      state.filters.PageSize = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppFeedbacks.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppFeedbacks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchAppFeedbacks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(exportAppFeedbacks.pending, state => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportAppFeedbacks.fulfilled, state => {
        state.exporting = false;
      })
      .addCase(exportAppFeedbacks.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload as string;
      });
  },
});

export const { setFeedbackPage, setFeedbackPageSize } = appFeedbackSlice.actions;
export default appFeedbackSlice.reducer;
