import { createSlice } from '@reduxjs/toolkit';
import type { ReferralCodesState } from '@/types';
import {
  fetchReferralSummary,
  fetchReferralCodes,
  fetchReferralCodeById,
  exportReferralCodes,
  exportReferralCodeUsers,
  generateReferralCodes,
  activateReferralCode,
  deactivateReferralCode,
} from '@/services/thunks';

const initialState: ReferralCodesState = {
  summary: null,
  codes: [],
  selected: null,
  metaData: null,
  loadingSummary: false,
  loadingList: false,
  loadingDetail: false,
  generating: false,
  activating: false,
  deactivating: false,
  exportingList: false,
  exportingUsers: false,
  errorSummary: null,
  errorList: null,
  errorDetail: null,
  generateError: null,
  exportListError: null,
  exportUsersError: null,
  filters: {},
};

const referralSlice = createSlice({
  name: 'referrals',
  initialState,
  reducers: {
    setReferralFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearReferralFilters(state) {
      state.filters = {};
    },
    clearSelectedReferral(state) {
      state.selected = null;
      state.errorDetail = null;
    },
  },
  extraReducers: builder => {
    // Summary
    builder
      .addCase(fetchReferralSummary.pending, state => {
        state.loadingSummary = true;
        state.errorSummary = null;
      })
      .addCase(fetchReferralSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        state.summary = action.payload;
      })
      .addCase(fetchReferralSummary.rejected, (state, action) => {
        state.loadingSummary = false;
        state.errorSummary = action.payload as string || 'Failed to load summary';
      });

    // List
    builder
      .addCase(fetchReferralCodes.pending, state => {
        state.loadingList = true;
        state.errorList = null;
      })
      .addCase(fetchReferralCodes.fulfilled, (state, action) => {
        state.loadingList = false;
        state.codes = action.payload.codes;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchReferralCodes.rejected, (state, action) => {
        state.loadingList = false;
        state.errorList = action.payload as string || 'Failed to load referral codes';
      });

    // Detail
    builder
      .addCase(fetchReferralCodeById.pending, state => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchReferralCodeById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchReferralCodeById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string || 'Failed to load referral code detail';
      });

    // Export list
    builder
      .addCase(exportReferralCodes.pending, state => {
        state.exportingList = true;
        state.exportListError = null;
      })
      .addCase(exportReferralCodes.fulfilled, state => {
        state.exportingList = false;
      })
      .addCase(exportReferralCodes.rejected, (state, action) => {
        state.exportingList = false;
        state.exportListError = action.payload as string || 'Failed to export referral codes';
      });

    // Export users for one code
    builder
      .addCase(exportReferralCodeUsers.pending, state => {
        state.exportingUsers = true;
        state.exportUsersError = null;
      })
      .addCase(exportReferralCodeUsers.fulfilled, state => {
        state.exportingUsers = false;
      })
      .addCase(exportReferralCodeUsers.rejected, (state, action) => {
        state.exportingUsers = false;
        state.exportUsersError = action.payload as string || 'Failed to export users';
      });

    // Generate codes
    builder
      .addCase(generateReferralCodes.pending, state => {
        state.generating = true;
        state.generateError = null;
      })
      .addCase(generateReferralCodes.fulfilled, state => {
        state.generating = false;
      })
      .addCase(generateReferralCodes.rejected, (state, action) => {
        state.generating = false;
        state.generateError = action.payload as string || 'Failed to generate codes';
      });

    // Activate referral code
    builder
      .addCase(activateReferralCode.pending, state => {
        state.activating = true;
      })
      .addCase(activateReferralCode.fulfilled, (state, action) => {
        state.activating = false;
        // Update the code status in the list
        const index = state.codes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.codes[index].status = 'Active';
        }
      })
      .addCase(activateReferralCode.rejected, state => {
        state.activating = false;
      });

    // Deactivate referral code
    builder
      .addCase(deactivateReferralCode.pending, state => {
        state.deactivating = true;
      })
      .addCase(deactivateReferralCode.fulfilled, (state, action) => {
        state.deactivating = false;
        // Update the code status in the list
        const index = state.codes.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.codes[index].status = 'Inactive';
        }
      })
      .addCase(deactivateReferralCode.rejected, state => {
        state.deactivating = false;
      });
  }
});

export const { setReferralFilters, clearReferralFilters, clearSelectedReferral } = referralSlice.actions;
export default referralSlice.reducer;
