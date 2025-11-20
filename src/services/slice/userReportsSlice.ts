import { createSlice } from '@reduxjs/toolkit';
import { UserReportsState } from '@/types';
import { fetchPatientReports, fetchDoctorReports, fetchPatientReportDetail, fetchDoctorReportDetail, exportUserReportDetail } from '@/services/thunks';

const initialState: UserReportsState = {
  list: [],
  detail: [],
  metaData: null,
  detailMeta: null,
  loadingList: false,
  loadingDetail: false,
  errorList: null,
  errorDetail: null,
  filters: { Page: 1, PageSize: 20 },
  detailFilters: { Page: 1, PageSize: 20, Date: '' },
  exportingDetail: false,
  exportDetailError: null,
};

const userReportsSlice = createSlice({
  name: 'userReports',
  initialState,
  reducers: {
    setReportPage(state, action) {
      state.filters.Page = action.payload;
    },
    setReportPageSize(state, action) {
      state.filters.PageSize = action.payload;
      state.filters.Page = 1; // reset page
    },
    setDetailPage(state, action) {
      state.detailFilters.Page = action.payload;
    },
    setDetailPageSize(state, action) {
      state.detailFilters.PageSize = action.payload;
      state.detailFilters.Page = 1;
    },
  },
  extraReducers: builder => {
    builder
      // Patient List
      .addCase(fetchPatientReports.pending, state => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchPatientReports.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchPatientReports.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload as string;
      })
      // Doctor List
      .addCase(fetchDoctorReports.pending, state => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchDoctorReports.fulfilled, (state, action) => {
        state.loadingList = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchDoctorReports.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload as string;
      })
      // Patient Detail
      .addCase(fetchPatientReportDetail.pending, (state, action) => {
        // If requesting a new date, reset first
        const requestedDate = (action.meta.arg as { Date: string }).Date;
        if (requestedDate !== state.detailFilters.Date) {
          state.detail = [];
          state.detailMeta = null;
          state.detailFilters.Date = requestedDate;
          state.detailFilters.Page = 1;
        }
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchPatientReportDetail.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.detail = action.payload.detail;
        state.detailMeta = action.payload.detailMeta;
        state.detailFilters.Date = action.payload.selectedDate;
      })
      .addCase(fetchPatientReportDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string;
      })
      // Doctor Detail
      .addCase(fetchDoctorReportDetail.pending, (state, action) => {
        // If requesting a new date, reset first
        const requestedDate = (action.meta.arg as { Date: string }).Date;
        if (requestedDate !== state.detailFilters.Date) {
          state.detail = [];
          state.detailMeta = null;
          state.detailFilters.Date = requestedDate;
          state.detailFilters.Page = 1;
        }
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchDoctorReportDetail.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.detail = action.payload.detail;
        state.detailMeta = action.payload.detailMeta;
        state.detailFilters.Date = action.payload.selectedDate;
      })
      .addCase(fetchDoctorReportDetail.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string;
      })
      // Export detail
      .addCase(exportUserReportDetail.pending, state => {
        state.exportingDetail = true;
        state.exportDetailError = null;
      })
      .addCase(exportUserReportDetail.fulfilled, (state) => {
        state.exportingDetail = false;
      })
      .addCase(exportUserReportDetail.rejected, (state, action) => {
        state.exportingDetail = false;
        state.exportDetailError = action.payload as string;
      });
  },
});

export const { setReportPage, setReportPageSize, setDetailPage, setDetailPageSize } = userReportsSlice.actions;
export default userReportsSlice.reducer;