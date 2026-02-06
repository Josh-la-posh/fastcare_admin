import { createSlice } from '@reduxjs/toolkit';
import { UserReportsState } from '@/types';
import { fetchPatientReports, fetchDoctorReports, fetchPatientReportDetail, fetchDoctorReportDetail, exportUserReportDetail } from '@/services/thunks';

const initialState: UserReportsState = {
  patientList: [],
  doctorList: [],
  detail: [],
  patientMeta: null,
  doctorMeta: null,
  detailMeta: null,
  loadingPatient: false,
  loadingDoctor: false,
  loadingDetail: false,
  errorPatient: null,
  errorDoctor: null,
  errorDetail: null,
  patientFilters: { Page: 1, PageSize: 20 },
  doctorFilters: { Page: 1, PageSize: 20 },
  detailFilters: { Page: 1, PageSize: 20, Date: '' },
  exportingDetail: false,
  exportDetailError: null,
};

const userReportsSlice = createSlice({
  name: 'userReports',
  initialState,
  reducers: {
    setPatientPage(state, action) {
      state.patientFilters.Page = action.payload;
    },
    setPatientPageSize(state, action) {
      state.patientFilters.PageSize = action.payload;
      state.patientFilters.Page = 1;
    },
    setDoctorPage(state, action) {
      state.doctorFilters.Page = action.payload;
    },
    setDoctorPageSize(state, action) {
      state.doctorFilters.PageSize = action.payload;
      state.doctorFilters.Page = 1;
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
        state.loadingPatient = true;
        state.errorPatient = null;
      })
      .addCase(fetchPatientReports.fulfilled, (state, action) => {
        state.loadingPatient = false;
        state.patientList = action.payload.list;
        state.patientMeta = action.payload.metaData;
      })
      .addCase(fetchPatientReports.rejected, (state, action) => {
        state.loadingPatient = false;
        state.errorPatient = action.payload as string;
      })
      // Doctor List
      .addCase(fetchDoctorReports.pending, state => {
        state.loadingDoctor = true;
        state.errorDoctor = null;
      })
      .addCase(fetchDoctorReports.fulfilled, (state, action) => {
        state.loadingDoctor = false;
        state.doctorList = action.payload.list;
        state.doctorMeta = action.payload.metaData;
      })
      .addCase(fetchDoctorReports.rejected, (state, action) => {
        state.loadingDoctor = false;
        state.errorDoctor = action.payload as string;
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

export const { setPatientPage, setPatientPageSize, setDoctorPage, setDoctorPageSize, setDetailPage, setDetailPageSize } = userReportsSlice.actions;
export default userReportsSlice.reducer;