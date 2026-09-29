import { createSlice } from "@reduxjs/toolkit";
import { AllAmbulancesState } from "@/types";
import toast from "react-hot-toast";
import { activateAmbulance, deactivateAmbulance, fetchAmbulances } from "../thunks";

const initialState: AllAmbulancesState = {
  ambulances: [],
  metaData: null,
  loading: false,
  error: null,
};

const allAmbulancesSlice = createSlice({
  name: "allAmbulances",
  initialState,
  reducers: {
    clearAmbulances: (state) => {
      state.ambulances = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAmbulances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAmbulances.fulfilled, (state, action) => {
        state.loading = false;
        state.ambulances = action.payload.ambulances;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchAmbulances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error("Failed to fetch ambulances");
      })
      .addCase(activateAmbulance.fulfilled, (state, action) => {
        const item = state.ambulances.find(row => row.id === action.payload.id);
        if (item) Object.assign(item, action.payload);
      })
      .addCase(deactivateAmbulance.fulfilled, (state, action) => {
        const item = state.ambulances.find(row => row.id === action.payload.id);
        if (item) Object.assign(item, action.payload);
      });
  },
});

export const { clearAmbulances } = allAmbulancesSlice.actions;
export default allAmbulancesSlice.reducer;
