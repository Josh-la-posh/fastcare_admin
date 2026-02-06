import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { HospitalState, Hospital } from "@/types";
import { createHospital, fetchHospitalById, fetchHospitals, updateHospital, activateHospital, deactivateHospital } from "../thunks";
import toast from "react-hot-toast";

const initialState: HospitalState = {
  hospitals: [],
  selectedHospital: null,   // ✅ add this
  loading: false,
  error: null,
  createLoading: false,
  createError: null,
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
  hasNext: false,
  hasPrevious: false,
};

const hospitalSlice = createSlice({
  name: "hospitals",
  initialState,
  reducers: {
    setSelectedHospital: (state, action: PayloadAction<Hospital | null>) => {
      state.selectedHospital = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchHospitals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHospitals.fulfilled, (state, action) => {
        state.loading = false;
        // New structured payload with hospitals + meta
        state.hospitals = action.payload.hospitals;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
      })
      .addCase(fetchHospitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

       .addCase(createHospital.pending, (state) => {
              state.createLoading = true;
              state.createError = null;
        })
        .addCase(createHospital.fulfilled, (state) => {
          state.createLoading = false;
        })
        .addCase(createHospital.rejected, (state, action) => {
          state.createLoading = false;
          state.createError = action.payload as string;
        })

      // Fetch by ID
      .addCase(fetchHospitalById.fulfilled, (state, action) => {
        state.selectedHospital = action.payload;
      })
      .addCase(activateHospital.fulfilled, (state, action) => {
        // Assume API returns updated hospital
        const updated: Hospital | undefined = action.payload;
        if (updated && updated.id) {
          state.hospitals = state.hospitals.map(h => h.id === updated.id ? { ...h, ...updated, isActive: true } : h);
          if (state.selectedHospital?.id === updated.id) {
            state.selectedHospital = { ...state.selectedHospital, ...updated, isActive: true } as Hospital;
          }
        }
        toast.success('Hospital activated');
      })
      .addCase(deactivateHospital.fulfilled, (state, action) => {
        const updated: Hospital | undefined = action.payload;
        if (updated && updated.id) {
          state.hospitals = state.hospitals.map(h => h.id === updated.id ? { ...h, ...updated, isActive: false } : h);
          if (state.selectedHospital?.id === updated.id) {
            state.selectedHospital = { ...state.selectedHospital, ...updated, isActive: false } as Hospital;
          }
        }
        toast.success('Hospital deactivated');
      })

     .addCase(updateHospital.fulfilled, (state, action) => {
        // Optimistically update local state
        state.hospitals = state.hospitals.map((h) =>
          h.id === action.payload.id ? action.payload : h
        );
           toast.success("Hospital Updated successful 🎉");
      });
  },
});

export const { setSelectedHospital } = hospitalSlice.actions;
export default hospitalSlice.reducer;
