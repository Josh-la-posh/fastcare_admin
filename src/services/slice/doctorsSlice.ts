import { Doctor, DoctorsState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { approveDoctor, disapproveDoctor, deleteDoctor, fetchDoctorById, fetchDoctorDashboardById, fetchDoctors, fetchPendingDoctors } from "../thunks";

const initialState: DoctorsState = {
  doctors: [],
  pendingDoctors: [],
  totalCount: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 5,      
  hasNext: false,
  hasPrevious: false,
  loading: false,
  selectedDoctor: null,
  error: null,
  dashboard: null,
};

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
   reducers: {
    setSelectedDoctor: (state, action: PayloadAction<Doctor| null>) => {
      state.selectedDoctor = action.payload;
    },
  },
  extraReducers: builder => {
    builder
    .addCase(fetchDoctors.pending, state => {
      state.loading = true;
      state.error = null;
    })
   .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
        
      })

    .addCase(fetchDoctors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch doctors';
    })

    .addCase(fetchDoctorById.fulfilled, (state, action) => {
      state.selectedDoctor = action.payload;
    })

    .addCase(deleteDoctor.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(deleteDoctor.fulfilled, (state, action) => {
      state.loading = false;

      // remove doctor from list if present
     state.doctors = state.doctors.filter(d => d.id !== action.meta.arg);

    // clear selected doctor if you are on detail page
    // if (state.selectedDoctor?.id === action.meta.arg) {
    //   state.selectedDoctor = null;
    // }
    })
    .addCase(deleteDoctor.rejected, (state, action) => {
       state.loading = false;
        state.error = action.payload as string;
    })

     // Fetch pending doctors
    .addCase(fetchPendingDoctors.pending, state => {
        state.loading = true;
        state.error = null;
     })
    .addCase(fetchPendingDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingDoctors = action.payload.doctors;
        state.totalCount = action.payload.totalCount;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
        state.pageSize = action.payload.pageSize;
        state.hasNext = action.payload.hasNext;
        state.hasPrevious = action.payload.hasPrevious;
     })
     .addCase(fetchPendingDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch pending doctors';
     })

     .addCase(approveDoctor.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(approveDoctor.fulfilled, (state, action) => {
      state.loading = false;
      const updatedDoctor = action.payload;

      // Update the doctor in the pendingDoctors list with the new isApproved status
      const index = state.pendingDoctors.findIndex(d => d.id === updatedDoctor.id);
      if (index !== -1) {
        state.pendingDoctors[index] = updatedDoctor;
      }
    })
    .addCase(approveDoctor.rejected, (state) => {
      state.loading = false;
      // Just save error for UI/toast, don't remove anything
      // state.error = action.payload as string;
    })
    .addCase(disapproveDoctor.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(disapproveDoctor.fulfilled, (state, action) => {
      state.loading = false;
      const updatedDoctor = action.payload;
      const index = state.pendingDoctors.findIndex(d => d.id === updatedDoctor.id);
      if (index !== -1) {
        state.pendingDoctors[index] = updatedDoctor;
      }
    })
    .addCase(disapproveDoctor.rejected, (state) => {
      state.loading = false;
    })
   .addCase(fetchDoctorDashboardById.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
  .addCase(fetchDoctorDashboardById.fulfilled, (state, action) => {
    state.loading = false;
    state.dashboard = action.payload;
  })
  .addCase(fetchDoctorDashboardById.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload as string;
  });
   
  },
});

export const { setSelectedDoctor } = doctorsSlice.actions;
export default doctorsSlice.reducer;
