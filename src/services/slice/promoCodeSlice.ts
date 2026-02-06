import { createSlice } from '@reduxjs/toolkit';
import { fetchPromoCodes, activatePromoCode, deactivatePromoCode } from '@/services/thunks';
import { PromoCodeState } from '@/types';

const initialState: PromoCodeState = {
  list: [],
  metaData: null,
  loading: false,
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
      // Activate Promo Code
      .addCase(activatePromoCode.pending, (state) => {
        state.activating = true;
      })
      .addCase(activatePromoCode.fulfilled, (state, action) => {
        state.activating = false;
        const idx = state.list.findIndex((item) => item.id === action.payload.id);
        if (idx !== -1) {
          state.list[idx].status = 1;
        }
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
          state.list[idx].status = 0;
        }
      })
      .addCase(deactivatePromoCode.rejected, (state) => {
        state.deactivating = false;
      });
  },
});

export const { clearPromoCodeError } = promoCodeSlice.actions;
export default promoCodeSlice.reducer;
