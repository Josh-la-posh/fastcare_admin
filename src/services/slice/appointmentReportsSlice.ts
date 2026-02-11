import { createSlice } from '@reduxjs/toolkit';
import { AppointmentReportsState } from '@/types';
import { fetchAppointmentReports, exportAppointmentReports } from '@/services/thunks';

const initialState: AppointmentReportsState = {
  list: [],
  metaData: null,
  loading: false,
  error: null,
  exporting: false,
  exportError: null,
  filters: {
    Page: 1,
    PageSize: 20,
    MinDuration: undefined,
  },
};

const appointmentReportsSlice = createSlice({
  name: 'appointmentReports',
  initialState,
  reducers: {
    setAppointmentPage(state, action) {
      state.filters.Page = action.payload;
    },
    setAppointmentPageSize(state, action) {
      state.filters.PageSize = action.payload;
      state.filters.Page = 1;
    },
    setAppointmentFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload, Page: 1 };
    },
    resetAppointmentFilters(state) {
      state.filters = { Page: 1, PageSize: state.filters.PageSize || 20, MinDuration: undefined };
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAppointmentReports.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentReports.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchAppointmentReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(exportAppointmentReports.pending, state => {
        state.exporting = true;
        state.exportError = null;
      })
      .addCase(exportAppointmentReports.fulfilled, (state) => {
        state.exporting = false;
      })
      .addCase(exportAppointmentReports.rejected, (state, action) => {
        state.exporting = false;
        state.exportError = action.payload as string;
      });
  }
});

export const { setAppointmentPage, setAppointmentPageSize, setAppointmentFilters, resetAppointmentFilters } = appointmentReportsSlice.actions;
export default appointmentReportsSlice.reducer;