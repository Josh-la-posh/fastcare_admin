import { createSlice } from '@reduxjs/toolkit';
import {
  fetchPromoCodes,
  activatePromoCode,
  deactivatePromoCode,
  fetchPromoCodeById,
  fetchPromoCodeSummary,
  createPromoCode,
} from '@/services/thunks';
import { PromoCodeState } from '@/types';

const initialState: PromoCodeState = {
  list: [],
  selected: null,
  summary: null,
  metaData: null,
  loading: false,
  loadingDetail: false,
  loadingSummary: false,
  creating: false,
  error: null,
  activating: false,
  deactivating: false,
};

const promoCodeSlice = createSlice({
  name: 'promoCodes',
  initialState,
  reducers: {
    clearPromoCodeError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Promo Codes
      .addCase(fetchPromoCodes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromoCodes.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchPromoCodes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPromoCodeById.pending, (state) => {
        state.loadingDetail = true;
      })
      .addCase(fetchPromoCodeById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchPromoCodeById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPromoCodeSummary.pending, (state) => {
        state.loadingSummary = true;
      })
      .addCase(fetchPromoCodeSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        state.summary = action.payload;
      })
      .addCase(fetchPromoCodeSummary.rejected, (state, action) => {
        state.loadingSummary = false;
        state.error = action.payload as string;
      })
      .addCase(createPromoCode.pending, (state) => {
        state.creating = true;
      })
      .addCase(createPromoCode.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      // Activate Promo Code
      .addCase(activatePromoCode.pending, (state) => {
        state.activating = true;
      })
      .addCase(activatePromoCode.fulfilled, (state, action) => {
        state.activating = false;
        const idx = state.list.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx].status = 'Active';
        }
        if (state.selected?.id === action.payload.id) state.selected.status = 'Active';
      })
      .addCase(activatePromoCode.rejected, (state) => {
        state.activating = false;
      })
      // Deactivate Promo Code
      .addCase(deactivatePromoCode.pending, (state) => {
        state.deactivating = true;
      })
      .addCase(deactivatePromoCode.fulfilled, (state, action) => {
        state.deactivating = false;
        const idx = state.list.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx].status = 'Inactive';
        }
        if (state.selected?.id === action.payload.id) state.selected.status = 'Inactive';
      })
      .addCase(deactivatePromoCode.rejected, (state) => {
        state.deactivating = false;
      });
  },
});

export const { clearPromoCodeError } = promoCodeSlice.actions;
export default promoCodeSlice.reducer;
