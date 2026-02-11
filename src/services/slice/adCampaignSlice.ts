import { createSlice } from '@reduxjs/toolkit';
import { fetchAdCampaigns, createAdCampaign, updateAdCampaign } from '@/services/thunks';
import { AdCampaignState } from '@/types';

const initialState: AdCampaignState = {
  list: [],
  metaData: null,
  loading: false,
  error: null,
  creating: false,
  createError: null,
  updating: false,
  updateError: null,
};

const adCampaignSlice = createSlice({
  name: 'adCampaigns',
  initialState,
  reducers: {
    clearAdCampaignError: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Ad Campaigns
      .addCase(fetchAdCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchAdCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Ad Campaign
      .addCase(createAdCampaign.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createAdCampaign.fulfilled, (state) => {
        state.creating = false;
      })
      .addCase(createAdCampaign.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string;
      })
      // Update Ad Campaign
      .addCase(updateAdCampaign.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateAdCampaign.fulfilled, (state) => {
        state.updating = false;
      })
      .addCase(updateAdCampaign.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearAdCampaignError } = adCampaignSlice.actions;
export default adCampaignSlice.reducer;
