import { createSlice } from "@reduxjs/toolkit";
import { AllAmbulancesState } from "@/types";
import toast from "react-hot-toast";
import { fetchAmbulances } from "../thunks";

const initialState: AllAmbulancesState = {
  ambulances: [],
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
        state.ambulances = action.payload;
      })
      .addCase(fetchAmbulances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error("Failed to fetch ambulances");
      });
  },
});

export const { clearAmbulances } = allAmbulancesSlice.actions;
export default allAmbulancesSlice.reducer;
