import { createSlice } from '@reduxjs/toolkit';
import { fetchEmergencyReports } from '@/services/thunks';
import { EmergencyReportState } from '@/types';

const initialState: EmergencyReportState = {
  list: [],
  loading: false,
  error: null,
  metaData: null,
  filters: { Page: 1, PageSize: 20 },
};

const emergencyReportsSlice = createSlice({
  name: 'emergencyReports',
  initialState,
  reducers: {
    setEmergencyFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setEmergencyPage(state, action) {
      state.filters.Page = action.payload;
    },
    setEmergencyPageSize(state, action) {
      state.filters.PageSize = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchEmergencyReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmergencyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchEmergencyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setEmergencyFilters, setEmergencyPage, setEmergencyPageSize } = emergencyReportsSlice.actions;
export default emergencyReportsSlice.reducer;
