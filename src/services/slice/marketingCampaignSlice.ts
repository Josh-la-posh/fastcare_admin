import { createSlice } from '@reduxjs/toolkit';
import type { MarketingCampaignState } from '@/types';
import { 
  fetchMarketingCampaigns, 
  fetchMarketingCampaignSummary, 
  fetchMarketingCampaignById,
  exportMarketingCampaigns,
  createMarketingCampaignEntry,
  activateMarketingCampaign, 
  deactivateMarketingCampaign 
} from '@/services/thunks';

const initialState: MarketingCampaignState = {
  summary: null,
  list: [],
  selected: null,
  metaData: null,
  loading: false,
  loadingSummary: false,
  loadingDetail: false,
  exporting: false,
  error: null,
  creating: false,
  createError: null,
  activating: false,
  deactivating: false,
};

const marketingCampaignSlice = createSlice({
  name: 'marketingCampaigns',
  initialState,
  reducers: {
    clearMarketingCampaignError(state) {
      state.error = null;
      state.createError = null;
    },
  },
  extraReducers: builder => {
    // Summary
    builder
      .addCase(fetchMarketingCampaignSummary.pending, state => {
        state.loadingSummary = true;
      })
      .addCase(fetchMarketingCampaignSummary.fulfilled, (state, action) => {
        state.loadingSummary = false;
        state.summary = action.payload;
      })
      .addCase(fetchMarketingCampaignSummary.rejected, state => {
        state.loadingSummary = false;
      });

    // List
    builder
      .addCase(fetchMarketingCampaigns.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMarketingCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.list;
        state.metaData = action.payload.metaData;
      })
      .addCase(fetchMarketingCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch marketing campaigns';
      });

    // Activate campaign
    builder
      .addCase(activateMarketingCampaign.pending, state => {
        state.activating = true;
      })
      .addCase(activateMarketingCampaign.fulfilled, (state, action) => {
        state.activating = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index].status = 'Active';
        }
      })
      .addCase(activateMarketingCampaign.rejected, state => {
        state.activating = false;
      });

    // Deactivate campaign
    builder
      .addCase(deactivateMarketingCampaign.pending, state => {
        state.deactivating = true;
      })
      .addCase(deactivateMarketingCampaign.fulfilled, (state, action) => {
        state.deactivating = false;
        const index = state.list.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.list[index].status = 'Inactive';
        }
      })
      .addCase(deactivateMarketingCampaign.rejected, state => {
        state.deactivating = false;
      });

    // Fetch by ID (detail)
    builder
      .addCase(fetchMarketingCampaignById.pending, state => {
        state.loadingDetail = true;
        state.selected = null;
      })
      .addCase(fetchMarketingCampaignById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
      })
      .addCase(fetchMarketingCampaignById.rejected, state => {
        state.loadingDetail = false;
      });

    // Export
    builder
      .addCase(exportMarketingCampaigns.pending, state => {
        state.exporting = true;
      })
      .addCase(exportMarketingCampaigns.fulfilled, state => {
        state.exporting = false;
      })
      .addCase(exportMarketingCampaigns.rejected, state => {
        state.exporting = false;
      });

    // Create
    builder
      .addCase(createMarketingCampaignEntry.pending, state => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createMarketingCampaignEntry.fulfilled, state => {
        state.creating = false;
      })
      .addCase(createMarketingCampaignEntry.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload as string || 'Failed to create promo code';
      });
  },
});

export const { clearMarketingCampaignError } = marketingCampaignSlice.actions;
export default marketingCampaignSlice.reducer;
