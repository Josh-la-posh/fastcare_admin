import { Respondent, RespondentsState } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import toast from "react-hot-toast";
import { fetchRespondersNote, fetchRespondentsById } from "../thunks";


const initialState: RespondentsState = {
  respondents: [],
  metaData: null,
  selectedRespondents: null,
  loading: false,
  error: null,
};

const respondersNoteSlice = createSlice({
  name: 'respondersNote',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedResponder: (state) => {
      state.selectedRespondents = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all responders note
      .addCase(fetchRespondersNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRespondersNote.fulfilled, (state, action: PayloadAction<Respondent[]>) => {
        state.loading = false;
        state.respondents = action.payload;
      })
      .addCase(fetchRespondersNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error("Failed to fetch respondents");
      })
      // Fetch responder by ID
      .addCase(fetchRespondentsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRespondentsById.fulfilled, (state, action: PayloadAction<Respondent>) => {
        state.loading = false;
        state.selectedRespondents = action.payload;
      })
      .addCase(fetchRespondentsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedResponder } = respondersNoteSlice.actions;
export default respondersNoteSlice.reducer;
